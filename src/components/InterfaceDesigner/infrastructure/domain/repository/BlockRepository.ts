import { BlockRepositoryInterface } from '@/components/InterfaceDesigner/domain/repository/BlockRepositoryInterface'
import BlockDTO from '@/components/InterfaceDesigner/domain/model/BlockDTO'
import { Store } from 'vuex'
import { InterfaceState } from '@/components/InterfaceDesigner/infrastructure/store/state'

export default class BlockRepository implements BlockRepositoryInterface {
  private store: Store<InterfaceState>

  constructor (store: Store<InterfaceState>) {
    this.store = store
  }

  change (block: BlockDTO, property: string, value: any): void {
    const blockModel = this.store.getters.findModelByGuid(block.guid)
    blockModel[property] = value
  }
}
