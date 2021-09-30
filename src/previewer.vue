<template>
  <div class="container">
    <preview-block
        v-for="block in _blocks"
        :key="block.guid"
        :block="block"
        :ref="block.guid"
        :replication-callback="replicationCallback"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </preview-block>
  </div>
</template>

<script lang="ts">
import PreviewBlock from '@/infrastructure/components/PreviewBlock.vue'
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import BlockRepository from '@/infrastructure/domain/repository/BlockRepository'
// eslint-disable-next-line no-unused-vars
import { BlockRepositoryInterface } from '@/domain/repository/BlockRepositoryInterface'
// eslint-disable-next-line no-unused-vars
import BlockDTO from '@/domain/model/BlockDTO'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'
// eslint-disable-next-line no-unused-vars
import { BlockProperties } from '@/domain/model/BlockProperties'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
  name: 'VueDraggableResponsivePreviewer',
  components: { PreviewBlock },
  props: {
    replicationCallback: Function
  },
  data (): { store: BlockRepositoryInterface } {
    return {
      store: new BlockRepository([], true)
    }
  },
  provide (): { getStore: Function } {
    return {
      getStore: this.getStore
    }
  },
  computed: {
    _blocks (): BlockDTO[] {
      return this.store.get()
    }
  },
  methods: {
    getStore (): BlockRepositoryInterface {
      return this.store
    },
    setBlocks (blocks: BlockProperties[]): void {
      this.store.set(blocks)
    }
  }
})
</script>

<style scoped>
.container {
  position: relative;
}
</style>
