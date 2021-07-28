<template>
  <div
      :style="positionStyle"
      ref="draggableContainer"
      class="block"
  >
    <div class="content" :style="block.style" ref="container">
      <slot :block="block" name="content"></slot>
      <preview-block
          v-for="_block in block.children"
          :key="_block.guid"
          :block="_block"
          :ref="block.guid"
          :style="block.style"
      ></preview-block>
    </div>
  </div>
</template>

<script lang="ts">
import { Sticky } from '@/domain/model/Sticky'
import BlockDTO from '../../domain/model/BlockDTO'
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import { SizeTypes } from '@/domain/model/SizeTypes'
import BlockManager from '@/application/service/BlockManager'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'
const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
  name: 'PreviewBlock',
  props: {
    block: {
      type: BlockDTO
    }
  },
  inject: ['getStore'],
  computed: {
    positionStyle (): object {
      let position = {}
      let top: string
      let left: string
      let height: string = this.block.height + this.block.sizeTypes.height
      let width: string = this.block.width + this.block.sizeTypes.width
      switch (this.block.sticky) {
        case Sticky.TL:
          top = this.block.top + this.block.sizeTypes.top
          left = this.block.left + this.block.sizeTypes.left
          if (this.block.parentGuid) {
            if (typeof this.parentBlock !== 'undefined') {
              if (this.parentBlock.isStretched) {
                const parentSizes = BlockManager.getAbsoluteSizesByParent(this.parentBlock, this.parentElement as Element)
                if (this.block.sizeTypes.top === SizeTypes.PERCENT) {
                  top = `${parentSizes.height / 100 * (this.block.top || 0)}px`
                  height = `${parentSizes.height / 100 * this.block.height}px`
                }
                if (this.block.sizeTypes.left === SizeTypes.PERCENT) {
                  left = `${parentSizes.width / 100 * (this.block.left || 0)}px`
                  width = `${parentSizes.width / 100 * this.block.width}px`
                }
              }
            }
          }
          position = {
            top: top,
            left: left
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
      if (this.block.isStretched) {
        position = Object.assign(position, {
          minWidth: this.block.width + this.block.sizeTypes.width,
          minHeight: this.block.height + this.block.sizeTypes.height,
          height: this.scrollHeight + 'px',
          width: this.scrollWidth + 'px'
        })
      } else {
        position = Object.assign(position, {
          width: width,
          height: height
        })
      }
      return position
    }
  },
  mounted () {
    this.setParent()
    this.scrollHeight = this.$el.getElementsByClassName('content')[0].scrollHeight
    this.scrollWidth = this.$el.getElementsByClassName('content')[0].scrollWidth
  },
  data (): {
      parentBlock?: BlockDTO,
      parentElement?: Element,
      scrollHeight?: number,
      scrollWidth?: number
      } {
    return {
      parentBlock: undefined,
      parentElement: undefined,
      scrollHeight: undefined,
      scrollWidth: undefined
    }
  },
  methods: {
    setParent (): void {
      this.parentBlock = this.block.parentGuid ? this.getStore().getByGuid(this.block.parentGuid) : undefined
      this.parentElement = this.block.parentGuid ? this.$parent.$refs.draggableContainer as Element : undefined
    }
  }
})
</script>

<style scoped>
.block {
  position: absolute;
}
.block .content {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: auto;
}
</style>
