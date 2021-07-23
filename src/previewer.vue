<template>
  <div class="container">
    <preview-block
        v-for="block in blocks"
        :key="block.guid"
        :block="block"
        :ref="block.guid"
        :style="block.style"
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

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
  name: 'VueDraggableResponsivePreviewer',
  components: { PreviewBlock },
  props: {
    blocks: {
      type: Array as Vue.PropType<BlockDTO[]>,
      default: () => []
    }
  },
  data (): { store: BlockRepositoryInterface } {
    return {
      store: new BlockRepository(this.blocks)
    }
  },
  provide (): { getStore: Function } {
    return {
      getStore: this.getStore
    }
  },
  methods: {
    getStore (): BlockRepositoryInterface {
      return this.store
    }
  }
})
</script>

<style scoped>
.container {
  position: relative;
}
</style>
