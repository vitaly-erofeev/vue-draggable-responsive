<template>
  <div
      :style="positionStyle"
      :class="{
        'block': true,
        'highlight' : isResizing || isDragging,
        'active': block.isActive,
        'active_parent': block.isActiveAsParent }"
      ref="draggableContainer"
      @mousedown.stop="dragStart"
      @contextmenu.stop="$emit('contextmenu', {block: block, event: $event})"
  >
    <div
        v-if="isTabsContainer"
        :class="{
          'tabs_container' : true,
          'position_top': block.tabs.position === 'top',
          'position_right': block.tabs.position === 'right',
          'position_bottom': block.tabs.position === 'bottom',
          'position_left': block.tabs.position === 'left',
        }"
        :style="block.tabs.containerStyle"
    >
      <div
          v-for="tab in block.tabs.list"
          :key="tab.guid"
          :style="`${block.tabs.tabStyle};${tab.guid === activeTabGuid ? block.tabs.activeTabStyle :''}`"
          :class="{'tab': true, 'active': tab.guid === activeTabGuid, [block.tabs.class]: true}"
          @click="onTabClick(tab.guid)"
      >
        <span class="label">{{ tab.name }}</span>
      </div>
    </div>
    <div class="block_info">
      <slot :block="block" name="help_text"></slot>
    </div>
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
      <slot :block="block" v-if="!isTabsContainer" name="content"></slot>
      <block
          v-for="_block in block.children"
          v-show="!(block.tabs || {}).use || _block.parentTabGuid === activeTabGuid"
          :key="_block.guid"
          :block="_block"
          :step="step"
          :ref="_block.guid"
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
import { StickyToType } from '@/domain/model/StickyTo'

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
    parentElement?: Element,
    ctrlPressed: boolean,
    activeTabGuid?: string
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
      parentElement: undefined,
      ctrlPressed: false,
      activeTabGuid: undefined
    }
  },
  watch: {
    activeTabGuid (guid) {
      this.getStore().setActiveTab(this.block.guid, guid)
    },
    'block.tabs.list': {
      handler () {
        if (!this.block.tabs?.list.find(item => item.guid === this.activeTabGuid)) {
          if (this.block.tabs?.list[0]?.guid) {
            this.onTabClick(this.block.tabs.list[0].guid)
          }
        }
      }
    }
  },
  computed: {
    zIndex (): number {
      const startIndex = 101
      if (!this.block.parentGuid) {
        return startIndex + (this.block.tabs?.use ? 1 : 0)
      }
      let parentRef = this.getStore().getRefByGuid(this.block.parentGuid) as unknown as {
        zIndex: number
      }
      if (!parentRef) {
        return startIndex
      }

      return parentRef.zIndex + 1 + (this.block.tabs?.use ? 1 : 0)
    },
    isTabsContainer (): boolean {
      return this.block.tabs?.use || false
    },
    positionStyle (): object {
      let position: {
        top?: string, left?: string, right?: string, bottom?: string
      } = {}
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
      if (this.block.stickyTo?.guid && this.block.stickyTo?.type) {
        const stickyToBlock = this.getStore().getByGuid(this.block.stickyTo.guid)
        const stickyToElement = this.getStore().getRefByGuid(this.block.stickyTo.guid) as unknown as {
          positionStyle: {
            top: string, height: string, left: string, width: string
          }
        }
        if (stickyToBlock && stickyToBlock.parentGuid === this.block.parentGuid && stickyToElement) {
          switch (this.block.stickyTo.type) {
            case StickyToType.TOP:
              position.top =
                  `calc(${stickyToElement.positionStyle.height} + ${stickyToElement.positionStyle.top} + ${position.top})`
              break
            case StickyToType.LEFT:
              position.left =
                  `calc(${stickyToElement.positionStyle.width} + ${stickyToElement.positionStyle.left} + ${position.left})`
              break
          }
        }
      }
      let width = this.block.width + this.block.sizeTypes.width
      let height = this.block.height + this.block.sizeTypes.height

      if (this.block.widthCalc && this.block.widthCalc.type && this.block.widthCalc.value) {
        width = `calc(${width} ${this.block.widthCalc.type} ${this.block.widthCalc.value}px)`
      }
      if (this.block.heightCalc && this.block.heightCalc.type && this.block.heightCalc.value) {
        height = `calc(${height} ${this.block.heightCalc.type} ${this.block.heightCalc.value}px)`
      }

      return Object.assign(position, {
        width: width,
        height: height,
        zIndex: this.zIndex
      })
    }
  },
  mounted () {
    if (this.block?.tabs?.use && this.block?.tabs?.list?.length > 0) {
      this.activeTabGuid = this.block.tabs.list[0].guid
    }
    this.getStore().addRef(this.block.guid, this)
  },
  beforeDestroy () {
    this.getStore().removeRef(this.block.guid)
  },
  methods: {
    onTabClick (guid: string) {
      this.activeTabGuid = guid
    },
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
      if (this.block.isEditing) {
        return
      }
      event.preventDefault()
      this.$emit('start-drag', this.block)
      this.getBlockManager().startDrag(event, 'drag', isInteractive)
      this.isDragging = true
      document.addEventListener('mousemove', this.elementDrag)
      document.addEventListener('mouseup', this.dragStop)
      document.addEventListener('keydown', this.keyDown)
      document.addEventListener('keyup', this.keyUp)
    },
    elementDrag (event: MouseEvent): void {
      event.preventDefault()
      this.$emit('dragging', this.block)
      /* if (this.ctrlPressed) {
        if (this.block.parentGuid) {
          this.getBlockManager().changeParent()
        }
      } */
      this.getBlockManager().change(event)
      if (this.isDragging) {
        this.$nextTick(() => {
          this.onDrag()
        })
      }
    },
    keyDown (event: KeyboardEvent) {
      if (event.ctrlKey) {
        this.ctrlPressed = true
      }
    },
    keyUp (event: KeyboardEvent) {
      if (event.key === 'Control') {
        this.ctrlPressed = false
      }
    },
    dragStop (): void {
      this.$emit('stop-drag', this.block)
      this.isResizing = false
      this.isDragging = false
      this.ctrlPressed = false
      document.removeEventListener('mousemove', this.elementDrag)
      document.removeEventListener('mouseup', this.dragStop)
      document.removeEventListener('keydown', this.keyDown)
      document.removeEventListener('keyup', this.keyUp)
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
  z-index: 9999;
}

.block .block_info:empty {
  display: none;
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

.block.active {
  outline: 3px solid #539FFF;
}

.block.active_parent {
  outline: 3px solid green;
}

.block .tabs_container {
  position: absolute;
  display: flex;
}

.block .tabs_container.position_top {
  bottom: 100%;
}

.block .tabs_container.position_right {
  left: 100%;
  flex-direction: column;
}

.block .tabs_container.position_bottom {
  top: 100%;
}

.block .tabs_container.position_left {
  right: 100%;
  flex-direction: column;
}
</style>
