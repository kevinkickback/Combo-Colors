import {
	type App,
	PluginSettingTab,
	Setting,
	Notice,
	type MarkdownView,
	type Plugin,
} from "obsidian";

import { resetModal } from "./modal";

export interface Settings {
	selectedProfile: string;
	[key: string]: string;
}

export const inputMap = {
	asw: {
		name: "ASW Standard",
		desc: {
			A: "Weak Attack, Weak Punch",
			B: "Strong Attack, Weak Kick",
			C: "Heavy Attack, Strong Punch, Clash",
			D: "Strong Kick, Drive, Dust, Homing Dash, Change",
			E: "Arcana, Extra Attack",
			K: "Kick",
			P: "Punch, Partner",
			S: "Slash, Special",
			HS: "Heavy Slash",
			MS: "MP Skill",
			OD: "Overdrive",
			RC: "Rapid Cancel, Roman Cancel",
			DRC: "Drift Roman Cancel",
			YRC: "Yellow Roman Cancel",
			BRC: "Blue Roman Cancel",
			PRC: "Purple Roman Cancel",
		},
		colors: {
			A: "#DE1616", // red
			B: "#1F8CCC", // blue
			C: "#009E4E", // green
			D: "#E8982C", // orange
			E: "#892CE8", // purple
			K: "#1F8CCC", // blue
			P: "#FF87D1", // pink
			S: "#009E4E", // green
			HS: "#DE1616", // red
			MS: "#E8982C", // orange
			OD: "#892CE8", // purple
			RC: "#DE1616", // red
			DRC: "#DE1616", // red
			BRC: "#1F8CCC", // blue
			YRC: "#E8982C", // orange
			PRC: "#892CE8", // purple
		},
	},
	alt: {
		name: "Modern Alt",
		desc: {
			A: "A Button",
			B: "B Button",
			X: "X Button",
			Y: "Y Button",
			L: "Light Attack",
			M: "Medium Attack",
			H: "Heavy Attack",
			S: "Special Attack",
			U: "Unique Attack",
			A1: "Assist 1",
			A2: "Assist 2",
		},
		colors: {
			A: "#009E4E", // green
			B: "#DE1616", // red
			X: "#1F8CCC", // blue
			Y: "#E8982C", // orange
			L: "#1F8CCC", // blue
			M: "#E8982C", // orange
			H: "#DE1616", // red
			S: "#009E4E", // green
			U: "#FF87D1", // pink
			A1: "#892CE8", // purple
			A2: "#892CE8", // purple
		},
	},
	trd: {
		name: "Traditional",
		desc: {
			P: "Any Punch",
			K: "Any Kick",
			LP: "Light Punch",
			MP: "Medium Punch",
			HP: "Heavy Punch",
			LK: "Light Kick",
			MK: "Medium Kick",
			HK: "Heavy Kick",
			DI: "Drive Impact",
			DR: "Drive Rush",
			VT: "V-Trigger",
		},
		colors: {
			P: "#FF87D1", // pink
			K: "#892CE8", // purple
			LP: "#1F8CCC", // blue
			MP: "#E8982C", // orange
			HP: "#DE1616", // red
			LK: "#1F8CCC", // blue
			MK: "#E8982C", // orange
			HK: "#DE1616", // red
			DI: "#009E4E", // green
			DR: "#009E4E", // green
			VT: "#DE1616", // red
		},
	},
};

export const DEFAULT_SETTINGS: { [key: string]: string } = {
	selectedProfile: "asw",
	...Object.entries(inputMap).reduce(
		(acc, [profileKey, profile]) => {
			for (const [colorKey, colorValue] of Object.entries(profile.colors)) {
				acc[`${profileKey}_${colorKey}`] = colorValue;
			}
			return acc;
		},
		{} as { [key: string]: string },
	),
};

// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ SETTINGS TAB                                                                         ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

export class settingsTab extends PluginSettingTab {
	plugin: Plugin & {
		settings: Settings;
		saveSettings: () => Promise<void>;
		updateColors: (views: MarkdownView[]) => void;
	};

