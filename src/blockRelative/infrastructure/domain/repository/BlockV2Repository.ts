import { InterfaceBlockV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/repository/RelativeBlock'
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
import GuidGenerator from 'e:/vue-draggable-responsive/src/infrastructure/service/GuidGenerator'
// export class BlockV2Repository implements interfaceBlockV2 {
//   private blocks: BlockDTOV2[];

//   constructor (blocks: BlockDTOV2[]) {
//     this.blocks = blocks
//   }

//   createBlock ({ alias, parentGuid }: { alias: string; parentGuid: string; }): BlockDTOV2 {
//     const guid = GuidGenerator.generate()
//     const block: BlockDTOV2 = {
//       guid: guid,
//       alias: alias,
//       parentGuid: parentGuid,
//       children: [],
//       width: 200,
//       height: 150,
//       isStretched: false,
//       blockV2: {
//         isBlockV2: true
//       }
//     }

//     return block
//   }
//   getByGuid (guid: string): BlockDTOV2 | undefined {
//     function findBlock (blocks: BlockDTOV2[]): BlockDTOV2 | undefined {
//       for (const block of blocks) {
//         if (block.guid === guid) {
//           return block
//         }
//         if (block.children?.length) {
//           const found = findBlock(block.children)
//           if (found) return found
//         }
//       }
//       return undefined
//     }

//     return findBlock(this.blocks)
//   }

//   addBlock (block: BlockDTOV2): string {
//     this.blocks.push(block)

//     if (block.parentGuid) {
//       const parent = this.getByGuid(block.parentGuid)
//       if (parent) {
//         parent.children.push(block)
//       }
//     }

//     return block.guid
//   }
// }
export const BlockV2Repository = (blocks: BlockDTOV2[]): InterfaceBlockV2 => {
  // Кэш для быстрого поиска
  const blocksMap = new Map<string, BlockDTOV2>()

  const buildCache = (blocksToCache: BlockDTOV2[]) => {
    for (const block of blocksToCache) {
      blocksMap.set(block.guid, block)
      if (block.children?.length) {
        buildCache(block.children)
      }
    }
  }

  buildCache(blocks)

  return {
    createBlock ({ alias, parentGuid }): BlockDTOV2 {
      const guid = GuidGenerator.generate()
      const block: BlockDTOV2 = {
        guid: guid,
        alias: alias,
        parentGuid: parentGuid || '',
        children: [],
        width: 202,
        height: 150,
        isStretched: false,
        isActive: false,
        isActiveAsParent: false,
        isHidden: false,
        blockV2: { isBlockV2: true }
      }
      blocksMap.set(block.guid, block)
      return block
    },

    getByGuid (guid: string | undefined): BlockDTOV2 | undefined {
      if (!guid) return undefined
      return blocksMap.get(guid)
    },

    addBlock (block: BlockDTOV2): string {
      if (block.parentGuid) {
        const parent = this.getByGuid(block.parentGuid)
        if (parent) {
          parent.children.push(block)
        }
      } else {
        blocks.push(block)
      }
      return block.guid
    },

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
    },

    resetActiveBlock (): void {
      const resetRecursive = (blocksToReset: BlockDTOV2[]) => {
        for (const block of blocksToReset) {
          block.isActive = false
          block.isActiveAsParent = false
          if (block.children?.length) {
            resetRecursive(block.children)
          }
        }
      }
      resetRecursive(blocks)
    },

    setBlocks (blocksV2: BlockDTOV2[]): void {
      // this.resetActiveBlock()
      const copy = JSON.parse(JSON.stringify(blocksV2))
      copy.forEach((block: BlockDTOV2) => {
        blocks.push(block)
      })
      buildCache(blocks)
    },
    findBlocks (predicate: (block: BlockDTOV2) => boolean): BlockDTOV2[] {
      const results: BlockDTOV2[] = []

      const search = (blockList: BlockDTOV2[]) => {
        for (const block of blockList) {
          if (predicate(block)) results.push(block)
          if (block.children?.length) search(block.children)
        }
      }

      search(blocks)
      return results
    },

    removeBlock (guid: string): boolean {
      const blockToRemove = blocksMap.get(guid)
      if (!blockToRemove) return false

      if (blockToRemove.parentGuid) {
        const parent = blocksMap.get(blockToRemove.parentGuid)
        if (parent?.children) {
          const index = parent.children.findIndex(child => child.guid === guid)
          if (index !== -1) {
            parent.children.splice(index, 1)
            blocksMap.delete(guid)
            return true
          }
        }
      } else {
        const index = blocks.findIndex(block => block.guid === guid)
        if (index !== -1) {
          blocks.splice(index, 1)
          blocksMap.delete(guid)
          return true
        }
      }

      return false
    }
  }
}
