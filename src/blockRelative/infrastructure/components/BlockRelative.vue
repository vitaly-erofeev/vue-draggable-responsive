<template>
  <div
    class="block-relative"
    :style="{
      width: block.width + 'px',
      height: block.height + 'px',
    }"
  >
  {{ block.width }} x {{ block.height }}

    <!-- Потомки -->
    <!-- <block-relative
      v-for="child in block.children"
      :key="child.guid"
      :ref="child.guid"
      :block="child"
    /> -->

    <!-- Ресайзер -->
    <!-- <Resizer :width.sync="block.width" :height.sync="block.height" /> -->
  </div>

</template>

<script lang="ts">
// import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
// import { BlockPropertiesV2 } from 'e:/vue-draggable-responsive/src/blockRelative/domain/model/RelativeBlockProperties'
// import Resizer from 'e:/vue-draggable-responsive/src/blockRelative/shared/ui/Resizer.vue'

// export default Vue.extend({
export default {

  name: 'BlockRelative',
  // components: { Resizer },
  props: {
    block: {
      // type: Object as () => BlockPropertiesV2,
      type: Object,
      required: true
    }
  }
}

// })
</script>

<style scoped>
.block-relative {
  position: relative;
  outline: 1px solid red;
  margin: 8px;
}
</style>
