import BlockDTO from '@/domain/model/BlockDTO'
import CustomMouseEvent from '@/domain/model/CustomMouseEvent'
import CustomDomRect from '@/domain/model/CustomDomRect'
import BreakpointsFactory from '@/domain/service/BreakpointsFactory'
import { Breakpoints } from '@/domain/model/Breakpoints'
import { BlockRepositoryInterface } from '@/domain/repository/BlockRepositoryInterface'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { StickyToType } from '@/domain/model/StickyTo'

export default class BlockManager {
  [index: string]: any;

  private block: BlockDTO
  private repository: BlockRepositoryInterface
  private clientX: number = 0
  private clientY: number = 0
  private movementX: number = 0
  private movementY: number = 0
  private type: string = 'drag'
  private blockElement: Element
  private blockElementRect: CustomDomRect = new CustomDomRect()
  private parentElement: HTMLElement | null
  private readonly step: number

  constructor (block: BlockDTO, repository: BlockRepositoryInterface, blockElement: Element, step: number = 0.5) {
    this.repository = repository
    this.block = block
    this.step = step
    this.blockElement = blockElement
    this.parentElement = this.blockElement.parentElement
  }

  public startDrag (event: MouseEvent, type: string, isInteractive: boolean = false): void {
    this.blockElementRect = this.getBlockElementRect()
    this.clientX = event.clientX
    this.clientY = event.clientY
    this.type = type

    if (this.type === 'resize') {
      if (this.block.widthCalc && this.block.widthCalc.type && this.block.widthCalc.value) {
        if (this.block.widthCalc.type === '-') {
          this.clientX = this.clientX - this.block.widthCalc.value
        } else {
          this.clientX = this.clientX + this.block.widthCalc.value
        }
      }
      if (this.block.heightCalc && this.block.heightCalc.type && this.block.heightCalc.value) {
        if (this.block.heightCalc.type === '-') {
          this.clientY = this.clientY - this.block.heightCalc.value
        } else {
          this.clientY = this.clientY + this.block.heightCalc.value
        }
      }
    }

    if (isInteractive) {
      this.clientX = this.blockElementRect.x + 15
      this.clientY = this.blockElementRect.y + 15
    }

    if (this.type === 'drag') {
      if (this.block.stickyTo?.guid) {
        const el = this.repository.getRefByGuid(this.block.stickyTo?.guid) as unknown as {
          $el: {
            offsetTop: number, offsetLeft: number, offsetHeight: number, offsetWidth: number
          }
        }
        if (this.block.stickyTo?.type === StickyToType.TOP) {
          this.clientY += el.$el.offsetTop + el.$el.offsetHeight
        } else if (this.block.stickyTo?.type === StickyToType.LEFT) {
          this.clientX += el.$el.offsetLeft + el.$el.offsetWidth
        }
      }
    }
  }

  private getBlockElementRect (): CustomDomRect {
    const blockRect: CustomDomRect = CustomDomRect.fromDocRect(this.blockElement.getBoundingClientRect())
    if (!this.parentElement) {
      return blockRect
    }
    const parentElementRect = this.parentElement.getBoundingClientRect()
    blockRect.left -= parentElementRect.left
    blockRect.top -= parentElementRect.top

    blockRect.left += this.parentElement.scrollLeft
    blockRect.top += this.parentElement.scrollTop

    blockRect.right = parentElementRect.width - (blockRect.left + blockRect.width)
    blockRect.bottom = parentElementRect.height - (blockRect.top + blockRect.height)

    return blockRect
  }

  public static getAbsoluteSizesByParent (block: BlockDTO, blockElement: Element): CustomDomRect {
    let blockRect = new CustomDomRect()
    const parentElement = blockElement.parentElement
    if (!parentElement) {
      return blockRect
    }
    const parentElementRect = parentElement.getBoundingClientRect()
    blockRect.height = parentElementRect.height / 100 * block.height
    blockRect.width = parentElementRect.width / 100 * block.width

    return blockRect
  }

