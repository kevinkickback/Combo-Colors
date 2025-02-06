import {
	type MarkdownPostProcessorContext,
	MarkdownView,
	Plugin,
	type WorkspaceLeaf,
} from "obsidian";
import { type Settings, settingsTab, DEFAULT_SETTINGS } from "./settings";
import { imageMap, colorPatterns } from "./patterns";

export default class comboColors extends Plugin {
	styleElement: HTMLStyleElement;
	settings: Settings;
	// Track leaves that need rerendering after profile changes
	private metadataChanged: Map<string, WorkspaceLeaf>;

	async onload() {
		this.styleElement = createEl("style", { attr: { id: "dynamic-colors" } });
		document.head.appendChild(this.styleElement);
		this.metadataChanged = new Map();

		await this.loadSettings();

		// Generate CSS rules for all profiles to ensure frontmatter overrides work immediately
		for (const profileId of Object.keys(this.settings.profiles)) {
			this.updateColorsForProfile(profileId);
		}

		// First processor: Convert =:notation:= syntax into spans
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			const processNode = (node: Node) => {
				if (node.nodeType !== Node.TEXT_NODE) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						for (const child of node.childNodes) processNode(child);
					}
					return;
				}

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
				if (node.parentNode) {
					node.parentNode.replaceChild(fragment, node);
				}
			};

			for (const node of element.childNodes) processNode(node);
		});

		// Second processor: Apply colors and process inputs based on profile from frontmatter
		this.registerMarkdownPostProcessor(
			(element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const file = context.sourcePath;
				const frontmatter = this.app.metadataCache.getCache(file)?.frontmatter;
				const frontmatterProfile = frontmatter?.cc_profile;
				const profileId = frontmatterProfile
					? String(frontmatterProfile).trim()
					: null;
				const profile = profileId ? this.settings.profiles[profileId] : null;

				for (const notation of element.querySelectorAll(".notation")) {
					if (!(notation instanceof HTMLElement)) continue;

					const textMode = notation.textContent || "";
					notation.dataset.textMode = textMode;

					if (!profile) {
						notation.textContent = "[ No notation profile in frontmatter ]";
						notation.classList.add("warning");
						continue;
					}

					const patterns = colorPatterns(profile);
					for (const childNode of notation.childNodes) {
						if (childNode.nodeType !== Node.TEXT_NODE) continue;

						const textContent = childNode.textContent || "";
						const matchRanges = [];

						// Collect all matches first to handle overlapping patterns correctly
						for (const [pattern, input] of patterns.entries()) {
							pattern.lastIndex = 0;
							let match: RegExpExecArray | null = pattern.exec(textContent);
							while (match !== null) {
								matchRanges.push({
									start: match.index,
									end: match.index + match[0].length,
									input,
									text: match[0],
								});
								match = pattern.exec(textContent);
							}
						}

						if (!matchRanges.length) continue;

						matchRanges.sort((a, b) => a.start - b.start);
						const fragment = createFragment();
						let lastIndex = 0;

						for (const { start, end, input, text } of matchRanges) {
							if (lastIndex < start) {
								fragment.appendText(textContent.slice(lastIndex, start));
							}
							fragment.append(
								element.createSpan({
									cls: `cc-${profileId}-${input} cc-profile-color`,
									text,
									attr: {
										"data-color-input": input,
										"data-profile-id": profileId,
									},
								}),
							);
							lastIndex = end;
						}

						if (lastIndex < textContent.length) {
							fragment.appendText(textContent.slice(lastIndex));
						}

						if (childNode.parentNode) {
							childNode.parentNode.replaceChild(fragment, childNode);
						}
					}
				}
			},
		);

		// Create button from 'comboButton' codeblock
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			for (const codeblock of element.querySelectorAll<HTMLElement>("code")) {
				if (
					codeblock.innerText.trim() === "comboButton" &&
					codeblock.parentNode
				) {
					const button = element.createEl("button", {
						text: "Icon Notation",
						cls: "combo",
					});
					this.registerDomEvent(button, "click", this.toggleNotations);
					codeblock.parentNode.replaceChild(button, codeblock);
				}
			}
		});

		// Handle profile changes in frontmatter
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				const metadata = this.app.metadataCache.getFileCache(file);
				if (!metadata?.frontmatter) return;

				for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
					const view = leaf.view;
					if (!(view instanceof MarkdownView) || view.file !== file) continue;

					if (view.getMode() === "preview") {
						view.previewMode.rerender(true);
					} else if (view.getMode() === "source") {
						// Queue source view for rerender when switching to preview
						this.metadataChanged.set(file.path, leaf);
					}
				}
			}),
		);

		// Process queued rerenders when switching views
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
					const view = leaf.view;
					if (!(view instanceof MarkdownView)) continue;

					const filePath = view.file?.path;
					if (!filePath || view.getMode() !== "preview") continue;

					const matchedLeaf = this.metadataChanged.get(filePath);
					if (matchedLeaf === leaf) {
						view.previewMode.rerender(true);
						this.metadataChanged.delete(filePath);
					}
				}
			}),
		);

		this.addCommand({
			id: "toggle-icons",
			name: "Toggle notation icons",
			callback: this.toggleNotations,
		});

		this.addSettingTab(new settingsTab(this.app, this));
	}

	updateColorsForProfile(profileId: string) {
		const profile = this.settings.profiles[profileId];
		if (!profile) return;

		const sheet = this.styleElement.sheet;
		if (!sheet) return;

		// Remove existing rules for this profile before adding new ones
		for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
			const rule = sheet.cssRules[i];
			if (
				rule instanceof CSSStyleRule &&
				rule.selectorText.includes(`cc-${profileId}-`)
			) {
				sheet.deleteRule(i);
			}
		}

		// Add color rules using CSS custom properties
		for (const [input, color] of Object.entries(profile.colors)) {
			const className = `cc-${profileId}-${input}`;
			sheet.insertRule(`.${className} { --notation-color: ${color}; }`);
		}

		// Update existing elements to use new color classes
		const elements =
			this.app.workspace.containerEl.querySelectorAll<HTMLElement>(
				`[data-profile-id="${profileId}"]`,
			);

		for (const element of elements) {
			const input = element.getAttribute("data-color-input");
			if (!input || !profile.colors[input]) continue;

			element.classList.add(`cc-${profileId}-${input}`, "cc-profile-color");
		}
	}

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

			// Cache text content for toggling back to text mode
			notation.dataset.textMode ||= notation.textContent || "";
			const isImageMode = !notation.hasClass("imageMode");
			notation.toggleClass("imageMode", isImageMode);

			if (isImageMode) {
				// Convert all spans and text nodes to images
				for (const span of notation.querySelectorAll<HTMLElement>("span")) {
					this.convertTextToImages(span);
				}

				for (const node of notation.childNodes) {
					if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
						const span = notation.createSpan({ text: node.textContent });
						if (node.parentNode) {
							node.parentNode.replaceChild(span, node);
							this.convertTextToImages(span);
						}
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
		if (!text) return;

		const notation = span.closest(".notation");
		const profileId = notation
			?.querySelector("[data-profile-id]")
			?.getAttribute("data-profile-id");
		const profile = profileId ? this.settings.profiles[profileId] : null;
		if (!profile) return;

		span.empty();
		const fragment = createFragment();
		let pos = 0;
		const motions = imageMap(profile);

		while (pos < text.length) {
			let matched = false;
			// Skip motion inputs after 'x' to prevent matching in combinations (e.g., 2x4)
			const isAfterX = pos > 0 && text[pos - 1].toLowerCase() === "x";

			for (const [regex, config] of motions) {
				regex.lastIndex = 0;
				if (isAfterX && config.type === "img") continue;

				const match = regex.exec(text.substring(pos));
				if (!match || match.index !== 0) continue;

				// Create the element based on type
				const element =
					config.type === "svg"
						? this.createSvgElement(span, config)
						: span.createEl("img", {
								cls: config.class || "default-class",
								attr: {
									src: config.source,
									alt: config.alt,
								},
							});

				if (element) {
					const count = config.repeat || 1;
					for (let i = 0; i < count; i++) {
						fragment.append(i === 0 ? element : element.cloneNode(true));
					}
				}

				pos += match[0].length;
				matched = true;
				break;
			}

			if (!matched) {
				fragment.appendText(text[pos]);
				pos++;
			}
		}

		span.append(fragment);
	}

	private createSvgElement(
		span: HTMLElement,
		config: { class?: string; source: string; alt?: string },
	) {
		const svg = span.createSvg("svg", {
			cls: config.class || "default-class",
			attr: {
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 100 100",
				alt: config.alt || null,
			},
		});
		const svgDoc = new DOMParser().parseFromString(
			config.source,
			"image/svg+xml",
		);
		svg.append(...Array.from(svgDoc.documentElement.childNodes));
		return svg;
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
