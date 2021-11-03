export default class TabSettings {
  tabSettings: object
  context: Vue
  onUpdateTabSettings: Function

  constructor (tabSettings: object, context: Vue) {
    this.tabSettings = tabSettings
    this.context = context
    this.onUpdateTabSettings = (context as any).onUpdateTabSettings
  }

  createTabSetting (tabGuid: string): object {
    // Заменить изначальную ссылку, только так возможно добавить несколько реактивных свойств
    this.tabSettings = Object.assign({}, this.tabSettings, {
      [tabGuid]: {
        isHidden: false,
        isBlocked: false,
        isStyled: true,
        style: ''
      }
    })

    if (typeof this.onUpdateTabSettings === 'function') {
      // Обновить ссылку на объект на новую
      this.onUpdateTabSettings(this.tabSettings)
    }

    return this.getTabSettingByGuid(tabGuid)
  }

  createTabSettings (tabGuids: Array<string>): void {
    for (const tabGuid of tabGuids) {
      if (!this.getTabSettingByGuid(tabGuid)) {
        this.createTabSetting(tabGuid)
      }
    }
  }

  getTabSettingByGuid (tabGuid: string): object {
    const tabSetting = (this.tabSettings as any)[tabGuid]
    this.restoreTabSettingsStructure(tabSetting)

    return tabSetting
  }

  restoreTabSettingsStructure (tabSetting: object): void {
    if (!tabSetting) {
      return
    }

    if (!('isHidden' in tabSetting)) {
      this.context.$set(tabSetting, 'isHidden', true)
    }

    if (!('isStyled' in tabSetting)) {
      this.context.$set(tabSetting, 'isStyled', true)
    }

    if (!('hiddenConditions' in tabSetting)) {
      this.context.$set(tabSetting, 'hiddenConditions', { type: 'never' })
    }

    if (!('blockedConditions' in tabSetting)) {
      this.context.$set(tabSetting, 'blockedConditions', { type: 'never' })
    }

    if (!('styledConditions' in tabSetting)) {
      this.context.$set(tabSetting, 'styledConditions', { type: 'always' })
    }
  }

  getHiddenConditions (tabGuid: string): object | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.hiddenConditions
    }
  }

  setHiddenConditions (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'hiddenConditions', value)
  }

  getBlockedConditions (tabGuid: string): object | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.blockedConditions
    }
  }

  setBlockedConditions (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'blockedConditions', value)
  }

  getStyledConditions (tabGuid: string): object | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.styledConditions
    }
  }

  setStyledConditions (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'styledConditions', value)
  }

  getIsHidden (tabGuid: string): boolean | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.isHidden
    }
  }

  setIsHidden (tabGuid: string, value: boolean): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isHidden', value)
  }

  getIsBlocked (tabGuid: string): boolean | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.isBlocked
    }
  }

  setIsBlocked (tabGuid: string, value: boolean): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isBlocked', value)
  }

  getIsStyled (tabGuid: string): boolean | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.isStyled
    }
  }

  setIsStyled (tabGuid: string, value: boolean): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isStyled', value)
  }

  getStyle (tabGuid: string): string | void {
    const tabSetting: any = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.style
    }
  }

  setStyle (tabGuid: string, value: string): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'style', value)
  }
}
