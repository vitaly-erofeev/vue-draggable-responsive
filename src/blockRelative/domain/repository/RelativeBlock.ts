import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
export interface InterfaceBlockV2 {

  createBlock({ alias, parentGuid }: { alias: string; parentGuid: string }): BlockDTOV2

  getByGuid(guid: string): BlockDTOV2 | undefined

  addBlock (block: BlockDTOV2): string
}
