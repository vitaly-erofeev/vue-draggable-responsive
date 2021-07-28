export interface TabProperties {
  use: boolean,
  list: {
    guid: string,
    name: string
  }[],
  activeGuid?: string,
  position: TabPosition,
  style?: string,
  activeStyle?: string
}
export enum TabPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
