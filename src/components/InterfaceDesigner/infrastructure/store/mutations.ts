import { MutationTree } from 'vuex'
import { InterfaceState } from '@/components/InterfaceDesigner/infrastructure/store/state'
import { ADD_BLOCK } from '@/components/InterfaceDesigner/infrastructure/store/mutation-types'
import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties'

export const mutations: MutationTree<InterfaceState> = {
  [ADD_BLOCK] (state: InterfaceState, block: BlockProperties) {
    state.blocks.push(block)
  }
}
