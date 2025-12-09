<template>
  <div class="container">
    <svg id="svg" v-if="!isBlocksV2">
      <line class="line" v-for="(line, index) in stickyLines"
            :key="index"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
      />
    </svg>
  <template  v-if="!isBlocksV2">
    <block
      v-for="block in _blocks"
      :ref="block.guid"
      :key="block.guid"
      :block="block"
      :step="step"
      :show-hidden="showHidden"
      :tab-settings-service="tabSettingsService"
      @start-drag="$emit('start-drag', $event)"
      @stop-drag="$emit('stop-drag', $event)"
      @dragging="$emit('dragging', $event)"
      @contextmenu="$emit('contextmenu', $event)"
      @click="$emit('click', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </block>
  </template>
<!-- _blocksRelative -->
<!-- <code>{{_blocksRelative}}</code> -->
<!-- <code>{{_blocks}}</code> -->
  <template v-if="!isSetka">
    <block-relative
     v-for="block in _blocksRelative"
      :ref="block.guid"
      :key="block.guid"
      :block="block"
      :show-hidden="showHidden"
       @set-active-block="$emit('set-active-block', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </block-relative>
  </template>

  <template v-if="isSetka">
    <block-grid-layout
      ref="gridLayout"
      :is-designer="true"
      :store-v2="storeV2"
      :grid-config="blocksV2Props.gridConfig"
     @set-active-block="$emit('set-active-block', $event)"
     >
      <template v-slot:content="{ blocks }">
          <block-relative
          v-for="block in blocks"
            :ref="block.guid"
            :key="block.guid"
            :block="block"
            :show-hidden="showHidden"
            @set-active-block="$emit('set-active-block', $event)"
          >
            <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
              <slot :name="name" v-bind="data"></slot>
            </template>
          </block-relative>
      </template>

    </block-grid-layout>
  </template>

  </div>
</template>

<script lang="ts">
import Block from '@/infrastructure/components/Block.vue'
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import { Sticky } from '@/domain/model/Sticky'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { AddBlockType } from '@/domain/model/AddBlockType'
// eslint-disable-next-line no-unused-vars
import { BlockRepositoryInterface } from '@/domain/repository/BlockRepositoryInterface'
import BlockRepository from '@/infrastructure/domain/repository/BlockRepository'
// eslint-disable-next-line no-unused-vars
import BlockDTO from '@/domain/model/BlockDTO'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'
// eslint-disable-next-line no-unused-vars
import { BlockProperties } from '@/domain/model/BlockProperties'
// eslint-disable-next-line no-unused-vars
import { TabProperties } from '@/domain/model/TabProperties'
// eslint-disable-next-line no-unused-vars
import { StickyTo } from '@/domain/model/StickyTo'
// eslint-disable-next-line no-unused-vars
import { ReplicationProperties } from '@/domain/model/ReplicationProperties'
// eslint-disable-next-line no-unused-vars
import { MinMax } from '@/domain/model/MinMax'
// eslint-disable-next-line no-unused-vars
import { OnCenter } from '@/domain/model/OnCenter'
import SimpleRemoveListener from '@/infrastructure/service/listeners/SimpleRemoveListener'

import TabSettings from '@/application/service/TabSettings'

