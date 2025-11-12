<template>
  <div
    class="block-relative"
    :style="{
      width: block.width + 'px',
      height: block.height + 'px',
    }"
    @click="$emit('set-active-block', block.guid)"
  >
  {{ block.width }} x {{ block.height }}

    <!-- Потомки -->
    <block-relative
      v-for="child in block.children"
      :key="child.guid"
      :ref="child.guid"
      :block="child"
    />

    <!-- Ресайзер -->
    <Resizer :width.sync="block.width" :height.sync="block.height" />
  </div>

</template>

<script lang="ts">
// import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
import Resizer from 'e:/vue-draggable-responsive/src/blockRelative/shared/ui/Resizer.vue'

// export default Vue.extend({
export default {

  name: 'BlockRelative',
  components: { Resizer },
  props: {
    block: {
      type: Object as () => BlockDTOV2,
      required: true
    }
  }
}

// })
</script>

<style scoped>
.block-relative {
  position: relative;
  outline: 1px solid rgb(52, 156, 69);
  margin: 8px;
  display: inline-block;
  cursor: pointer;
}
.block-relative:hover {
  outline: 2px solid rgb(52, 156, 69);
}
</style>
