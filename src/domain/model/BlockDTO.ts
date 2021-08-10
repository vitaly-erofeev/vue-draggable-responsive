import { Sticky } from './Sticky'
import { BlockProperties } from '@/domain/model/BlockProperties'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { TabPosition, TabProperties } from '@/domain/model/TabProperties'
import { CalcProperties } from '@/domain/model/CalcProperties'

export default class BlockDTO {
  [index: string]: any;
  widthCalc?: CalcProperties
  heightCalc?: CalcProperties
  width: number
  height: number
  top?: number
  right?: number
  bottom?: number
  left?: number
  sticky: Sticky
  sizeTypes: { [index: string]: any; width: SizeTypes; height: SizeTypes; top: SizeTypes; right: SizeTypes; bottom: SizeTypes; left: SizeTypes }
  children: BlockDTO[]
  guid: string
  isStretched: boolean = false
  stickyToGuid?: string
  parentGuid?: string
  style?: string
  isActive: boolean = false
  isActiveAsParent: boolean = false
  tabs?: TabProperties = {
    use: false,
    list: [],
    position: TabPosition.TOP
  }
  parentTabGuid?: string

  constructor (
    {
      children = [],
      width = 0,
      height = 0,
      top = 0,
      right = 0,
      bottom = 0,
      left = 0,
      sticky = Sticky.TL,
      sizeTypes = {
        width: SizeTypes.PERCENT,
        height: SizeTypes.PERCENT,
        top: SizeTypes.PERCENT,
        right: SizeTypes.PERCENT,
        bottom: SizeTypes.PERCENT,
        left: SizeTypes.PERCENT
      },
      guid = 'guid',
      stickyToGuid,
      parentGuid,
      isStretched,
      style,
      tabs,
      parentTabGuid,
      widthCalc,
      heightCalc
    }: BlockProperties
  ) {
    this.widthCalc = widthCalc
    this.heightCalc = heightCalc
    const {
      _top, _right, _bottom, _left
    } = BlockDTO.getPreparedSizes({
      top,
      right,
      bottom,
      left,
      sticky
    })
    this.top = _top
    this.right = _right
    this.bottom = _bottom
    this.left = _left

    this.sticky = sticky
    this.sizeTypes = sizeTypes
    this.children = children
    this.width = width
    this.height = height
    this.guid = guid
    this.stickyToGuid = stickyToGuid
    this.parentGuid = parentGuid
    this.isStretched = isStretched
    this.style = style
    this.tabs = tabs
    this.parentTabGuid = parentTabGuid
  }

  private static getPreparedSizes ({
    top, right, bottom, left, sticky
  }: {
    top: number,
    right: number,
    bottom: number,
    left: number,
    sticky: Sticky
  }): { _top: number, _right: number, _bottom: number, _left: number } {
    let _top, _right, _bottom, _left
    _top = top
    _left = left
    _bottom = bottom
    _right = right
    if (sticky === Sticky.TL) {
      _top = top < 0 ? 0 : top
      _left = left < 0 ? 0 : left
    }
    return {
      _top,
      _right,
      _bottom,
      _left
    }
  }
}
