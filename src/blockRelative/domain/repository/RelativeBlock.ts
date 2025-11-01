import { BlockRepositoryInterface } from 'e:/vue-draggable-responsive/src/domain/repository/BlockRepositoryInterface'
import { BlockPropertiesV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/model/RelativeBlockProperties'
import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
export interface BlockRepositoryInterfaceV2 extends BlockRepositoryInterface {
    addRelativeBlock?(block: BlockDTO, blockRelative: BlockPropertiesV2): string
  }
