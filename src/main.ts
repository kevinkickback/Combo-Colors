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
import { imageMap, regPatterns } from "./notations";

// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ MAIN PLUGIN CLASS                                                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

export default class comboColors extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		// Register the syntax processor
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			const textElements = element.querySelectorAll(
				"p, blockquote, ul, ol, li",
			);
			for (const textElement of Array.from(textElements)) {
				let text = textElement.innerHTML;

				text = text.replace(/=:(.+?):=/g, (match, p1) => {
					const span = createEl("span", { cls: "notation", text: p1 });
					return span.outerHTML;
				});
				textElement.innerHTML = text;
			}
		});

		// Register the color processor second
		this.registerMarkdownPostProcessor(
			(element: HTMLElement, context: MarkdownPostProcessorContext) => {
				const notations = element.querySelectorAll<HTMLElement>(".notation");

				for (const notation of Array.from(notations)) {
					const inputs = regPatterns(this.settings);
					const file = context.sourcePath;
					const fileAbstract = this.app.vault.getAbstractFileByPath(file);
					if (!(fileAbstract instanceof TFile)) return;

					const fileCache = this.app.metadataCache.getFileCache(fileAbstract);
					const profile = fileCache?.frontmatter
						?.profile as keyof typeof inputs;

					notation.dataset.textMode = notation.textContent || "";

					if (!profile || !inputs[profile]) {
						notation.textContent = "[ No notation profile in frontmatter ]";
						notation.addClass("warning");
						continue;
					}

					const colorsToApply = inputs[profile];

					for (const childNode of Array.from(notation.childNodes)) {
						if (childNode.nodeType === Node.TEXT_NODE) {
							let textContent = childNode.textContent || "";
							const parentNode = childNode.parentNode;

							for (const [regex, mappedColor] of colorsToApply) {
								textContent = textContent.replace(
									new RegExp(regex, "g"),
									(match) => {
										const spanElement = createEl("span", { text: match });
										spanElement.style.color = mappedColor;
										return spanElement.outerHTML;
									},
								);
							}

							const tempDiv = createEl("div");
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
			for (const codeblock of Array.from(element.querySelectorAll("code"))) {
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

		// Register editor change event
		this.registerEvent(
			this.app.workspace.on("editor-change", () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!activeView || !activeView.file) return;

				const activeFilePath = activeView.file.path;
				const leaves = this.app.workspace
					.getLeavesOfType("markdown")
					.filter((leaf) => {
						const view = leaf.view;
						return (
							view instanceof MarkdownView &&
							(view === activeView || view.getMode() === "preview") &&
							view.file?.path === activeFilePath
						);
					});

				for (const leaf of leaves) {
					const notations =
						leaf.view.containerEl.querySelectorAll<HTMLElement>(".notation");
					for (const notation of Array.from(notations)) {
						if (notation.dataset.textMode) {
							const html = notation.dataset.textMode;
							const tempDiv = createEl("div");
							tempDiv.innerHTML = html;
							notation.innerHTML = "";
							while (tempDiv.firstChild) {
								notation.appendChild(tempDiv.firstChild);
								activeView.previewMode.rerender(true);
							}
						}

						const fileCache = this.app.metadataCache.getFileCache(
							activeView.file,
						);
						const profile = fileCache?.frontmatter?.profile;
						const inputs = regPatterns(this.settings);

						if (profile || inputs[profile as keyof typeof inputs]) {
							notation.textContent = notation.dataset.textMode || "";
						}
						notation.removeClass("image-notation");
					}

					const button =
						leaf.view.containerEl.querySelector<HTMLElement>(".combo");
					if (button) {
						button.textContent = "Icon Notation";
					}
				}
			}),
		);

		// Detect if iconize plugin is enabled
		this.app.workspace.onLayoutReady(async () => {
			const iconize = "obsidian-icon-folder";
			if (this.isPluginEnabled(iconize)) {
				setTimeout(() => {
					this.reload();
				}, 2500);
			}
		});

		// Add the toggle-icons command
		this.addCommand({
			id: "toggle-icons",
			name: "Toggle notation icons",
			callback: () => this.toggleNotations(),
		});

		// Add the settings tab
		this.addSettingTab(new settingsTab(this.app, this));
	}

	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ FIX BROKEN ICONIZE ICONS AT STARTUP                                                  ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

	isPluginEnabled(pluginId: string): boolean {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const plugins = (this.app as any).plugins;
		return plugins.enabledPlugins.has(pluginId);
	}

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
			if (view.file) {
				console.log(
					`CC | Broken icons detected in ${view.file.basename} tab. Reloading...`,
				);
			}
		}
	}
	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ UPDATE COLORS IN REAL-TIME                                                           ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

	public updateColors(leaves: MarkdownView[]) {
		const inputs = regPatterns(this.settings);
		for (const leaf of leaves) {
			const notations = leaf.containerEl.querySelectorAll(".notation");
			const fileCache = leaf.file
				? this.app.metadataCache.getFileCache(leaf.file)
				: null;
			const profile = fileCache?.frontmatter?.profile as keyof typeof inputs;
			if (!profile || !inputs[profile]) continue;
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
	}

	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ TOGGLE NOTATION ICONS                                                                ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

	private toggleNotations = () => {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const notations =
			activeView.containerEl.querySelectorAll<HTMLElement>(".notation");
		const iconPath = `${this.app.vault.adapter.getResourcePath("").split("?")[0]}/.obsidian/plugins/combo-colors/icons/`;
		const button = activeView.containerEl.querySelector<HTMLElement>(".combo");

		let validNotationsProcessed = false;

		// Handle the notations (image/text toggle)
		for (const notation of Array.from(notations)) {
			if (notation.textContent === "[ No notation profile in frontmatter ]") {
				continue;
			}

			validNotationsProcessed = true;

			let html = notation.innerHTML;
			if (!notation.dataset.textModeColor)
				notation.dataset.textModeColor = html;
			notation.toggleClass(
				"image-notation",
				!notation.hasClass("image-notation"),
			);

			if (html.includes("<img")) {
				const html = notation.dataset.textModeColor;
				const tempDiv = createEl("div");
				tempDiv.innerHTML = html;
				notation.innerHTML = "";
				while (tempDiv.firstChild) {
					notation.appendChild(tempDiv.firstChild);
				}
				delete notation.dataset.textModeColor;
			} else {
				html = html
					.replace(/(<[^>]+>)/g, "||HTML||$1||HTML||")
					.split("||HTML||")
					.map((segment) => {
						if (segment.startsWith("<")) return segment;

						let modifiedSegment = segment;
						for (const [regex, image] of imageMap) {
							const replacement = Array.isArray(image)
								? image
										.map(
											(img) =>
												`<img src="${iconPath}${img}" class="normStyle" />`,
										)
										.join("")
								: `<img src="${iconPath}${image}" class="${image === "5.png" ? "hideStyle" : "normStyle"}" />`;
							modifiedSegment = modifiedSegment.replace(regex, replacement);
						}

						return modifiedSegment;
					})
					.join("");

				const tempDiv = createEl("div");
				tempDiv.innerHTML = html;
				notation.innerHTML = "";
				while (tempDiv.firstChild) {
					notation.appendChild(tempDiv.firstChild);
				}
			}
		}

		// Update the button text based on the mode if valid notations were processed
		if (validNotationsProcessed && button) {
			button.textContent =
				button.textContent === "Text Notation"
					? "Icon Notation"
					: "Text Notation";
		}

		// Call updateColors after textMode has been applied
		this.updateColors([activeView]);
	};

	onunload() {}

	// ╔══════════════════════════════════════════════════════════════════════════════════════╗
	// ║ SETTINGS STATE                                                                       ║
	// ╚══════════════════════════════════════════════════════════════════════════════════════╝

	// Load settings from storage
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// Save settings to storage
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
