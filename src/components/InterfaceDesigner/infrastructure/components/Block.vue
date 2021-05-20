<template>
  <div
      :style="positionStyle"
      :class="{ 'block': true, 'highlight' : isResizing || isDragging }"
      ref="draggableContainer"
      @mousedown.stop="dragStart"
  >
    <slot :block="block" :is-resizing="isResizing" :is-dragging="isDragging">
      <div class="block_info" v-show="isResizing">
        {{block.width}}{{block.types.width}} x {{block.height}}{{block.types.height}}
      </div>
    </slot>
      <div
          v-show="isDragging"
          class="position_line left"
           :style="`left: calc(-${currentPosition.left}px - 1px);width:calc(${currentPosition.left}px - 1px)`"
      >
        <span>{{block.left}}{{block.types.left}}</span>
      </div>
      <div
          v-show="isDragging"
          class="position_line top"
          :style="`top: -${currentPosition.top}px;height:${currentPosition.top}px`"
      >
        <span>{{block.top}}{{block.types.top}}</span>
      </div>
    <block
        v-for="(_block, index) in block.children"
        :key="index"
        :block="_block"
        :step="step"
        @start-drag="$emit('start-drag', $event)"
        @stop-drag="$emit('stop-drag', $event)"
        @dragging="$emit('dragging', $event)"
    ></block>
    <font-awesome-icon
        icon="angle-down"
        class="resize-handler"
        @mousedown.stop="resizeStart"
    ></font-awesome-icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import BlockDTO from '../../domain/model/BlockDTO.ts'
import BlockManager from '@/components/InterfaceDesigner/application/service/BlockManager.ts'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import BlockRepository from '@/components/InterfaceDesigner/infrastructure/domain/repository/BlockRepository.ts'

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
  data (): {
    blockManager: undefined | BlockManager,
    isResizing: boolean,
    isDragging: boolean,
    currentPosition: {
      left: number,
      top:number,
      right: number,
      bottom: number
    }
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
      }
    }
  },
  computed: {
    positionStyle (): object {
      let position = {}
      switch (this.block.sticky) {
        case 'tl':
          position = {
            top: this.block.top + this.block.types.top,
            left: this.block.left + this.block.types.left
          }
          break
        case 'tr':
          position = {
            top: this.block.top + this.block.types.top,
            right: this.block.right + this.block.types.right
          }
          break
        case 'bl':
          position = {
            bottom: this.block.bottom + this.block.types.bottom,
            left: this.block.left + this.block.types.left
          }
          break
        case 'br':
          position = {
            bottom: this.block.bottom + this.block.types.bottom,
            right: this.block.right + this.block.types.right
          }
          break
        default:
          position = {
            top: this.block.top + this.block.types.top,
            left: this.block.left + this.block.types.left
          }
          break
      }
      return Object.assign(position, {
        width: this.block.width + this.block.types.width,
        height: this.block.height + this.block.types.height
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
          new BlockRepository(this.$store),
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
    dragStart (event: MouseEvent): void {
      event.preventDefault()
      this.$emit('start-drag', this.block)
      this.getBlockManager().startDrag(event, 'drag')
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
</style>
