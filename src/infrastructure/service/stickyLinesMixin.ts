import { Sticky } from 'e:/vue-draggable-responsive/src/domain/model/Sticky'
import { StickyToType } from 'e:/vue-draggable-responsive/src/domain/model/StickyTo'
import Vue from 'vue'
import BlockDTO from 'e:/vue-draggable-responsive/src/domain/model/BlockDTO'

export default Vue.extend({
  props: {
    block: {
      type: BlockDTO
    }
  },
  computed: {
    stickyLines () {
      if (!this.block?.isActiveAsParent && !this.block?.isActive) {
        return []
      }
      let blocks = this.block.children
      if (!blocks) {
        return []
      }
      let answer: {
                x1: string, y1: string, x2: string, y2: string, type: StickyToType
            }[] = []
      blocks.filter((item) => item.stickyTo?.guid !== 'undefined').forEach((item) => {
        if (!item.stickyTo?.guid || item.sticky !== Sticky.TL) {
          return false
        }
        let stickyElm = ((this.$refs[item.stickyTo.guid] as unknown as Array<{
                    positionStyle: {
                        top: string;
                        height: string;
                        left: string;
                        width: string;
                    };
                }>) || [])[0] || null
        let elm = ((this.$refs[item.guid] as unknown as Array<{
                    positionStyle: {
                        top: string;
                        height: string;
                        left: string;
                        width: string;
                    }
                }>) || [])[0] || null
        if (!elm || !stickyElm) {
          return false
        }
        if (item.stickyTo.type === StickyToType.TOP) {
          answer.push({
            x1: `calc(${elm.positionStyle.left} + calc(${elm.positionStyle.width} / 2))`,
            y1: elm.positionStyle.top,
            x2: `calc(${stickyElm.positionStyle.left} + calc(${stickyElm.positionStyle.width} / 2))`,
            y2: `calc(${stickyElm.positionStyle.top} + ${stickyElm.positionStyle.height})`,
            type: StickyToType.TOP
          })
        } else if (item.stickyTo.type === StickyToType.LEFT) {
          answer.push({
            x1: elm.positionStyle.left,
            y1: `calc(${elm.positionStyle.top} + calc(${elm.positionStyle.height} / 2))`,
            x2: `calc(${stickyElm.positionStyle.left} + ${stickyElm.positionStyle.width})`,
            y2: `calc(${stickyElm.positionStyle.top} + calc(${stickyElm.positionStyle.height} / 2))`,
            type: StickyToType.LEFT
          })
        }
      })

      return answer
    }
  }
})
