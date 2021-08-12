<template>
  <div class="container">
    <block
        v-for="block in _blocks"
        :key="block.guid"
        :block="block"
        :step="step"
        :ref="block.guid"
        @start-drag="$emit('start-drag', $event)"
        @stop-drag="$emit('stop-drag', $event)"
        @dragging="$emit('dragging', $event)"
        @contextmenu="$emit('contextmenu', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </block>
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

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>

export default Vue.extend({
  name: 'VueDraggableResponsiveDesigner',
  components: { Block },
  props: {
    step: {
      type: Number,
      default: 0.5
    },
    blocks: {
      type: Array as Vue.PropType<object[]>,
      default: () => []
    }
  },
  provide () {
    return {
      getStore: this.getStore
    }
  },
  data (): { blocksArray: object[], store: BlockRepositoryInterface } {
    return {
      store: new BlockRepository(),
      blocksArray: this.blocks
    }
  },
  methods: {
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
        if (item.children?.length > 0) {
          this.getRefs(item.children, block, object)
        }
      })
    },
    setActiveBlock (guid: string): void {
      this.store.setActiveBlock(guid)
    },
    clearActiveBlock (): void {
      this.store.resetActiveBlock()
    },
    getStore (): BlockRepositoryInterface {
      return this.store
    },
    getBlocks (): BlockDTO[] {
      return this.store.get()
    },
    setBlocks (blocks: BlockProperties[]): void {
      this.store.set(blocks)
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
        event = undefined,
        type = AddBlockType.DEFAULT,
        isStretched = false,
        tabs = undefined
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
          event?: MouseEvent,
          type: AddBlockType,
          isStretched: boolean,
          tabs?: TabProperties
        }
    ): string {
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
        tabs
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
      this.store.remove(guid)
    }
  },
  computed: {
    _blocks (): BlockDTO[] {
      return this.store.get()
    }
  }
})
</script>

<style scoped>
@import url('https://rsms.me/inter/inter.css');

.container {
  background-image: linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
  background-size: 1% 1%;
  position: relative;
}
</style>
