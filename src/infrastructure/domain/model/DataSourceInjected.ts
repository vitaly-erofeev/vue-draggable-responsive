import { BlockRepositoryInterface } from '@/domain/repository/BlockRepositoryInterface'

export interface DataSourceInjected {
  getStore: () => BlockRepositoryInterface,
  mainBlockSelector: string
}
