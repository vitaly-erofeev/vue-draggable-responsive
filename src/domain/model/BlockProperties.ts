import { Sticky } from '@/domain/model/Sticky'
import BlockDTO from '@/domain/model/BlockDTO'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { InteractiveProperties } from '@/domain/model/InteractiveProperties'
import { TabProperties } from '@/domain/model/TabProperties'
import { CalcProperties } from '@/domain/model/CalcProperties'
import { StickyTo } from '@/domain/model/StickyTo'
import { ReplicationProperties } from '@/domain/model/ReplicationProperties'
import { MinMax } from '@/domain/model/MinMax'
import { OnCenter } from '@/domain/model/OnCenter'

export interface BlockProperties {
  widthCalc?: CalcProperties
  heightCalc?: CalcProperties
  onCenter?: OnCenter
  minMax?: MinMax
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
  className?: string,
  stickyTo?: StickyTo,
  isStretched: boolean,
  isScrollHover?: boolean,
  guid?: string,
  alias?: string,
  children?: BlockDTO[],
  parentGuid?: string,
  style?: string,
  interactive?: InteractiveProperties,
  tabs?: TabProperties,
  parentTabGuid?: string,
  replication?: ReplicationProperties,
  pagination?: {
    replicationGuid: string,
    total: number,
    limit: number
  },
  isHover?: boolean,
  isHidden?: boolean
  isHighlight?: boolean,
  properties?: {},
  isLoading?: boolean,
  disabledMove?: boolean
}
