import { Sticky } from '@/components/VueDraggableResponsive/domain/model/Sticky'
import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'
import { SizeTypes } from '@/components/VueDraggableResponsive/domain/model/SizeTypes'

export interface BlockProperties {
  width: number,
  height: number,
  top: number,
  right: number,
  bottom: number,
  left: number,
  sticky: Sticky,
  sizeTypes?: {
    width: SizeTypes,
    height: SizeTypes,
    top: SizeTypes,
    right: SizeTypes,
    bottom: SizeTypes,
    left: SizeTypes
  },
  debug?: any,
  guid: string,
  stickyToGuid?: null | string
  children?: BlockDTO[],
  parentGuid?: string
}
