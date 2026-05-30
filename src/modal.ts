import type { App } from 'obsidian'
import { Modal, Notice, Setting, setIcon } from 'obsidian'
import { validateAndNormalizeInputs } from './input-validation'
import { validateProfileId } from './profile-validation'

export interface InputConfig {
  name: string
  description: string
  color: string
}

export class InputsModal extends Modal {
  private inputs: InputConfig[] = []
  private editingIndex: number | null = null
  private editingInput: InputConfig | null = null

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

  private render(): void {
    const { contentEl } = this
    contentEl.empty()

    contentEl.createEl('h2', { text: 'Edit inputs' })

    this.renderList(contentEl)

    if (this.editingIndex === null) {
      new Setting(contentEl).addButton((btn) =>
        btn.setButtonText('Add input').onClick(() => {
          this.editingIndex = -1
          this.editingInput = { name: '', description: '', color: '#FFFFFF' }
          this.render()
        }),
      )
    }

    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' })
    new Setting(buttonContainer)
      .addButton((btn) => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton((btn) =>
        btn
          .setButtonText('Save')
          .setCta()
          .onClick(async () => {
            const validated = validateAndNormalizeInputs(this.inputs)
            if (!validated.valid) {
              new Notice(validated.message || 'Please fix invalid input values')
              return
            }
            await this.onSubmit(validated.inputs)
            this.close()
          }),
      )
  }

  private renderEditForm(containerEl: HTMLElement, input: InputConfig): void {
    const form = containerEl.createDiv({ cls: 'cc-modal-edit-form' })

    new Setting(form)
      .setName('Input')
      .setDesc('Case sensitive')
      .addText((text) => {
        text
          .setPlaceholder('LP')
          .setValue(input.name)
          .onChange((value) => {
            input.name = value
          })
      })

    new Setting(form)
      .setName('Description')
      .setDesc('Optional')
      .addText((text) => {
        text
          .setPlaceholder('Light punch')
          .setValue(input.description)
          .onChange((value) => {
            input.description = value
          })
      })

    new Setting(form)
      .setName('Default color')
      .setDesc('Used when resetting')
      .addColorPicker((picker) => {
        picker.setValue(input.color || '#FFFFFF').onChange((value) => {
          input.color = value
        })
      })

    new Setting(form)
      .addButton((btn) =>
        btn
          .setButtonText('Done')
          .setCta()
          .onClick(() => {
            const name = input.name.trim()
            if (!name) {
              new Notice('Input name is required')
              return
            }
            const isDuplicate = this.inputs.some(
              (item, i) => item.name === name && i !== this.editingIndex,
            )
            if (isDuplicate) {
              new Notice('An input with this name already exists')
              return
            }
            if (this.editingIndex === -1) {
              this.inputs.push({ ...input, name })
            } else if (this.editingIndex !== null) {
              this.inputs[this.editingIndex] = { ...input, name }
            }
            this.editingIndex = null
            this.editingInput = null
            this.render()
          }),
      )
      .addButton((btn) =>
        btn.setButtonText('Cancel').onClick(() => {
          this.editingIndex = null
          this.editingInput = null
          this.render()
        }),
      )
  }

  private renderList(containerEl: HTMLElement): void {
    const list = containerEl.createDiv({ cls: 'cc-input-list' })

    if (this.inputs.length === 0 && this.editingIndex !== -1) {
      list.createEl('p', { text: 'No inputs added yet', cls: 'cc-input-list-empty' })
    }

    for (let i = 0; i < this.inputs.length; i++) {
      const idx = i

      if (this.editingIndex === idx && this.editingInput !== null) {
        this.renderEditForm(list, this.editingInput)
        continue
      }

      const input = this.inputs[i]
      const row = list.createDiv({ cls: 'cc-input-row' })

      const swatch = row.createSpan({ cls: 'cc-input-swatch' })
      swatch.style.backgroundColor = input.color
      row.createSpan({ cls: 'cc-input-name', text: input.name })
      if (input.description) {
        row.createSpan({ cls: 'cc-input-desc', text: input.description })
      }

      const actions = row.createDiv({ cls: 'cc-input-actions' })

      const editBtn = actions.createEl('button', { cls: 'clickable-icon' })
      setIcon(editBtn, 'pencil')
      editBtn.addEventListener('click', () => {
        this.editingIndex = idx
        this.editingInput = { ...this.inputs[idx] }
        this.render()
      })

      const deleteBtn = actions.createEl('button', { cls: 'clickable-icon cc-input-delete' })
      setIcon(deleteBtn, 'trash')
      deleteBtn.addEventListener('click', () => {
        this.inputs.splice(idx, 1)
        if (this.editingIndex !== null) {
          if (this.editingIndex === idx) {
            this.editingIndex = null
            this.editingInput = null
          } else if (idx < this.editingIndex) {
            this.editingIndex--
          }
        }
        this.render()
      })
    }

    if (this.editingIndex === -1 && this.editingInput !== null) {
      this.renderEditForm(list, this.editingInput)
    }
  }

  onOpen() {
    this.render()
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
        // eslint-disable-next-line obsidianmd/ui/sentence-case -- placeholder shows an example profile ID (lowercase by convention)
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
            if (!profileName.trim()) {
              new Notice('Please fill in all fields')
              return
            }

            const validation = validateProfileId(profileId)
            if (!validation.valid) {
              new Notice(validation.message || 'Invalid profile ID')
              return
            }

            try {
              await this.onSubmit(validation.normalized, profileName.trim())
              this.close()
            } catch (error) {
              new Notice(error instanceof Error ? error.message : 'Could not create profile')
            }
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
            try {
              await this.onConfirm()
              this.close()
            } catch (error) {
              new Notice(error instanceof Error ? error.message : 'Could not delete profile')
            }
          }),
      )
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
