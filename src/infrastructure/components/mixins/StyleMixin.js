import { Sticky } from '@/domain/model/Sticky'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { StickyToType } from '@/domain/model/StickyTo'
import { stickyManager } from '@/infrastructure/service/StickyManager'

export default {
  data () {
    return {
      parentBlock: undefined,
      parentElement: undefined,
      stickyToBlock: undefined,
      stickyToElement: undefined
    }
  },
  beforeDestroy () {
    stickyManager.removeBlock(this.block.guid)
  },
  mounted () {
    this.setParent()
    this.$nextTick(() => {
      this.setSticky(this.block?.stickyTo?.guid)
    })
    console.log(stickyManager)
  },
  computed: {
    zIndex () {
      // console.count(`zIndex ${this.block.guid}`)
      const startIndex = 101
      if (!this.block.parentGuid) {
        return startIndex + (this.block.tabs?.use ? 1 : 0)
      }
      let parentRef = this.getStore().getRefByGuid(this.block.parentGuid)

      if (!parentRef) {
        return startIndex
      }

      return parentRef.zIndex + 1 + (this.block.tabs?.use ? 1 : 0)
    },
    defaultPosition () {
      // console.count(`defaultPosition ${this.block.guid}`)
      let position = {}
      let top
      let left

      switch (this.block.sticky) {
        case Sticky.TL:
          top = this.block.top + this.block.sizeTypes.top
          left = this.block.left + this.block.sizeTypes.left
          position = {
            top: top,
            left: left
          }
          break
        case Sticky.TR:
          position = {
            top: this.block.top + this.block.sizeTypes.top,
            right: this.block.right + this.block.sizeTypes.right
          }
          break
        case Sticky.BL:
          position = {
            bottom: this.block.bottom + this.block.sizeTypes.bottom,
            left: this.block.left + this.block.sizeTypes.left
          }
          break
        case Sticky.BR:
          position = {
            bottom: this.block.bottom + this.block.sizeTypes.bottom,
            right: this.block.right + this.block.sizeTypes.right
          }
          break
        default:
          position = {
            top: this.block.top + this.block.sizeTypes.top,
            left: this.block.left + this.block.sizeTypes.left
          }
          break
      }

      if (this.block.stickyTo?.guid) {
        if (this.block.stickyTo.type === StickyToType.TOP) {
          delete position.top
        } else if (this.block.stickyTo?.type === StickyToType.LEFT) {
          delete position.left
        }
      }

      return position
    },
    positionStyle: function () {
      // console.count(`positionStyle ${this.block.guid}`)

      let height = this.block.height + this.block.sizeTypes.height
      let width = this.block.width + this.block.sizeTypes.width
      let position = { ...this.defaultPosition }

      if (this.block.replication?.topBlockGuid) {
        const stickyToElement = this.getStore().getRefByGuid(this.block.replication?.topBlockGuid)

        if (stickyToElement) {
          position.top =
            `calc(${stickyToElement.positionStyle.height} + ${stickyToElement.positionStyle.top} + ${this.block.replication?.verticalMargin})`
        }
      }

      if (this.block.widthCalc && this.block.widthCalc.type && this.block.widthCalc.value) {
        width = `calc(${width} ${this.block.widthCalc.type} ${this.block.widthCalc.value}px)`
      }
      if (this.block.heightCalc && this.block.heightCalc.type && this.block.heightCalc.value) {
        height = `calc(${height} ${this.block.heightCalc.type} ${this.block.heightCalc.value}px)`
      }

      if (this.block.isStretched) {
        position = Object.assign(position, {
          minWidth: width,
          minHeight: height,
          height: this.scrollHeight + 'px',
          width: this.scrollWidth + 'px'
        })
      } else {
        if (this.block.minMax?.minWidth && this.block.sizeTypes.width === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            minWidth: `${this.block.minMax.minWidth}px`
          })
        }
        if (this.block.minMax?.maxWidth && this.block.sizeTypes.width === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            maxWidth: `${this.block.minMax.maxWidth}px`
          })
        }
        if (this.block.minMax?.minHeight && this.block.sizeTypes.height === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            minHeight: `${this.block.minMax.minHeight}px`
          })
        }
        if (this.block.minMax?.maxHeight && this.block.sizeTypes.height === SizeTypes.PERCENT) {
          position = Object.assign(position, {
            maxHeight: `${this.block.minMax.maxHeight}px`
          })
        }
        position = Object.assign(position, {
          width: width,
          height: height
        })
      }

      if (this.block.isHidden) {
        position.width = '0px'
        position.height = '0px'
        if (this.block.stickyTo?.guid && this.block.stickyTo?.type) {
          if (this.block.stickyTo.type === StickyToType.TOP) {
            position.top = '0px'
          } else if (this.block.stickyTo.type === StickyToType.LEFT) {
            position.left = '0px'
          }
        }
      }

      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontal && this.isShowing) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid)
        // Для элементов с display:none offsetWidth равен нулю
        if (refBlock && refBlock.$el.offsetWidth) {
          if (this.block.sticky === Sticky.BL || this.block.sticky === Sticky.TL) {
            position.left = `calc(50% - calc(${refBlock.$el.offsetWidth}px / 2))`
          } else {
            position.right = `calc(50% - calc(${refBlock.$el.offsetWidth}px / 2))`
          }
        }
      }
      // центрировать горизонтально (адаптивно)
      if (!this.block.stickyTo?.guid && this.block.onCenter?.horizontalAdaptive && this.isShowing) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid)
        // Для элементов с display:none offsetWidth равен нулю
        if (refBlock && refBlock.$el.offsetWidth) {
          position.marginLeft = 'auto'
          position.marginLeft = 'auto'
          position.marginRight = 'auto'
          position.left = '0'
          position.right = '0'
        }
      }

      if (!this.block.stickyTo?.guid && this.block.onCenter?.vertical && this.isShowing) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid)
        if (refBlock) {
          if (this.block.sticky === Sticky.TR || this.block.sticky === Sticky.TL) {
            position.top = `calc(50% - calc(${refBlock.$el.offsetHeight}px / 2))`
          } else {
            position.bottom = `calc(50% - calc(${refBlock.$el.offsetHeight}px / 2))`
          }
        }
      }

      if (this.block.stickyTo?.guid) {
        if (this.block.stickyTo?.type === StickyToType.TOP) {
          delete position.top
        } else if (this.block.stickyTo?.type === StickyToType.LEFT) {
          // delete position.left
        }
      }

      return Object.assign(position, {
        zIndex: this.zIndex
      })
    },
    isTabsContainer () {
      return this.block.tabs?.use || false
    }
  },
  methods: {
    setSticky (guid) {
      if (guid) {
        this.stickyToBlock = this.getStore().getByGuid(guid)
        this.stickyToElement = this.getStore().getRefByGuid(guid)

        let stickyOffset = ''
        switch (this.block.stickyTo?.type) {
          case StickyToType.TOP:
            stickyOffset = this.block.top + this.block.sizeTypes.top
            break
          case StickyToType.LEFT:
            stickyOffset = this.block.left + this.block.sizeTypes.left
            break
        }

        stickyManager.addBlock({
          guid: this.block.guid,
          stickyTo: this.stickyToElement.$el,
          element: this.$refs.draggableContainer,
          type: this.block.stickyTo?.type || StickyToType.TOP,
          offset: stickyOffset
        })
      } else {
        this.stickyToBlock = undefined
        this.stickyToElement = undefined
      }
    },
    setParent () {
      this.parentBlock = this.block.parentGuid ? this.getStore().getByGuid(this.block.parentGuid) : undefined
      this.parentElement = this.block.parentGuid ? this.$parent?.$refs.draggableContainer : undefined
    }
  }
}