// V2
import BlockRelative from 'e:/vue-draggable-responsive/src/blockRelative/infrastructure/components/BlockRelative.vue'
import BlockGridLayout from 'e:/vue-draggable-responsive/src/blockRelative/infrastructure/blockGrid/BlockGridLayout.vue'
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2, ParametersBlock } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
// eslint-disable-next-line no-unused-vars
import { InterfaceBlockV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/repository/RelativeBlock'
import { BlockV2Repository } from 'e:/vue-draggable-responsive/src/blockRelative/infrastructure/domain/repository/BlockV2Repository'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>

export default Vue.extend({
// export default {
  name: 'VueDraggableResponsiveDesigner',
  components: { Block, BlockRelative, BlockGridLayout },

  provide () {
    return {
      // @ts-ignore
      getStore: this.getStore
    }
  },

  props: {
    step: {
      type: Number,
      default: 0.5
    },
    blocks: {
      type: Array as Vue.PropType<object[]>,
      default: () => []
    },
    showHidden: {
      type: Boolean,
      default: false
    },
    tabSettings: {
      type: Object
    },
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

  data (): { blocksArray: object[], store: BlockRepositoryInterface, tabSettingsService: TabSettings, storeV2: InterfaceBlockV2 } {
    return {
      store: new BlockRepository(),
      storeV2: new BlockV2Repository(),
      blocksArray: this.blocks,
      tabSettingsService: new TabSettings(this.tabSettings, this)
    }
  },

  computed: {
    isBlocksV2 ():boolean {
      return this.blocksV2Props.isRelative
    },
    isRelativeV2 () {
      return this.blocksV2Props.displayPosition === 'displayRelative'
    },
    isSetka (): boolean {
      return !this.isRelativeV2 && this.isBlocksV2
    },
    _blocks (): BlockDTO[] {
      return this.getStore().get()
    },
    _blocksRelative (): BlockDTOV2[] {
      return this.getStoreV2().get()
    },
    stickyLines () {
      // @ts-ignore
      return this.getStore().getStickyLines()
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
    this.store.addListener(new SimpleRemoveListener(this.onBlockRemove))
  },

  methods: {
    onBlockRemove (event: {guid: string}) {
      this.$emit('block-remove', event.guid)
    },
    getAllBlockRefs (): { [index: string]: Vue; } {
      let answer: { [index: string]: Vue; } = {}

      this.getRefs(this._blocks, this, answer)
      return answer
    },
    getRefs (blocks: BlockDTO[], context: Vue, object: { [index: string]: Vue; }): void {
      blocks.forEach((item: BlockDTO) => {
        const refs: any = context.$refs[item.guid]
        const block: Vue = refs[0]
        object[item.guid] = block
        if (item.children?.length > 0 && block) {
          this.getRefs(item.children, block, object)
        }
      })
    },
    setActiveBlock (guid: string): void {
      if (this.isBlocksV2) {
        this.setActiveBlockV2(guid)
        return
      }
      this.store.setActiveBlock(guid)
    },
    clearActiveBlock (): void {
      if (this.isBlocksV2) {
        this.clearActiveBlockV2()
        return
      }
      this.store.resetActiveBlock()
    },
    getStore (): BlockRepositoryInterface {
      return this.store
    },
    getBlocks (): BlockDTO[] | BlockDTOV2[] {
      if (this.isBlocksV2) {
        return this.storeV2.get()
      }
      return this.store.get()
    },
    getMainParents (guid: string): BlockDTO | {} {
      return this.store.getMainParents(guid)
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
    getMousePosition (event: MouseEvent, sizeTypes: {
      width: SizeTypes,
      height: SizeTypes,
      top: SizeTypes,
      right: SizeTypes,
      bottom: SizeTypes,
      left: SizeTypes
    }): { top: number, right: number, bottom: number, left: number } {
      const elPosition = this.$el.getBoundingClientRect()
      const top = sizeTypes.top === SizeTypes.PIXEL ? event.clientY - elPosition.top : (event.clientY - elPosition.top) / (elPosition.height / 100) - 2
      const left = sizeTypes.left === SizeTypes.PIXEL ? event.clientX - elPosition.left : (event.clientX - elPosition.left) / (elPosition.width / 100) - 2
      const right = sizeTypes.left === SizeTypes.PIXEL ? elPosition.width - event.clientX + elPosition.left : 100 - (event.clientX / (elPosition.width / 100) + 2)
      const bottom = sizeTypes.top === SizeTypes.PIXEL ? elPosition.height - event.clientY + elPosition.top : 100 - (event.clientY / (elPosition.height / 100) + 2)

      return {
        top: Math.floor(top),
        right: Math.floor(right),
        bottom: Math.floor(bottom),
        left: Math.floor(left)
      }
    },
    addBlock (
      {
        width = 0,
        height = 0,
        top = undefined,
        right = undefined,
        bottom = undefined,
        left = undefined,
        sticky = Sticky.TL,
        stickyTo = undefined,
        parentGuid = undefined,
        sizeTypes = {
          width: SizeTypes.PERCENT,
          height: SizeTypes.PERCENT,
          top: SizeTypes.PERCENT,
          right: SizeTypes.PERCENT,
          bottom: SizeTypes.PERCENT,
          left: SizeTypes.PERCENT
        },
        className = undefined,
        event = undefined,
        type = AddBlockType.DEFAULT,
        isStretched = false,
        tabs = undefined,
        replication = undefined,
        pagination = undefined,
        minMax = undefined,
        onCenter = undefined,
        alias = undefined,
        isComponent = false
      }: {
          width: number,
          height: number,
          sticky: Sticky,
          stickyTo?: StickyTo,
          parentGuid?: string,
          top?: number,
          right?: number,
          bottom?: number,
          left?: number,
          sizeTypes?: {
            width: SizeTypes,
            height: SizeTypes,
            top: SizeTypes,
            right: SizeTypes,
            bottom: SizeTypes,
            left: SizeTypes
          },
          className?: string,
          event?: MouseEvent,
          type: AddBlockType,
          isStretched: boolean,
          tabs?: TabProperties,
          replication?: ReplicationProperties,
          pagination?: {
            replicationGuid: string,
            total: number,
            limit: number
          }
          minMax?: MinMax,
          onCenter?: OnCenter,
          alias?: string
          isComponent?: boolean
        }
    ): string {
      if (this.isBlocksV2) {
        return this.addBlockV2({
          width: isComponent ? 200 : 300,
          height: isComponent ? 100 : 300,
          parentGuid: parentGuid || '',
          alias: alias || '',
          isComponent
        })
      }
      if (type === AddBlockType.INTERACTIVE && typeof event !== 'undefined') {
        const position: { top: number, right: number, bottom: number, left: number } = this.getMousePosition(event, sizeTypes)
        top = position.top
        right = position.right
        bottom = position.bottom
        left = position.left
      }

      const guid = this.store.add({
        width,
        height,
        top,
        right,
        bottom,
        left,
        sticky,
        stickyTo,
        parentGuid,
        sizeTypes,
        isStretched,
        tabs,
        className,
        replication,
        pagination,
        minMax,
        onCenter,
        alias
      })
      if (type === AddBlockType.INTERACTIVE && typeof event !== 'undefined') {
        this.$nextTick(() => {
          const block: any = this.getAllBlockRefs()[guid]
          block.onDrag()
          block.dragStart(event, true)
        })
      }
      return guid
    },
    removeBlock (guid: string): void {
      if (this.isBlocksV2) {
        this.removeBlockV2(guid)
        return
      }
      this.store.remove(guid)
    },
    getBlockStoreV1 (): BlockDTOV2[] {
      return this.store.get() as unknown as BlockDTOV2[]
    },
    getStoreV2 (): InterfaceBlockV2 {
      return this.storeV2
    },
    getBlocksV2 (): BlockDTOV2[] {
      return this.storeV2.get()
    },
    addBlockV2 (parametersBlock: ParametersBlock): string {
      const createBlock = this.storeV2.createBlock(parametersBlock)
      if (this.isSetka) {
        // @ts-ignore
        const selectedContainer: BlockDTOV2 | null = this.$refs.gridLayout.getSelectionContainer()
        if (selectedContainer) {
          return this.storeV2.addBlock(createBlock)
        }
        return ''
      }
      return this.storeV2.addBlock(createBlock)
    },
    setActiveBlockV2 (guid: string): void {
      this.storeV2.setActiveBlock(guid)
    },
    clearActiveBlockV2 (): void {
      this.storeV2.resetActiveBlock()
      if (this.isSetka) {
        // @ts-ignore
        this.$refs.gridLayout.clearActiveContainer()
      }
    },
    setBlocksV2 (blocks: BlockDTOV2[]): void {
      if (this.isSetka) {
        // @ts-ignore
        this.$refs.gridLayout.loadLayout(blocks)
      }
      this.storeV2.setBlocks(blocks)
    },
    removeBlockV2 (guid: string): void {
      if (this.isSetka) {
        // @ts-ignore
        this.$refs.gridLayout.removeContainer(guid)
      }
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
  background-image: linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
  background-size: 1% 1%;
  position: relative;
  overflow: scroll;
}

/* Works on Firefox */
.container {
  scrollbar-width: thin;
  scrollbar-color: #539FFF transparent;
}

/* Works on Chrome, Edge, and Safari */
.container::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.container::-webkit-scrollbar-track {
  background: transparent;
}

.container::-webkit-scrollbar-thumb {
  background-color: #539FFF;
  border-radius: 5px;
}

#svg{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.line{
  stroke-width:1px;
  stroke: #32B84D;
}
</style>
