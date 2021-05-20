import { MutationTree } from 'vuex'
import { InterfaceState } from '@/components/VueDraggableResponsive/infrastructure/store/state'
import { ADD_BLOCK } from '@/components/VueDraggableResponsive/infrastructure/store/mutation-types'
import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'

export const mutations: MutationTree<InterfaceState> = {
  [ADD_BLOCK] (state: InterfaceState, block: BlockProperties) {
    state.blocks.push(block)
  }
}
