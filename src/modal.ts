import { Modal, Setting, Notice } from "obsidian";
import type { App, MarkdownView, Plugin } from "obsidian";
import type comboColors from "./main";

interface AppWithPlugins extends App {
	plugins: {
		getPlugin(id: string): Plugin;
	};
}

export interface InputConfig {
	name: string;
	description: string;
	color: string;
}

export class InputsModal extends Modal {
	private inputs: InputConfig[] = [];

	constructor(
		app: App,
		private readonly onSubmit: (inputs: InputConfig[]) => Promise<void>,
		private readonly profileId: string,
		initialInputs?: InputConfig[],
	) {
		super(app);
		if (initialInputs) {
			this.inputs = [...initialInputs];
		}
	}

	private addInputRow(containerEl: HTMLElement, input?: InputConfig) {
		const newInput: InputConfig = input || {
			name: "",
			description: "",
			color: "#FFFFFF",
		};

		if (!input) {
			this.inputs.push(newInput);
		}

		const rowContainer = containerEl.createDiv({
			cls: "custom-profile-row",
		});

		new Setting(rowContainer)
			.setName("Input")
			.setDesc("Case sensitive")
			.addText((text) => {
				text.setPlaceholder("LP");
				if (newInput.name) {
					text.setValue(newInput.name);
				}
				text.onChange((value) => {
					newInput.name = value;
				});
			});

		new Setting(rowContainer)
			.setName("Description")
			.setDesc("Optional")
			.setClass("input-description")
			.addText((text) => {
				text.setPlaceholder("Light Punch");
				if (newInput.description) {
					text.setValue(newInput.description);
				}
				text.onChange((value) => {
					newInput.description = value;
				});
			});

		new Setting(rowContainer)
			.setName("Default Color")
			.setDesc("Used when resetting")
			.addText((text) => {
				text.inputEl.type = "color";
				text.setValue(newInput.color || "#FFFFFF");
				text.onChange(async (value) => {
					newInput.color = value;
					// Get the plugin instance
					const plugin = (this.app as AppWithPlugins).plugins.getPlugin(
						"combo-colors",
					) as comboColors;

					// Update the color in the profile temporarily
					const profileData = plugin.settings.profiles[this.profileId];
					if (profileData && newInput.name) {
						profileData.colors[newInput.name] = value;
						await plugin.saveSettings();
						plugin.updateColorsForProfile(this.profileId);
					}
				});
			});

		new Setting(rowContainer).addButton((btn) =>
			btn
				.setIcon("trash")
				.setWarning()
				.onClick(() => {
					const index = this.inputs.indexOf(newInput);
					if (index > -1) {
						this.inputs.splice(index, 1);
						rowContainer.remove();
					}
				}),
		);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Edit inputs" });

		const inputsContainer = contentEl.createDiv({ cls: "inputs-container" });

		// Add existing inputs if any
		if (this.inputs.length > 0) {
			for (const input of this.inputs) {
				this.addInputRow(inputsContainer, input);
			}
		} else {
			this.addInputRow(inputsContainer);
		}

		// Add Input button below the inputs
		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Add Input")
				.onClick(() => this.addInputRow(inputsContainer)),
		);

		// Add button container with proper spacing
		const buttonContainer = contentEl.createDiv({
			cls: "modal-button-container",
		});

		new Setting(buttonContainer)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => this.close()),
			)
			.addButton((btn) =>
				btn
					.setButtonText("Save")
					.setCta()
					.onClick(async () => {
						if (this.inputs.some((input) => !input.name)) {
							new Notice("Please fill in all input fields");
							return;
						}

						// Get the plugin instance
						const plugin = (this.app as AppWithPlugins).plugins.getPlugin(
							"combo-colors",
						) as comboColors;
						const profileData = plugin.settings.profiles[this.profileId];

						// Clear existing descriptions (but not colors since they're already updated)
						profileData.desc = {};

						// Update descriptions and store default colors
						for (const input of this.inputs) {
							profileData.desc[input.name] = input.description;

							// Store the current color as default if it's not already set
							if (!profileData.defaultColors) {
								profileData.defaultColors = {};
							}
							if (!profileData.defaultColors[input.name]) {
								profileData.defaultColors[input.name] = input.color;
							}
						}

						await this.onSubmit(this.inputs);

						// Rerender all visible markdown leaves that use this profile
						const leaves = this.app.workspace.getLeavesOfType("markdown");
						for (const leaf of leaves) {
							const view = leaf.view as MarkdownView;
							const file = view.file;
							if (!file) continue;

							const frontmatter = this.app.metadataCache.getCache(
								file.path,
							)?.frontmatter;
							const fileProfileId = frontmatter?.cc_profile;

							// Only rerender if the file explicitly uses this profile
							if (
								view.getMode() === "preview" &&
								fileProfileId === this.profileId
							) {
								view.previewMode.rerender(true);
							}
						}

						this.close();
					}),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class CustomProfileModal extends Modal {
	constructor(
		app: App,
		private readonly onSubmit: (
			profileId: string,
			profileName: string,
		) => Promise<void>,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Create profile" });

		let profileId = "";
		let profileName = "";

		new Setting(contentEl).setName("Display name").addText((text) => {
			text.setPlaceholder("Custom");
			text.onChange((value) => {
				profileName = value;
			});
		});

		new Setting(contentEl)
			.setName("Frontmatter ID")
			.setDesc("Unique Identifier used by cc_profile")
			.addText((text) => {
				text.setPlaceholder("cstm");
				text.onChange((value) => {
					profileId = value;
				});
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Create profile")
					.setCta()
					.onClick(async () => {
						if (!profileId || !profileName) {
							new Notice("Please fill in all fields");
							return;
						}
						await this.onSubmit(profileId, profileName);
						this.close();
					}),
			)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => this.close()),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class DeleteProfileModal extends Modal {
	constructor(
		app: App,
		private readonly profileId: string,
		private readonly profileName: string,
		private readonly onConfirm: () => Promise<void>,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Delete profile" });
		contentEl.createEl("p", {
			text: `Are you sure you want to delete the "${this.profileName}" profile? This cannot be undone.`,
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Delete")
					.setWarning()
					.onClick(async () => {
						await this.onConfirm();
						this.close();
					}),
			)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.close();
				}),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
