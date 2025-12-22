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
            <i class="plus"
               :class="{'el-icon-arrow-right': !tab.data.isExpanded, 'el-icon-arrow-down': tab.data.isExpanded}"></i>
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
          :class="[
          (_block.parentTabGuid === activeTabGuid) ? '' : 'visibility',
          { 'active_block': _block.guid === activeBlockGuid }
        ]"
          :ref="_block.guid"
          :key="_block.guid"
          :is-showing="isShowChildren && _block.parentTabGuid === activeTabGuid && !_block.isHidden"
          :block="_block"
          :replication-callback="replicationCallback"
          :tab-settings-service="tabSettingsService"
          @click="handleClick({ block: $event.block || _block, event: $event.event || $event })"
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
import BlockDTO from '../../domain/model/BlockDTO'
// eslint-disable-next-line no-unused-vars
import ResizeObserver from 'resize-observer-polyfill'
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAngleDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'

import StyleMixin from '@/infrastructure/components/mixins/StyleMixin'
import ReplicationMixin from '@/infrastructure/components/mixins/ReplicationMixin'
import StretchedMixin from '@/infrastructure/components/mixins/StretchedMixin'

const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
library.add(faAngleDown, faChevronRight, faChevronLeft)
export default Vue.extend({
  name: 'PreviewBlock',
  mixins: [StyleMixin, ReplicationMixin, StretchedMixin],

  components: {
    FontAwesomeIcon
  },

  inject: {
    getStore: {
      default: () => () => {
      }
    },
    mainBlockSelector: {
      default: null
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
    activeTabGuid?: string,
    tabsOffset: number,
    blockWidth: number,
    tabsWidth: number,
    isShowArrows: boolean,
    visitedTabGuids: string[],
    activeBlockGuid?: string
    } {
    return {
      activeTabGuid: undefined,
      tabsOffset: 0,
      blockWidth: 0,
      tabsWidth: 0,
      isShowArrows: false,
      visitedTabGuids: [],
      activeBlockGuid: ''
    }
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
            if (tabs[guid].isChild) {
              // isExpanded если есть expandChildrenByDefault
              tabs[guid].isExpanded = this.tabSettingsService.getExpandChildren(guid)
            }
            // является первым уровнем и есть потомок - вкладку показывать при иницилизации
            if (!tabs[guid].parentTabForTree && parentKeys[guid]) {
              tabs[guid].isShow = true
            }
            // есть родитель, является потомком - вкладку не показывать при иницилизации
            if (tabs[guid].parentTabForTree) {
              tabs[guid].isShow = false
            }
            // показать вкладки, если expandChildrenByDefault и есть родитель
            if (tabs[guid].parentTabForTree) {
              const parentGuid = tabs[guid].parentTabForTree
              if (tabs[parentGuid]?.expandChildrenByDefault) {
                tabs[guid].isShow = true
              }
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

    isTabsContainer (): boolean {
      return this.block.tabs?.use || false
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
    this.$nextTick(() => {
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
    this.block.isLoading = false
    this.prepareReplication()
    this.getStore().addRef(this.block.guid, this)
  },

  beforeDestroy () {
    this.getStore().removeRef(this.block.guid)
  },

  methods: {
    handleClick (event: { block: any, event: Event }) {
      this.$emit('click', event)
      this.activeBlockGuid = event.block.guid
    },
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
  scrollbar-color: rgba(144, 147, 153, .3) white; /* thumb and track color  for fireFox*/
}

.block .scroll_hover:hover::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, .3);
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

.tabs_container .positionTab > div:first-child {
  position: absolute;
  top: 50%;
  left: 4%;
  transform: translate(0%, -50%);
}
</style>
