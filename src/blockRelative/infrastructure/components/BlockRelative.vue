<template>
  <div
    :class="{
      'block-relative': true,
      'active': block.isActive,
      'active_parent': block.isActiveAsParent,
    }"
    :style="{
      width: block.width + 'px',
      height: block.height + 'px',
    }"
    @click.stop="setActiveBLock(block)"
  >
  {{ block.width }} x {{ block.height }}

    <!-- Потомки -->
    <block-relative
      v-for="child in block.children"
      :key="child.guid"
      :ref="child.guid"
      :block="child"
      @set-active-block="$emit('set-active-block', $event)"
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
  },
  methods: {
    setActiveBLock (block: BlockDTOV2) {
      console.log('set-active-block', block.guid)
      this.$emit('set-active-block', block)
    }
  }
}

// })
</script>

<style scoped>
.block-relative {
  position: relative;
  outline: 1px solid rgb(70 52 156 / 47%);
  margin: 8px;
  display: inline-block;
  cursor: pointer;
}
.block-relative:hover {
  outline: 2px solid rgb(52, 156, 69);
}
.block-relative.active {
  background: rgb(87 177 102);
  outline: 3px solid rgb(52, 156, 69);
}
.block-relative.active_parent {
  background: rgba(37, 134, 179, 0.336);
  outline: 2px solid rgb(37, 134, 179);
}
</style>