  // TODO: учитывать sticky
  public change (event: MouseEvent): void {
    this.movementX = this.clientX - event.clientX
    this.movementY = this.clientY - event.clientY
    if (this.type === 'drag') {
      this.setYPosition(event)
      this.setXPosition(event)
    } else if (this.type === 'resize') {
      this.setWidth(event)
      this.setHeight(event)
    }
  }

  private setWidth (event: MouseEvent): void {
    switch (this.block.sizeTypes.width) {
      case SizeTypes.PIXEL:
        this.setAbsolutePosition(Breakpoints.W, event)
        break
      case SizeTypes.PERCENT:
        this.setRelativePosition(Breakpoints.W)
        break
    }
  }

  private setHeight (event: MouseEvent): void {
    switch (this.block.sizeTypes.height) {
      case SizeTypes.PIXEL:
        this.setAbsolutePosition(Breakpoints.H, event)
        break
      case SizeTypes.PERCENT:
        this.setRelativePosition(Breakpoints.H)
        break
    }
  }

  private setAbsolutePosition (type: Breakpoints, event: CustomMouseEvent): void {
    // TODO: учитывать границы родителя
    const breakpoints = BreakpointsFactory.build(type, this.block.sticky)
    this[breakpoints.client] = event[breakpoints.client]
    let newValue
    if (breakpoints.inverse) {
      newValue = this.block[breakpoints.offset] + this[breakpoints.movement]
    } else {
      newValue = this.block[breakpoints.offset] - this[breakpoints.movement]
    }
    if (newValue < 0) {
      return
    }
    this.repository.change(this.block.guid, breakpoints.offset, newValue)
    // why?
    this.block[breakpoints.offset] = newValue
  }

  private setYPosition (event: MouseEvent): void {
    const breakpoints = BreakpointsFactory.build(Breakpoints.Y, this.block.sticky)
    switch (this.block.sizeTypes[breakpoints.offset]) {
      case SizeTypes.PIXEL:
        this.setAbsolutePosition(Breakpoints.Y, event)
        break
      case SizeTypes.PERCENT:
        this.setRelativePosition(Breakpoints.Y)
        break
    }
  }

  private setXPosition (event: MouseEvent): void {
    const breakpoints = BreakpointsFactory.build(Breakpoints.X, this.block.sticky)
    switch (this.block.sizeTypes[breakpoints.offset]) {
      case SizeTypes.PIXEL:
        this.setAbsolutePosition(Breakpoints.X, event)
        break
      case SizeTypes.PERCENT:
        this.setRelativePosition(Breakpoints.X)
        break
    }
  }

  private setRelativePosition (type: Breakpoints): void {
    const breakpoints = BreakpointsFactory.build(type, this.block.sticky)
    if (!this.parentElement || Math.abs(this[breakpoints.movement]) < 2) {
      return
    }
    const parentElementPositions: CustomDomRect = this.parentElement.getBoundingClientRect()
    let currentPosition
    if (breakpoints.inverse) {
      currentPosition = Math.floor(this.blockElementRect[breakpoints.offset]) + this[breakpoints.movement]
    } else {
      currentPosition = Math.floor(this.blockElementRect[breakpoints.offset]) - this[breakpoints.movement]
    }
    const currentRelativeSize = Math.floor(currentPosition / ((parentElementPositions[breakpoints.size] / 100) * this.step) * this.step)

    this.repository.change(this.block.guid, breakpoints.offset, this.getNewRelativeSize(type, currentRelativeSize))
    // this.block[breakpoints.offset] = this.getNewRelativeSize(type, currentRelativeSize)
  }

  private getNewRelativeSize (type: Breakpoints, currentRelativeSize: number): number {
    const size = Math.floor(currentRelativeSize / this.step) * this.step

    if (type === Breakpoints.W || type === Breakpoints.H) {
      return size > 100 ? 100 : (size < 1 ? 1 : size)
    } else if (type === Breakpoints.X || type === Breakpoints.Y) {
      return size < 0 ? 0 : size
    }

    return size
  }
}
