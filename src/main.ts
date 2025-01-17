// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ IMPORTS & DECLARATIONS                                                               ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

import {
	type MarkdownPostProcessorContext,
	MarkdownView,
	Plugin,
	TFile,
} from "obsidian";
import { type Settings, settingsTab, DEFAULT_SETTINGS } from "./settings";
import { imageMap, regPatterns } from "./patterns";

// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ MAIN PLUGIN CLASS                                                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

export default class comboColors extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		//Rregister syntax processor
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			const processNode = (node: Node) => {
				if (node.nodeType === Node.TEXT_NODE) {
					const originalText = node.textContent || "";
					const modifiedText = originalText.replace(/=:(.+?):=/g, "$1");

					if (originalText !== modifiedText) {
						const span = element.createSpan({
							cls: "notation",
							text: modifiedText,
						});
						(node as ChildNode).replaceWith(span);
					}
				}

				if (node.nodeType === Node.ELEMENT_NODE) {
					node.childNodes.forEach(processNode);
				}
			};

			element.childNodes.forEach(processNode);
		});

		// Register the color processor
		this.registerMarkdownPostProcessor(
			(element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const notations = element.querySelectorAll<HTMLElement>(".notation");

				for (const notation of notations) {
					const activeView =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (!activeView?.file) continue;

					const fileAbstract = this.app.vault.getAbstractFileByPath(
						activeView.file.path,
					);
					if (!(fileAbstract instanceof TFile)) continue;

					const profile = this.app.metadataCache.getFileCache(fileAbstract)
						?.frontmatter?.profile as keyof typeof inputs;
					const inputs = regPatterns(this.settings);

					notation.dataset.textMode = notation.textContent || "";

					if (!inputs[profile]) {
						notation.textContent = "[ No notation profile in frontmatter ]";
						notation.addClass("warning");
						continue;
					}
					notation.removeClass("warning");

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

		// Register metadata profile change event
		let previousProfile: string | null = null;
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				const metadata = this.app.metadataCache.getFileCache(file);
				if (!metadata) return;

				// Extract the profile property from the frontmatter
				const profile = metadata.frontmatter?.profile ?? null;

				// Perform the action if the profile key itself or its value has changed
				if (profile !== previousProfile) {
					previousProfile = profile;

					// Iterate over all leaves of type Markdown
					const leaves = this.app.workspace.getLeavesOfType("markdown");

					// Iterate over each leaf
					for (const leaf of leaves) {
						const view = leaf.view as MarkdownView;

						// Trigger rerender for preview mode if the view matches the file and is in preview mode
						if (view.getMode() === "preview" && view.file === file) {
							view.previewMode.rerender(true);
						}
					}
				}
			}),
		);

		// Add the toggle-icons command
		this.addCommand({
			id: "toggle-icons",
			name: "Toggle notation icons",
			callback: () => this.toggleNotations(),
		});

		// Detect if iconize plugin is enabled
		const plugins = (
			this.app as unknown as { plugins: { enabledPlugins: Set<string> } }
		).plugins;
		if (plugins.enabledPlugins.has("obsidian-icon-folder")) {
			setTimeout(() => {
				this.reload();
			}, 2500);
		}

		// Add the settings tab
		this.addSettingTab(new settingsTab(this.app, this));
	}

	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ FIX BROKEN ICONIZE ICONS AT STARTUP                                                  ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

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
	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ UPDATE COLORS IN REAL-TIME                                                           ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

	private updateSvgFill = (settings: Settings) => {
		const svgElements = document.querySelectorAll("svg");

		for (const svg of Array.from(svgElements)) {
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

			for (const notation of Array.from(notations)) {
				const innerSpans = (notation as HTMLElement).querySelectorAll("span");

				for (const [regex, color] of colorsToApply) {
					for (const span of Array.from(innerSpans)) {
						if (span.textContent && regex.test(span.textContent)) {
							(span as HTMLElement).style.color = color;
						}
					}
				}
			}
		}
		this.updateSvgFill(this.settings);
	}

	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ TOGGLE NOTATION ICONS                                                                ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

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

			notation.classList.toggle("imageMode");
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
						node.childNodes.forEach(processNode);
					}
				};

				notation.childNodes.forEach(processNode);
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

	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ SETTINGS STATE                                                                       ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
