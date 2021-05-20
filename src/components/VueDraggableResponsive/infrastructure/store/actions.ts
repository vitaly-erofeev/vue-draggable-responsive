import { ActionTree } from 'vuex'
import { InterfaceState } from '@/components/VueDraggableResponsive/infrastructure/store/state'
import { ADD_BLOCK } from '@/components/VueDraggableResponsive/infrastructure/store/action-types'
import GuidGenerator from '@/components/VueDraggableResponsive/infrastructure/service/GuidGenerator'
import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'

export const actions: ActionTree<InterfaceState, any> = {
  [ADD_BLOCK] ({ commit, state }, block: BlockProperties) {
    block.guid = GuidGenerator.generate()
    commit(ADD_BLOCK, block)
  }
}
