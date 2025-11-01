import { BlockRepositoryInterfaceV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/repository/RelativeBlock'
import BlockRepository from 'e:/vue-draggable-responsive/src/infrastructure/domain/repository/BlockRepository'
import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
import { BlockPropertiesV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/model/RelativeBlockProperties'
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/model/RelativeBlockDTO'
export class BlockRepositoryV2 extends BlockRepository
  implements BlockRepositoryInterfaceV2 {
  constructor (blocks: BlockDTO[] = [], isPreviewMode: boolean = false) {
    super(blocks, isPreviewMode)
  }

  addRelativeBlock (block: BlockDTO, blockRelative: BlockPropertiesV2): string {
    console.log('blockRelative BlockRepositoryV2 BlockDTO', block)
    console.log('blockRelative BlockRepositoryV2 blockRelative', blockRelative)
    this.blocks.push(new BlockDTOV2(block, blockRelative))
    console.log('BlockRepositoryV2 block array', this.blocks)
    return 'ok'
  }
}
