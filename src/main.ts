import {
	type MarkdownPostProcessorContext,
	MarkdownView,
	Plugin,
	type TFile,
} from "obsidian";
import { type Settings, settingsTab, DEFAULT_SETTINGS } from "./settings";
import { imageMap, regPatterns } from "./patterns";

export default class comboColors extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		// Register syntax processor (must be first)
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			const processNode = (node: Node) => {
				if (node.nodeType === Node.TEXT_NODE) {
					const modifiedText = (node.textContent || "").replace(
						/=:(.+?):=/g,
						"$1",
					);
					if (node.textContent !== modifiedText) {
						(node as ChildNode).replaceWith(
							element.createSpan({ cls: "notation", text: modifiedText }),
						);
					}
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					for (const child of node.childNodes) {
						processNode(child);
					}
				}
			};

			for (const child of element.childNodes) {
				processNode(child);
			}
		});

		// Register color processor
		this.registerMarkdownPostProcessor(
			(element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const file = this.app.vault.getAbstractFileByPath(
					context.sourcePath,
				) as TFile;
				const profile = this.app.metadataCache.getFileCache(file)?.frontmatter
					?.profile as keyof typeof inputs;
				const inputs = regPatterns(this.settings);
				const notations = element.querySelectorAll<HTMLElement>(".notation");

				for (const notation of notations) {
					notation.dataset.textMode = notation.textContent || "";

					if (!inputs[profile]) {
						notation.textContent = "[ No notation profile in frontmatter ]";
						notation.addClass("warning");
						continue;
					}

					for (const childNode of notation.childNodes) {
						if (childNode.nodeType === Node.TEXT_NODE) {
							let textContent = childNode.textContent || "";
							const parentNode = childNode.parentNode;

							for (const [regex, mappedColor] of inputs[profile]) {
								textContent = textContent.replace(
									new RegExp(regex, "g"),
									(match) => {
										const spanElement = createSpan({ text: match });
										spanElement.style.color = mappedColor;
										return spanElement.outerHTML;
									},
								);
							}

							const tempDiv = createDiv();
							tempDiv.innerHTML = textContent;
							const fragment = createFragment();

							while (tempDiv.firstChild) {
								fragment.appendChild(tempDiv.firstChild);
							}

							if (parentNode) {
								childNode.replaceWith(fragment);
							}
						}
					}
				}
			},
		);

		// Register the button processor
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			const codeblocks = element.querySelectorAll<HTMLElement>("code");
			for (const codeblock of codeblocks) {
				if (codeblock.innerText.trim() === "comboButton") {
					const comboButton = createEl("button", {
						text: "Icon Notation",
						cls: "combo",
					});
					codeblock.replaceWith(comboButton);
					this.registerDomEvent(comboButton, "click", this.toggleNotations);
				}
			}
		});

		// Register frontmatter profile change event
		const profileMap = new Map<string, string | null>();

		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				const metadata = this.app.metadataCache.getFileCache(file);
				if (!metadata || !metadata.frontmatter) return;

				const currentProfile = metadata.frontmatter.profile ?? null;
				const previousProfile = profileMap.get(file.path) ?? null;

				if (currentProfile !== previousProfile) {
					profileMap.set(file.path, currentProfile);

					const leaves = this.app.workspace.getLeavesOfType("markdown");
					for (const leaf of leaves) {
						const view = leaf.view as MarkdownView;
						if (view.getMode() === "preview" && view.file === file) {
							view.previewMode.rerender(true);
						}
					}
				}
			}),
		);

		// Add toggle-icons command
		this.addCommand({
			id: "toggle-icons",
			name: "Toggle notation icons",
			callback: () => this.toggleNotations(),
		});

		// Detect if iconize is installed & all icons loaded
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const plugins = (this.app as any).plugins;
		if (plugins.enabledPlugins.has("obsidian-icon-folder")) {
			const iconiz = plugins.plugins["obsidian-icon-folder"]?.api;
			const event = iconiz.getEventEmitter();
			event.on("allIconsLoaded", () => {
				this.reload();
			});
		}

		// Add the settings tab
		this.addSettingTab(new settingsTab(this.app, this));
	}

	//Re-render preview mode if broken icons detected
	private async reload() {
		const leaves = this.app.workspace
			.getLeavesOfType("markdown")
			.filter((leaf) => {
				const view = leaf.view;
				return (
					view instanceof MarkdownView &&
					view.getMode() === "preview" &&
					/:[A-Za-z]*:/.test(view.containerEl.innerHTML)
				);
			});

		for (const leaf of leaves) {
			const view = leaf.view as MarkdownView;
			view.previewMode.rerender(true);
		}
	}

	// Update SVG colors in real time
	private updateSvgFill = (settings: Settings) => {
		const svgElements = document.querySelectorAll("svg");

		for (const svg of svgElements) {
			const textElement = svg.querySelector("text");
			if (textElement) {
				const textContent = textElement.textContent?.trim();
				if (textContent) {
					const colorKey = `${settings.selectedProfile}_${textContent}`;
					const newColor = settings[colorKey];
					if (newColor) {
						const pathElement = svg.querySelector("path");
						if (pathElement) {
							pathElement.setAttribute("fill", newColor);
						}
					}
				}
			}
		}
	};

	// Update TXT colors in real time (and call SVG color update)
	public updateColors(leaves: MarkdownView[]) {
		const inputs = regPatterns(this.settings);
		for (const leaf of leaves) {
			const notations = leaf.containerEl.querySelectorAll(".notation");
			const fileCache = leaf.file
				? this.app.metadataCache.getFileCache(leaf.file)
				: null;
			const profile = fileCache?.frontmatter?.profile as keyof typeof inputs;
			if (!inputs[profile]) continue;
			const colorsToApply = inputs[profile];

			for (const notation of notations) {
				const innerSpans = (notation as HTMLElement).querySelectorAll("span");

				for (const [regex, color] of colorsToApply) {
					for (const span of innerSpans) {
						if (span.textContent && regex.test(span.textContent)) {
							(span as HTMLElement).style.color = color;
						}
					}
				}
			}
		}
		this.updateSvgFill(this.settings);
	}

	// Toggle between text and icon notations
	private toggleNotations = () => {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const notations =
			activeView.containerEl.querySelectorAll<HTMLElement>(".notation");
		const button = activeView.containerEl.querySelector<HTMLElement>(".combo");
		let validNotationsProcessed = false;

		for (const notation of notations) {
			if (notation.textContent === "[ No notation profile in frontmatter ]") {
				continue;
			}
			validNotationsProcessed = true;

			if (!notation.dataset.textMode) {
				notation.dataset.textMode = notation.textContent || "";
			}

			notation.toggleClass("imageMode", !notation.hasClass("imageMode"));
			const isImageMode =
				notation.querySelector("svg") || notation.querySelector("img");

			if (isImageMode) {
				activeView.previewMode.rerender(true);
			} else {
				const processNode = (node: Node) => {
					if (node.nodeType === Node.TEXT_NODE) {
						const originalText = node.textContent || "";
						let modifiedText = originalText;

						for (const [regex, svg] of imageMap()) {
							if (typeof svg === "string") {
								modifiedText = modifiedText.replace(regex, svg);
							}
						}

						if (originalText !== modifiedText) {
							const span = notation.createEl("span", {});
							span.innerHTML = modifiedText;
							(node as ChildNode).replaceWith(span);
						}
					}

					if (node.nodeType === Node.ELEMENT_NODE) {
						for (const child of node.childNodes) {
							processNode(child);
						}
					}
				};

				for (const child of notation.childNodes) {
					processNode(child);
				}
			}
		}

		if (validNotationsProcessed && button) {
			button.textContent =
				button.textContent === "Text Notation"
					? "Icon Notation"
					: "Text Notation";
		}

		this.updateColors([activeView]);
	};

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
