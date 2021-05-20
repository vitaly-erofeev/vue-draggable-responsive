import { ActionTree } from 'vuex'
import { InterfaceState } from '@/components/InterfaceDesigner/infrastructure/store/state'
import { ADD_BLOCK } from '@/components/InterfaceDesigner/infrastructure/store/action-types'
import GuidGenerator from '@/components/InterfaceDesigner/infrastructure/service/GuidGenerator'
import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties'

export const actions: ActionTree<InterfaceState, any> = {
  [ADD_BLOCK] ({ commit, state }, block: BlockProperties) {
    block.guid = GuidGenerator.generate()
    commit(ADD_BLOCK, block)
  }
}
