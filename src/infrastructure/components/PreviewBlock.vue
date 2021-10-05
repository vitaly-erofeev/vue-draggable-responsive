<template>
  <div
      :style="positionStyle"
      ref="draggableContainer"
      class="block"
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
      <font-awesome-icon
        v-show="isShowArrows"
        icon="chevron-left"
        class="tabs_button"
        @click="scrollPrevTab"
        :class="{ [block.tabs.tabArrowsClass]: true }"
      ></font-awesome-icon>
      <div class="tabs_onScroll" ref="tabsScroll" :class="{'tabs_padding': isShowArrows, 'direction': directionTabs }">
        <div
            v-for="tab in block.tabs.list"
            :key="tab.guid"
            :style="`${block.tabs.tabStyle};${tab.guid === activeTabGuid ? block.tabs.activeTabStyle :''}`"
            :class="{'tab': true, 'active': tab.guid === activeTabGuid, [block.tabs.class]: true}"
            @click="activeTabGuid = tab.guid"
        >
          <span class="label">{{ tab.name }}</span>
        </div>
      </div>
      <font-awesome-icon
        v-show="isShowArrows"
        icon="chevron-right"
        :class="{ [block.tabs.tabArrowsClass]: true }"
        class="tabs_button tabs_button_next"
        @click="scrollNextTab"
      ></font-awesome-icon>
    </div>
    <div
      ref="container"
      class="content"
      :style="blockContentStyle"
      @mouseover="block.isHover = true"
      @mouseleave="block.isHover = false"
      @click.stop="$emit('click', { block, event: $event.event || $event })"
    >
      <slot :block="block" v-if="!isTabsContainer" name="content"></slot>
      <preview-block
          v-for="_block in children"
          v-show="isShowChildren && _block.parentTabGuid === activeTabGuid && !_block.isHidden"
          :key="_block.guid"
          :block="_block"
          :ref="_block.guid"
          :replication-callback="replicationCallback"
          @click="$emit('click', { block: _block, event: $event.event || $event })"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data"></slot>
        </template>
      </preview-block>
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAngleDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'
import { StickyToType } from '@/domain/model/StickyTo'
import SimpleListener from '@/infrastructure/service/listeners/SimpleListener'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
library.add(faAngleDown, faChevronRight, faChevronLeft)
export default Vue.extend({
  name: 'PreviewBlock',
  components: {
    FontAwesomeIcon
  },
  props: {
    block: {
      type: BlockDTO
    },
    replicationCallback: Function
  },
  inject: ['getStore'],
  computed: {
    directionTabs (): boolean {
      return (this.block.tabs?.position === 'left' || this.block.tabs?.position === 'right')
    },
    // список потомков у контейнера
    children () {
      if (this.activeTabGuid) {
        return this.block.children.map(item => {
          if (item.parentTabGuid === this.activeTabGuid) {
            item['isLoadedTab'] = true
          }
          return item
        }).filter(item => item.isLoadedTab)
      } else {
        return this.block.children
      }
    },
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
        top?: string, left?: string, right?: string, bottom?: string, width?: string, height?: string
      } = {}
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
      if (this.block.isHidden) {
        if (this.block.stickyTo?.guid && this.block.stickyTo?.type) {
          if (this.block.stickyTo.type === StickyToType.TOP) {
            position.top = '0px'
          } else if (this.block.stickyTo.type === StickyToType.LEFT) {
            position.left = '0px'
          }
        }
      }
      if (this.block.replication?.topBlockGuid) {
        const stickyToElement = this.getStore().getRefByGuid(this.block.replication?.topBlockGuid) as unknown as {
          positionStyle: {
            top: string, height: string
          }
        }
        if (stickyToElement) {
          position.top =
              `calc(${stickyToElement.positionStyle.height} + ${stickyToElement.positionStyle.top} + ${position.top})`
        }
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

      if (this.block.widthCalc && this.block.widthCalc.type && this.block.widthCalc.value) {
        width = `calc(${width} ${this.block.widthCalc.type} ${this.block.widthCalc.value}px)`
      }
      if (this.block.heightCalc && this.block.heightCalc.type && this.block.heightCalc.value) {
        height = `calc(${height} ${this.block.heightCalc.type} ${this.block.heightCalc.value}px)`
      }

      if (this.block.isStretched) {
        position = Object.assign(position, {
          minWidth: width,
          minHeight: height,
          height: this.scrollHeight + 'px',
          width: this.scrollWidth + 'px'
        })
      } else {
        if (this.block.minMax?.minWidth && this.block.sizeTypes.width === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            minWidth: `${this.block.minMax.minWidth}px`
          })
        }
        if (this.block.minMax?.maxWidth && this.block.sizeTypes.width === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            maxWidth: `${this.block.minMax.maxWidth}px`
          })
        }
        if (this.block.minMax?.minHeight && this.block.sizeTypes.height === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            minHeight: `${this.block.minMax.minHeight}px`
          })
        }
        if (this.block.minMax?.maxHeight && this.block.sizeTypes.height === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            maxHeight: `${this.block.minMax.maxHeight}px`
          })
        }
        position = Object.assign(position, {
          width: width,
          height: height
        })
      }
      if (this.block.isHidden) {
        position.width = '0px'
        position.height = '0px'
      }
      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontal) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid) as unknown as {
          $el: HTMLElement
        }
        if (refBlock) {
          if (this.block.sticky === Sticky.BL || this.block.sticky === Sticky.TL) {
            position.left = `calc(50% - calc(${refBlock.$el.offsetWidth}px / 2))`
          } else {
            position.right = `calc(50% - calc(${refBlock.$el.offsetWidth}px / 2))`
          }
        }
      }

      if (!this.block.stickyTo?.guid && this.block.onCenter?.vertical) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid) as unknown as {
          $el: HTMLElement
        }
        if (refBlock) {
          if (this.block.sticky === Sticky.TR || this.block.sticky === Sticky.TL) {
            position.top = `calc(50% - calc(${refBlock.$el.offsetHeight}px / 2))`
          } else {
            position.bottom = `calc(50% - calc(${refBlock.$el.offsetHeight}px / 2))`
          }
        }
      }

      return Object.assign(position, {
        zIndex: this.zIndex
      })
    },
    blockContentStyle () {
      let style = ''

      const block = this.block

      if (block.style) {
        style += block.style
      }

      if (block.isHover) {
        if (block.interactive?.containerHoverStyle) {
          style += '; ' + block.interactive.containerHoverStyle
        }
      }

      return style
    },
    isShowChildren () {
      let isShow = true

      const block = this.block

      if (block.contentType === 'registry') {
        isShow = false
      }

      return isShow
    }
  },
  mounted () {
    this.setParent()
    this.$nextTick(() => {
      this.scrollHeight = this.$el.getElementsByClassName('content')[0].scrollHeight
      this.scrollWidth = this.$el.getElementsByClassName('content')[0].scrollWidth
      if (this.isTabsContainer) {
        this.setIsShowArrows()
      }
    })
    if (this.block?.tabs?.use && this.block?.tabs?.list?.length > 0) {
      this.activeTabGuid = this.block.tabs.list[0].guid
    }
    this.prepareReplication()
    this.getStore().addRef(this.block.guid, this)
  },
  beforeDestroy () {
    this.getStore().removeRef(this.block.guid)
  },
  watch: {
    activeTabGuid () {
      this.scrollHeight = 0
      this.scrollWidth = 0
      this.$nextTick(() => {
        this.scrollHeight = this.$el.getElementsByClassName('content')[0].scrollHeight
        this.scrollWidth = this.$el.getElementsByClassName('content')[0].scrollWidth
      })
    }
  },
  data (): {
    parentBlock?: BlockDTO,
    parentElement?: Element,
    scrollHeight?: number,
    scrollWidth?: number,
    activeTabGuid?: string,
    replicationIndex: number,
    tabsOffset: number,
    blockWidth: number,
    tabsWidth: number,
    isShowArrows: boolean
    } {
    return {
      parentBlock: undefined,
      parentElement: undefined,
      scrollHeight: undefined,
      scrollWidth: undefined,
      activeTabGuid: undefined,
      replicationIndex: 0,
      tabsOffset: 0,
      blockWidth: 0,
      tabsWidth: 0,
      isShowArrows: false
    }
  },
  methods: {
    onReplicateBlock (event: {}) {
      if (this.replicationCallback) {
        this.replicationCallback(Object.assign({}, event, {
          replicationBlockGuid: this.block.guid,
          replicationIndex: this.replicationIndex
        }))
      }
    },
    async prepareReplication (): Promise<void> {
      if (!this.block.replication?.function) {
        return
      }
      const blocksData: any[] = await this.block.replication?.function()
      if (blocksData.length === 0) {
        this.$nextTick(() => {
          this.getStore().remove(this.block.guid)
        })
        return
      }
      blocksData.shift()
      let me = this
      let lastGuid = me.block.guid
      let columns = me.block.replication?.columns || 1
      let rowGuids: { [index: string]: any; } = { 0: [me.block.guid] }
      let row = 0
      this.replicationIndex = 0
      const listenerGuid = this.getStore().addListener(new SimpleListener(this.onReplicateBlock))
      blocksData.forEach((item: object, index: number) => {
        const newBlock = JSON.parse(JSON.stringify(me.block))
        newBlock.replication = undefined
        this.replicationIndex = this.replicationIndex + 1
        if ((index + 1) % columns !== 0) {
          if (me.block.replication?.horizontalMargin?.value) {
            newBlock.left = me.block.replication?.horizontalMargin?.value
            newBlock.sizeTypes.left = me.block.replication?.horizontalMargin?.type || SizeTypes.PIXEL
          } else {
            newBlock.left = 0
          }

          newBlock.stickyTo = {
            type: 'left',
            guid: lastGuid
          }
          if (row > 0) {
            let previousRowBlockGuid = rowGuids[row - 1][(index % columns) + 1]
            newBlock.replication = {}
            newBlock.replication.topBlockGuid = previousRowBlockGuid
          }
          lastGuid = me.getStore().add(newBlock)
        } else {
          row++
          if (me.block.replication?.verticalMargin?.value) {
            newBlock.top = me.block.replication?.verticalMargin?.value
            newBlock.sizeTypes.top = me.block.replication?.verticalMargin?.type || SizeTypes.PIXEL
          } else {
            newBlock.top = 0
          }
          newBlock.stickyTo = {
            type: 'top',
            guid: lastGuid
          }
          lastGuid = me.getStore().add(newBlock)
        }
        if (typeof rowGuids[row] === 'undefined') {
          rowGuids[row] = []
        }
        rowGuids[row].push(lastGuid)
      })
      this.getStore().removeListener(listenerGuid)
    },
    setParent (): void {
      this.parentBlock = this.block.parentGuid ? this.getStore().getByGuid(this.block.parentGuid) : undefined
      this.parentElement = this.block.parentGuid ? this.$parent.$refs.draggableContainer as Element : undefined
    },
    scrollPrevTab (): void {
      const tabsScroll: HTMLElement = this.$refs.tabsScroll as HTMLElement
      const draggableContainer: HTMLElement = this.$refs.draggableContainer as HTMLElement
      const blockWidth = draggableContainer.offsetWidth
      this.blockWidth = draggableContainer.offsetWidth
      this.tabsOffset -= blockWidth / 2
      if (this.tabsOffset < 0) {
        this.tabsOffset = 0
        // return
      }
      tabsScroll.style.transform = `translateX(-${this.tabsOffset}px)`
    },
    scrollNextTab (): void {
      const tabsScroll: HTMLElement = this.$refs.tabsScroll as HTMLElement
      const draggableContainer: HTMLElement = this.$refs.draggableContainer as HTMLElement
      const tabsWidth = tabsScroll.offsetWidth
      const blockWidth = draggableContainer.offsetWidth
      this.blockWidth = draggableContainer.offsetWidth
      if ((tabsWidth - blockWidth) < this.tabsOffset) return
      this.tabsOffset += blockWidth / 1.5
      tabsScroll.style.transform = `translateX(-${this.tabsOffset}px)`
    },
    setIsShowArrows (): void {
      if (!this.$refs.draggableContainer) return
      const tabsScroll: HTMLElement = this.$refs.tabsScroll as HTMLElement
      const draggableContainer: HTMLElement = this.$refs.draggableContainer as HTMLElement
      const tabsWidth = tabsScroll.offsetWidth
      this.tabsWidth = tabsScroll.offsetWidth
      const blockWidth = draggableContainer.offsetWidth
      this.blockWidth = draggableContainer.offsetWidth

      if (tabsWidth > blockWidth) {
        this.isShowArrows = true
      } else {
        this.isShowArrows = false
        tabsScroll.style.transform = `translateX(-${0}px)`
      }
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

.block .tabs_container {
  position: absolute;
  display: flex;
  overflow: hidden;
}
.tabs_onScroll.direction {
  flex-direction: column;
}

.block .tabs_container.position_top {
  bottom: 100%;
  width: 100%;
}

.block .tabs_container.position_right {
  left: 100%;
  height: 100%;
  flex-direction: column;
}

.block .tabs_container.position_bottom {
  top: 100%;
  width: 100%;
}

.block .tabs_container.position_left {
  right: 100%;
  height: 100%;
  flex-direction: column;
}
.block .tab {
  width: 100px;
  cursor: pointer;
  box-sizing: border-box;
  text-align: center;
  /* flex: 1; */
}
.block .tabs_onScroll {
  display: flex;
  transition: 1s all;
}
.block .tabs_onScroll.tabs_padding {
  padding-left: 15px;
  padding-right: 15px;
}
.block .tabs_button {
    display: block;
    background: white;
    border: none;
    outline: none;
    cursor: pointer;
    position: absolute;
    width: 12px;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 5;
    color: #909399;
    box-sizing: border-box;
}
.block .tabs_button_next {
    right: 0;
    left: auto;
}
</style>
