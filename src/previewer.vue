<template>
  <div class="container">
    <preview-block
      v-for="block in _blocks"
      v-show="!block.isHidden"
      :ref="block.guid"
      :key="block.guid"
      :block="block"
      :replication-callback="replicationCallback"
      :tab-settings-service="tabSettingsService"
      :class="{
          'active_block': block.guid === activeBlockGuid,
        }"
      @click="handleClick"
      @tab-click="$emit('tab-click', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </preview-block>
  </div>
</template>

<script lang="ts">
import PreviewBlock from 'e:/vue-draggable-responsive/src/infrastructure/components/PreviewBlock.vue'
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import BlockRepository from 'e:/vue-draggable-responsive/src/infrastructure/domain/repository/BlockRepository'
// eslint-disable-next-line no-unused-vars
import { BlockRepositoryInterface } from 'e:/vue-draggable-responsive/src/domain/repository/BlockRepositoryInterface'
// eslint-disable-next-line no-unused-vars
import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from 'e:/vue-draggable-responsive/src/infrastructure/domain/model/DataSourceInjected'
// eslint-disable-next-line no-unused-vars
import { BlockProperties } from 'e:/vue-draggable-responsive/src/domain/model/BlockProperties'

import TabSettings from 'e:/vue-draggable-responsive/src/application/service/TabSettings'

// const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
// export default Vue.extend({
export default {
  name: 'VueDraggableResponsivePreviewer',
  components: { PreviewBlock },

  provide (): { getStore: Function, mainBlockSelector: string } {
    return {
      getStore: this.getStore,
      mainBlockSelector: this.mainBlockSelector
    }
  },

  props: {
    replicationCallback: Function,
    tabSettings: {
      type: Object
    },
    mainBlockSelector: String
  },

  data (): { store: BlockRepositoryInterface, tabSettingsService: TabSettings, activeBlockGuid: string } {
    return {
      store: new BlockRepository([], true),
      tabSettingsService: new TabSettings(this.tabSettings, this),
      activeBlockGuid: ''
    }
  },

  computed: {
    _blocks (): BlockDTO[] {
      return this.store.get()
    }
  },

  watch: {
    tabSettings: {
      handler () {
        this.$set(this.tabSettingsService, 'tabSettings', this.tabSettings)
      }
    }
  },

  methods: {
    handleClick (event: {block: any, event: Event}) {
      this.$emit('click', event)
      this.activeBlockGuid = event.block.guid
    },
    getStore (): BlockRepositoryInterface {
      return this.store
    },
    setBlocks (blocks: BlockProperties[]): void {
      this.store.set([])
      this.$nextTick(() => {
        this.store.set(blocks)
      })
    },
    removeBlock (guid: string): void {
      this.store.remove(guid)
    },
    getRefByGuid (guid: string): Vue | undefined {
      return this.store.getRefByGuid(guid)
    }
  }
// })
}
</script>

<style scoped>
.container {
  position: relative;
}
</style>
