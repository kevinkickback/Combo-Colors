import type { App } from 'obsidian'
import { Modal, Notice, Setting } from 'obsidian'

export interface InputConfig {
  name: string
  description: string
  color: string
}

export class InputsModal extends Modal {
  private inputs: InputConfig[] = []

  constructor(
    app: App,
    private readonly onSubmit: (inputs: InputConfig[]) => Promise<void>,
    initialInputs?: InputConfig[],
  ) {
    super(app)
    if (initialInputs) {
      this.inputs = [...initialInputs]
    }
  }

  private addInputRow(containerEl: HTMLElement, input?: InputConfig) {
    const newInput: InputConfig = input || {
      name: '',
      description: '',
      color: '#FFFFFF',
    }

    if (!input) {
      this.inputs.push(newInput)
    }

    const rowContainer = containerEl.createDiv({ cls: 'custom-profile-row' })

    new Setting(rowContainer)
      .setName('Input')
      .setDesc('Case sensitive')
      .addText((text) => {
        text.setPlaceholder('LP')
        if (newInput.name) {
          text.setValue(newInput.name)
        }
        text.onChange((value) => {
          newInput.name = value
        })
      })

    new Setting(rowContainer)
      .setName('Description')
      .setDesc('Optional')
      .setClass('input-description')
      .addText((text) => {
        text.setPlaceholder('Light punch')
        if (newInput.description) {
          text.setValue(newInput.description)
        }
        text.onChange((value) => {
          newInput.description = value
        })
      })

    new Setting(rowContainer)
      .setName('Default color')
      .setDesc('Used when resetting')
      .addColorPicker((picker) => {
        picker.setValue(newInput.color || '#FFFFFF').onChange((value) => {
          newInput.color = value
        })
      })

    new Setting(rowContainer).addButton((btn) =>
      btn
        .setIcon('trash')
        .setWarning()
        .onClick(() => {
          const index = this.inputs.indexOf(newInput)
          if (index > -1) {
            this.inputs.splice(index, 1)
            rowContainer.detach()
          }
        }),
    )
  }

  onOpen() {
    const { contentEl } = this
    contentEl.empty()

    contentEl.createEl('h2', { text: 'Edit inputs' })
    const inputsContainer = contentEl.createDiv({ cls: 'inputs-container' })

    if (this.inputs.length > 0) {
      for (const input of this.inputs) {
        this.addInputRow(inputsContainer, input)
      }
    } else {
      this.addInputRow(inputsContainer)
    }

    new Setting(contentEl).addButton((btn) =>
      btn.setButtonText('Add input').onClick(() => this.addInputRow(inputsContainer)),
    )

    const buttonContainer = contentEl.createDiv({
      cls: 'modal-button-container',
    })

    new Setting(buttonContainer)
      .addButton((btn) => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton((btn) =>
        btn
          .setButtonText('Save')
          .setCta()
          .onClick(async () => {
            if (this.inputs.some((input) => !input.name)) {
              new Notice('Please fill in all input fields')
              return
            }

            await this.onSubmit(this.inputs)

            this.close()
          }),
      )
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}

export class CustomProfileModal extends Modal {
  constructor(
    app: App,
    private readonly onSubmit: (profileId: string, profileName: string) => Promise<void>,
  ) {
    super(app)
  }

  onOpen() {
    const { contentEl } = this
    contentEl.empty()

    contentEl.createEl('h2', { text: 'Create profile' })

    let profileId = ''
    let profileName = ''

    new Setting(contentEl)
      .setName('Display name')
      .setDesc('Shown in the profile dropdown menu')
      .addText((text) => {
        text.setPlaceholder('Custom')
        text.onChange((value) => {
          profileName = value
        })
      })

    new Setting(contentEl)
      .setName('Frontmatter ID')
      .setDesc('Unique identifier used by cc_profile')
      .addText((text) => {
        text.setPlaceholder('cstm')
        text.onChange((value) => {
          profileId = value
        })
      })

    new Setting(contentEl)
      .addButton((btn) => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton((btn) =>
        btn
          .setButtonText('Create profile')
          .setCta()
          .onClick(async () => {
            if (!profileId || !profileName) {
              new Notice('Please fill in all fields')
              return
            }
            await this.onSubmit(profileId, profileName)
            this.close()
          }),
      )
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}

export class DeleteProfileModal extends Modal {
  constructor(
    app: App,
    _profileId: string,
    private readonly profileName: string,
    private readonly onConfirm: () => Promise<void>,
  ) {
    super(app)
  }

  onOpen() {
    const { contentEl } = this
    contentEl.empty()

    contentEl.createEl('h2', { text: 'Delete profile' })
    contentEl.createEl('p', {
      text: `Are you sure you want to delete the "${this.profileName}" profile? This cannot be undone.`,
    })

    new Setting(contentEl)
      .addButton((btn) => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton((btn) =>
        btn
          .setButtonText('Delete')
          .setWarning()
          .onClick(async () => {
            await this.onConfirm()
            this.close()
          }),
      )
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
