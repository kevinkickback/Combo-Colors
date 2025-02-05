import {
	type MarkdownPostProcessorContext,
	MarkdownView,
	Plugin,
} from "obsidian";
import { type Settings, settingsTab, DEFAULT_SETTINGS } from "./settings";
import { imageMap, colorPatterns } from "./patterns";

export default class comboColors extends Plugin {
	styleElement: HTMLStyleElement;
	settings: Settings;

	async onload() {
		// Create dynamic stylesheet & initialize color rules
		this.styleElement = createEl("style");
		this.styleElement.id = "dynamic-colors";
		document.head.appendChild(this.styleElement);

		await this.loadSettings();

		// Initialize colors for the default profile
		this.updateColorsForProfile(this.settings.selectedProfile);

		// Syntax processor (must be before color processor)
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			const processNode = (node: Node) => {
				if (node.nodeType === Node.TEXT_NODE) {
					const text = node.textContent || "";
					const regex = /=:(.+?):=/g;
					let match = regex.exec(text);

					if (!match) return;

					const fragment = createFragment();
					let lastIndex = 0;

					while (match) {
						fragment.appendText(text.slice(lastIndex, match.index));
						fragment.append(
							element.createSpan({ cls: "notation", text: match[1] }),
						);
						lastIndex = regex.lastIndex;
						match = regex.exec(text);
					}

					fragment.appendText(text.slice(lastIndex));
					(node as ChildNode).replaceWith(fragment);
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					Array.from(node.childNodes).forEach(processNode);
				}
			};

			Array.from(element.childNodes).forEach(processNode);
		});

		// Color processor
		this.registerMarkdownPostProcessor(
			(element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const file = context.sourcePath;
				const frontmatter = this.app.metadataCache.getCache(file)?.frontmatter;

				const profileId =
					(frontmatter?.cc_profile as string | undefined) ||
					this.settings.selectedProfile;
				const profile = this.settings.profiles[profileId];

				for (const notation of element.querySelectorAll(".notation")) {
					const textMode = notation.textContent || "";
					(notation as HTMLElement).dataset.textMode = textMode;

					if (!profile) {
						notation.textContent = "[ No notation profile in frontmatter ]";
						notation.classList.add("warning");
						continue;
					}

					const patterns = colorPatterns(profile);

					for (const childNode of Array.from(notation.childNodes)) {
						if (childNode.nodeType !== Node.TEXT_NODE) continue;

						const textContent = childNode.textContent || "";
						const matchRanges: Array<{
							start: number;
							end: number;
							input: string;
							text: string;
						}> = [];

						for (const [pattern, input] of patterns.entries()) {
							pattern.lastIndex = 0;
							let match: RegExpExecArray | null;
							while (true) {
								match = pattern.exec(textContent);
								if (!match) break;
								matchRanges.push({
									start: match.index,
									end: match.index + match[0].length,
									input,
									text: match[0],
								});
							}
						}

						matchRanges.sort((a, b) => a.start - b.start);

						const fragment = createFragment();
						let lastIndex = 0;

						for (const { start, end, input, text } of matchRanges) {
							if (lastIndex < start) {
								fragment.appendText(textContent.slice(lastIndex, start));
							}

							const span = element.createSpan({
								cls: `cc-${profileId}-${input}`,
								text,
								attr: {
									"data-color-input": input,
									"data-profile-id": profileId,
									style: `color: ${profile.colors[input]}`,
								},
							});
							fragment.append(span);

							lastIndex = end;
						}

						if (lastIndex < textContent.length) {
							fragment.appendText(textContent.slice(lastIndex));
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
					const comboButton = element.createEl("button", {
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

	updateColorsForProfile(profileId: string) {
		const profile = this.settings.profiles[profileId];
		if (!profile) return;

		const sheet = this.styleElement.sheet;
		if (!sheet) return;

		// Clear existing rules
		while (sheet.cssRules.length > 0) {
			sheet.deleteRule(0);
		}

		// Add new rules for each input in the profile
		for (const [input, color] of Object.entries(profile.colors)) {
			const className = `cc-${profileId}-${input}`;
			sheet.insertRule(`.${className} { color: ${color} !important; }`);
			// Single rule for SVG colors - path/circle get color, text stays white
			sheet.insertRule(
				`.${className} svg path, .${className} svg circle { fill: ${color} !important; }`,
			);
			sheet.insertRule(`.${className} svg text { fill: white !important; }`);
		}

		// Update any existing SVGs in the document
		const elements = this.app.workspace.containerEl.querySelectorAll(
			`[data-profile-id="${profileId}"]`,
		);
		for (const element of elements) {
			const input = element.getAttribute("data-color-input");
			if (input && profile.colors[input]) {
				const color = profile.colors[input];
				const svgElements = element.querySelectorAll("svg path, svg circle");
				for (const el of svgElements) {
					(el as SVGElement).style.fill = color;
				}
				const textElements = element.querySelectorAll("svg text");
				for (const el of textElements) {
					(el as SVGElement).style.fill = "white";
				}
			}
		}
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

		// Get the profile ID and profile from the span's parent notation element
		const notation = span.closest(".notation");
		const profileId = notation
			?.querySelector("[data-profile-id]")
			?.getAttribute("data-profile-id");
		const profile = profileId ? this.settings.profiles[profileId] : null;

		if (!profile) return;

		while (pos < text.length) {
			const fragment = createFragment();
			let matched = false;

			// Check if we're at a position after 'x' to prevent matching motion inputs
			const isAfterX = pos > 0 && text[pos - 1].toLowerCase() === "x";

			for (const [regex, config] of imageMap(profile)) {
				regex.lastIndex = 0;
				// Skip motion input patterns if we're after an 'x'
				if (isAfterX && config.type === "img") continue;

				const match = regex.exec(text.substring(pos));
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
									return svg;
								})()
							: span.createEl("img", {
									cls: config.class || "default-class",
									attr: {
										src: config.source,
										alt: config.alt,
									},
								});

					if (element) fragment.append(element);
				}
				pos += match[0].length;
				matched = true;
				break;
			}

			if (!matched) {
				fragment.appendText(text[pos]);
				pos++;
			}
			span.append(fragment);
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
