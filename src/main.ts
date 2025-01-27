import {
	type MarkdownPostProcessorContext,
	MarkdownView,
	Plugin,
	TFile,
} from "obsidian";
import { type Settings, settingsTab, DEFAULT_SETTINGS } from "./settings";
import { imageMap, regPatterns } from "./patterns";

export default class comboColors extends Plugin {
	settings: Settings;
	private styleElement: HTMLStyleElement;

	async onload() {
		// Create dynamic stylesheet & initialize color rules
		this.styleElement = document.createElement("style");
		this.styleElement.id = "dynamic-colors";
		document.head.appendChild(this.styleElement);

		await this.loadSettings();

		const sheet = this.styleElement.sheet;
		if (sheet) {
			for (const [className, colorValue] of Object.entries(this.settings)) {
				sheet.insertRule(`.${className} { color: ${colorValue} !important; }`);
			}
		}

		// Syntax processor (must be before color processor)
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

		// Color processor
		this.registerMarkdownPostProcessor(
			(element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
				if (!(file instanceof TFile)) return;

				const profile: keyof ReturnType<typeof regPatterns> =
					this.app.metadataCache.getFileCache(file)?.frontmatter?.cc_profile;
				const inputs = regPatterns(this.settings)[profile];

				for (const notation of element.querySelectorAll(".notation")) {
					const textMode = notation.textContent || "";
					(notation as HTMLElement).dataset.textMode = textMode;

					if (!inputs) {
						notation.textContent = "[ No notation profile in frontmatter ]";
						notation.addClass("warning");
						continue;
					}

					const fragment = createFragment();
					let lastIndex = 0;

					for (const childNode of Array.from(notation.childNodes)) {
						if (childNode.nodeType !== Node.TEXT_NODE) continue;

						const textContent = childNode.textContent || "";
						const matchRanges = [];

						for (const [regex, settingName] of inputs) {
							let match: RegExpExecArray | null = regex.exec(textContent);
							while (match !== null) {
								matchRanges.push({
									start: match.index,
									end: match.index + match[0].length,
									settingName,
									text: match[0],
								});
								match = regex.exec(textContent);
							}
						}

						matchRanges.sort((a, b) => a.start - b.start);

						for (const { start, end, settingName, text } of matchRanges) {
							if (lastIndex < start)
								fragment.append(textContent.slice(lastIndex, start));

							const span = createSpan({ text });
							span.classList.add(settingName);
							this.updateColors(settingName, this.settings[settingName]);
							fragment.append(span);

							lastIndex = end;
						}

						if (lastIndex < textContent.length) {
							fragment.append(textContent.slice(lastIndex));
						}

						childNode.replaceWith(fragment);
					}
				}
			},
		);

		// Button processor
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

		// Profile change events
		const metadataChanged = new Map<string, string>();

		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				const metadata = this.app.metadataCache.getFileCache(file);
				if (!metadata || !metadata.frontmatter) return;

				const leaves = this.app.workspace.getLeavesOfType("markdown");
				for (const leaf of leaves) {
					const view = leaf.view as MarkdownView;
					if (view.getMode() === "preview" && view.file === file) {
						view.previewMode.rerender(true);
					} else if (view.getMode() === "source" && view.file === file) {
						// @ts-ignore
						metadataChanged.set(file.path, leaf.id);
					}
				}
			}),
		);

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				const leaves = this.app.workspace.getLeavesOfType("markdown");
				for (const leaf of leaves) {
					const view = leaf.view as MarkdownView;
					const filePath = view.file?.path;

					if (!filePath) continue;

					if (view.getMode() === "preview" && metadataChanged.has(filePath)) {
						const metadataId = metadataChanged.get(filePath);

						// @ts-ignore
						if (metadataId === leaf.id) {
							view.previewMode.rerender(true);
							metadataChanged.delete(filePath);
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

		// Add the settings tab
		this.addSettingTab(new settingsTab(this.app, this));
	}

	// Update text and icon colors
	public updateColors(className: string, colorValue: string) {
		const sheet = this.styleElement.sheet;
		if (!sheet) return;

		for (let i = 0; i < sheet.cssRules.length; i++) {
			const rule = sheet.cssRules[i];
			if (
				rule instanceof CSSStyleRule &&
				rule.selectorText === `.${className}`
			) {
				sheet.deleteRule(i);
				sheet.insertRule(`.${className} { color: ${colorValue} !important; }`);
				this.updateSvgFill(className);
				return;
			}
		}

		sheet.insertRule(`.${className} { color: ${colorValue} !important; }`);
		this.updateSvgFill(className);
	}

	private updateSvgFill = (className: string) => {
		const newColor = this.settings[className];
		if (!newColor) return;

		for (const span of document.querySelectorAll(`span.${className}`)) {
			const svg = span.querySelector("svg");
			if (svg) {
				const textElement = svg.querySelector("text");
				if (textElement?.textContent?.trim()) {
					const pathElement = svg.querySelector("path");
					if (pathElement) pathElement.setAttribute("fill", newColor);
				}
			}
		}
	};

	// Toggle between text and icon notations
	private toggleNotations = () => {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const notations =
			activeView.containerEl.querySelectorAll<HTMLElement>(".notation");
		const button = activeView.containerEl.querySelector<HTMLElement>(".combo");
		let validNotationsProcessed = false;

		for (const notation of notations) {
			if (notation.textContent === "[ No notation profile in frontmatter ]")
				continue;

			notation.dataset.textMode ||= notation.textContent || "";
			notation.toggleClass("imageMode", !notation.hasClass("imageMode"));

			if (notation.hasClass("imageMode")) {
				for (const span of notation.querySelectorAll<HTMLElement>("span")) {
					this.convertTextToImages(span);
				}

				for (const node of Array.from(notation.childNodes)) {
					if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
						const span = createSpan();
						span.textContent = node.textContent;
						node.replaceWith(span);
						this.convertTextToImages(span);
					}
				}
			} else {
				activeView.previewMode.rerender(true);
			}
			validNotationsProcessed = true;
		}

		if (validNotationsProcessed && button) {
			button.textContent =
				button.textContent === "Text Notation"
					? "Icon Notation"
					: "Text Notation";
		}
	};

	private convertTextToImages(span: HTMLElement) {
		const text = span.textContent || "";
		span.empty();
		let pos = 0;

		while (pos < text.length) {
			const fragment = document.createDocumentFragment();
			let matched = false;

			for (const [regex, config] of imageMap()) {
				const match = regex.exec(text.slice(pos));
				if (!match || match.index !== 0) continue;

				const count = config.repeat || 1;
				for (let i = 0; i < count; i++) {
					const element =
						config.type === "svg"
							? (() => {
									const svg = span.createSvg("svg", {
										cls: config.class || "default-class",
										attr: {
											xmlns: "http://www.w3.org/2000/svg",
											viewBox: "0 0 100 100",
											alt: config.alt,
										},
									});
									const svgDoc = new DOMParser().parseFromString(
										config.source,
										"image/svg+xml",
									);
									svg.append(...Array.from(svgDoc.documentElement.childNodes));
									return svg as unknown as HTMLElement;
								})()
							: span.createEl("img", {
									cls: config.class || "default-class",
									attr: {
										src: config.source,
										alt: config.alt,
									},
								});

					if (element) fragment.appendChild(element);
				}
				pos += match[0].length;
				matched = true;
				break;
			}

			if (!matched) {
				fragment.appendChild(document.createTextNode(text[pos]));
				pos++;
			}
			span.appendChild(fragment);
		}

		if (span.className) {
			this.updateSvgFill(span.className);
		}
	}

	onunload() {
		this.styleElement?.remove();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
