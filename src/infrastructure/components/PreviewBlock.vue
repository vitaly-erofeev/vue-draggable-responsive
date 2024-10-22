<template>
  <div
    :style="positionStyle"
    ref="draggableContainer"
    :class="['block', block.className]"
  >
    <div
      v-if="isTabsContainer"
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
          v-show="isShowTabs(tab)"
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

    <div
      ref="container"
      class="content custom_scrollbar"
      :class="{ 'scroll_hover': isActiveScrollHover }"
      :style="blockContentStyle"
      @mouseover="block.isHover = true"
      @mouseleave="block.isHover = false"
      @click="$emit('click', { block: $event.block || block, event: $event.event || $event })"
    >
      <slot :block="block" v-if="!isTabsContainer" name="content"></slot>
      <preview-block
        v-for="_block in children"
        v-show="(isShowChildren && !_block.isHidden )"
        :class="(_block.parentTabGuid === activeTabGuid) ? '' : 'visibility'"
        :ref="_block.guid"
        :key="_block.guid"
        :is-showing="isShowChildren && _block.parentTabGuid === activeTabGuid && !_block.isHidden"
        :block="_block"
        :replication-callback="replicationCallback"
        :tab-settings-service="tabSettingsService"
        @click="$emit('click', { block: $event.block || _block, event: $event.event || $event })"
        @tab-click="$emit('tab-click', $event)"
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
import { Position } from '@/domain/model/PositionCss'
import ResizeObserver from 'resize-observer-polyfill'
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
import SimpleAddListener from '@/infrastructure/service/listeners/SimpleAddListener'