	constructor(
		app: App,
		plugin: Plugin & {
			settings: Settings;
			saveSettings: () => Promise<void>;
			updateColors: (views: MarkdownView[]) => void;
		},
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Profile select dropdown
		new Setting(containerEl)
			.setName("Notation Profile")
			.addDropdown((dropdown) => {
				for (const [key, value] of Object.entries(inputMap)) {
					dropdown.addOption(key, value.name);
				}
				dropdown
					.setValue(this.plugin.settings.selectedProfile)
					.onChange(async (value) => {
						this.plugin.settings.selectedProfile = value;
						await this.plugin.saveSettings();
						this.display();
					});
			})
			// Profile reset button
			.addButton((button) => {
				button.setIcon("reset").onClick(async () => {
					new resetModal(this.app, async () => {
						const profile = this.plugin.settings.selectedProfile;
						for (const [key, color] of Object.entries(
							inputMap[profile as keyof typeof inputMap].colors,
						)) {
							this.plugin.settings[`${profile}_${key}`] =
								DEFAULT_SETTINGS[`${profile}_${key}`];
						}
						await this.plugin.saveSettings();
						this.display();
						this.plugin.updateColors(
							this.plugin.app.workspace
								.getLeavesOfType("markdown")
								.map((leaf) => leaf.view as MarkdownView),
						);
						new Notice("Default colors restored");
					}).open();
				});
			});

		// Profile Select description
		const profileSettingDesc = containerEl.createEl("p", {
			cls: "setting-item-description-custom",
		});

		const profileName = document.createElement("span");
		profileName.textContent = `profile: ${this.plugin.settings.selectedProfile}`;
		profileName.classList.add("hlt-interaction");

		profileSettingDesc.appendChild(
			document.createTextNode("To use this profile, add  "),
		);
		profileSettingDesc.appendChild(profileName);
		profileSettingDesc.appendChild(
			document.createTextNode("  to the file's frontmatter"),
		);

		// Copy to clipboard
		profileName.onclick = () => {
			navigator.clipboard.writeText(
				`profile: ${this.plugin.settings.selectedProfile}`,
			);
			new Notice("Copied to clipboard");
		};

		// Input color picker settings
		const selectedProfile = this.plugin.settings
			.selectedProfile as keyof typeof inputMap;
		for (const [inputSetting, desc] of Object.entries(
			inputMap[selectedProfile].desc,
		)) {
			new Setting(containerEl)
				.setName(inputSetting)
				.setDesc(desc as string)
				.addText((text) => {
					text.inputEl.type = "color";
					text
						.setValue(
							this.plugin.settings[`${selectedProfile}_${inputSetting}`],
						)
						.onChange(async (value) => {
							this.plugin.settings[`${selectedProfile}_${inputSetting}`] =
								value;
							await this.plugin.saveSettings();
							// update colors in all open notes
							this.plugin.updateColors(
								this.plugin.app.workspace
									.getLeavesOfType("markdown")
									.filter(
										(leaf) =>
											(leaf.view as MarkdownView).getMode() === "preview",
									)
									.map((leaf) => leaf.view as MarkdownView),
							);
						});
				})
				// Color picker reset button
				.addButton((button) => {
					button.setIcon("reset").onClick(async () => {
						const defaultColor =
							DEFAULT_SETTINGS[`${selectedProfile}_${inputSetting}`];
						this.plugin.settings[`${selectedProfile}_${inputSetting}`] =
							defaultColor;
						await this.plugin.saveSettings();
						this.display();
						// update colors in all open notes
						this.plugin.updateColors(
							this.plugin.app.workspace
								.getLeavesOfType("markdown")
								.filter(
									(leaf) => (leaf.view as MarkdownView).getMode() === "preview",
								)
								.map((leaf) => leaf.view as MarkdownView),
						);
					});
				});
		}

		// Footnote message
		const footnoteMessage = containerEl.createEl("p", { cls: "gamesList" });
		footnoteMessage.appendChild(
			document.createTextNode("Games currently using this profile:"),
		);

		// Games list display
		const gamesListContainer = containerEl.createDiv({
			cls: "gamesList",
		});
		const gameFolders = new Set(
			this.app.vault
				.getFiles()
				.filter((file) => file.extension === "md")
				.map(
					(note) =>
						this.plugin.app.metadataCache.getFileCache(note)?.frontmatter
							?.profile === this.plugin.settings.selectedProfile &&
						note.parent?.path,
				)
				.filter(Boolean),
		);

		if (gameFolders.size) {
			for (const folder of Array.from(gameFolders).sort()) {
				const folders = gamesListContainer.createEl("span", {
					cls: "individual-game",
				});
				folders.textContent = folder || null;
			}
		} else {
			const noGamesMessage = gamesListContainer.createEl("span", {
				cls: "no-games",
			});
			noGamesMessage.textContent = "None";
		}
	}
}
