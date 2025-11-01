import { BlockRepositoryInterface } from 'e:/vue-draggable-responsive/src/domain/repository/BlockRepositoryInterface'
import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
import GuidGenerator from 'e:/vue-draggable-responsive/src/infrastructure/service/GuidGenerator'
import { BlockProperties } from 'e:/vue-draggable-responsive/src/domain/model/BlockProperties'
import { StickyToType } from 'e:/vue-draggable-responsive/src/domain/model/StickyTo'
import { Sticky } from 'e:/vue-draggable-responsive/src/domain/model/Sticky'
import { ListenerInterface } from 'e:/vue-draggable-responsive/src/domain/service/ListenerInterface'
import { EventTypes } from 'e:/vue-draggable-responsive/src/domain/model/EventTypes'

export default class BlockRepository implements BlockRepositoryInterface {
  protected blocks: BlockDTO[] = []
  private previousRequiredBlocks: string[] = []
  private listeners: {
    [index: string]: ListenerInterface
  } = {}
  private refs: {
    guid: string,
    element: Vue
  }[] = []
  private readonly isPreviewMode: boolean

  constructor (blocks: BlockDTO[] = [], isPreviewMode: boolean = false) {
    this.blocks = blocks
    this.isPreviewMode = isPreviewMode
  }

  set (blocks: BlockProperties[]): void {
    this.resetActiveBlock()
    this.blocks = this.prepareBlocks(blocks)
  }

  prepareBlocks (blocks: BlockProperties[]): BlockDTO[] {
    return blocks.map((block) => {
      let children: BlockDTO[] = []
      if (typeof block.children !== 'undefined' && block.children.length > 0) {
        children = this.prepareBlocks(block.children)
      }

      let replicationFunction
      if (block.replication?.function) {
        replicationFunction = block.replication?.function
      }
      block = JSON.parse(JSON.stringify(block))
      block.isHidden = false
      if (replicationFunction && block.replication) {
        block.replication.function = replicationFunction
      }
      block.children = children

      return new BlockDTO(block)
    })
  }

  change (guid: string, property: string, value: any): void {
    const blockModel = this.getByGuid(guid)
    if (typeof blockModel !== 'undefined') {
      blockModel[property] = value
    }
  }

  getByGuid (guid: string): BlockDTO | undefined {
    let answer: BlockDTO | undefined
    JSON.stringify(this.blocks, (_, nestedValue) => {
      if (nestedValue && nestedValue.guid === guid &&
        typeof nestedValue.sticky !== 'undefined') {
        answer = nestedValue
      }
      return nestedValue
    })

    return answer
  }

  getByTabGuid (tabGuid: string): BlockDTO[] {
    let answer: BlockDTO[] = []

    JSON.stringify(this.blocks, (_, nestedValue) => {
      if (nestedValue && nestedValue.parentTabGuid === tabGuid &&
          typeof nestedValue.sticky !== 'undefined') {
        !answer.includes(nestedValue.guid) && answer.push(nestedValue.guid)
      }
      return nestedValue
    })

    return answer
  }

  getByAlias (alias: string): BlockDTO | undefined {
    let answer: BlockDTO | undefined
    JSON.stringify(this.blocks, (_, nestedValue) => {
      if (nestedValue && nestedValue.alias === alias &&
        typeof nestedValue.sticky !== 'undefined') {
        answer = nestedValue
      }
      return nestedValue
    })

    return answer
  }

  getMainParents (guid: string): BlockDTO | {} {
    let block!: BlockDTO | {}
    let blocks: BlockDTO[] | []
    blocks = this.get()
    for (let i = 0; i < blocks.length; i++) {
      if (JSON.stringify(blocks[i]).includes(guid)) {
        block = blocks[i]
        break
      }
    }

    return block
  }

  add (block: BlockProperties): string {
    const oldGuid = block.guid
    block.guid = GuidGenerator.generate()
    let parent: undefined | BlockDTO
    let children = block.children
    block.children = []
    block.isLoading = false
    if (block.parentGuid) {
      parent = this.getByGuid(block.parentGuid)
      if (typeof parent !== 'undefined') {
        if (parent.tabs?.use && parent.tabs?.activeGuid && !this.isPreviewMode) {
          block.parentTabGuid = parent.tabs.activeGuid
        }
        parent.children.push(new BlockDTO(block))
      }
    } else {
      this.blocks.push(new BlockDTO(block))
    }

    this.emitEvent(EventTypes.ADD_BLOCK, {
      oldGuid: oldGuid,
      guid: block.guid
    })

    if (children && children.length > 0) {
      this.addChildren(children, block.guid)
    }

    return block.guid
  }

  private addChildren (blocks: BlockProperties[], parentGuid: string) {
    const blocksMapper: { [index: string]: string } = {}
    const stickyMapper: { [index: string]: string } = {}
    blocks.forEach((item) => {
      const oldGuid = item.guid
      const newGuid = this.add(Object.assign(item, { parentGuid }))
      if (oldGuid) {
        blocksMapper[oldGuid] = newGuid
        if (item.stickyTo?.guid) {
          stickyMapper[oldGuid] = item.stickyTo.guid
        }
      }
    })

    Object.keys(stickyMapper).forEach((key) => {
      const block = this.getByGuid(blocksMapper[key])
      if (block) {
        const newStickyBlockGuid = blocksMapper[stickyMapper[key]]
        if (newStickyBlockGuid) {
          if (block.stickyTo) {
            block.stickyTo.guid = newStickyBlockGuid
          }
        }
      }
    })
  }

