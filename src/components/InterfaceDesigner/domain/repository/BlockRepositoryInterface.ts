import BlockDTO from '@/components/InterfaceDesigner/domain/model/BlockDTO.ts'

export interface BlockRepositoryInterface {
  change (block: BlockDTO, property: string, value: any): void
}
