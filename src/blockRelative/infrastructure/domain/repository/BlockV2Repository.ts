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
  return {
    createBlock ({ alias, parentGuid }) {
      const guid = GuidGenerator.generate()
      const block: BlockDTOV2 = {
        guid,
        alias,
        parentGuid,
        children: [],
        width: 200,
        height: 150,
        isStretched: false,
        blockV2: { isBlockV2: true }
      }
      return block
    },

    getByGuid (guid: string) {
      const findBlock = (blocksToSearch: BlockDTOV2[]): BlockDTOV2 | undefined => {
        for (const block of blocksToSearch) {
          if (block.guid === guid) return block
          if (block.children?.length) {
            const found = findBlock(block.children)
            if (found) return found
          }
        }
        return undefined
      }
      return findBlock(blocks)
    },

    addBlock (block: BlockDTOV2): string {
      blocks.push(block)
      if (block.parentGuid) {
        const parent = this.getByGuid(block.parentGuid)
        if (parent) {
          parent.children.push(block)
        }
      }
      return block.guid
    }
  }
}
