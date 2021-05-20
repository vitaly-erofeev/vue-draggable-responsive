import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'

export interface InterfaceState {
  blocks: BlockProperties[];
}

export const initialState = (): InterfaceState => {
  return {
    blocks: []
  }
}
