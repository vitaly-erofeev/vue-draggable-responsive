import { BlockRepositoryInterface } from 'e:/vue-draggable-responsive/src/domain/repository/BlockRepositoryInterface'

export interface DataSourceInjected {
  getStore: () => BlockRepositoryInterface,
  mainBlockSelector: string
}
