import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'

export interface InterfaceState {
  blocks: BlockDTO[];
}

export const initialState = (): InterfaceState => {
  return {
    blocks: []
  }
}
