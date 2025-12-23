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
      let parentNode
      let parentScroll = 0
      if (this.block.parentGuid) {
        parentNode = this.$el.parentNode
      } else if (this.mainBlockSelector) {
        parentNode = this.$el.closest(this.mainBlockSelector)
      }
      parentScroll = parentNode?.scrollTop || 0

      requestAnimationFrame(() => {
        const el = this.$el.getElementsByClassName('content')[0]
        if (el.scrollWidth !== this.scrollWidth || el.scrollHeight !== this.scrollHeight) {
          this.scrollHeight = el.scrollHeight
          this.scrollWidth = el.scrollWidth
          if (parentNode && parentScroll) {
            this.$nextTick(() => {
              if (parentNode) {
                parentNode.scrollTop = parentScroll
              }
            })
          }
        }
      })
    }
  }
}
