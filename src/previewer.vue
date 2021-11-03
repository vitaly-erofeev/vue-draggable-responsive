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
      @click="$emit('click', $event)"
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

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
  name: 'VueDraggableResponsivePreviewer',
  components: { PreviewBlock },

  provide (): { getStore: Function } {
    return {
      getStore: this.getStore
    }
  },

  props: {
    replicationCallback: Function,
    tabSettings: {
      type: Object
    }
  },

  data (): { store: BlockRepositoryInterface, tabSettingsService: TabSettings } {
    return {
      store: new BlockRepository([], true),
      tabSettingsService: new TabSettings(this.tabSettings, this)
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
    getStore (): BlockRepositoryInterface {
      return this.store
    },
    setBlocks (blocks: BlockProperties[]): void {
      this.store.set(blocks)
    },
    removeBlock (guid: string): void {
      this.store.remove(guid)
    },
    getRefByGuid (guid: string): Vue | undefined {
      return this.store.getRefByGuid(guid)
    },
    onUpdateTabSettings (tabSettings: object): void {
      // Обновить ссылку на объект на новую
      this.$emit('tab-settings-update', tabSettings)
    }
  }
})
</script>

<style scoped>
.container {
  position: relative;
}
</style>
