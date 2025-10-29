import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
import { BlockProperties } from 'e:/vue-draggable-responsive/src/domain/model/BlockProperties'
import { ListenerInterface } from 'e:/vue-draggable-responsive/src/domain/service/ListenerInterface'

export interface BlockRepositoryInterface {
  change (guid: string, property: string, value: any): void

  add (block: BlockProperties): string

  get (): BlockDTO[]

  getByGuid (guid: string): BlockDTO | undefined

  getByAlias (alias: string): BlockDTO | undefined

  getByTabGuid (tabGuid: string): BlockDTO[]

  getMainParents (guid: string): BlockDTO | {}

  remove (guid: string): void

  setActiveBlock (guid: string): void

  set (blocks: BlockProperties[]): void

  setActiveTab (blockGuid: string, guid: string): void

  resetActiveBlock (): void

  addRef (guid: string, ref: Vue): void

  removeRef (guid: string): void

  getRefByGuid (guid: string): Vue | undefined

  getStickyLines (guid?: string): {
    x1: string, y1: string, x2: string, y2: string
  }[]

  addListener (listener: ListenerInterface): string

  removeListener (guid: string): void

  setRequiredTabs (blocks: string[]): void
}
