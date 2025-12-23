<template>
  <div
    :style="positionStyle"
    :class="{
      'block': true,
      'highlight' : isResizing || isDragging,
      'active': block.isActive,
      'hidden': block.isHidden,
      'active_parent': block.isActiveAsParent,
      [block.className]: !!block.className
    }"
    ref="draggableContainer"
    v-show="!block.isHidden || showHidden"
    @mousedown.stop="dragStart"
    @contextmenu.stop="$emit('contextmenu', { block: block, event: $event })"
  >
    <div
      v-if="isTabsContainer"
      ref="tabsContainer"
      :class="{
        'tabs_container' : true,
        'custom_scrollbar' : true,
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
      <div class="tabs_onScroll" ref="tabsScroll" :class="{ 'tabs_padding': isShowArrows, 'direction': directionTabs }">
        <div
          v-for="tab in visibleTabs"
          :key="tab.guid"
          :style="blockTabStyle + getBlockTabStyle(tab)"
          :class="{
            'tab': true,
            'active': tab.guid === activeTabGuid,
            [block.tabs.class]: true,
            'required_tab': block.tabs.requiredTabs && block.tabs.requiredTabs.includes(tab.guid),
            'positionTab': tab.data && tab.data.isChild
          }"
          @click="onTabClick(tab.guid)"
        >
          <div @click="showChildTabs(tab.guid)" v-show="tab.data && tab.data.isChild">
            <i class="plus" :class="{'el-icon-arrow-right': !tab.data.isExpanded, 'el-icon-arrow-down': tab.data.isExpanded}"></i>
          </div>
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

    <div class="block_info">
      <slot :block="block" name="help_text"></slot>
    </div>
    <slot :block="block" :is-resizing="isResizing" :is-dragging="isDragging" name="info">
      <div class="block_info" v-show="isResizing">
        {{ block.width }}{{ block.sizeTypes.width }} x {{ block.height }}{{ block.sizeTypes.height }}
      </div>
      <div
        v-show="isDragging && ['tl', 'bl'].includes(block.sticky)"
        class="position_line left"
        :style="`left: calc(-${currentPosition.left}px - 1px);width:calc(${currentPosition.left}px - 1px)`"
      >
        <span>{{ block.left }}{{ block.sizeTypes.left }}</span>
      </div>
      <div
        v-show="isDragging && ['tl', 'tr'].includes(block.sticky)"
        class="position_line top"
        :style="`top: -${currentPosition.top}px;height:${currentPosition.top}px`"
      >
        <span>{{ block.top }}{{ block.sizeTypes.top }}</span>
      </div>
      <div
        v-show="isDragging && ['br', 'bl'].includes(block.sticky)"
        class="position_line bottom"
        :style="`bottom: -${currentPosition.bottom}px;height:${currentPosition.bottom}px`"
      >
        <span>{{ block.bottom }}{{ block.sizeTypes.bottom }}</span>
      </div>
      <div
        v-show="isDragging && ['tr', 'br'].includes(block.sticky)"
        class="position_line right"
        :style="`right: -${currentPosition.right}px;width:${currentPosition.right}px`"
      >
        <span>{{ block.right }}{{ block.sizeTypes.right }}</span>
      </div>
    </slot>
    <div
      class="content custom_scrollbar"
      :style="blockContentStyle"
      @mouseover="block.isHover = true"
      @mouseleave="block.isHover = false"
      @click.stop="$emit('click', { block: $event.block || block, event: $event.event || $event })"
    >
      <slot :block="block" v-if="!isTabsContainer" name="content"></slot>
      <slot :block="block" name="toolbar"></slot>
      <svg id="svg" v-if="!block.isEditing && !isTabsContainer">
        <line class="line" v-for="(line, index) in stickyLines"
              :class="{
                [line.type]: true
              }"
              :key="index"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
        />
      </svg>
      <block
        v-for="_block in children"
        v-show="isShowChildren && _block.parentTabGuid === activeTabGuid"
        :ref="_block.guid"
        :key="_block.guid"
        :block="_block"
        :tab-settings-service="tabSettingsService"
        :step="step"
        :show-hidden="showHidden"
        :initial-zindex="zIndex + 1"
        @start-drag="$emit('start-drag', $event)"
        @stop-drag="$emit('stop-drag', $event)"
        @dragging="$emit('dragging', $event)"
        @contextmenu="$emit('contextmenu', $event)"
        @click="$emit('click', { block: $event.block || _block, event: $event.event || $event })"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data"></slot>
        </template>
      </block>
    </div>
    <font-awesome-icon
      v-show="!block.disabledMove"
      icon="angle-down"
      :class="`resize-handler ${block.sticky}`"
      @mousedown.stop="resizeStart"
    ></font-awesome-icon>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import BlockDTO from '../../domain/model/BlockDTO'
