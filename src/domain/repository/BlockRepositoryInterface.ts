import BlockDTO from '@/domain/model/BlockDTO'
import { BlockProperties } from '@/domain/model/BlockProperties'

export interface BlockRepositoryInterface {
  change (block: BlockDTO, property: string, value: any): void

  add (block: BlockProperties): string

  get (): BlockDTO[]

  getByGuid (guid: string): BlockDTO | undefined

  remove (guid: string): void

  setActiveBlock (guid: string): void

  set (blocks: BlockProperties[]): void
}
