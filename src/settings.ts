import { PluginSettingTab, Setting, Notice } from "obsidian";
import type { App, ColorComponent } from "obsidian";
import { CustomProfileModal, DeleteProfileModal, InputsModal } from "./modal";
import type comboColors from "./main";

export interface CustomProfile {
	name: string;
	desc: Record<string, string>;
	colors: Record<string, string>;
	defaultColors?: Record<string, string>;
	textColor?: string;
}

export interface Settings {
	selectedProfile: string;
	profiles: Record<string, CustomProfile>;
	iconSize: "small" | "medium" | "large";
}

export type InputMapType = Record<string, CustomProfile>;

export const inputMap: InputMapType = {
	asw: {
		name: "ASW Standard",
		desc: {
			A: "Weak attack, weak punch",
			B: "Strong attack, weak kick",
			C: "Heavy attack, strong punch, clash",
			D: "Strong kick, drive, dust, homing dash, change",
			E: "Arcana, extra attack",
			K: "Kick",
			P: "Punch, partner",
			S: "Slash, special",
			HS: "Heavy slash",
			MS: "MP skill",
			OD: "Overdrive",
			RC: "Rapid cancel, roman cancel",
			DRC: "Drift roman cancel",
			YRC: "Yellow roman cancel",
			BRC: "Blue roman cancel",
			PRC: "Purple roman cancel",
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
			A: "A button",
			B: "B button",
			X: "X button",
			Y: "Y button",
			L: "Light attack",
			M: "Medium attack",
			H: "Heavy attack",
			S: "Special attack",
			U: "Unique attack",
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
			P: "Any punch",
			K: "Any kick",
			LP: "Light punch",
			MP: "Medium punch",
			HP: "Heavy punch",
			LK: "Light kick",
			MK: "Medium kick",
			HK: "Heavy kick",
			DI: "Drive impact",
			DR: "Drive rush",
			VT: "V-trigger",
			FA: "Focus attack",
			PP: "Perfect parry",
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
			FA: "#E8982C", // orange
			PP: "#1F8CCC", // blue
		},
	},
};

export const DEFAULT_SETTINGS: Settings = {
	selectedProfile: "asw",
	profiles: { ...inputMap },
	iconSize: "medium",
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
			new Notice("Profile not found");
			return;
		}

		new Setting(containerEl)
			.setName("Notation profile")
			.addButton((button) =>
				button.setIcon("plus").onClick(() => {
					new CustomProfileModal(this.app, async (profileId, profileName) => {
						if (profileId in this.plugin.settings.profiles) {
							new Notice("Profile ID already exists");
							return;
						}

						this.plugin.settings.profiles[profileId] = {
							name: profileName,
							desc: {},
							colors: {},
							textColor: "#FFFFFF",
						};
						this.plugin.settings.selectedProfile = profileId;
						await this.plugin.saveSettings();
						this.display();
						new Notice("Custom profile created");
					}).open();
				}),
			)
			.addButton((button) =>
				button
					.setIcon("trash")
					.setWarning()
					.setDisabled(profile in inputMap)
					.onClick(() => {
						new DeleteProfileModal(
							this.app,
							profile,
							profileData.name,
							async () => {
								delete this.plugin.settings.profiles[profile];
								this.plugin.settings.selectedProfile = "asw";
								await this.plugin.saveSettings();
								this.display();
								new Notice("Custom profile deleted");
							},
						).open();
					}),
			)
			.addDropdown((dropdown) => {
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
			.setDesc(
				createFragment((frag) => {
					frag.appendText("To use this profile, add ");
					const span = frag.createSpan({
						text: `cc_profile: ${profile}`,
						cls: "hlt-interaction",
					});
					span.addEventListener("click", async () => {
						await navigator.clipboard.writeText(`cc_profile: ${profile}`);
						new Notice("Copied to clipboard");
					});
					frag.appendText(" to the file's frontmatter");
				}),
			);

		new Setting(containerEl)
			.setName("Icon size")
			.setDesc("Set the size of notation icons")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("small", "Small")
					.addOption("medium", "Medium")
					.addOption("large", "Large")
					.setValue(this.plugin.settings.iconSize)
					.onChange(async (value: "small" | "medium" | "large") => {
						this.plugin.settings.iconSize = value;
						await this.plugin.saveSettings();
						this.plugin.updateIconSizes();
					});
			});

		new Setting(containerEl)
			.setName("Color settings")
			.setDesc("Customize the colors for notation text and icons");

		const colorSection = containerEl.createDiv({
			cls: "color-settings-container",
		});

		new Setting(colorSection)
			.setName("Text color")
			.setDesc("Applies to all inputs below")
			.addButton((button) =>
				button
					.setIcon("reset")
					.setClass("clickable-icon")
					.setClass("extra-setting-button")
					.onClick(async () => {
						profileData.textColor = "#FFFFFF";
						await this.plugin.saveSettings();
						this.plugin.updateColorsForProfile(profile);
						this.display();
					}),
			)
			.addColorPicker((picker) => {
				picker
					.setValue(profileData.textColor || "#FFFFFF")
					.onChange(async (value) => {
						profileData.textColor = value;
						await this.plugin.saveSettings();
						this.plugin.updateColorsForProfile(profile);
					});
			});

		// Add individual color settings
		for (const [input, desc] of Object.entries(profileData.desc)) {
			let colorPicker: ColorComponent;
			new Setting(colorSection)
				.setName(input)
				.setDesc(desc)
				.addButton((button) => {
					const defaultProfile = inputMap[profile];
					const defaultColor =
						defaultProfile?.colors?.[input] ||
						profileData.defaultColors?.[input];

					return button
						.setIcon("reset")
						.setClass("clickable-icon")
						.setClass("extra-setting-button")
						.setDisabled(!defaultColor)
						.onClick(async () => {
							if (defaultColor) {
								profileData.colors[input] = defaultColor;
								colorPicker.setValue(defaultColor);
								await this.plugin.saveSettings();
								this.plugin.updateColorsForProfile(profile);
							}
						});
				})
				.addColorPicker((picker) => {
					colorPicker = picker;
					picker
						.setValue(profileData.colors[input] || "#000000")
						.onChange(async (value) => {
							profileData.colors[input] = value;
							await this.plugin.saveSettings();
							this.plugin.updateColorsForProfile(profile);
						});
				});
		}

		if (!(profile in inputMap)) {
			new Setting(colorSection).addButton((button) =>
				button.setButtonText("Edit inputs").onClick(() => {
					const existingInputs = Object.entries(profileData.desc).map(
						([name, description]) => ({
							name,
							description,
							color: profileData.colors[name] || "#000000",
						}),
					);

					new InputsModal(
						this.app,
						this.plugin,
						async (inputs) => {
							const previousColors = { ...profileData.colors };
							profileData.desc = {};
							profileData.colors = {};

							for (const input of inputs) {
								profileData.desc[input.name] = input.description;
								if (previousColors[input.name] === input.color) {
									profileData.colors[input.name] = previousColors[input.name];
								} else {
									profileData.colors[input.name] = input.color;
									profileData.defaultColors ??= {};
									profileData.defaultColors[input.name] = input.color;
								}
							}

							await this.plugin.saveSettings();
							this.display();
						},
						profile,
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
	}
}
