<template>
  <div class="container">
    <block
        v-for="(block, index) in _blocks"
        :key="index"
        :block="block"
        :step="step"
        :ref="block.guid"
        @start-drag="$emit('start-drag', $event)"
        @stop-drag="$emit('stop-drag', $event)"
        @dragging="$emit('dragging', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </block>
  </div>
</template>

<script lang="ts">
import Block from '@/components/VueDraggableResponsive/infrastructure/components/Block.vue'
import Vue from 'vue'
import { Sticky } from '@/components/VueDraggableResponsive/domain/model/Sticky'
import { ADD_BLOCK } from '@/components/VueDraggableResponsive/infrastructure/store/action-types'
import store from '@/components/VueDraggableResponsive/infrastructure/store'
// eslint-disable-next-line no-unused-vars
import { Store } from 'vuex'
// eslint-disable-next-line no-unused-vars
import { InterfaceState } from '@/components/VueDraggableResponsive/infrastructure/store/state'
import { SizeTypes } from '@/components/VueDraggableResponsive/domain/model/SizeTypes'

export default Vue.extend({
  name: 'VueDraggableResponsive',
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
  data (): { blocksArray: object[], store: Store<InterfaceState> } {
    return {
      store: store,
      blocksArray: this.blocks
    }
  },
  methods: {
    getBlocks (): [] {
      return this.store.getters.blocksAsList
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
    async interactiveAddBlock ({
      width = 0,
      height = 0,
      sticky = Sticky.TL,
      stickyToGuid = null,
      parentGuid = null,
      sizeTypes = {
        width: SizeTypes.PERCENT,
        height: SizeTypes.PERCENT,
        top: SizeTypes.PERCENT,
        right: SizeTypes.PERCENT,
        bottom: SizeTypes.PERCENT,
        left: SizeTypes.PERCENT
      },
      event
    }: {
      width: number,
      height: number,
      sticky: Sticky,
      stickyToGuid: string | null,
      parentGuid: string | null,
      sizeTypes: {
        width: SizeTypes,
        height: SizeTypes,
        top: SizeTypes,
        right: SizeTypes,
        bottom: SizeTypes,
        left: SizeTypes
      },
      event: MouseEvent
    }): Promise<string> {
      const {
        top,
        right,
        bottom,
        left
      } = this.getMousePosition(event, sizeTypes)
      const guid = await this.addBlock({
        width,
        height,
        top,
        right,
        bottom,
        sizeTypes,
        left,
        sticky,
        stickyToGuid,
        parentGuid
      })
      const refs: any = this.$refs
      const block: any = refs[guid][0]
      block.onDrag()
      block.dragStart(event, true)
      return guid
    },
    async addBlock (
      {
        width = 0,
        height = 0,
        top = 0,
        right = 0,
        bottom = 0,
        left = 0,
        sticky = Sticky.TL,
        stickyToGuid = null,
        parentGuid = null,
        sizeTypes = {
          width: SizeTypes.PERCENT,
          height: SizeTypes.PERCENT,
          top: SizeTypes.PERCENT,
          right: SizeTypes.PERCENT,
          bottom: SizeTypes.PERCENT,
          left: SizeTypes.PERCENT
        }
      }: {
          width: number,
          height: number,
          sticky: Sticky,
          stickyToGuid: string | null,
          parentGuid: string | null,
          top: number,
          right: number,
          bottom: number,
          left: number,
          sizeTypes?: {
            width: SizeTypes,
            height: SizeTypes,
            top: SizeTypes,
            right: SizeTypes,
            bottom: SizeTypes,
            left: SizeTypes
          }
        }
    ): Promise<string> {
      const guid = await this.store.dispatch(ADD_BLOCK, {
        width,
        height,
        top,
        right,
        bottom,
        left,
        sticky,
        stickyToGuid,
        parentGuid,
        sizeTypes
      })
      return guid
    }
  },
  computed: {
    _blocks (): [] {
      return this.store.getters.blocks
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
