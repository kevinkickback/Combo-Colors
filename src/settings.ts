import { type App, PluginSettingTab, Setting, Notice } from "obsidian";
import { CustomProfileModal, DeleteProfileModal, InputsModal } from "./modal";
import type comboColors from "./main";

export interface CustomProfile {
	name: string;
	desc: { [key: string]: string };
	colors: Record<string, string>;
	defaultColors?: Record<string, string>;
}

export interface Settings {
	selectedProfile: string;
	profiles: {
		[key: string]: CustomProfile;
	};
	[key: string]: string | { [key: string]: CustomProfile };
}

export type InputMapType = {
	[key: string]: {
		name: string;
		desc: Record<string, string>;
		colors: Record<string, string>;
	};
};

export const inputMap: InputMapType = {
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

export const DEFAULT_SETTINGS: Settings = {
	selectedProfile: "asw",
	profiles: {
		...inputMap,
	},
};

export class settingsTab extends PluginSettingTab {
	plugin: comboColors;

	constructor(app: App, plugin: comboColors) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private createProfileSection(containerEl: HTMLElement): void {
		const profile = this.plugin.settings.selectedProfile;
		const profileData = this.plugin.settings.profiles[profile];
		if (!profileData) {
			new Notice("Profile not found!");
			return;
		}

		const profileSetting = new Setting(containerEl)
			.setName("Notation profile")
			.addDropdown((dropdown) => {
				// Add all profiles
				for (const [key, profile] of Object.entries(
					this.plugin.settings.profiles,
				)) {
					dropdown.addOption(key, profile.name);
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
				button.setIcon("plus").onClick(() => {
					new CustomProfileModal(this.app, async (profileId, profileName) => {
						// Check if profile ID already exists
						if (profileId in this.plugin.settings.profiles) {
							new Notice("Profile ID already exists!");
							return;
						}

						const newProfile: CustomProfile = {
							name: profileName,
							desc: {},
							colors: {},
						};

						this.plugin.settings.profiles[profileId] = newProfile;
						this.plugin.settings.selectedProfile = profileId;
						await this.plugin.saveSettings();
						this.display();
						new Notice("Custom profile created!");
					}).open();
				}),
			)
			.addButton((button) => {
				button
					.setIcon("trash")
					.setWarning()
					.onClick(() => {
						new DeleteProfileModal(
							this.app,
							this.plugin.settings.selectedProfile,
							async () => {
								const profileId = this.plugin.settings.selectedProfile;
								delete this.plugin.settings.profiles[profileId];
								this.plugin.settings.selectedProfile = "asw"; // Reset to default profile
								await this.plugin.saveSettings();
								this.display();
								new Notice("Custom profile deleted!");
							},
						).open();
					});

				// Disable delete button for default profiles
				if (profile in inputMap) {
					button.setDisabled(true);
				}
				return button;
			});

		const descFragment = createFragment();
		descFragment.append("To use this profile, add ");
		const span = descFragment.createEl("span", {
			text: `cc_profile: ${this.plugin.settings.selectedProfile}`,
			cls: "hlt-interaction",
		});
		span.onclick = async () => {
			await navigator.clipboard.writeText(
				`cc_profile: ${this.plugin.settings.selectedProfile}`,
			);
			new Notice("Copied to clipboard!");
		};
		descFragment.append(" to the file's frontmatter");

		profileSetting.setDesc(descFragment);
	}

	private createColorSection(containerEl: HTMLElement): void {
		const profile = this.plugin.settings.selectedProfile;
		const profileData = this.plugin.settings.profiles[profile];
		if (!profileData) {
			new Notice("Profile not found!");
			return;
		}

		const resetSingleColor = async (input: string) => {
			const defaultProfile = inputMap[profile];
			if (defaultProfile?.colors?.[input]) {
				// For built-in profiles, use the default color from inputMap
				profileData.colors[input] = defaultProfile.colors[input];
			} else if (
				profileData.desc[input] &&
				profileData.defaultColors?.[input]
			) {
				// For custom profiles, use the stored default color
				profileData.colors[input] = profileData.defaultColors[input];
			}
			await this.plugin.saveSettings();
			this.plugin.updateColorsForProfile(profile);
			this.display();
		};

		for (const [input, desc] of Object.entries(profileData.desc)) {
			new Setting(containerEl)
				.setName(input)
				.setDesc(desc)
				.addText((text) => {
					text.inputEl.type = "color";
					text
						.setValue(profileData.colors[input] || "#000000")
						.onChange(async (value) => {
							profileData.colors[input] = value;
							await this.plugin.saveSettings();
							this.plugin.updateColorsForProfile(profile);
						});
				})
				.addButton((button) =>
					button.setIcon("reset").onClick(() => resetSingleColor(input)),
				);
		}

		// Add "Add Input" button for custom profiles
		if (!(profile in inputMap)) {
			new Setting(containerEl).addButton((button) =>
				button
					.setButtonText("Edit Inputs")
					.setCta()
					.onClick(() => {
						const existingInputs = Object.entries(profileData.desc).map(
							([name, description]) => ({
								name,
								description,
								// Use the current color as the starting value in the modal
								color: profileData.colors[name] || "#000000",
							}),
						);

						new InputsModal(
							this.app,
							async (inputs) => {
								// Store the current colors before clearing
								const previousColors = { ...profileData.colors };

								// Clear existing inputs
								profileData.desc = {};
								profileData.colors = {};

								// Add new/updated inputs
								for (const input of inputs) {
									profileData.desc[input.name] = input.description;
									// If this is an existing input and the color hasn't changed,
									// preserve the current color instead of making the modal color the new default
									if (previousColors[input.name] === input.color) {
										profileData.colors[input.name] = previousColors[input.name];
									} else {
										// If it's a new input or the color was changed in the modal,
										// use the modal's color as both the current and default color
										profileData.colors[input.name] = input.color;
										// Store the default color
										if (!profileData.defaultColors) {
											profileData.defaultColors = {};
										}
										profileData.defaultColors[input.name] = input.color;
									}
								}
								await this.plugin.saveSettings();
								this.plugin.updateColorsForProfile(profile);
								this.display();
								new Notice("Profile inputs updated!");
							},
							existingInputs,
						).open();
					}),
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
