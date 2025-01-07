// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ IMPORTS & DECLARATIONS                                                               ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

import { type App, Modal } from "obsidian";

// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║ RESTORE DEFAULTS MODAL                                                               ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

export class resetModal extends Modal {
	onConfirm: () => Promise<void>;

	constructor(app: App, onConfirm: () => Promise<void>) {
		super(app);
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Are you sure?" });
		contentEl.createEl("p", {
			text: "All colors in the current profile will be reset to their default values.",
		});

		const buttonContainer = contentEl.createDiv({
			cls: "modal-button-container",
		});

		const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
		cancelButton.addEventListener("click", () => {
			this.close();
		});

		const confirmButton = buttonContainer.createEl("button", {
			text: "Confirm",
		});
		confirmButton.addClass("mod-cta");
		confirmButton.addEventListener("click", () => {
			this.onConfirm();
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
