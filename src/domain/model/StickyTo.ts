export interface StickyTo {
  type: StickyToType,
  guid: string
}
export enum StickyToType {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}
