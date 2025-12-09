<template>
  <div class="container">
   <template v-if="!isBlocksV2">
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
  </template>
    <!-- _blocksRelative-preview
<code>{{_blocksRelative}}</code> -->
 <!-- this.store.get
<code>{{ this.store.get()}}</code> -->
  <template v-if="!isSetka">
    <block-relative-preview
      v-for="block in _blocksRelative"
      v-show="!block.isHidden"
      :ref="block.guid"
      :key="block.guid"
      :block="block"
      @set-active-block="$emit('set-active-block', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </block-relative-preview>
  </template>

  <template v-if="isSetka">
    <block-grid-layout
      ref="gridLayout"
      :grid-config="blocksV2Props.gridConfig"
     @set-active-block="$emit('set-active-block', $event)"
     >
      <template v-slot:content="{ blocks }">
        <block-relative-preview
          v-for="block in blocks"
          v-show="!block.isHidden"
          :ref="block.guid"
          :key="block.guid"
          :block="block"
          @set-active-block="$emit('set-active-block', $event)"
        >
          <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
            <slot :name="name" v-bind="data"></slot>
          </template>
        </block-relative-preview>
      </template>

    </block-grid-layout>
  </template>
  </div>
</template>

<script lang="ts">
import PreviewBlock from 'e:/vue-draggable-responsive/src/infrastructure/components/PreviewBlock.vue'
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

// V2
import BlockRelativePreview from 'e:/vue-draggable-responsive/src/blockRelative/infrastructure/components/BlockRelativePreview.vue'
// eslint-disable-next-line no-unused-vars
import { InterfaceBlockV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/repository/RelativeBlock'
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
import { BlockV2Repository } from 'e:/vue-draggable-responsive/src/blockRelative/infrastructure/domain/repository/BlockV2Repository'
import BlockGridLayout from 'e:/vue-draggable-responsive/src/blockRelative/infrastructure/blockGrid/BlockGridLayout.vue'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
// export default {
  name: 'VueDraggableResponsivePreviewer',
  components: { PreviewBlock, BlockRelativePreview, BlockGridLayout },

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
    mainBlockSelector: String,
    blocksV2Props: {
      type: Object,
      default: () => ({
        isRelative: false,
        displayPosition: 'displayRelative',
        gridConfig: {
          columns: 3,
          rows: 2
        }
      })
    }
  },

  data (): { store: BlockRepositoryInterface, tabSettingsService: TabSettings, activeBlockGuid: string, storeV2: InterfaceBlockV2 } {
    return {
      store: new BlockRepository([], true),
      storeV2: new BlockV2Repository(),
      tabSettingsService: new TabSettings(this.tabSettings, this),
      activeBlockGuid: ''
    }
  },

  computed: {
    isBlocksV2 () {
      return this.blocksV2Props.isRelative
    },
    isRelativeV2 () {
      return this.blocksV2Props.displayPosition === 'displayRelative'
    },
    isSetka (): boolean {
      return !this.isRelativeV2 && this.isBlocksV2
    },
    _blocks (): BlockDTO[] {
      return this.store.get()
    },
    _blocksRelative (): BlockDTOV2[] {
      return this.getStoreV2().get()
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
      if (this.isBlocksV2) {
        this.setBlocksV2(blocks as unknown as BlockDTOV2[])
        return
      }
      this.store.set([])
      this.$nextTick(() => {
        this.store.set(blocks)
      })
    },
    removeBlock (guid: string): void {
      if (this.isBlocksV2) {
        this.removeBlockV2(guid)
        return
      }
      this.store.remove(guid)
    },
    getRefByGuid (guid: string): Vue | undefined {
      return this.store.getRefByGuid(guid)
    },
    getStoreV2 (): InterfaceBlockV2 {
      return this.storeV2
    },
    setBlocksV2 (blocks: BlockDTOV2[]): void {
      if (this.isSetka) {
        // @ts-ignore
        this.$refs.gridLayout.loadLayout(blocks)
      }
      this.storeV2.setBlocks(blocks)
    },
    removeBlockV2 (guid: string): void {
      this.storeV2.removeBlock(guid)
    },
    getByGuidV2 (guid: string): BlockDTOV2 | undefined {
      return this.storeV2.getByGuid(guid)
    }
  }
})
// }
</script>

<style scoped>
.container {
  position: relative;
}
</style>
