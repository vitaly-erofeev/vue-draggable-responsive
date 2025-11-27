<template>
  <div id="app" style="height: 100%">
    <div style="width: 20%;display:inline-block;float: left;height: 100%; overflow: auto">
      <button @click="addContainer(0)">add</button>
      <button @click="addContainer(1, $event)">addT</button>
      <button @click="addContainer(1, $event, true)">addStretched</button>
      <button @click="addChildren">addChild</button>
      <button @click="load">load</button>
      <button @click="addSticky($event)">addSticky</button>
      <button @click="get">get</button>
      <button @click="addWithTabs(1, $event)">addWithTabs</button>
      <button @click="addTab">addTab</button>
      <button @click="removeTab">removeTab</button>
      <button @click="preview = !preview">preview: {{ preview }}</button>
      <button @click="remove">remove active</button>
      <button @click="clearActive">clear active</button>
      <button @click="addReplication(1, $event)">add replication</button>
      <button @click="toggleHide">toggle hide</button>
      <button @click="switchWidth">switch width</button>
      <button @click="switchSticky">sticky</button>
      <button @click="addContainerPercent(1, $event)">percent container</button>
      <button @click="addContainerPixel(1, $event)">pixel container</button>
      <button @click="addMinMax()">add min_max</button>
      <button @click="addHorizontalCenter()">add hor center</button>
      <button @click="addVerticalCenter()">add ver center</button>
      <button @click="disableMove">disable move</button>
      <button @click="showHidden = !showHidden">toggle show hidden: {{showHidden}}</button>
      <select v-model="(activeBlock || {}).sticky">
        <option value="tr">Top-Right</option>
        <option value="tl">Top-Left</option>
        <option value="br">Bottom-Right</option>
        <option value="bl">Bottom-Left</option>
      </select>
      <pre>{{ activeBlock }}</pre>
    </div>
    <vue-draggable-responsive
        ref="designer"
        style="height: 500px;width: 1059px;display: inline-block"
        :step="1"
        :show-hidden="showHidden"
        @start-drag="onStartDrag"
        v-show="!preview"
        @contextmenu="oncontext"
    >
      <template v-slot:content="{ block }">
        {{ block.guid }}
      </template>
    </vue-draggable-responsive>
    <vue-draggable-responsive-previewer
        v-if="preview"
        ref="previewer"
        style="height: 500px;width: 1059px;display: inline-block"
        :replication-callback="cl"
    >
      <template v-slot:content="{ block }">
        {{ block.guid }}
      </template>
    </vue-draggable-responsive-previewer>
  </div>
</template>

<script>
import VueDraggableResponsive from './index.vue'
import VueDraggableResponsivePreviewer from '@/previewer.vue'
import { StickyToType } from '@/domain/model/StickyTo'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { TabPosition } from '@/domain/model/TabProperties'

