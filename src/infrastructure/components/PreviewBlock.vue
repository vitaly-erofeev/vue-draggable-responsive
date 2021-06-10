<template>
  <div
      :style="positionStyle"
      ref="draggableContainer"
      class="block"
  >
    <slot :block="block" name="content"></slot>
    <preview-block
        v-for="(_block, index) in block.children"
        :key="index"
        :block="_block"
        :ref="block.guid"
        :style="block.style"
    ></preview-block>
  </div>
</template>

<script lang="ts">
import { Sticky } from '@/domain/model/Sticky'
import BlockDTO from '../../domain/model/BlockDTO'
import Vue from 'vue'

export default Vue.extend({
  name: 'PreviewBlock',
  props: {
    block: {
      type: BlockDTO
    }
  },
  computed: {
    positionStyle (): object {
      let position = {}
      switch (this.block.sticky) {
        case Sticky.TL:
          position = {
            top: this.block.top + this.block.sizeTypes.top,
            left: this.block.left + this.block.sizeTypes.left
          }
          break
        case Sticky.TR:
          position = {
            top: this.block.top + this.block.sizeTypes.top,
            right: this.block.right + this.block.sizeTypes.right
          }
          break
        case Sticky.BL:
          position = {
            bottom: this.block.bottom + this.block.sizeTypes.bottom,
            left: this.block.left + this.block.sizeTypes.left
          }
          break
        case Sticky.BR:
          position = {
            bottom: this.block.bottom + this.block.sizeTypes.bottom,
            right: this.block.right + this.block.sizeTypes.right
          }
          break
        default:
          position = {
            top: this.block.top + this.block.sizeTypes.top,
            left: this.block.left + this.block.sizeTypes.left
          }
          break
      }
      return Object.assign(position, {
        width: this.block.width + this.block.sizeTypes.width,
        height: this.block.height + this.block.sizeTypes.height
      })
    }
  }
})
</script>

<style scoped>
.block {
  position: absolute;
}
</style>
