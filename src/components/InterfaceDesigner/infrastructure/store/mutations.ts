import { MutationTree } from 'vuex'
import { InterfaceState } from '@/components/InterfaceDesigner/infrastructure/store/state.ts'
import { ADD_BLOCK } from '@/components/InterfaceDesigner/infrastructure/store/mutation-types.ts'
import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties.ts'

export const mutations: MutationTree<InterfaceState> = {
  [ADD_BLOCK] (state: InterfaceState, block: BlockProperties) {
    state.blocks.push(block)
  }
}
