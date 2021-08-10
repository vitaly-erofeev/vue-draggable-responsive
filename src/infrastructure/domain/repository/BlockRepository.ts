import { BlockRepositoryInterface } from '@/domain/repository/BlockRepositoryInterface'
import BlockDTO from '@/domain/model/BlockDTO'
import GuidGenerator from '@/infrastructure/service/GuidGenerator'
import { BlockProperties } from '@/domain/model/BlockProperties'
import Block from '@/infrastructure/components/Block.vue'

export default class BlockRepository implements BlockRepositoryInterface {
  private blocks: BlockDTO[] = [];

  constructor (blocks: BlockDTO[] = []) {
    this.blocks = blocks
  }

  set (blocks: BlockProperties[]): void {
    this.resetActiveBlock()
    this.blocks = this.prepareBlocks(blocks)
  }

  prepareBlocks (blocks: BlockProperties[]): BlockDTO[] {
    return blocks.map((block) => {
      if (typeof block.children !== 'undefined' && block.children.length > 0) {
        block.children = this.prepareBlocks(block.children)
      }
      return new BlockDTO(block)
    })
  }

  change (block: BlockDTO, property: string, value: any): void {
    const blockModel = this.getByGuid(block.guid)
    if (typeof blockModel !== 'undefined') {
      blockModel[property] = value
    }
  }

  getByGuid (guid: string): BlockDTO | undefined {
    let answer: BlockDTO | undefined
    JSON.stringify(this.blocks, (_, nestedValue) => {
      if (nestedValue && nestedValue.guid === guid) {
        answer = nestedValue
      }
      return nestedValue
    })

    return answer
  }

  add (block: BlockProperties): string {
    block.guid = GuidGenerator.generate()
    let parent: undefined | BlockDTO
    if (block.parentGuid) {
      parent = this.getByGuid(block.parentGuid)
      if (typeof parent !== 'undefined') {
        if (parent.tabs?.use && parent.tabs?.activeGuid) {
          block.parentTabGuid = parent.tabs.activeGuid
        }
        parent.children.push(new BlockDTO(block))
      }
    } else {
      this.blocks.push(new BlockDTO(block))
    }

    return block.guid
  }

  get (): BlockDTO[] {
    return this.blocks
  }

  remove (guid: string): void {
    const block = this.getByGuid(guid)
    if (!block) {
      return
    }
    if (block.parentGuid) {
      const parent = this.getByGuid(block.parentGuid)
      if (!parent) {
        return
      }
      parent.children = parent.children.filter((item) => item.guid !== guid)
      return
    }
    this.blocks = this.blocks.filter((item) => item.guid !== guid)
  }

  private resetActiveBlock ():void {
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
}
