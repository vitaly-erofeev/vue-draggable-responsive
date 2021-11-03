export interface TabProperties {
  use: boolean,
  list: {
    guid: string,
    name: string
  }[],
  activeGuid?: string,
  position: TabPosition,
  tabArrowsClass?: string,

  containerStyle?: string,
  tabStyle?: string,
  activeTabStyle?: string,
  class?: string,
  tabStyleByCondition?: string
}
export enum TabPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