// eslint-disable-next-line no-unused-vars
import { Position } from '@/domain/model/PositionCss'
import BlockManager from '@/application/service/BlockManager'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Sticky } from '@/domain/model/Sticky'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'
import { StickyToType } from '@/domain/model/StickyTo'
import { SizeTypes } from '@/domain/model/SizeTypes'
import stickyLinesMixin from '@/infrastructure/service/stickyLinesMixin'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
library.add(faAngleDown, faChevronRight, faChevronLeft)

export default Vue.extend({
  name: 'Block',
  mixins: [stickyLinesMixin],
  components: {
    FontAwesomeIcon
  },

  inject: {
    getStore: {
      default: () => () => {}
    }
  },

  props: {
    block: {
      type: BlockDTO
    },
    step: {
      type: Number
    },
    showHidden: {
      type: Boolean,
      default: false
    },
    tabSettingsService: {
      type: Object
    },
    initialZindex: {
      type: Number
    }
  },

  data (): {
    blockManager: undefined | BlockManager,
    isResizing: boolean,
    isDragging: boolean,
    currentPosition: {
      [index: string]: any;
      left: number,
      top: number,
      right: number,
      bottom: number
    },
    parentBlock?: BlockDTO,
    parentElement?: Element,
    ctrlPressed: boolean,
    activeTabGuid?: string,
    tabsOffset: number,
    blockWidth: number,
    tabsWidth: number,
    isShowArrows: boolean,
    visitedTabs: string[],
    stickyToBlock?: BlockDTO,
    stickyToElement?: any,
    zIndex: number
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
      activeTabGuid: undefined,
      tabsOffset: 0,
      blockWidth: 0,
      tabsWidth: 0,
      isShowArrows: false,
      visitedTabs: [],
      stickyToBlock: undefined,
      stickyToElement: undefined,
      zIndex: this.initialZindex || 101
    }
  },

  computed: {
    // список потомков у контейнера
    children (): object[] {
      if (this.activeTabGuid) {
        return this.block.children.reduce((arr: object[], item) => {
          if (item.parentTabGuid === this.activeTabGuid) {
            if (!this.visitedTabs.includes(item.guid)) {
              this.visitedTabs.push(item.guid)
            }
          }

          if (this.visitedTabs.includes(item.guid)) {
            arr.push(item)
          }

          return arr
        }, [])
      } else {
        return this.block.children
      }
    },

    availableTabs (): Array<object> {
      if (!this.block?.tabs?.use || this.block?.tabs?.list?.length < 1) {
        return []
      }

      return this.block.tabs.list.filter(tab => {
        if (this.tabSettingsService) {
          const isHidden = this.tabSettingsService.getIsHidden(tab.guid)
          const isBlocked = this.tabSettingsService.getIsBlocked(tab.guid)

          if (isHidden || isBlocked) {
            return false
          }
        }

        return true
      })
    },

    visibleTabs (): { guid: string, name: string, data: any }[] {
      if (!this.block?.tabs?.use || this.block?.tabs?.list?.length < 1) {
        return []
      }
      let tabs = this.tabSettingsService.tabSettings || {}

      if (this.tabSettingsService) {
        const parentKeys: { [key: string]: boolean } = {}

        // Заполняем parentKeys ключами, используемыми в parentTabForTree
        for (const key in tabs) {
          if (Object.prototype.hasOwnProperty.call(tabs, key)) {
            const parentKey = tabs[key].parentTabForTree
            if (parentKey) {
              parentKeys[parentKey] = true
            }
          }
        }

        for (const guid in tabs) {
          if (Object.prototype.hasOwnProperty.call(tabs, guid)) {
            // изначально svg в плюсик
            tabs[guid].isExpanded = false
            // является первым уровнем и есть потомок - вкладку показывать при иницилизации
            if (!tabs[guid].parentTabForTree && parentKeys[guid]) {
              tabs[guid].isShow = true
            }
            // есть родитель, является потомком - вкладку не показывать при иницилизации
            if (tabs[guid].parentTabForTree) {
              tabs[guid].isShow = false
            }
            // есть потомок - показать плюсик
            if (parentKeys[guid]) {
              tabs[guid].isChild = true
            } else {
              tabs[guid].isChild = false
            }
          }
        }
        const defaultData = { isChild: false, isExpanded: false, isShow: false, parentTabForTree: '' }
        let result = this.block.tabs.list
          .map(tab => {
            return {
              guid: tab.guid,
              name: tab.name,
              data: tabs[tab.guid] || defaultData
            }
          })

        return result
      }
      return []
    },

    tabGuids () {
      return (this.block.tabs?.list || []).map((item) => item.guid)
    },

    isTabsContainer (): boolean {
      return this.block.tabs?.use || false
    },

    directionTabs (): boolean {
      return (this.block.tabs?.position === 'left' || this.block.tabs?.position === 'right')
    },

    positionStyle (): object {
      let position: Position = {}

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

      if (this.block.isHidden && !this.showHidden) {
        if (this.block.stickyTo?.guid && this.block.stickyTo?.type) {
          if (this.block.stickyTo.type === StickyToType.TOP) {
            position.top = '0px'
          } else if (this.block.stickyTo.type === StickyToType.LEFT) {
            position.left = '0px'
          }
        }
      }

      if (this.block.stickyTo?.guid && this.block.stickyTo?.type) {
        const stickyToBlock = this.stickyToBlock
        const stickyToElement = this.stickyToElement

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

      if (this.block.isHidden && !this.showHidden) {
        width = '0px'
        height = '0px'
      }

      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontal) {
        if (this.block.sticky === Sticky.BL || this.block.sticky === Sticky.TL) {
          position.left = `calc(50% - calc(${width} / 2))`
        } else {
          position.right = `calc(50% - calc(${width} / 2))`
        }
      }
      // центрировать горизонтально (адаптивно)
      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontalAdaptive) {
        position.marginLeft = 'auto'
        position.marginLeft = 'auto'
        position.marginRight = 'auto'
        position.left = '0'
        position.right = '0'
      }

      if (!this.block.stickyTo?.guid && this.block.onCenter?.vertical) {
        if (this.block.sticky === Sticky.TR || this.block.sticky === Sticky.TL) {
          position.top = `calc(50% - calc(${height} / 2))`
        } else {
          position.bottom = `calc(50% - calc(${height} / 2))`
        }
      }

      return Object.assign(position, {
        width: width,
        height: height,
        zIndex: this.zIndex
      })
    },

    blockTabStyle () {
      let style = ''

      if (this.block.tabs) {
        style += this.block.tabs.tabStyle
      }

      return style
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

      if (block.properties?.contentType === 'registry') {
        isShow = false
      }

      return isShow
    }
  },

  watch: {
    'block.sticky': {
      handler (value) {
        if (!value) {
          return
        }
        const parent = this.$el.parentElement as {
          [index: string]: any;
        }
        if (!parent) {
          return
        }
        if (this.block.stickyTo?.guid && value !== Sticky.TL) {
          this.block.stickyTo.guid = undefined
        }

        const map: {
          [index: string]: any;
        } = {
          [Sticky.TL]: ['top', 'left'],
          [Sticky.TR]: ['top', 'right'],
          [Sticky.BL]: ['bottom', 'left'],
          [Sticky.BR]: ['bottom', 'right']
        }
        const parentSizesMap: {
          [index: string]: any;
        } = {
          top: 'offsetHeight',
          left: 'offsetWidth',
          bottom: 'offsetHeight',
          right: 'offsetWidth'
        }

        const positions = map[value]
        positions.forEach((position: string) => {
          this.block[position] = this.block.sizeTypes[position] === SizeTypes.PERCENT
            ? Math.round(this.currentPosition[position] / (parent[parentSizesMap[position]] / 100))
            : Math.round(this.currentPosition[position])
        })
      }
    },

    'block.stickyTo.guid': {
      handler (value, oldValue) {
        if (!this.$el.parentElement) {
          return
        }
        this.setSticky(value)
        if (oldValue && !value) {
          const el = this.getStore().getRefByGuid(oldValue) as unknown as {
            $el: {
              offsetTop: number, offsetLeft: number, offsetHeight: number, offsetWidth: number
            }
          }
          if (this.block.stickyTo?.type === StickyToType.TOP) {
            let difference = el.$el.offsetTop + el.$el.offsetHeight
            if (this.block.sizeTypes.top === SizeTypes.PERCENT) {
              difference = difference / (this.$el.parentElement.offsetHeight / 100)
            }
            this.block.top = Math.round((this.block.top || 0) + difference)
          } else if (this.block.stickyTo?.type === StickyToType.LEFT) {
            let difference = el.$el.offsetLeft + el.$el.offsetWidth
            if (this.block.sizeTypes.left === SizeTypes.PERCENT) {
              difference = difference / (this.$el.parentElement.offsetWidth / 100)
            }
            this.block.left = Math.round((this.block.left || 0) + difference)
          }
          return
        }
        if (!value || !this.block.stickyTo?.guid) {
          return
        }
        const el = this.getStore().getRefByGuid(this.block.stickyTo?.guid) as unknown as {
          $el: {
            offsetTop: number, offsetLeft: number, offsetHeight: number, offsetWidth: number
          }
        }
        if (this.block.stickyTo?.type === StickyToType.TOP) {
          let difference = el.$el.offsetTop + el.$el.offsetHeight
          if (this.block.sizeTypes.top === SizeTypes.PERCENT) {
            difference = difference / (this.$el.parentElement.offsetHeight / 100)
          }
          this.block.top = Math.round((this.block.top || 0) - difference)
        } else if (this.block.stickyTo?.type === StickyToType.LEFT) {
          let difference = el.$el.offsetLeft + el.$el.offsetWidth
          if (this.block.sizeTypes.left === SizeTypes.PERCENT) {
            difference = difference / (this.$el.parentElement.offsetWidth / 100)
          }
          this.block.left = Math.round((this.block.left || 0) - difference)
        }
      }
    },

    activeTabGuid (guid) {
      this.getStore().setActiveTab(this.block.guid, guid)
    },

    'block.tabs.list': {
      handler () {
        if (this.isTabsContainer) {
          setTimeout(() => {
            this.setIsShowArrows()
          }, 0)
        }
        if (this.block.tabs?.list.length === 1) {
          this.block.children.forEach(el => {
            el.parentTabGuid = this.block.tabs?.list[0]?.guid
          })
        }
        if (!this.block.tabs?.list.find(item => item.guid === this.activeTabGuid)) {
          if (this.block.tabs?.list[0]?.guid) {
            this.onTabClick(this.block.tabs.list[0].guid)
          }
        }
      },
      deep: true
    },

    'block.sizeTypes.width': {
      handler (value: SizeTypes, old: SizeTypes) {
        if (value === old || !value) {
          return
        }
        if (!this.$el.parentElement) {
          return
        }
        let parentSize = this.$el.parentElement.offsetWidth
        const oldValue = this.block.width
        this.block.width = this.calcSwitchedSizes(value, parentSize, oldValue)
      },
      deep: true
    },

    'block.sizeTypes.height': {
      handler (value: SizeTypes, old: SizeTypes) {
        if (value === old || !value) {
          return
        }
        if (!this.$el.parentElement) {
          return
        }
        let parentSize = this.$el.parentElement.offsetHeight
        const oldValue = this.block.height
        this.block.height = this.calcSwitchedSizes(value, parentSize, oldValue)
      },
      deep: true
    },

    'block.sizeTypes.top': {
      handler (value: SizeTypes, old: SizeTypes) {
        if (value === old || !value) {
          return
        }
        if (!this.$el.parentElement) {
          return
        }
        let parentSize = this.$el.parentElement.offsetHeight
        const oldValue = this.block.top
        if (!oldValue) {
          return
        }
        this.block.top = this.calcSwitchedSizes(value, parentSize, oldValue)
      },
      deep: true
    },

    'block.sizeTypes.left': {
      handler (value: SizeTypes, old: SizeTypes) {
        if (value === old || !value) {
          return
        }
        if (!this.$el.parentElement) {
          return
        }
        let parentSize = this.$el.parentElement.offsetWidth
        const oldValue = this.block.left
        if (!oldValue) {
          return
        }
        this.block.left = this.calcSwitchedSizes(value, parentSize, oldValue)
      },
      deep: true
    },

    'block.sizeTypes.right': {
      handler (value: SizeTypes, old: SizeTypes) {
        if (value === old || !value) {
          return
        }
        if (!this.$el.parentElement) {
          return
        }
        let parentSize = this.$el.parentElement.offsetWidth
        const oldValue = this.block.right
        if (!oldValue) {
          return
        }
        this.block.right = this.calcSwitchedSizes(value, parentSize, oldValue)
      },
      deep: true
    },

    'block.sizeTypes.bottom': {
      handler (value: SizeTypes, old: SizeTypes) {
        if (value === old || !value) {
          return
        }
        if (!this.$el.parentElement) {
          return
        }
        let parentSize = this.$el.parentElement.offsetHeight
        const oldValue = this.block.bottom
        if (!oldValue) {
          return
        }
        this.block.bottom = this.calcSwitchedSizes(value, parentSize, oldValue)
      },
      deep: true
    },

    'block.width': {
      handler () {
        if (this.isTabsContainer) {
          this.setIsShowArrows()
        }
      }
    },

    tabGuids (value, oldValue) {
      if (value.length < oldValue.length) {
        let removedTab = oldValue.filter((item: string) => !value.includes(item))[0]
        if (removedTab) {
          this.block.children
            .forEach((item) => {
              if (item.parentTabGuid === removedTab) {
                this.getStore().remove(item.guid)
              }
            })
        }
      }
    }
  },

  mounted () {
    if (this.block?.tabs?.use && this.block?.tabs?.list?.length > 0) {
      this.onTabClick(this.block.tabs.list[0].guid)
    }
    this.getStore().addRef(this.block.guid, this)
    this.$nextTick(() => {
      this.onDrag()
      if (this.isTabsContainer) {
        this.setIsShowArrows()
      }
      this.setSticky(this.block?.stickyTo?.guid)
    })
  },

  beforeDestroy () {
    this.getStore().removeRef(this.block.guid)
  },

  methods: {
    showChildTabs (guid: string) {
      if (this.block.tabs) {
        this.visibleTabs.forEach(tab => {
          if (tab.guid === guid) {
            tab.data.isExpanded = !tab.data.isExpanded
          }
          if (tab.data.parentTabForTree === guid) {
            tab.data.isShow = !tab.data.isShow
          }
        })
      }
    },
    setSticky (guid?: string) {
      if (guid) {
        this.stickyToBlock = this.getStore().getByGuid(guid)
        this.stickyToElement = this.getStore().getRefByGuid(guid) as unknown as {
          positionStyle: {
            top: string, height: string, left: string, width: string
          }
        }
      } else {
        this.stickyToBlock = undefined
        this.stickyToElement = undefined
      }
    },
    setIsShowArrows (): void {
      if (!this.$refs.draggableContainer) return
      const tabsScroll: HTMLElement = this.$refs.tabsScroll as HTMLElement
      const draggableContainer: HTMLElement = this.$refs.draggableContainer as HTMLElement
      const tabsWidth = tabsScroll.offsetWidth
      this.tabsWidth = tabsScroll.offsetWidth
      const blockWidth = draggableContainer.offsetWidth
      this.blockWidth = draggableContainer.offsetWidth

      if (tabsWidth > blockWidth && (this.block.tabs?.position !== 'left' && this.block.tabs?.position !== 'right')) {
        this.isShowArrows = true
      } else {
        this.isShowArrows = false
        tabsScroll.style.transform = `translateX(-${0}px)`
      }
    },

    calcSwitchedSizes (type: SizeTypes, parentSize: number, oldValue: number): number {
      if (type === SizeTypes.PIXEL) {
        return Math.round(parentSize / 100 * oldValue)
      } else {
        return Math.round(oldValue / (parentSize / 100))
      }
    },

    getBlockTabStyle (tab: any): string {
      let style = ';'

      if (this.block.tabs) {
        if (tab.guid === this.activeTabGuid) {
          const newStyle = this.block.tabs.activeTabStyle
          if (newStyle) {
            style += '; ' + this.block.tabs.activeTabStyle
          }
        }
      }

      if (this.tabSettingsService) {
        if (this.tabSettingsService.getIsStyled(tab.guid)) {
          const newStyle = this.tabSettingsService.getStyle(tab.guid)
          if (newStyle) {
            style += '; ' + newStyle
          }
        }

        if (this.tabSettingsService.getIsHidden(tab.guid)) {
          style += '; color: #f46666; cursor: not-allowed; '
        }

        if (this.tabSettingsService.getIsBlocked(tab.guid)) {
          style += '; color: gray; cursor: not-allowed; '
        }
      }

      return style
    },

    onTabClick (guid: string) {
      if (this.tabSettingsService && this.tabSettingsService.getIsBlocked(guid)) {
        return
      }

      this.activeTabGuid = guid
    },

    onDrag (): void {
      // при ленивой загрузки табов this.$refs.draggableContainer undefined
      if (!this.$refs.draggableContainer) return
      const el: HTMLElement = this.$refs.draggableContainer as HTMLElement
      this.currentPosition.left = el.offsetLeft
      this.currentPosition.top = el.offsetTop
      if (el.parentElement) {
        this.currentPosition.bottom = el.parentElement?.offsetHeight - el.offsetTop - el.offsetHeight
        this.currentPosition.right = el.parentElement?.offsetWidth - el.offsetLeft - el.offsetWidth
      }
      /* if (this.block.stickyTo?.guid) {
        this.currentPosition.top =
      } */
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
      this.$emit('start-drag', this.block)
      if (this.block.isEditing || this.block.disabledMove) {
        this.dragStop()
        return
      }
      event.preventDefault()
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
    },

    getNextTab (): string {
      const findTabIndex: number | undefined = this.availableTabs.findIndex((item: any) => item.guid === this.activeTabGuid)
      if (typeof findTabIndex === 'number' && this.availableTabs[findTabIndex + 1]) {
        return (this.availableTabs[findTabIndex + 1] as any).guid
      }
      return ''
    },

    getPrevTab (): string {
      const findTabIndex: number | undefined = this.availableTabs.findIndex((item: any) => item.guid === this.activeTabGuid)
      if (typeof findTabIndex === 'number' && this.availableTabs[findTabIndex - 1]) {
        return (this.availableTabs[findTabIndex - 1] as any).guid
      }
      return ''
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
    }
  }
})
</script>