  private setRequiredTab (guid: string, toClear = false): string[] {
    const block = this.getByGuid(guid)
    let answer: string[] = []

    if (block?.parentTabGuid) {
      if (block?.parentGuid) {
        const parentBlock = this.getByGuid(block?.parentGuid)
        if (parentBlock?.tabs && !parentBlock?.tabs?.requiredTabs) {
          parentBlock.tabs.requiredTabs = []
        }
        if (parentBlock?.tabs?.requiredTabs) {
          if (toClear) {
            const index = parentBlock.tabs.requiredTabs.indexOf(block.parentTabGuid)
            if (index > -1) {
              parentBlock.tabs.requiredTabs.splice(index, 1)
            }
          } else {
            parentBlock.tabs.requiredTabs.push(block.parentTabGuid)
          }
        }
      }
    }
    if (block?.parentGuid) {
      this.setRequiredTab(block.parentGuid, toClear)
    }

    return answer
  }

  setRequiredTabs (blocks: string[]): void {
    this.previousRequiredBlocks.forEach((item) => this.setRequiredTab(item, true))
    blocks.forEach((item) => this.setRequiredTab(item))
    this.previousRequiredBlocks = blocks
  }

  get (): BlockDTO[] {
    return this.blocks
  }

  getFlat (): (BlockDTO | undefined)[] {
    return this.refs.map(ref => this.getByGuid(ref.guid))
  }

  remove (guid: string): void {
    const block = this.getByGuid(guid)
    if (!block) {
      return
    }
    if (block.children?.length) {
      block.children.forEach((item) => this.remove(item.guid))
    }
    if (block.parentGuid) {
      const parent = this.getByGuid(block.parentGuid)
      if (!parent) {
        return
      }
      parent.children = parent.children.filter((item) => item.guid !== guid)
    } else {
      this.blocks = this.blocks.filter((item) => item.guid !== guid)
    }
    this.emitEvent(EventTypes.REMOVE_BLOCK, {
      guid: guid
    })
  }

  resetActiveBlock (): void {
    JSON.stringify(this.blocks, (_, nestedValue) => {
      if (nestedValue && typeof nestedValue.isActive !== 'undefined') {
        nestedValue.isActive = false
        nestedValue.isActiveAsParent = false
      }
      return nestedValue
    })
  }

  setActiveBlock (guid: string): void {
    this.resetActiveBlock()
    const block = this.getByGuid(guid)
    if (typeof block === 'undefined') {
      return
    }

    block.isActive = true
    if (block.parentGuid) {
      const parent = this.getByGuid(block.parentGuid)
      if (typeof parent !== 'undefined') {
        parent.isActiveAsParent = true
      }
    }
  }

  setActiveTab (blockGuid: string, guid: string): void {
    const block = this.getByGuid(blockGuid)
    if (typeof block === 'undefined') {
      return
    }
    if (block.tabs && block.tabs.use) {
      block.tabs.activeGuid = guid
    }
  }

  addRef (guid: string, ref: Vue): void {
    this.refs.push({
      guid: guid,
      element: ref
    })
  }

  getRefByGuid (guid: string): Vue | undefined {
    const element = this.refs.find((item) => {
      return item.guid === guid
    })

    if (element) {
      return element.element
    }

    return undefined
  }

  removeRef (guid: string): void {
    this.refs = this.refs.filter((item) => item.guid !== guid)
  }

  getStickyLines (guid?: string): {
    x1: string, y1: string, x2: string, y2: string
  }[] {
    let blocks = guid ? this.getByGuid(guid)?.children : this.blocks
    if (!blocks) {
      return []
    }
    let answer: {
      x1: string, y1: string, x2: string, y2: string
    }[] = []
    blocks.filter((item) => item.stickyTo?.guid !== 'undefined').forEach((item) => {
      if (!item.stickyTo?.guid || item.sticky !== Sticky.TL) {
        return false
      }
      let stickyElm = this.getRefByGuid(item.stickyTo.guid) as unknown as {
        positionStyle: {
          top: string, height: string, left: string, width: string
        }
      }
      let elm = this.getRefByGuid(item.guid) as unknown as {
        positionStyle: {
          top: string, height: string, left: string, width: string
        }
      }
      if (!elm || !stickyElm) {
        return false
      }
      if (item.stickyTo.type === StickyToType.TOP) {
        answer.push({
          x1: `calc(${elm.positionStyle.left} + calc(${elm.positionStyle.width} / 2))`,
          y1: elm.positionStyle.top,
          x2: `calc(${stickyElm.positionStyle.left} + calc(${stickyElm.positionStyle.width} / 2))`,
          y2: `calc(${stickyElm.positionStyle.top} + ${stickyElm.positionStyle.height})`
        })
      } else if (item.stickyTo.type === StickyToType.LEFT) {
        answer.push({
          x1: elm.positionStyle.left,
          y1: `calc(${elm.positionStyle.top} + calc(${elm.positionStyle.height} / 2))`,
          x2: `calc(${stickyElm.positionStyle.left} + ${stickyElm.positionStyle.width})`,
          y2: `calc(${stickyElm.positionStyle.top} + calc(${stickyElm.positionStyle.height} / 2))`
        })
      }
    })

    return answer
  }

  addListener (listener: ListenerInterface): string {
    const guid = GuidGenerator.generate()
    this.listeners[guid] = listener
    return guid
  }

  removeListener (guid: string): void {
    delete this.listeners[guid]
  }

  private emitEvent (type: EventTypes, event: {}): void {
    Object.values(this.listeners).forEach((listener: ListenerInterface) => {
      if (listener.isSubscribed(type)) {
        listener.handle(event)
      }
    })
  }
}
