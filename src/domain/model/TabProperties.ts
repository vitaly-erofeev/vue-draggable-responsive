export interface TabProperties {
  use: boolean,
  list: {
    guid: string,
    name: string
  }[],
  activeGuid?: string,
  position: TabPosition,
  containerStyle?: string,
  tabStyle?: string,
  tabArrowsClass?: string,
  activeTabStyle?: string,
  class?: string
}
export enum TabPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
