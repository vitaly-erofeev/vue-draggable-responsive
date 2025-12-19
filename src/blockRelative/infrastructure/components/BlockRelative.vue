<template>
  <div
    :style="blockContentStyle"
    :class="{
      'block-relative': true,
      'active': block.isActive,
      'active_parent': block.isActiveAsParent,
      'hidden': block.isHidden,
      [block.className]: !!block.className
    }"
    :data-guid="block.guid.slice(0, 8)"
    @click.stop="setActiveBLock(block)"
  >
  <!-- <pre>{{ block }}</pre> -->
    <slot :block="block" name="content"></slot>

    <!-- Потомки -->
    <block-relative
      v-for="child in block.children"
      :key="child.guid"
      :ref="child.guid"
      :block="child"
      :show-hidden="showHidden"
      @set-active-block="$emit('set-active-block', $event)"
    >
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </block-relative>
    <!-- Ресайзер -->
    <Resizer
      v-if="isShowResizer"
      :width.sync="block.width"
      :height.sync="block.height"
      @update:width="block.width = $event"
      @update:height="block.height = $event" />
  </div>

</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from 'e:/vue-draggable-responsive/src/infrastructure/domain/model/DataSourceInjected'
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
import Resizer from 'e:/vue-draggable-responsive/src/blockRelative/shared/ui/Resizer.vue'
// const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
// export default Vue.extend({
export default {

  name: 'BlockRelative',
  components: { Resizer },
  props: {
    block: {
      type: Object as () => BlockDTOV2,
      required: true
    },
    showHidden: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    setActiveBLock (block: BlockDTOV2) {
      console.log('set-active-block', block.guid)
      this.$emit('set-active-block', block)
    }
  },
  computed: {
    isShowResizer () {
      return this.block.sizeTypes.width === 'px' && this.block.sizeTypes.height === 'px' && this.block.isActive
    },
    objectStyle () {
      const styleArray = (this.block.style || '').split(';').map(pair => pair.replace(/\n/g, '').trim())
      return styleArray.reduce((acc, item) => {
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
      result.paddingLeft = this.block.customStyles.paddingLeft || '0px'
      result.paddingRight = this.block.customStyles.paddingRight || '0px'
      result.paddingTop = this.block.customStyles.paddingTop || '0px'
      result.paddingBottom = this.block.customStyles.paddingBottom || '0px'
      result.display = this.block.customStyles.display || 'block'
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
  outline: 1px solid rgb(70 52 156 / 47%);
  overflow: auto;
  /* margin: 8px; */
  display: inline-block;
  cursor: pointer;
}
.block-relative:hover {
  outline: 2px solid rgb(52, 156, 69);
}
.block-relative.active {
  /* background: rgb(87 177 102); */
  outline: 3px solid rgb(52, 156, 69);
}
.block-relative.active_parent {
  /* background: rgba(37, 134, 179, 0.336); */
  outline: 2px solid rgb(37, 134, 179);
}
.block-relative .block_info {
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  /*background: #e2e2e2;*/
  display: inline-block;
  position: absolute;
  right: 3px;
  top: 3px;
  border-radius: 3px;
  padding: 3px;
  color: rgba(71, 135, 218, 0.116);
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
  outline: 1px dashed #E94435;
}
</style>
