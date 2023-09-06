import { TabSettingsType } from '@/domain/model/TabSettingsType'
import { TabSettingType } from '@/domain/model/TabSettingType'

export default class TabSettings {
  tabSettings: TabSettingsType
  context: Vue

  constructor (tabSettings: TabSettingsType, context: Vue) {
    this.tabSettings = tabSettings
    this.context = context
  }

  createTabSetting (tabGuid: string): TabSettingType {
    const tabSetting: TabSettingType = {
      isHidden: false,
      isBlocked: false,
      isStyled: true,
      isDefaultTab: false,
      isExpanded: false,
      parentTabForTree: '',
      style: '',
      interactive: {}
    }

    this.context.$set(this.tabSettings, tabGuid, tabSetting)

    return tabSetting
  }

  createTabSettings (tabGuids: Array<string>): void {
    for (const tabGuid of tabGuids) {
      if (!this.getTabSettingByGuid(tabGuid)) {
        this.createTabSetting(tabGuid)
      }
    }
  }

  getTabSettingByGuid (tabGuid: string): TabSettingType | void {
    if (!this.tabSettings) {
      return
    }

    const tabSetting: TabSettingType = this.tabSettings[tabGuid]
    if (!tabSetting) {
      return
    }

    this.restoreTabSettingsStructure(tabSetting)

    return tabSetting
  }

  restoreTabSettingsStructure (tabSetting: TabSettingType): void {
    if (!tabSetting) {
      return
    }

    if (!('isHidden' in tabSetting)) {
      this.context.$set(tabSetting, 'isHidden', false)
    }

    if (!('isBlocked' in tabSetting)) {
      this.context.$set(tabSetting, 'isBlocked', false)
    }

    if (!('isStyled' in tabSetting)) {
      this.context.$set(tabSetting, 'isStyled', true)
    }

    if (!('isDefaultTab' in tabSetting)) {
      this.context.$set(tabSetting, 'isDefaultTab', false)
    }
    if (!('isExpanded' in tabSetting)) {
      this.context.$set(tabSetting, 'isExpanded', false)
    }

    if (!('parentTabForTree' in tabSetting)) {
      this.context.$set(tabSetting, 'parentTabForTree', '')
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

  deleteTabOnGuid (tabGuid: string): void {
    if (this.tabSettings[tabGuid]) {
      delete this.tabSettings[tabGuid]
    } else {
      console.warn(`Вкладка с ${tabGuid} не найден`)
    }
  }

  getHiddenConditions (tabGuid: string): object | void {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.hiddenConditions
    }
  }

  setHiddenConditions (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'hiddenConditions', value)
  }

  getBlockedConditions (tabGuid: string): object | void {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.blockedConditions
    }
  }

  setInteractive (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'interactive', value)
  }

  getInteractive (tabGuid: string): object | void {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.interactive
    }
  }

  setBlockedConditions (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'blockedConditions', value)
  }

  getStyledConditions (tabGuid: string): object | void {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.styledConditions
    }
  }

  setStyledConditions (tabGuid: string, value: object): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'styledConditions', value)
  }

  getIsHidden (tabGuid: string): boolean {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting && ('isHidden' in tabSetting)) {
      return tabSetting.isHidden
    }

    return false
  }

  setIsHidden (tabGuid: string, value: boolean): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isHidden', value)
  }

  getIsBlocked (tabGuid: string): boolean {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting && ('isBlocked' in tabSetting)) {
      return tabSetting.isBlocked
    }

    return false
  }

  setIsBlocked (tabGuid: string, value: boolean): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isBlocked', value)
  }

  getIsStyled (tabGuid: string): boolean {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting && ('isStyled' in tabSetting)) {
      return tabSetting.isStyled
    }

    return false
  }

  setIsStyled (tabGuid: string, value: boolean): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isStyled', value)
  }

  getStyle (tabGuid: string): string | void {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting) {
      return tabSetting.style
    }
  }

  setStyle (tabGuid: string, value: string): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'style', value)
  }

  getIsDefaultTab (tabGuid: string): boolean {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting && ('isDefaultTab' in tabSetting)) {
      return tabSetting.isDefaultTab
    }

    return false
  }

  setIsDefaultTab (tabGuid: string, value: string): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'isDefaultTab', value)
  }
  // получить guid родительской вкладки
  getParentTabForTree (tabGuid: string): string {
    const tabSetting: TabSettingType | void = this.getTabSettingByGuid(tabGuid)
    if (tabSetting && ('parentTabForTree' in tabSetting)) {
      return tabSetting.parentTabForTree
    }

    return ''
  }
  // установить guid родительской вкладки
  setParentTabForTree (tabGuid: string, value: string): void {
    const tabSetting = this.getTabSettingByGuid(tabGuid) || this.createTabSetting(tabGuid)

    this.context.$set(tabSetting, 'parentTabForTree', value)
  }
}
