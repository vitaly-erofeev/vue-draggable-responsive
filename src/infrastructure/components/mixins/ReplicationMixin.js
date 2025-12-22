import SimpleAddListener from '@/infrastructure/service/listeners/SimpleAddListener'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { debounce } from '@/infrastructure/service/utils'

export default {
  props: {
    replicationCallback: Function
  },
  data () {
    return {
      prepareReplication: () => {
      },
      replicationIndex: 0
    }
  },
  created () {
    const me = this
    this.prepareReplication = debounce(this._prepareReplication.bind(this), 300, () => {
      if (!this.block.replication?.function) {
        return
      }
      me.block.isLoading = true
    })
  },
  methods: {
    onReplicateBlock (event) {
      if (this.replicationCallback) {
        this.replicationCallback(Object.assign({}, event, {
          replicationBlockGuid: this.block.guid,
          replicationIndex: this.replicationIndex
        }))
      }
    },
    async _prepareReplication (offset = {}) {
      if (!this.block.replication?.function) {
        this.block.isLoading = false
        return
      }
      this.block.isLoading = true
      this.block.isHidden = false
      let blocksData = []
      try {
        blocksData = await this.block.replication?.function(offset)
      } catch (e) {
        console.log('Error in replication request', e)
      }
      if (blocksData.length === 0) {
        this.block.isHidden = true
        this.block.isLoading = false
        return
      }
      blocksData.shift()
      let me = this
      let lastGuid = me.block.guid
      let columns = me.block.replication?.columns || 1
      let rowGuids = { 0: [me.block.guid] }
      let row = 0
      this.replicationIndex = 0
      const listenerGuid = this.getStore().addListener(new SimpleAddListener(this.onReplicateBlock))
      blocksData.forEach((item, index) => {
        const newBlock = JSON.parse(JSON.stringify(me.block))
        newBlock.replication = undefined
        newBlock.isLoading = false
        this.replicationIndex = this.replicationIndex + 1
        if ((index + 1) % columns !== 0) {
          if (me.block.replication?.horizontalMargin?.value) {
            newBlock.left = me.block.replication?.horizontalMargin?.value
            newBlock.sizeTypes.left = me.block.replication?.horizontalMargin?.type || SizeTypes.PIXEL
          } else {
            newBlock.left = 0
          }

          newBlock.stickyTo = {
            type: 'left',
            guid: lastGuid
          }
          if (row > 0) {
            let previousRowBlockGuid = rowGuids[row - 1][(index % columns) + 1]
            newBlock.replication = {}
            newBlock.replication.topBlockGuid = previousRowBlockGuid
            if (me.block.replication?.verticalMargin?.value) {
              newBlock.replication.verticalMargin =
                `${me.block.replication?.verticalMargin?.value}${me.block.replication?.verticalMargin?.type || SizeTypes.PIXEL}`
            }
          }
          lastGuid = me.getStore().add(newBlock)
        } else {
          row++
          if (me.block.replication?.verticalMargin?.value) {
            newBlock.top = me.block.replication?.verticalMargin?.value
            newBlock.sizeTypes.top = me.block.replication?.verticalMargin?.type || SizeTypes.PIXEL
          } else {
            newBlock.top = 0
          }
          newBlock.stickyTo = {
            type: 'top',
            guid: lastGuid
          }
          lastGuid = me.getStore().add(newBlock)
        }
        if (typeof rowGuids[row] === 'undefined') {
          rowGuids[row] = []
        }
        rowGuids[row].push(lastGuid)
      })
      this.getStore().removeListener(listenerGuid)
      this.block.isLoading = false
    }
  }
}