export default {
  name: 'App',
  components: {
    VueDraggableResponsivePreviewer,
    VueDraggableResponsive
  },
  data () {
    return {
      activeBlock: undefined,
      preview: false,
      blocks: [],
      showHidden: false
    }
  },
  watch: {
    preview (value) {
      if (value) {
        this.blocks = this.$refs.designer.getBlocks()
        this.$nextTick(() => {
          this.$refs.previewer.setBlocks(this.blocks)
        })
      }
    }
  },
  methods: {
    addVerticalCenter () {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        onCenter: {
          vertical: true
        },
        sizeTypes: {
          width: '%',
          height: '%',
          top: 'px',
          left: '%'
        }
      })
    },
    addHorizontalCenter () {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        onCenter: {
          horizontal: true
        },
        sizeTypes: {
          width: '%',
          height: '%',
          top: 'px',
          left: '%'
        }
      })
    },
    addMinMax () {
      this.$refs.designer.addBlock({
        width: 100,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        minMax: {
          maxWidth: 200
        },
        onCenter: {
          horizontal: true
        },
        sizeTypes: {
          width: '%',
          height: '%',
          top: 'px',
          left: '%'
        }
      })
    },
    cl (event) {
      console.log(event)
    },
    switchSticky () {
      if (this.activeBlock) {
        if (this.activeBlock.stickyTo?.guid) {
          this.activeBlock.stickyTo.guid = undefined
          return false
        }
        let block = this.$refs.designer.getBlocks().filter((item) => item.guid !== this.activeBlock.guid)[0]
        this.activeBlock.stickyTo = {
          guid: block.guid,
          type: StickyToType.TOP
        }
      }
    },
    toggleHide () {
      if (this.activeBlock) {
        this.activeBlock.isHidden = !this.activeBlock.isHidden
      }
    },
    addReplication (type, event) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        type,
        sizeTypes: {
          width: 'px',
          height: 'px',
          top: 'px',
          left: 'px'
        },
        event,
        parentGuid: this.activeBlock?.guid,
        className: 'red',
        replication: {
          columns: 1,
          function: async () => {
            const count = 7
            let counter = 0
            let answer = []
            while (count > counter) {
              answer.push({ id: counter + 1 })
              counter++
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
            return answer
          },
          verticalMargin: {
            type: 'px',
            value: 20
          },
          horizontalMargin: {
            type: 'px',
            value: 20
          }
        }
      })
    },
    clearActive () {
      this.$refs.designer.clearActiveBlock()
      this.activeBlock = undefined
    },
    oncontext (a) {
      console.log(a)
    },
    removeTab () {
      if (this.activeBlock) {
        if (this.activeBlock.tabs?.use) {
          this.activeBlock.tabs.list.splice(0, 1)
        }
      }
    },
    addTab () {
      if (this.activeBlock) {
        if (!this.activeBlock.tabs) {
          this.$set(this.activeBlock, 'tabs', {
            use: false,
            list: [],
            position: TabPosition.TOP
          })
        }
        this.activeBlock.tabs.use = true
        if (this.activeBlock.tabs?.use) {
          this.activeBlock.tabs.list.push({
            name: `Новая вкладка - ${this.activeBlock.tabs.list.length}`,
            guid: Date.now()
          })
        }
      }
    },
    disableMove () {
      this.$set(this.activeBlock, 'disabledMove', !(this.activeBlock.disabledMove || false))
    },
    switchWidth () {
      if (!this.activeBlock) {
        return false
      }
      this.activeBlock.sizeTypes.bottom = this.activeBlock.sizeTypes.bottom ===
      SizeTypes.PERCENT ? SizeTypes.PIXEL : SizeTypes.PERCENT
    },
    addWithTabs (type, event) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        type,
        event,
        isStretched: true,
        tabs: {
          class: 'test',
          use: true,
          containerStyle: 'background: grey',
          tabStyle: 'color:black',
          tabArrowsClass: 'testArr',
          activeTabStyle: 'color:green',
          requiredTabs: ['asdasdas'],
          list: [
            {
              guid: 'asdasdas',
              name: 'test'
            },
            {
              guid: 'asdasdas2',
              name: 'test2'
            }
          ],
          position: 'top'
        }
      })
    },
    load () {
      this.activeBlock = undefined
      this.$refs.designer.setBlocks([
        {
          'isStretched': true,
          'isActive': true,
          'isActiveAsParent': false,
          'tabs': {
            'class': 'test',
            'use': true,
            'containerStyle': 'background: grey',
            'tabStyle': 'color:black',
            'tabArrowsClass': 'testArr',
            'activeTabStyle': 'color:green',
            'list': [
              {
                'guid': 'asdasdas',
                'name': 'test'
              },
              {
                'guid': 'asdasdas2',
                'name': 'test2'
              }
            ],
            'position': 'top',
            'activeGuid': 'asdasdas'
          },
          'isHover': false,
          'isHidden': false,
          'top': 22,
          'right': 82,
          'bottom': 91,
          'left': 9,
          'sticky': 'tl',
          'sizeTypes': {
            'width': '%',
            'height': '%',
            'top': '%',
            'right': '%',
            'bottom': '%',
            'left': '%'
          },
          'children': [
            {
              'isStretched': false,
              'isActive': false,
              'isActiveAsParent': false,
              'isHover': false,
              'isHidden': false,
              'top': 81.109375,
              'right': 78,
              'bottom': 488,
              'left': 10,
              'sticky': 'tl',
              'sizeTypes': {
                'width': '%',
                'height': 'px',
                'top': 'px',
                'left': '%',
                'right': '%',
                'bottom': '%'
              },
              onCenter: {
                horizontal: true,
                vertical: true
              },
              'children': [],
              'width': 70,
              'height': 100,
              'guid': '3bb941e8-996e-45f6-afce-1bfcc95e4bcd',
              'parentGuid': 'f5cd4eaf-0005-482a-87aa-b34aa1e0ab1b',
              'parentTabGuid': 'asdasdas',
              'isEditing': false
            },
            {
              'isStretched': false,
              'isActive': false,
              'isActiveAsParent': false,
              'isHover': false,
              'isHidden': false,
              'top': 62.109375,
              'right': 76,
              'bottom': 490,
              'left': 14,
              'sticky': 'tl',
              'sizeTypes': {
                'width': '%',
                'height': 'px',
                'top': 'px',
                'left': '%',
                'right': '%',
                'bottom': '%'
              },
              'children': [],
              'width': 70,
              'height': 100,
              'guid': '3e22f8e6-a83c-4387-bdd3-441611917bc9',
              'parentGuid': 'f5cd4eaf-0005-482a-87aa-b34aa1e0ab1b',
              'parentTabGuid': 'asdasdas2',
              'isEditing': false
            }
          ],
          'width': 84,
          'height': 55,
          'guid': 'f5cd4eaf-0005-482a-87aa-b34aa1e0ab1b',
          'isEditing': false
        },
        {
          'top': 9,
          'guid': '528bc98d-e443-4830-add6-596e22b981b1',
          'left': 21,
          'right': 48,
          'width': 10,
          'bottom': 60,
          'height': 10,
          'sticky': 'tl',
          'heightCalc': {
            type: '-',
            value: 200
          },
          'children': [],
          'sizeTypes': {
            'top': '%',
            'left': '%',
            'right': '%',
            'width': '%',
            'bottom': '%',
            'height': '%'
          }
        },
        {
          'top': 16,
          'guid': 'a7a8f391-0973-4d6b-a9d9-ab9bca5f9de6',
          'left': 62,
          'right': 39,
          'style': 'background:red',
          'width': 10,
          'bottom': 65,
          'height': 10,
          'sticky': 'tl',
          'children': [],
          'sizeTypes': {
            'top': '%',
            'left': '%',
            'right': '%',
            'width': '%',
            'bottom': '%',
            'height': '%'
          }
        }
      ])
    },
    remove () {
      if (this.activeBlock) {
        this.$refs.designer.removeBlock(this.activeBlock.guid)
        this.activeBlock = undefined
      }
    },
    get () {
      console.log(this.$refs.designer.getBlocks())
    },
    onStartDrag (block) {
      this.activeBlock = block
      this.$refs.designer.setActiveBlock(block.guid)
    },
    addSticky (event) {
      if (this.activeBlock) {
        this.$refs.designer.addBlock({
          width: 40,
          height: 100,
          top: 10,
          left: 20,
          sticky: 'tl',
          parentGuid: this.activeBlock.parentGuid,
          sizeTypes: {
            width: '%',
            height: 'px',
            top: 'px',
            left: '%'
          },
          stickyTo: {
            guid: this.activeBlock.guid,
            type: StickyToType.TOP
          },
          event,
          type: 1
        })
      }
    },
    addContainer (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 100,
        top: 30,
        right: 0,
        className: 'green',
        sticky: 'tl',
        sizeTypes: {
          width: '%',
          height: 'px',
          top: 'px',
          left: '%'
        },
        type,
        event,
        isStretched
      })
    },
    addContainerPixel (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 100,
        top: 30,
        right: 0,
        sticky: 'tl',
        sizeTypes: {
          width: 'px',
          height: 'px',
          top: 'px',
          left: 'px',
          right: 'px',
          bottom: 'px'
        },
        type,
        event,
        isStretched
      })
    },
    addContainerPercent (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 100,
        top: 30,
        right: 0,
        sticky: 'tl',
        sizeTypes: {
          width: '%',
          height: '%',
          top: '%',
          left: '%'
        },
        type,
        event,
        isStretched
      })
    },
    addChildren (event) {
      this.$refs.designer.addBlock(
        {
          width: 70,
          height: 100,
          sizeTypes: {
            width: '%',
            height: 'px',
            top: 'px',
            left: '%'
          },
          top: 30,
          left: 20,
          parentGuid: this.activeBlock.guid,
          type: 1,
          event: event
        }
      )
    }
  }
}
</script>

<style>
.red {
  background: transparent;
}
.green {
  background: transparent;
}
</style>
