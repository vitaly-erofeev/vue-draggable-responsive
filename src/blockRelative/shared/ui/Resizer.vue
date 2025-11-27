<template>
  <div
    class="resizer"
    @mousedown="startResize"
  ></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
// export default {
  name: 'Resizer',
  props: {
    width: Number,
    height: Number
  },
  data () {
    return {
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      resizing: false
    }
  },
  methods: {
    startResize (e: MouseEvent) {
      e.stopPropagation()
      this.resizing = true
      this.startX = e.clientX
      this.startY = e.clientY
      this.startWidth = this.width || 100
      this.startHeight = this.height || 100

      document.addEventListener('mousemove', this.resize)
      document.addEventListener('mouseup', this.stopResize)
    },
    resize (e: MouseEvent) {
      if (!this.resizing) return
      const newWidth = this.startWidth + (e.clientX - this.startX)
      const newHeight = this.startHeight + (e.clientY - this.startY)
      this.$emit('update:width', Math.max(50, newWidth))
      this.$emit('update:height', Math.max(50, newHeight))
    },
    stopResize () {
      this.resizing = false
      document.removeEventListener('mousemove', this.resize)
      document.removeEventListener('mouseup', this.stopResize)
    }
  }
})
// }
</script>

<style scoped>
.resizer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  background: #007bff;
  cursor: se-resize;
  border-radius: 2px;
}
</style>
