import { BlockRepositoryInterface } from '@/components/VueDraggableResponsive/domain/repository/BlockRepositoryInterface'
import BlockDTO from '@/components/VueDraggableResponsive/domain/model/BlockDTO'
import { Store } from 'vuex'
import { InterfaceState } from '@/components/VueDraggableResponsive/infrastructure/store/state'

export default class BlockRepository implements BlockRepositoryInterface {
  private store: Store<InterfaceState>

  constructor (store: Store<InterfaceState>) {
    this.store = store
  }

  change (block: BlockDTO, property: string, value: any): void {
    const blockModel = this.store.getters.getByGuid(block.guid)
    blockModel[property] = value
  }
}
