import { ActionTree } from 'vuex'
import { InterfaceState } from '@/components/InterfaceDesigner/infrastructure/store/state.ts'
import { ADD_BLOCK } from '@/components/InterfaceDesigner/infrastructure/store/action-types.ts'
import GuidGenerator from '@/components/InterfaceDesigner/infrastructure/service/GuidGenerator.ts'
import { BlockProperties } from '@/components/InterfaceDesigner/domain/model/BlockProperties.ts'

export const actions: ActionTree<InterfaceState, any> = {
  [ADD_BLOCK] ({ commit, state }, block: BlockProperties) {
    block.guid = GuidGenerator.generate()
    commit(ADD_BLOCK, block)
  }
}
