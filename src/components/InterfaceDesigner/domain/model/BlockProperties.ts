import { Sticky } from '@/components/InterfaceDesigner/domain/model/Sticky.ts'
import BlockDTO from '@/components/InterfaceDesigner/domain/model/BlockDTO.ts'

export interface BlockProperties {
  width: number,
  height: number,
  top: number,
  right: number,
  bottom: number,
  left: number,
  sticky: Sticky,
  types?: {
    width: string,
    height: string,
    top: string,
    right: string,
    bottom: string,
    left: string
  },
  debug?: any,
  guid: string,
  stickyToGuid?: null | string
  children?: BlockDTO[],
  parentGuid?: string
}
