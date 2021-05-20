import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'

export interface BlockRepositoryInterface {
  change (block: BlockDTO, property: string, value: any): void
}
