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
      style: ''
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
}
