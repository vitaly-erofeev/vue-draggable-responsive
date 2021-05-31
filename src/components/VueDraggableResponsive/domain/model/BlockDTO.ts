import { Sticky } from './Sticky'
import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'
import { SizeTypes } from '@/components/VueDraggableResponsive/domain/model/SizeTypes'

export default class BlockDTO {
  [index: string]: any;

  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
  sticky: Sticky
  sizeTypes: { [index: string]: any; width: SizeTypes; height: SizeTypes; top: SizeTypes; right: SizeTypes; bottom: SizeTypes; left: SizeTypes }
  children: BlockDTO[]
  guid: string
  stickyToGuid: null | string
  debug: any
  parentGuid: null | string

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
      guid,
      stickyToGuid = null,
      debug = null,
      parentGuid = null
    }: BlockProperties
  ) {
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
    this.debug = debug
    this.guid = guid
    this.stickyToGuid = stickyToGuid
    this.parentGuid = parentGuid
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
