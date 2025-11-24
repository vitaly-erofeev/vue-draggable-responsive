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
      stickyToElement: undefined,
      cachedSizeKey: '',
      cachedSizeStyles: undefined,
      cachedCenterKey: '',
      cachedCenterStyle: undefined,
      cachedVisibilityKey: '',
      cachedVisibilityStyle: undefined
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

      let position = { ...this.defaultPosition }
      position = Object.assign(position, this.buildSizeStyle())
      position = Object.assign(position, this.buildVisibilityStyle())

      if (this.block.replication?.topBlockGuid) {
        const stickyToElement = this.getStore().getRefByGuid(this.block.replication?.topBlockGuid)

        if (stickyToElement) {
          position.top =
            `calc(${stickyToElement.positionStyle.height} + ${stickyToElement.positionStyle.top} + ${this.block.replication?.verticalMargin})`
        }
      }

      if (this.block.stickyTo?.guid) {
        if (this.block.stickyTo?.type === StickyToType.TOP) {
          delete position.top
        } else if (this.block.stickyTo?.type === StickyToType.LEFT) {
          // delete position.left
        }
      }

      position = Object.assign(position, this.buildCenteringStyle())

      return Object.assign(position, {
        zIndex: this.zIndex
      })
    },
    isTabsContainer () {
      return this.block.tabs?.use || false
    }
  },
  methods: {
    buildSizeStyle () {
      const key = [
        this.block.width,
        this.block.height,
        this.block.sizeTypes.width,
        this.block.sizeTypes.height,
        this.block.widthCalc?.type,
        this.block.widthCalc?.value,
        this.block.heightCalc?.type,
        this.block.heightCalc?.value,
        this.block.isStretched,
        this.block.minMax?.minWidth,
        this.block.minMax?.maxWidth,
        this.block.minMax?.minHeight,
        this.block.minMax?.maxHeight
      ].join('|')

      if (this.cachedSizeKey === key && this.cachedSizeStyles) {
        return this.cachedSizeStyles
      }

      let height = this.block.height + this.block.sizeTypes.height
      let width = this.block.width + this.block.sizeTypes.width
      let style = {}

      if (this.block.widthCalc && this.block.widthCalc.type && this.block.widthCalc.value) {
        width = `calc(${width} ${this.block.widthCalc.type} ${this.block.widthCalc.value}px)`
      }
      if (this.block.heightCalc && this.block.heightCalc.type && this.block.heightCalc.value) {
        height = `calc(${height} ${this.block.heightCalc.type} ${this.block.heightCalc.value}px)`
      }

      if (this.block.isStretched) {
        style = Object.assign(style, {
          minWidth: width,
          minHeight: height,
          height: this.scrollHeight + 'px',
          width: this.scrollWidth + 'px'
        })
      } else {
        if (this.block.minMax?.minWidth && this.block.sizeTypes.width === SizeTypes.PERCENT) {
          style = Object.assign(style, {
            minWidth: `${this.block.minMax.minWidth}px`
          })
        }
        if (this.block.minMax?.maxWidth && this.block.sizeTypes.width === SizeTypes.PERCENT) {
          style = Object.assign(style, {
            maxWidth: `${this.block.minMax.maxWidth}px`
          })
        }
        if (this.block.minMax?.minHeight && this.block.sizeTypes.height === SizeTypes.PERCENT) {
          style = Object.assign(style, {
            minHeight: `${this.block.minMax.minHeight}px`
          })
        }
        if (this.block.minMax?.maxHeight && this.block.sizeTypes.height === SizeTypes.PERCENT) {
          style = Object.assign(style, {
            maxHeight: `${this.block.minMax.maxHeight}px`
          })
        }
        style = Object.assign(style, {
          width: width,
          height: height
        })
      }

      this.cachedSizeKey = key
      this.cachedSizeStyles = style

      return style
    },
    buildCenteringStyle () {
      const key = [
        this.block.onCenter?.horizontal,
        this.block.onCenter?.horizontalAdaptive,
        this.block.onCenter?.vertical,
        this.block.width,
        this.block.height,
        this.isShowing,
        this.block.stickyTo?.guid
      ].join('|')

      if (this.cachedCenterKey === key && this.cachedCenterStyle) {
        return this.cachedCenterStyle
      }

      let style = {}
      const transforms = []

      if (!this.block.stickyTo?.guid && this.isShowing) {
        const refBlock = this.getStore().getRefByGuid(this.block.guid)

        if (refBlock && refBlock.$el.offsetWidth) {
          if (this.block.onCenter?.horizontal) {
            style.left = '50%'
            transforms.push('translateX(-50%)')
          } else if (this.block.onCenter?.horizontalAdaptive) {
            style.left = '50%'
            style.marginLeft = 'auto'
            style.marginRight = 'auto'
            transforms.push('translateX(-50%)')
          }
        }

        if (refBlock && this.block.onCenter?.vertical && refBlock.$el.offsetHeight) {
          style.top = '50%'
          transforms.push('translateY(-50%)')
        }
      }

      if (transforms.length) {
        style.transform = transforms.join(' ')
      }

      this.cachedCenterKey = key
      this.cachedCenterStyle = style

      return style
    },
    buildVisibilityStyle () {
      const key = [
        this.block.isHidden,
        this.block.stickyTo?.guid,
        this.block.stickyTo?.type
      ].join('|')

      if (this.cachedVisibilityKey === key && this.cachedVisibilityStyle) {
        return this.cachedVisibilityStyle
      }

      let style = {}

      if (this.block.isHidden) {
        style = {
          width: '0px',
          height: '0px'
        }
        if (this.block.stickyTo?.guid && this.block.stickyTo?.type) {
          if (this.block.stickyTo.type === StickyToType.TOP) {
            style.top = '0px'
          } else if (this.block.stickyTo.type === StickyToType.LEFT) {
            style.left = '0px'
          }
        }
      }

      this.cachedVisibilityKey = key
      this.cachedVisibilityStyle = style

      return style
    },
    setSticky (guid) {
      if (guid) {
        this.stickyToBlock = this.getStore().getByGuid(guid)
        this.stickyToElement = this.getStore().getRefByGuid(guid)

        let stickyOffset = 0
        switch (this.block.stickyTo?.type) {
          case StickyToType.TOP:
            stickyOffset = parseFloat(this.block.top + this.block.sizeTypes.top) || 0
            break
          case StickyToType.LEFT:
            stickyOffset = parseFloat(this.block.left + this.block.sizeTypes.left) || 0
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
