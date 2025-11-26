import { InterfaceBlockV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/repository/RelativeBlock'
import { BlockDTOV2, ParametersBlock, BlockMap } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
import GuidGenerator from 'e:/vue-draggable-responsive/src/infrastructure/service/GuidGenerator'

export class BlockV2Repository implements InterfaceBlockV2 {
  private blocks: BlockDTOV2[]
  private blocksMap: BlockMap

  constructor (initialBlocks: BlockDTOV2[] = []) {
    this.blocks = initialBlocks
    this.blocksMap = new Map()
    this.rebuildCache()
  }
  private rebuildCache (): void {
    this.blocksMap.clear()
    this.buildCache(this.blocks)
  }

  private buildCache = (blocksToCache: BlockDTOV2[]) => {
    for (const block of blocksToCache) {
      this.blocksMap.set(block.guid, block)
      if (block.children?.length) {
        this.buildCache(block.children)
      }
    }
  }
  public createBlock (parametersBlock: ParametersBlock): BlockDTOV2 {
    const { alias, parentGuid, width, height } = parametersBlock
    const guid = GuidGenerator.generate()
    const block: BlockDTOV2 = {
      guid,
      alias: alias || '',
      parentGuid: parentGuid || '',
      children: [],
      width,
      height,
      isStretched: false,
      isActive: false,
      style: '',
      isActiveAsParent: false,
      isHidden: false,
      properties: {
        contentType: null
      },
      blockV2: { isBlockV2: true }
    }
    this.blocksMap.set(block.guid, block)
    return block
  }

  public getByGuid (guid: string | undefined): BlockDTOV2 | undefined {
    if (!guid) return undefined
    return this.blocksMap.get(guid)
  }

  public addBlock (block: BlockDTOV2): string {
    if (block.parentGuid) {
      const parent = this.getByGuid(block.parentGuid)
      if (parent) {
        parent.children.push(block)
      }
    } else {
      this.blocks.push(block)
    }
    return block.guid
  }

  setActiveBlock (guid: string): void {
    this.resetActiveBlock()
    const block = this.getByGuid(guid)
    if (!block) return

    block.isActive = true

    let currentGuid = block.parentGuid
    while (currentGuid) {
      const parent = this.getByGuid(currentGuid)
      if (!parent) break

      parent.isActiveAsParent = true
      currentGuid = parent.parentGuid
    }
  }

  public resetActiveBlock (): void {
    const resetRecursive = (blocksToReset: BlockDTOV2[]) => {
      for (const block of blocksToReset) {
        block.isActive = false
        block.isActiveAsParent = false
        if (block.children?.length) {
          resetRecursive(block.children)
        }
      }
    }
    resetRecursive(this.blocks)
  }

  public setBlocks (blocksV2: BlockDTOV2[]): void {
    // this.resetActiveBlock()
    // const copy = JSON.parse(JSON.stringify(blocksV2))
    this.rebuildCache()
    blocksV2.forEach((block: BlockDTOV2) => {
      if (this.blocksMap.get(block.guid)) return
      this.blocks.push(block)
    })
    this.rebuildCache()
  }
  // private findBlocks (predicate: (block: BlockDTOV2) => boolean): BlockDTOV2[] {
  //   const results: BlockDTOV2[] = []

  //   const search = (blockList: BlockDTOV2[]) => {
  //     for (const block of blockList) {
  //       if (predicate(block)) results.push(block)
  //       if (block.children?.length) search(block.children)
  //     }
  //   }

  //   search(this.blocks)
  //   return results
  // }

  public removeBlock (guid: string): boolean {
    const blockToRemove = this.blocksMap.get(guid)
    if (!blockToRemove) return false

    if (blockToRemove.parentGuid) {
      const parent = this.blocksMap.get(blockToRemove.parentGuid)
      if (parent?.children) {
        const index = parent.children.findIndex(child => child.guid === guid)
        if (index !== -1) {
          parent.children.splice(index, 1)
          this.blocksMap.delete(guid)
          return true
        }
      }
    } else {
      const index = this.blocks.findIndex(block => block.guid === guid)
      if (index !== -1) {
        this.blocks.splice(index, 1)
        this.blocksMap.delete(guid)
        return true
      }
    }

    return false
  }
}
