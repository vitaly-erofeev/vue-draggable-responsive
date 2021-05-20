import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties.ts'

export interface InterfaceState {
  blocks: BlockProperties[];
}

export const initialState = (): InterfaceState => {
  return {
    blocks: []
  }
}
