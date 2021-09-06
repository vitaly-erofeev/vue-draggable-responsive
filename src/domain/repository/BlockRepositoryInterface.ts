import BlockDTO from '@/domain/model/BlockDTO'
import { BlockProperties } from '@/domain/model/BlockProperties'

export interface BlockRepositoryInterface {
  change (guid: string, property: string, value: any): void

  add (block: BlockProperties): string

  get (): BlockDTO[]

  getByGuid (guid: string): BlockDTO | undefined

  remove (guid: string): void

  setActiveBlock (guid: string): void

  set (blocks: BlockProperties[]): void

  setActiveTab (blockGuid: string, guid: string): void

  resetActiveBlock (): void

  addRef (guid: string, ref: Vue): void

  removeRef (guid: string): void

  getRefByGuid(guid: string): Vue | undefined
}
