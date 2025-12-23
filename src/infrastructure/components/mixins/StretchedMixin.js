import { StretchManager } from '@/infrastructure/service/StretchManager'

export default {
  data () {
    return {
      scrollHeight: 0,
      scrollWidth: 0,
      _stretchItem: null
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.setStretchedSize()
    })

    if (this.block?.isStretched && this.$refs.container && this.$refs.container instanceof Element) {
      this._stretchItem = {
        el: this.$el,
        update: this.setStretchedSize
      }

      StretchManager.register(this._stretchItem)
    }
  },
  beforeDestroy () {
    if (this._stretchItem) {
      StretchManager.unregister(this._stretchItem)
      this._stretchItem = null
    }
  },
  methods: {
    setStretchedSize () {
      const content = this.$el.getElementsByClassName('content')[0]
      if (!content) return

      // Вычисляем максимальное дно среди прямых детей
      const contentTop = content.getBoundingClientRect().top
      let maxBottom = 0
      Array.from(content.children).forEach(child => {
        const rect = child.getBoundingClientRect()
        const bottom = rect.top + rect.height
        if (bottom > maxBottom) maxBottom = bottom
      })

      const newScrollHeight = maxBottom - contentTop
      const newScrollWidth = content.scrollWidth // ширину можно оставить через scrollWidth

      if (newScrollHeight !== this.scrollHeight || newScrollWidth !== this.scrollWidth) {
        let parentNode
        let parentScroll = 0
        if (this.block.parentGuid) {
          parentNode = this.$el.parentNode
        } else if (this.mainBlockSelector) {
          parentNode = this.$el.closest(this.mainBlockSelector)
        }
        parentScroll = parentNode?.scrollTop || 0

        this.scrollHeight = newScrollHeight
        this.scrollWidth = newScrollWidth

        if (parentNode && parentScroll) {
          this.$nextTick(() => {
            if (parentNode) parentNode.scrollTop = parentScroll
          })
        }
      }
    }
  }
}
