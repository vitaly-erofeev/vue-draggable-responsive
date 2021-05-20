<template>
  <div class="container">
    <block
        v-for="(block, index) in _blocks"
        :key="index"
        :block="block"
        :step="step"
        @start-drag="$emit('start-drag', $event)"
        @stop-drag="$emit('stop-drag', $event)"
        @dragging="$emit('dragging', $event)"
    >
    </block>
  </div>
</template>

<script lang="ts">
import Block from '@/components/InterfaceDesigner/infrastructure/components/Block.vue'
import Vue from 'vue'
import { Sticky } from '@/components/InterfaceDesigner/domain/model/Sticky'
import { ADD_BLOCK } from '@/components/InterfaceDesigner/infrastructure/store/action-types'

export default Vue.extend({
  name: 'InterfaceDesigner',
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
  data (): { blocksArray: object[] } {
    return {
      blocksArray: this.blocks
    }
  },
  methods: {
    getBlocks (): [] {
      return this.$store.getters.blocksAsList
    },
    addBlock (
      {
        width = 0,
        height = 0,
        top = 0,
        right = 0,
        bottom = 0,
        left = 0,
        sticky = Sticky.TL,
        stickyToGuid = null,
        parentGuid = null
      }
    ): void {
      this.$store.dispatch(ADD_BLOCK, {
        width,
        height,
        top,
        right,
        bottom,
        left,
        sticky,
        stickyToGuid,
        parentGuid
      })
    }
  },
  computed: {
    _blocks (): [] {
      return this.$store.getters.blocksAsTree
    }
  }
})
</script>

<style scoped>
@import url('https://rsms.me/inter/inter.css');

.container {
  background-image: linear-gradient(rgba(128, 128, 128, 0.1)  1px, transparent 1px),
  linear-gradient(90deg, rgba(128, 128, 128, 0.1)  1px, transparent 1px);
  background-size: 1% 1%;
  position: relative;
}
</style>
