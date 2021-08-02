<template>
  <div id="app" style="height: 100%">
    <div style="width: 20%;display:inline-block;float: left;height: 100%; overflow: auto">
      <button @click="addContainer(0)">add</button>
      <button @click="addContainer(1, $event)">addT</button>
      <button @click="addContainer(1, $event, true)">addStretched</button>
      <button @click="addChildren">addChild</button>
      <button @click="load">load</button>
      <button @click="addSticky">addSticky</button>
      <button @click="get">get</button>
      <button @click="addWithTabs(1, $event)">addWithTabs</button>
      <button @click="removeTab">removeTab</button>
      <button @click="preview = !preview">preview: {{ preview }}</button>
      <button @click="remove">remove active</button>
      <pre>{{ activeBlock }}</pre>
    </div>
    <vue-draggable-responsive
        ref="designer"
        style="height: 500px;width: 1059px;display: inline-block"
        :step="1"
        @start-drag="onStartDrag"
        v-show="!preview"
    >
      <template v-slot:content="{ block }">
        {{ block }}
      </template>
    </vue-draggable-responsive>
    <vue-draggable-responsive-previewer
        v-if="preview"
        ref="previewer"
        style="height: 500px;width: 1059px;display: inline-block"
    >
      <template v-slot:content="{ block }">
        {{ block }}
      </template>
    </vue-draggable-responsive-previewer>
  </div>
</template>

<script>
import VueDraggableResponsive from './index.vue'
import VueDraggableResponsivePreviewer from '@/previewer'

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
      blocks: []
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
    removeTab () {
      if (this.activeBlock) {
        if (this.activeBlock.tabs?.use) {
          this.activeBlock.tabs.list.splice(0, 1)
        }
      }
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
        tabs: {
          use: true,
          containerStyle: 'background: grey',
          tabStyle: 'color:red',
          activeTabStyle: 'color:green',
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
          position: 'right'
        }
      })
    },
    load () {
      this.activeBlock = undefined
      this.$refs.designer.setBlocks([
        {
          'top': 27,
          'guid': '4488bb6c-ba9b-44dd-97e0-e51c23fcf224',
          'left': 24,
          'right': 37,
          'width': 20,
          'bottom': 85,
          'height': 20,
          'sticky': 'tl',
          'children': [],
          'style': 'background:red',
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
          'top': 9,
          'guid': '528bc98d-e443-4830-add6-596e22b981b1',
          'left': 21,
          'right': 48,
          'width': 10,
          'bottom': 60,
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
    addSticky () {
      if (this.activeBlock) {
        this.$refs.designer.addBlock({
          width: 40,
          height: 10,
          top: 10,
          left: 20,
          sticky: 'tl',
          stickyToGuid: this.activeBlock.guid
        })
      }
    },
    addContainer (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        type,
        event,
        isStretched
      })
    },
    addChildren () {
      this.$refs.designer.addBlock(
        {
          width: 70,
          height: 10,
          top: 30,
          left: 20,
          parentGuid: this.activeBlock.guid
        }
      )
    }
  }
}
</script>

<style>
</style>
