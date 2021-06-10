<template>
  <div class="container">
    <preview-block
        v-for="(block, index) in blocks"
        :key="index"
        :block="block"
        :ref="block.guid"
        :style="block.style"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </preview-block>
  </div>
</template>

<script lang="ts">
import PreviewBlock from '@/infrastructure/components/PreviewBlock.vue'
// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
export default {
  name: 'VueDraggableResponsivePreviewer',
  components: { PreviewBlock },
  props: {
    blocks: {
      type: Array as Vue.PropType<object[]>,
      default: () => []
    }
  }
}
</script>

<style scoped>
.container {
  position: relative;
}
</style>
