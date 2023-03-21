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
  className?: string
  isStretched: boolean = false
  stickyTo?: StickyTo
  parentGuid?: string
  style?: string
  isActive: boolean = false
  isActiveAsParent: boolean = false
  isScrollHover?: boolean = false
  interactive?: InteractiveProperties
  tabs?: TabProperties = {
    use: false,
    list: [],
    position: TabPosition.TOP
  }
  parentTabGuid?: string
  isEditing?: boolean
  replication?: ReplicationProperties
  pagination?: {
    replicationGuid: string,
    total: number,
    limit: number
  }
  isHover: boolean = false
  isHidden: boolean = false
  isHighlight: boolean = false
  properties: {} = {}

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
      className,
      guid = 'guid',
      alias,
      parentGuid,
      isStretched,
      isScrollHover,
      style,
      interactive,
      tabs,
      parentTabGuid,
      widthCalc,
      heightCalc,
      stickyTo,
      replication,
      pagination,
      isHover = false,
      isHidden = false,
      isHighlight = false,
      minMax,
      onCenter,
      properties = {}
    }: BlockProperties
  ) {
    this.widthCalc = widthCalc
    this.heightCalc = heightCalc
    this.stickyTo = stickyTo
    this.isHover = isHover
    this.isHidden = isHidden
    this.isHighlight = isHighlight
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
    this.className = className
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
    this.isScrollHover = isScrollHover
    this.style = style
    this.interactive = interactive
    this.tabs = tabs
    this.parentTabGuid = parentTabGuid
    this.isEditing = false
    this.replication = replication
    this.pagination = pagination
    this.properties = properties
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
