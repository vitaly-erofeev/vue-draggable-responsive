import { ActionTree } from 'vuex'
import { InterfaceState } from '@/components/VueDraggableResponsive/infrastructure/store/state'
import { ADD_BLOCK } from '@/components/VueDraggableResponsive/infrastructure/store/action-types'
import GuidGenerator from '@/components/VueDraggableResponsive/infrastructure/service/GuidGenerator'
import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'
import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'

export const actions: ActionTree<InterfaceState, any> = {
  [ADD_BLOCK] ({ commit, state, getters }, block: BlockProperties) {
    block.guid = GuidGenerator.generate()
    let parent: undefined | BlockDTO
    if (block.parentGuid) {
      parent = getters.getByGuid(block.parentGuid)
    }
    return new Promise((resolve: (guid: string) => void) => {
      commit(ADD_BLOCK, { block: new BlockDTO(block), parent: parent })
      resolve(block.guid)
    })
  }
}
