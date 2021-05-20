import { Sticky } from './Sticky'
import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties'

export default class BlockDTO {
  [index: string]: any;

  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
  sticky: Sticky
  types: { [index: string]: any; width: string; height: string; top: string; right: string; bottom: string; left: string }
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
      types = {
        width: '%',
        height: '%',
        top: '%',
        right: '%',
        bottom: '%',
        left: '%'
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
    this.types = types
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
      types: this.types,
      guid: this.guid,
      stickyToGuid: this.stickyToGuid
    }
  }
}
