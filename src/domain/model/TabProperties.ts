export interface TabProperties {
  use: boolean,
  list: {
    guid: string,
    name: string
  }[],
  activeGuid?: string,
  position: TabPosition,
  tabArrowsClass?: string,
  requiredTabs?: string[],
  containerStyle?: string,
  tabStyle?: string,
  activeTabStyle?: string,
  class?: string,
  expandAllByDefault?: boolean,
  tabStyleByCondition?: string,
  saveActiveTab?: boolean
}
export enum TabPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