<style scoped>
.resize-handler {
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
  left: 0;
  transform: rotate(45deg);
}

.resize-handler.bl {
  top: -3px;
  right: 0;
  transform: rotate(-135deg);
}

.resize-handler.br {
  top: -3px;
  left: 0;
  transform: rotate(135deg);
}

.block {
  outline: 1px dashed #539FFF;
  position: absolute;
}
.block.hidden {
  outline: 1px dashed #E94435;
}

.block.highlight {
  outline: 1px solid #539FFF;
  cursor: pointer;
}
.block.highlight.hidden {
  outline: 1px solid #E94435;
}

.block .block_info {
  font-size: 12px;
  font-family: 'Roboto', sans-serif;
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
  font-family: 'Roboto', sans-serif;
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

.block .position_line.right {
  top: calc(50% - 1px);
  height: 1px;
}

.block .position_line.left span {
  right: 3px;
  top: 3px;
}

.block .position_line.right span {
  left: 4px;
  top: 3px;
}

.block .position_line.top span {
  bottom: 4px;
  left: 3px;
}

.block .position_line.top {
  left: calc(50% - 1px);
  width: 1px;
}

.block .position_line.bottom span {
  top: 4px;
  left: 3px;
}

.block .position_line.bottom {
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

.block.active.hidden {
  outline: 3px solid #E94435;
}

.block.active_parent {
  outline: 3px solid green;
}

.block .tabs_container {
  position: absolute;
  display: flex;
  overflow: hidden;
}

.block .tabs_container.position_top {
  bottom: 100%;
  width: 100%;
}

.block .tabs_container.position_right {
  left: 100%;
  flex-direction: column;
  height: 100%;
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
}
.line.top {
  stroke: #32B84D;
}
.line.left {
  stroke: #F56C6C;
}
.tab {
  width: 100px;
  cursor: pointer;
  box-sizing: border-box;
  text-align: center;
  /* flex: 1; */
}
.tabs_onScroll {
  display: flex;
  transition: 1s all;
}
.tabs_onScroll.tabs_padding {
  padding-left: 15px;
  padding-right: 15px;
}
.tabs_onScroll.direction {
  flex-direction: column;
}
.tabs_button {
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
.tabs_button_next {
    right: 0;
    left: auto;
}

.required_tab:after {
  content: '';
  width: 4px;
  height: 4px;
  display: inline-block;
  background-color: #f56c6c;
  vertical-align: middle;
  margin-left: 5px;
  border-radius: 4px;
}
.tabs_container .positionTab {
  position: relative;
  padding-left: 20px !important;
}
.tabs_container .positionTab>div:first-child {
  position: absolute;
  top: 50%;
  left: 4%;
  transform: translate(0%, -50%);
}
</style>
