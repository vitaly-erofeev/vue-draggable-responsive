import { MutationTree } from 'vuex'
import { InterfaceState } from '@/components/VueDraggableResponsive/infrastructure/store/state'
import { ADD_BLOCK } from '@/components/VueDraggableResponsive/infrastructure/store/mutation-types'
import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'

export const mutations: MutationTree<InterfaceState> = {
  [ADD_BLOCK] (state: InterfaceState, { block, parent }: {block : BlockDTO, parent: BlockDTO}) {
    if (parent) {
      parent.children.push(block)
    } else {
      state.blocks.push(block)
    }
  }
}
