<template>
  <!-- <div
    ref="draggableContainer"
    :class="['block-relative', block.className]"
  > -->
    <div
      ref="container"
       :class="['content custom_scrollbar', block.className]"
      :style="blockContentStyle"
      :data-guid="block.guid.slice(0, 8)"
      @click.stop="setActiveBLock(block)"
    >
      <!-- <div class="block_info">
        <slot :block="block" name="help_text">
          <pre>{{ block }}</pre>
        </slot>
      </div> -->
      <slot :block="block" name="content"></slot>

      <!-- Потомки -->
      <block-relative-preview
        v-for="child in block.children"
        :key="child.guid"
        :ref="child.guid"
        :block="child"
        @set-active-block="$emit('set-active-block', $event)"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data"></slot>
        </template>
      </block-relative-preview>
    </div>
  <!-- </div> -->
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from 'e:/vue-draggable-responsive/src/infrastructure/domain/model/DataSourceInjected'
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
// export default Vue.extend({
export default {
  name: 'blockRelativePreview',
  props: {
    block: {
      type: Object as () => BlockDTOV2,
      required: true
    }
  },
  methods: {
    setActiveBLock (block: BlockDTOV2) {
      this.$emit('set-active-block', block)
    }
  },
  computed: {
    objectStyle () {
      return (this.block.style || '').split(';').reduce((acc, item) => {
        const [key, value] = item.split(':')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
    },
    blockContentStyle () {
      const result: Record<string, string> = {}
      result.width = `${this.block.width}${this.block.sizeTypes.width === 'auto' ? '' : this.block.sizeTypes.width}`
      result.height = `${this.block.height}${this.block.sizeTypes.height === 'auto' ? '' : this.block.sizeTypes.height}`
      result.marginLeft = this.block.customStyles.marginLeft || '0px'
      result.marginRight = this.block.customStyles.marginRight || '0px'
      result.marginTop = this.block.customStyles.marginTop || '0px'
      result.marginBottom = this.block.customStyles.marginBottom || '0px'
      Object.assign(result, this.objectStyle)

      return result
    }
  }
}

// })
</script>

<style scoped>
.block-relative {
  position: relative;
  overflow: auto;
}
.content {
  position: relative;
  overflow: auto;
  display: inline-block;
}
.block-relative .block_info {
  font-size: 16px;
  font-family: "Roboto", sans-serif;
  background: #e2e2e2;
  display: inline-block;
  position: absolute;
  right: 3px;
  top: 3px;
  border-radius: 3px;
  padding: 3px;
  color: rgb(0, 0, 0);
  font-weight: 400;
  z-index: 9999;
  height: 90%;
  width: 50%;
  overflow: auto;
}

.block-relative .block_info:empty {
  display: none;
}
.block-relative.hidden {
  outline: 1px dashed #e94435;
}
</style>
