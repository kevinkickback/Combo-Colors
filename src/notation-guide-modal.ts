import type { App } from 'obsidian'
import { Modal } from 'obsidian'
import {
  DIRECTION_GUIDE_ROWS,
  type DirectionGuideRow,
  MODIFIER_GUIDE_ROWS,
  MOTION_GUIDE_ROWS,
  type NotationGuideRow,
  SYNTAX_GUIDE_ROWS,
} from './notation-guide'
import type { DirectionValue } from './notation-schema'

export interface NotationGuideProfile {
  name: string
  inputs: Array<{ name: string; description: string }>
}

export class NotationGuideModal extends Modal {
  constructor(
    app: App,
    private readonly profile: NotationGuideProfile,
  ) {
    super(app)
  }

  private renderTable(containerEl: HTMLElement, rows: readonly NotationGuideRow[]): void {
    const tableWrapper = containerEl.createDiv({ cls: 'cc-notation-guide-table-wrapper' })
    const table = tableWrapper.createEl('table', { cls: 'cc-notation-guide-table' })
    const head = table.createEl('thead')
    const headingRow = head.createEl('tr')
    headingRow.createEl('th', { text: 'Input', attr: { scope: 'col' } })
    headingRow.createEl('th', { text: 'Resolves to', attr: { scope: 'col' } })

    const body = table.createEl('tbody')
    for (const row of rows) {
      const tableRow = body.createEl('tr')
      const aliases = tableRow.createEl('td', { cls: 'cc-notation-guide-aliases' })
      row.aliases.forEach((alias, index) => {
        if (index > 0) aliases.appendText(', ')
        aliases.createEl('code', { text: alias })
      })
      tableRow.createEl('td', { text: row.resolution })
    }
  }

  private renderDirectionGrid(containerEl: HTMLElement): void {
    const section = containerEl.createEl('section', {
      cls: 'cc-notation-guide-section cc-notation-guide-directions',
    })
    section.createEl('h3', { text: 'Directions' })
    section.createEl('p', {
      cls: 'cc-notation-guide-section-description',
      text: 'Numpad values and traditional aliases map to the direction they represent.',
    })

    const directionOrder: DirectionValue[] = [
      'up-back',
      'up',
      'up-forward',
      'back',
      'neutral',
      'forward',
      'down-back',
      'down',
      'down-forward',
    ]
    const rowsByValue = new Map<DirectionValue, DirectionGuideRow>(
      DIRECTION_GUIDE_ROWS.map((row) => [row.value, row]),
    )
    const grid = section.createEl('ul', {
      cls: 'cc-notation-guide-direction-grid',
      attr: { 'aria-label': 'Direction notation reference' },
    })

    for (const value of directionOrder) {
      const row = rowsByValue.get(value)
      if (!row) continue

      const item = grid.createEl('li', {
        cls: 'cc-notation-guide-direction',
        attr: { 'aria-label': `${row.resolution}: ${row.aliases.join(', ')}` },
      })
      const input = item.createDiv({ cls: 'cc-notation-guide-direction-input' })
      const orderedAliases = [...row.aliases].sort((left, right) => {
        const leftIsNumber = /^\d+$/.test(left)
        const rightIsNumber = /^\d+$/.test(right)
        return Number(rightIsNumber) - Number(leftIsNumber)
      })
      orderedAliases.forEach((alias, index) => {
        if (index > 0) input.appendText(' / ')
        input.createEl('code', { text: alias })
      })
      item.createSpan({
        text: row.symbol,
        cls: 'cc-notation-guide-direction-symbol',
        attr: { 'aria-hidden': 'true' },
      })
      item.createSpan({ text: row.resolution, cls: 'cc-notation-guide-direction-label' })
    }
  }

  private renderSection(
    containerEl: HTMLElement,
    title: string,
    rows: readonly NotationGuideRow[],
  ): void {
    const section = containerEl.createEl('section', { cls: 'cc-notation-guide-section' })
    section.createEl('h3', { text: title })
    this.renderTable(section, rows)
  }

  onOpen(): void {
    this.modalEl.addClass('cc-notation-guide-modal')
    this.contentEl.empty()
    this.contentEl.createEl('h2', { text: 'Notation guide' })
    this.contentEl.createEl('p', {
      cls: 'cc-notation-guide-intro',
      text: 'Shorthand is case-insensitive. Profile inputs remain case-sensitive.',
    })

    this.renderSection(this.contentEl, 'Syntax', SYNTAX_GUIDE_ROWS)
    this.renderDirectionGrid(this.contentEl)
    this.renderSection(this.contentEl, 'Motions', MOTION_GUIDE_ROWS)
    this.renderSection(this.contentEl, 'Modifiers', MODIFIER_GUIDE_ROWS)

    const profileRows: NotationGuideRow[] = this.profile.inputs.map((input) => ({
      aliases: [input.name],
      resolution: input.description || 'Profile input',
    }))
    this.renderSection(this.contentEl, `${this.profile.name} inputs`, profileRows)
  }

  onClose(): void {
    this.contentEl.empty()
  }
}