import { debounce } from '@/infrastructure/service/utils'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
library.add(faAngleDown, faChevronRight, faChevronLeft)
export default Vue.extend({
  name: 'PreviewBlock',

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
    replicationCallback: Function,
    isShowing: {
      type: Boolean,
      default: true
    },
    tabSettingsService: {
      type: Object
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
    isShowArrows: boolean,
    visitedTabGuids: string[],
    stickyToBlock?: BlockDTO,
    stickyToElement?: any,
    prepareReplication: () => void
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
      isShowArrows: false,
      visitedTabGuids: [],
      stickyToBlock: undefined,
      stickyToElement: undefined,
      prepareReplication: () => {}
    }
  },
  created () {
    let me = this
    this.prepareReplication = debounce(this._prepareReplication, 300, () => {
      if (!this.block.replication?.function) {
        return
      }
      me.block.isLoading = true
    })
  },
  computed: {
    // список потомков у контейнера
    children (): object[] {
      if (this.block?.tabs?.use) {
        return this.block.children.filter(item => item.parentTabGuid && this.visitedTabGuids.includes(item.parentTabGuid))
      } else {
        return this.block.children
      }
    },

    availableTabs (): { guid: string, name: string }[] {
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
        let result = this.block.tabs.list.filter(tab => {
          const isHidden = this.tabSettingsService.getIsHidden(tab.guid)

          if (isHidden) {
            return false
          }

          return true
        }).map(tab => {
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

    directionTabs (): boolean {
      return (this.block.tabs?.position === 'left' || this.block.tabs?.position === 'right')
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
      let position: Position = {}
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
              if (this.parentBlock.isStretched && this.isTabsContainer) {
                // Если this.isTabsContainer === false
                // и чекбокс "Растягиваемый" включен у дочернего блока, то поля в дочернем блоке пропадают (width = 0px)
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
              `calc(${stickyToElement.positionStyle.height} + ${stickyToElement.positionStyle.top} + ${this.block.replication?.verticalMargin})`
        }
      }
      if (this.block.stickyTo?.guid && this.block.stickyTo?.type && this.stickyToBlock?.guid) {
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

      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontal && this.isShowing) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid) as unknown as {
          $el: HTMLElement
        }
        // Для элементов с display:none offsetWidth равен нулю
        if (refBlock && refBlock.$el.offsetWidth) {
          if (this.block.sticky === Sticky.BL || this.block.sticky === Sticky.TL) {
            position.left = `calc(50% - calc(${refBlock.$el.offsetWidth}px / 2))`
          } else {
            position.right = `calc(50% - calc(${refBlock.$el.offsetWidth}px / 2))`
          }
        }
      }
      // центрировать горизонтально (адаптивно)
      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontalAdaptive && this.isShowing) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid) as unknown as {
          $el: HTMLElement
        }
        // Для элементов с display:none offsetWidth равен нулю
        if (refBlock && refBlock.$el.offsetWidth) {
          position.marginLeft = 'auto'
          position.marginLeft = 'auto'
          position.marginRight = 'auto'
          position.left = '0'
          position.right = '0'
        }
      }

      if (!this.block.stickyTo?.guid && this.block.onCenter?.vertical && this.isShowing) {
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
    },
    isActiveScrollHover (): boolean {
      return !!this.block?.isScrollHover
    }
  },

  watch: {
    activeTabGuid (value) {
      this.scrollHeight = 0
      this.scrollWidth = 0
      if (!this.visitedTabGuids.includes(value)) {
        this.visitedTabGuids.push(value)
      }
      this.$nextTick(() => {
        this.setStretchedSize()
      })
    },
    availableTabs (value) {
      let someGuid = value.some((item: { guid?: string }) => item?.guid === this.activeTabGuid)
      if (!someGuid) {
        this.onTabClick(value[0].guid)
      }
    }
  },

  mounted () {
    this.setParent()
    this.$nextTick(() => {
      this.setStretchedSize()
      this.setSticky(this.block?.stickyTo?.guid)
      if (this.isTabsContainer) {
        this.setIsShowArrows()
      }
    })
    if (this.block?.tabs?.use && this.block?.tabs?.list?.length > 0) {
      if (this.block.tabs.saveActiveTab && this.block.tabs.activeGuid) {
        this.onTabClick(this.block.tabs.activeGuid || this.availableTabs[0].guid)
      } else {
        this.onTabClick(this.availableTabs[0].guid)
      }
      // установлена вкладка по умолчанию
      let defaultTab = this.getDefaultTab()
      if (defaultTab) {
        this.onTabClick(defaultTab)
      }
    }
    if (this.block?.isStretched && this.$refs.container && this.$refs.container instanceof Element) {
      let children: HTMLCollection = this.$refs.container.children
      const observer = new ResizeObserver(() => {
        this.setStretchedSize()
      })
      for (let item of children) {
        observer.observe(item)
      }
      const observerInserted = new MutationObserver(mutationList =>
        mutationList.filter(m => m.type === 'childList').forEach(m => {
          observer.observe(m.target as Element)
        }))
      observerInserted.observe(this.$refs.container, { childList: true, subtree: true })
    }
    this.block.isLoading = false
    this.prepareReplication()
    this.getStore().addRef(this.block.guid, this)
  },

  beforeDestroy () {
    this.getStore().removeRef(this.block.guid)
  },

  methods: {
    showChildTabs (guid: string) {
      if (this.block.tabs) {
        let tabs = this.buidTreeTabs(this.visibleTabs)
        // изменить иконку плюс на минус
        tabs[guid].data.isExpanded = !tabs[guid].data.isExpanded
        // если закрыт верхний родитель  - то закрыть все child. Рекурсивно обходим "дерево"
        tabs[guid].childNodes.forEach(function search (item: any) {
          item.data.isShow = !item.data.isShow
          if (item.childNodes?.length > 0 && item.data.isExpanded) {
            item.childNodes.forEach((item: any) => search(item))
          }
        })
      }
    },
    // Для удобства добавить childNodes
    buidTreeTabs (tabs: { guid: string, name: string, data: any }[]) {
      const hashTable = Object.create(null)
      for (let item of tabs) {
        hashTable[item.guid] = { ...item, childNodes: [] }
      }
      for (let item of tabs) {
        if (hashTable[item.data.parentTabForTree]) {
          hashTable[item.data.parentTabForTree].childNodes.push(hashTable[item.guid])
        }
      }

      return hashTable
    },
    isShowTabs (tab: { guid: string, name: string, data: any }): boolean {
      if (tab.data.parentTabForTree === '') {
        return true
      }
      if (tab.data.isShow) {
        return true
      }

      return false
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
    setStretchedSize () {
      this.scrollHeight = 0
      this.scrollWidth = 0
      this.$nextTick(() => {
        this.scrollHeight = this.$el.getElementsByClassName('content')[0].scrollHeight
        this.scrollWidth = this.$el.getElementsByClassName('content')[0].scrollWidth
      })
    },
    onReplicateBlock (event: {}) {
      if (this.replicationCallback) {
        this.replicationCallback(Object.assign({}, event, {
          replicationBlockGuid: this.block.guid,
          replicationIndex: this.replicationIndex
        }))
      }
    },

    async _prepareReplication (offset = {}): Promise<void> {
      if (!this.block.replication?.function) {
        this.block.isLoading = false
        return
      }
      this.block.isLoading = true
      this.block.isHidden = false
      let blocksData: any[] = []
      try {
        blocksData = await this.block.replication?.function(offset)
      } catch (e) {
        console.log('Error in replication request', e)
      }
      if (blocksData.length === 0) {
        this.block.isHidden = true
        /* this.$nextTick(() => {
          this.getStore().remove(this.block.guid)
        }) */
        this.block.isLoading = false
        return
      }
      blocksData.shift()
      let me = this
      let lastGuid = me.block.guid
      let columns = me.block.replication?.columns || 1
      let rowGuids: { [index: string]: any; } = { 0: [me.block.guid] }
      let row = 0
      this.replicationIndex = 0
      const listenerGuid = this.getStore().addListener(new SimpleAddListener(this.onReplicateBlock))
      blocksData.forEach((item: object, index: number) => {
        const newBlock = JSON.parse(JSON.stringify(me.block))
        newBlock.replication = undefined
        newBlock.isLoading = false
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
            if (me.block.replication?.verticalMargin?.value) {
              newBlock.replication.verticalMargin =
                  `${me.block.replication?.verticalMargin?.value}${me.block.replication?.verticalMargin?.type || SizeTypes.PIXEL}`
            }
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
      this.block.isLoading = false
    },

    setParent (): void {
      this.parentBlock = this.block.parentGuid ? this.getStore().getByGuid(this.block.parentGuid) : undefined
      this.parentElement = this.block.parentGuid ? this.$parent?.$refs.draggableContainer as Element : undefined
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

        if (this.tabSettingsService.getIsBlocked(tab.guid)) {
          style += '; color: gray; cursor: not-allowed; '
        }
      }

      return style
    },

    getDefaultTab (): string | null {
      if (!this.block?.tabs?.use || this.block?.tabs?.list?.length === 1) {
        return null
      }

      let tabs = this.block.tabs.list
      for (let i = 0; i < tabs.length; i++) {
        const currentTab = tabs[i]
        if (this.tabSettingsService) {
          const isDefault = this.tabSettingsService.getIsDefaultTab(currentTab.guid)
          if (isDefault) {
            return currentTab.guid
          }
        }
      }

      return null
    },

    onTabClick (guid: string) {
      if (this.tabSettingsService && this.tabSettingsService.getIsBlocked(guid)) {
        return
      }
      this.$emit('tab-click', { guid })
      this.activeTabGuid = guid
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
.block .visibility {
    margin-left: -9999px;
    visibility: hidden;
    min-height: 0px !important;
    height: 0px !important;
  /*opacity: 0;*/
  /* display: none; */
}
.block .scroll_hover {
  scrollbar-color: transparent white; /* thumb and track color  for fireFox*/
  transition: scrollbar-color 0.3s ease-out;
}
.block .scroll_hover:hover {
  scrollbar-color: rgba(144,147,153,.3) white; /* thumb and track color  for fireFox*/
}
.block .scroll_hover:hover::-webkit-scrollbar-thumb {
  background-color: rgba(144,147,153,.3);
}
.block .scroll_hover::-webkit-scrollbar-thumb {
  background-color: transparent;
  transition: background-color 0.3s ease-out; /* transition not working for chrome*/
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
