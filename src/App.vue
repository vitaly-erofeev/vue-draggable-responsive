<template>
  <div id="app" style="height: 100%">
    <interface-designer
        ref="designer"
        style="height: 500px;width: 1059px;display: inline-block"
        :step="1"
        @start-drag="onStartDrag"
    />
    <div style="width: 20%;display:inline-block;float: right;height: 100%; overflow: auto">
      <button @click="addContainer">add</button>
      <button @click="addChildren">addChild</button>
      <button @click="addSticky">addSticky</button>
      <button @click="get">get</button>
      <pre>{{ activeBlock }}</pre>
    </div>
  </div>
</template>

<script>
import InterfaceDesigner from './components/InterfaceDesigner'

export default {
  name: 'App',
  components: {
    InterfaceDesigner
  },
  data () {
    return {
      activeBlock: null
    }
  },
  methods: {
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
    addContainer () {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl'
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
