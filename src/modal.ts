import { type App, Modal, Setting, Notice } from "obsidian";

export class resetModal extends Modal {
	constructor(
		app: App,
		private readonly onSubmit: () => Promise<void>,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Reset Colors" });
		contentEl.createEl("p", {
			text: "Are you sure you want to reset all colors to their default values?",
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText("Reset").onClick(async () => {
					await this.onSubmit();
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
			color: "#000000",
		};

		if (!input) {
			this.inputs.push(newInput);
		}

		const rowContainer = containerEl.createDiv({
			cls: "custom-profile-row",
		});

		new Setting(rowContainer).setName("Input").addText((text) => {
			text.setPlaceholder("e.g. A, B, LP, MP");
			if (newInput.name) {
				text.setValue(newInput.name);
			}
			text.onChange((value) => {
				newInput.name = value;
			});
		});

		new Setting(rowContainer)
			.setName("Description")
			.setClass("input-description")
			.addText((text) => {
				text.setPlaceholder("e.g. Light Attack");
				if (newInput.description) {
					text.setValue(newInput.description);
				}
				text.onChange((value) => {
					newInput.description = value;
				});
			});

		new Setting(rowContainer).setName("Default Color").addText((text) => {
			text.inputEl.type = "color";
			text.setValue(newInput.color || "#000000");
			text.onChange((value) => {
				newInput.color = value;
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
				btn
					.setButtonText("Save")
					.setCta()
					.onClick(async () => {
						if (
							this.inputs.some((input) => !input.name || !input.description)
						) {
							new Notice("Please fill in all fields for each input");
							return;
						}
						await this.onSubmit(this.inputs);
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
		private readonly onConfirm: () => Promise<void>,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Delete profile" });
		contentEl.createEl("p", {
			text: `Are you sure you want to delete the "${this.profileId}" profile? This cannot be undone.`,
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
