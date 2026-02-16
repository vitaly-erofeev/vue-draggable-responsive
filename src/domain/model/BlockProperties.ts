import { Sticky } from 'e:/vue-draggable-responsive/src/domain/model/Sticky'
import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
import { SizeTypes } from 'e:/vue-draggable-responsive/src/domain/model/SizeTypes'
import { InteractiveProperties } from 'e:/vue-draggable-responsive/src/domain/model/InteractiveProperties'
import { TabProperties } from 'e:/vue-draggable-responsive/src/domain/model/TabProperties'
import { CalcProperties } from 'e:/vue-draggable-responsive/src/domain/model/CalcProperties'
import { StickyTo } from 'e:/vue-draggable-responsive/src/domain/model/StickyTo'
import { ReplicationProperties } from 'e:/vue-draggable-responsive/src/domain/model/ReplicationProperties'
import { MinMax } from 'e:/vue-draggable-responsive/src/domain/model/MinMax'
import { OnCenter } from 'e:/vue-draggable-responsive/src/domain/model/OnCenter'
import { PositionBlockCss } from 'e:/vue-draggable-responsive/src/domain/model/PositionBlockCss'
import { AddBlockType } from 'e:/vue-draggable-responsive/src/domain/model/AddBlockType'
import { CustomStyles, StylesComponent } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'

export interface BlockProperties {
  widthCalc?: CalcProperties
  heightCalc?: CalcProperties
  onCenter?: OnCenter
  minMax?: MinMax
  width: number | string,
  height: number | string,
  top?: number,
  right?: number,
  bottom?: number,
  left?: number,
  sticky?: Sticky,
  sizeTypes?: {
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
  disabledMove?: boolean,
  event?: MouseEvent,
  type?: AddBlockType,
  isComponent?: boolean
  positionBlockCss: PositionBlockCss,
  customStyles?: Partial<CustomStyles>
  stylesComponent?: Partial<StylesComponent>

}
