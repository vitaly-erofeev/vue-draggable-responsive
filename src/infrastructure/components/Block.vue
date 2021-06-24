<template>
  <div
      :style="positionStyle"
      :class="{ 'block': true, 'highlight' : isResizing || isDragging }"
      ref="draggableContainer"
      @mousedown.stop="dragStart"
  >
    <slot :block="block" :is-resizing="isResizing" :is-dragging="isDragging" name="info">
      <div class="block_info" v-show="isResizing">
        {{ block.width }}{{ block.sizeTypes.width }} x {{ block.height }}{{ block.sizeTypes.height }}
      </div>
      <div
          v-show="isDragging"
          class="position_line left"
          :style="`left: calc(-${currentPosition.left}px - 1px);width:calc(${currentPosition.left}px - 1px)`"
      >
        <span>{{ block.left }}{{ block.sizeTypes.left }}</span>
      </div>
      <div
          v-show="isDragging"
          class="position_line top"
          :style="`top: -${currentPosition.top}px;height:${currentPosition.top}px`"
      >
        <span>{{ block.top }}{{ block.sizeTypes.top }}</span>
      </div>
    </slot>
    <div class="content" :style="block.style">
      <slot :block="block" name="content"></slot>
      <block
          v-for="(_block, index) in block.children"
          :key="index"
          :block="_block"
          :step="step"
          :ref="block.guid"
          @start-drag="$emit('start-drag', $event)"
          @stop-drag="$emit('stop-drag', $event)"
          @dragging="$emit('dragging', $event)"
      ></block>
    </div>
    <font-awesome-icon
        icon="angle-down"
        class="resize-handler"
        @mousedown.stop="resizeStart"
    ></font-awesome-icon>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import BlockDTO from '../../domain/model/BlockDTO'
import BlockManager from '@/application/service/BlockManager'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { Sticky } from '@/domain/model/Sticky'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
library.add(faAngleDown)

export default Vue.extend({
  name: 'block',
  components: {
    FontAwesomeIcon
  },
  props: {
    block: {
      type: BlockDTO
    },
    step: {
      type: Number
    }
  },
  inject: ['getStore'],
  data (): {
    blockManager: undefined | BlockManager,
    isResizing: boolean,
    isDragging: boolean,
    currentPosition: {
      left: number,
      top: number,
      right: number,
      bottom: number
    },
    parentBlock?: BlockDTO,
    parentElement?: Element
    } {
    return {
      blockManager: undefined,
      isResizing: false,
      isDragging: false,
      currentPosition: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      parentBlock: undefined,
      parentElement: undefined
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
  },
  methods: {
    onDrag (): void {
      const el: HTMLElement = this.$refs.draggableContainer as HTMLElement
      this.currentPosition.left = el.offsetLeft
      this.currentPosition.top = el.offsetTop
    },
    getBlockManager (): BlockManager {
      if (typeof this.blockManager === 'undefined') {
        this.blockManager = new BlockManager(
          this.block,
          this.getStore(),
            this.$refs.draggableContainer as Element,
            this.step
        )
      }
      return this.blockManager
    },
    resizeStart (event: MouseEvent): void {
      event.preventDefault()
      this.$emit('start-drag', this.block)
      this.getBlockManager().startDrag(event, 'resize')
      this.isResizing = true
      document.addEventListener('mousemove', this.elementDrag)
      document.addEventListener('mouseup', this.dragStop)
    },
    dragStart (event: MouseEvent, isInteractive: boolean = false): void {
      event.preventDefault()
      this.$emit('start-drag', this.block)
      this.getBlockManager().startDrag(event, 'drag', isInteractive)
      this.isDragging = true
      document.addEventListener('mousemove', this.elementDrag)
      document.addEventListener('mouseup', this.dragStop)
    },
    elementDrag (event: MouseEvent): void {
      event.preventDefault()
      this.$emit('dragging', this.block)
      this.getBlockManager().change(event)
      if (this.isDragging) {
        this.$nextTick(() => {
          this.onDrag()
        })
      }
    },
    dragStop (): void {
      this.$emit('stop-drag', this.block)
      this.isResizing = false
      this.isDragging = false
      document.removeEventListener('mousemove', this.elementDrag)
      document.removeEventListener('mouseup', this.dragStop)
    }
  }
})
</script>

<style scoped>
.resize-handler {
  bottom: -3px;
  right: 0;
  position: absolute;
  transform: rotate(-45deg);
  cursor: se-resize;
  color: #539FFF;
  z-index: 999;
}

.resize-handler.tl {
  bottom: -3px;
  right: 0;
}

.resize-handler.tr {
  bottom: -3px;
  right: 0;
}

.resize-handler.bl {
  bottom: -3px;
  right: 0;
}

.resize-handler.br {
  bottom: -3px;
  right: 0;
}

.block {
  outline: 1px dashed #539FFF;
  position: absolute;
}

.block.highlight {
  outline: 1px solid #539FFF;
  cursor: pointer;
}

.block .block_info {
  font-size: 12px;
  font-family: "Inter";
  background: #539FFF;
  display: inline-block;
  position: absolute;
  right: 3px;
  top: 3px;
  border-radius: 3px;
  padding: 3px;
  color: white;
  font-weight: 400;
}

.block .position_line {
  position: absolute;
  background: red;
  font-size: 12px;
  font-family: "Inter";
  font-weight: 400;
}

.block .position_line.left {
  top: calc(50% - 1px);
  height: 1px;
}

.block .position_line span {
  background: #539FFF;
  border-radius: 3px;
  padding: 3px;
  color: white;
  display: inline-block;
  position: absolute;
}

.block .position_line.left span {
  right: 3px;
  top: 3px;
}

.block .position_line.top span {
  bottom: 3px;
  left: 3px;
}

.block .position_line.top {
  left: calc(50% - 1px);
  width: 1px;
}

.block .content {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: auto;
}
</style>
