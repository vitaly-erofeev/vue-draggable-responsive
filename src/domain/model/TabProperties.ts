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
  activeTabStyle?: string
}
export enum TabPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
