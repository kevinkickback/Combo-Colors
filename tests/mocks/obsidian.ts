export class Plugin {
  app: any
  loadData() {
    return {}
  }
  saveData() {
    return undefined
  }
  registerEvent() {
    return undefined
  }
  registerDomEvent() {
    return undefined
  }
  registerMarkdownPostProcessor() {
    return undefined
  }
  addCommand() {
    return undefined
  }
  addSettingTab() {
    return undefined
  }
}

export class PluginSettingTab {
  app: any
  plugin: any
  containerEl: any
  constructor(app: any, plugin: any) {
    this.app = app
    this.plugin = plugin
    this.containerEl = { empty() {} }
  }
}

export class Setting {
  setName() {
    return this
  }
  setDesc() {
    return this
  }
  setClass() {
    return this
  }
  addButton(cb: (button: any) => void) {
    cb({
      setIcon() {
        return this
      },
      setWarning() {
        return this
      },
      setDisabled() {
        return this
      },
      setClass() {
        return this
      },
      setButtonText() {
        return this
      },
      setCta() {
        return this
      },
      onClick() {
        return this
      },
    })
    return this
  }
  addDropdown(cb: (dropdown: any) => void) {
    cb({
      addOption() {
        return this
      },
      setValue() {
        return this
      },
      onChange() {
        return this
      },
    })
    return this
  }
  addColorPicker(cb: (picker: any) => void) {
    cb({
      setValue() {
        return this
      },
      onChange() {
        return this
      },
    })
    return this
  }
  addText(cb: (text: any) => void) {
    cb({
      setPlaceholder() {
        return this
      },
      setValue() {
        return this
      },
      onChange() {
        return this
      },
    })
    return this
  }
}

export class Notice {}

export class MarkdownView {}
export class Modal {}
