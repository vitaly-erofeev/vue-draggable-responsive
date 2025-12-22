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

import TabSettings from '@/application/service/TabSettings'
import { StretchManager } from '@/infrastructure/service/StretchManager'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
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

  data (): { store: BlockRepositoryInterface, tabSettingsService: TabSettings, activeBlockGuid: string, mObserver?: MutationObserver } {
    return {
      store: new BlockRepository([], true),
      tabSettingsService: new TabSettings(this.tabSettings, this),
      activeBlockGuid: '',
      mObserver: undefined
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
  mounted () {
    const root = this.$el

    this.mObserver = new MutationObserver(mutationList => {
      mutationList.filter(m => m.type === 'childList').forEach(m => {
        m.addedNodes.forEach(node => node instanceof Element && StretchManager.notify())
      })
    })

    this.mObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true
    })
  },

  methods: {
    handleClick (event: { block: any, event: Event }) {
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
})
</script>

<style scoped>
.container {
  position: relative;
}
</style>
