import { GetterTree } from 'vuex'
import { InterfaceState } from './state'
import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'
import { BlockProperties } from '@/components/VueDraggableResponsive/domain/model/BlockProperties'

class Map {
  [index: string]: any
}
export const getters: GetterTree<InterfaceState, any> = {
  blocksAsTree (state: InterfaceState): BlockDTO[] {
    let answer: BlockDTO[] = []
    let map: Map = new Map()
    let list: BlockDTO[] = []

    state.blocks.forEach((item: BlockProperties, index) => {
      map[item.guid] = index
      list[index] = new BlockDTO(item)
    })

    state.blocks.forEach((item: BlockProperties, index) => {
      if (item.parentGuid) {
        list[map[item.parentGuid]].children.push(list[map[item.guid]])
      } else {
        answer.push(list[map[item.guid]])
      }
    })

    return answer
  },

  blocksAsList (state: InterfaceState): object[] {
    return state.blocks
  },

  findModelByGuid: (state: InterfaceState) => (guid: string): undefined | object => {
    return state.blocks.find((block: BlockProperties) => {
      return block.guid === guid
    })
  }
}
