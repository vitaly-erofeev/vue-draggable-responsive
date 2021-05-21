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
      debug = null
    }: BlockProperties
  ) {
    this.children = children
    this.width = width
    this.height = height
    this.top = top
    this.right = right
    this.bottom = bottom
    this.left = left
    this.sticky = sticky
    this.sizeTypes = sizeTypes
    this.debug = debug
    this.guid = guid
    this.stickyToGuid = stickyToGuid
  }

  toJson (): object {
    return {
      width: this.width,
      height: this.height,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
      sticky: this.sticky,
      sizeTypes: this.sizeTypes,
      guid: this.guid,
      stickyToGuid: this.stickyToGuid
    }
  }
}
