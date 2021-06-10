<template>
  <div id="app" style="height: 100%">
    <div style="width: 20%;display:inline-block;float: left;height: 100%; overflow: auto">
      <button @click="addContainer(0)">add</button>
      <button @click="addContainer(1, $event)">addT</button>
      <button @click="addChildren">addChild</button>
      <button @click="addSticky">addSticky</button>
      <button @click="get">get</button>
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
        v-show="preview"
        :blocks="blocks"
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
      activeBlock: null,
      preview: false,
      blocks: []
    }
  },
  watch: {
    preview (value) {
      if (value) {
        this.blocks = this.$refs.designer.getBlocks()
      }
    }
  },
  methods: {
    remove () {
      if (this.activeBlock) {
        this.$refs.designer.removeBlock(this.activeBlock.guid)
      }
    },
    get () {
      console.log(this.$refs.designer.getBlocks())
    },
    onStartDrag (block) {
      this.activeBlock = block
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
    addContainer (type, event) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        type,
        event
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
