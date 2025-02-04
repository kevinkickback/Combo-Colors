import { type App, PluginSettingTab, Setting, Notice } from "obsidian";
import { resetModal } from "./modal";
import type comboColors from "./main";

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

export class settingsTab extends PluginSettingTab {
	plugin: comboColors;

	constructor(app: App, plugin: comboColors) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// Custom profile selection option
	private createProfileSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Notation profile")
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
			.addButton((button) =>
				button.setIcon("reset").onClick(() =>
					new resetModal(this.app, async () => {
						const profile = this.plugin.settings.selectedProfile;
						for (const [key] of Object.entries(
							inputMap[profile as keyof typeof inputMap].colors,
						)) {
							const settingKey = `${profile}_${key}`;
							this.plugin.settings[settingKey] = DEFAULT_SETTINGS[settingKey];
							this.plugin.updateColors(
								settingKey,
								DEFAULT_SETTINGS[settingKey],
							);
						}
						await this.plugin.saveSettings();
						this.display();
						new Notice("Default colors restored");
					}).open(),
				),
			)
			.setDesc(
				(() => {
					const descEl = createFragment();
					descEl.append("To use this profile, add ");
					const span = descEl.createEl("span", {
						text: `profile: ${this.plugin.settings.selectedProfile}`,
						cls: "hlt-interaction",
					});
					span.onclick = async () => {
						await navigator.clipboard.writeText(
							`profile: ${this.plugin.settings.selectedProfile}`,
						);
						new Notice("Copied to clipboard!");
					};
					descEl.append(" to the file's frontmatter");
					return descEl;
				})(),
			);
	}

	// Color picker and reset button
	private createColorSection(containerEl: HTMLElement): void {
		const profile = this.plugin.settings
			.selectedProfile as keyof typeof inputMap;

		const resetSingleColor = async (input: string) => {
			const settingKey = `${profile}_${input}`;
			this.plugin.settings[settingKey] = DEFAULT_SETTINGS[settingKey];
			this.plugin.updateColors(settingKey, DEFAULT_SETTINGS[settingKey]);
			await this.plugin.saveSettings();
			this.display();
		};

		for (const [input, desc] of Object.entries(inputMap[profile].desc)) {
			new Setting(containerEl)
				.setName(input)
				.setDesc(desc as string)
				.addText((text) => {
					text.inputEl.type = "color";
					text
						.setValue(this.plugin.settings[`${profile}_${input}`])
						.onChange(async (value) => {
							this.plugin.settings[`${profile}_${input}`] = value;
							await this.plugin.saveSettings();
							this.plugin.updateColors(`${profile}_${input}`, value);
						});
				})
				.addButton((button) =>
					button.setIcon("reset").onClick(() => resetSingleColor(input)),
				);
		}
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.createProfileSection(containerEl);
		this.createColorSection(containerEl);
	}
}
