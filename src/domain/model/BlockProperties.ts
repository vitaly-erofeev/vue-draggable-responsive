import { Sticky } from '@/domain/model/Sticky'
import BlockDTO from '@/domain/model/BlockDTO'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { TabProperties } from '@/domain/model/TabProperties'
import { CalcProperties } from '@/domain/model/CalcProperties'
import { StickyTo } from '@/domain/model/StickyTo'
import { ReplicationProperties } from '@/domain/model/ReplicationProperties'

export interface BlockProperties {
  widthCalc?: CalcProperties
  heightCalc?: CalcProperties
  width: number,
  height: number,
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
  sticky: Sticky,
  sizeTypes: {
    width: SizeTypes,
    height: SizeTypes,
    top: SizeTypes,
    right: SizeTypes,
    bottom: SizeTypes,
    left: SizeTypes
  },
  stickyTo?: StickyTo,
  isStretched: boolean,
  guid?: string,
  stickyToGuid?: string,
  children?: BlockDTO[],
  parentGuid?: string,
  style?: string,
  tabs?: TabProperties,
  parentTabGuid?: string,
  replication?: ReplicationProperties
}
