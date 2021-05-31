import { GetterTree } from 'vuex'
import { InterfaceState } from './state'
import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'
import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'

export const getters: GetterTree<InterfaceState, any> = {
  blocks (state: InterfaceState): BlockDTO[] {
    return state.blocks
  },

  getByGuid: (state: InterfaceState) => (guid: string): undefined | object => {
    let answer
    JSON.stringify(state.blocks, (_, nestedValue) => {
      if (nestedValue && nestedValue.guid === guid) {
        answer = nestedValue
      }
      return nestedValue
    })
    return answer
  }
}
