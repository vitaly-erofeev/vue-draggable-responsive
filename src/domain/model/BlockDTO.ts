import { Sticky } from './Sticky'
import { BlockProperties } from '@/domain/model/BlockProperties'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { InteractiveProperties } from '@/domain/model/InteractiveProperties'
import { TabPosition, TabProperties } from '@/domain/model/TabProperties'
import { CalcProperties } from '@/domain/model/CalcProperties'
import { StickyTo } from '@/domain/model/StickyTo'
import { ReplicationProperties } from '@/domain/model/ReplicationProperties'
import { MinMax } from '@/domain/model/MinMax'
import { OnCenter } from '@/domain/model/OnCenter'

export default class BlockDTO {
  [index: string]: any;

  onCenter?: OnCenter
  widthCalc?: CalcProperties
  heightCalc?: CalcProperties
  minMax?: MinMax
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
  alias?: string
  isStretched: boolean = false
  stickyTo?: StickyTo
  parentGuid?: string
  style?: string
  isActive: boolean = false
  isActiveAsParent: boolean = false
  interactive?: InteractiveProperties
  tabs?: TabProperties = {
    use: false,
    list: [],
    position: TabPosition.TOP
  }
  parentTabGuid?: string
  isEditing?: boolean
  replication?: ReplicationProperties
  isHover: boolean = false
  isHidden: boolean = false
  isLoadedTab: boolean = false

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
      alias,
      parentGuid,
      isStretched,
      style,
      interactive,
      tabs,
      parentTabGuid,
      widthCalc,
      heightCalc,
      stickyTo,
      replication,
      isHover = false,
      isHidden = false,
      isLoadedTab = false,
      minMax,
      onCenter
    }: BlockProperties
  ) {
    this.widthCalc = widthCalc
    this.heightCalc = heightCalc
    this.stickyTo = stickyTo
    this.isHover = isHover
    this.isHidden = isHidden
    this.isLoadedTab = isLoadedTab
    this.minMax = minMax
    this.onCenter = onCenter
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
    this.alias = alias
    this.parentGuid = parentGuid
    this.isStretched = isStretched
    this.style = style
    this.interactive = interactive
    this.tabs = tabs
    this.parentTabGuid = parentTabGuid
    this.isEditing = false
    this.replication = replication
    this.prepareSizesTypes()
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

  private prepareSizesTypes (): void {
    const types = [
      'top',
      'left',
      'right',
      'bottom',
      'height',
      'width'
    ]
    types.forEach((type) => {
      if (!this.sizeTypes[type]) {
        this.sizeTypes[type] = SizeTypes.PERCENT
      }
    })
  }
}
