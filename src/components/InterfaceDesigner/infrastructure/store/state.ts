import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties'

export interface InterfaceState {
  blocks: BlockProperties[];
}

export const initialState = (): InterfaceState => {
  return {
    blocks: []
  }
}
