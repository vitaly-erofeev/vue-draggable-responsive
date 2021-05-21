import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'
import CustomMouseEvent from '@/components/VueDraggableResponsive/domain/model/CustomMouseEvent'
import CustomDomRect from '@/components/VueDraggableResponsive/domain/model/CustomDomRect'
import BreakpointsFactory from '@/components/VueDraggableResponsive/domain/service/BreakpointsFactory'
import { Breakpoints } from '@/components/VueDraggableResponsive/domain/model/Breakpoints'
import { BlockRepositoryInterface } from '@/components/VueDraggableResponsive/domain/repository/BlockRepositoryInterface'
import { SizeTypes } from '@/components/VueDraggableResponsive/domain/model/SizeTypes'

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
  private readonly step: number

  constructor (block: BlockDTO, repository: BlockRepositoryInterface, blockElement: Element, step: number = 0.5) {
    this.repository = repository
    this.block = block
    this.step = step
    this.blockElement = blockElement
  }

  public startDrag (event: MouseEvent, type: string): void {
    this.clientX = event.clientX
    this.clientY = event.clientY
    this.type = type
    this.blockElementRect = this.getBlockElementRect()
  }

  private getBlockElementRect (): CustomDomRect {
    const blockRect: CustomDomRect = CustomDomRect.fromDocRect(this.blockElement.getBoundingClientRect())
    const parentElement = this.blockElement.parentElement
    if (!parentElement) {
      return blockRect
    }
    const parentElementRect = parentElement.getBoundingClientRect()
    blockRect.left -= parentElementRect.left
    blockRect.top -= parentElementRect.top

    blockRect.right = parentElementRect.width - (blockRect.left + blockRect.width)
    blockRect.bottom = parentElementRect.height - (blockRect.top + blockRect.height)

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
    // TODO: учитывать границы родителя и минусовые значения
    const breakpoints = BreakpointsFactory.build(type, this.block.sticky)
    this[breakpoints.client] = event[breakpoints.client]
    if (breakpoints.inverse) {
      this.repository.change(this.block, breakpoints.offset, this.block[breakpoints.offset] + this[breakpoints.movement])
      // this.block[breakpoints.offset] = this.block[breakpoints.offset] + this[breakpoints.movement]
    } else {
      this.repository.change(this.block, breakpoints.offset, this.block[breakpoints.offset] - this[breakpoints.movement])
      // this.block[breakpoints.offset] = this.block[breakpoints.offset] - this[breakpoints.movement]
    }
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
    const parentElement = this.blockElement.parentElement
    const breakpoints = BreakpointsFactory.build(type, this.block.sticky)
    if (!parentElement || Math.abs(this[breakpoints.movement]) < 2) {
      return
    }
    const parentElementPositions: CustomDomRect = parentElement.getBoundingClientRect()
    let currentPosition
    if (breakpoints.inverse) {
      currentPosition = Math.floor(this.blockElementRect[breakpoints.offset]) + this[breakpoints.movement]
    } else {
      currentPosition = Math.floor(this.blockElementRect[breakpoints.offset]) - this[breakpoints.movement]
    }
    const currentRelativeSize = Math.floor(currentPosition / ((parentElementPositions[breakpoints.size] / 100) * this.step) * this.step)

    this.repository.change(this.block, breakpoints.offset, this.getNewRelativeSize(type, currentRelativeSize))
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
