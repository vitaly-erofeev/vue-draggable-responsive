import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
import { BlockPropertiesV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/model/RelativeBlockProperties'
import { BlockProperties } from 'e:/vue-draggable-responsive/src/domain/model/BlockProperties'
export class BlockDTOV2 extends BlockDTO {
    // новые поля
    isBlockRelative?: boolean

    constructor (data: Partial<BlockProperties> = {}, relativeBlockData: BlockPropertiesV2) {
      console.log('relativeBlockData datadata', data)
      console.log('relativeBlockData BlockDTOV2', relativeBlockData)
      super(data)
      this.isBlockRelative = relativeBlockData.isBlockRelative
    }
}
