import { debounce } from '@/infrastructure/service/utils'
import ResizeObserver from 'resize-observer-polyfill'

export default {
  data () {
    return {
      scrollHeight: 0,
      scrollWidth: 0,
      _resizeObserver: null,
      _raf: null,
      setStretchedSize: () => {
      }
    }
  },
  mounted () {
    if (!this.block?.isStretched) return

    this.$nextTick(() => {
      const content = this.$el.querySelector('.content')
      if (!content) return

      this._resizeObserver = new ResizeObserver(() => {
        this.setStretchedSize()
      })

      this._resizeObserver.observe(content)

      this.setStretchedSize()
    })
  },
  beforeDestroy () {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
    }
  },
  created () {
    this.setStretchedSize = debounce(this._setStretchedSize.bind(this), 100)
  },
  methods: {
    _setStretchedSize () {
      if (this._raf) return

      this._raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._raf = null
          let parentNode
          let parentScroll = 0
          if (this.block.parentGuid) {
            parentNode = this.$el.parentNode
          } else if (this.mainBlockSelector) {
            parentNode = this.$el.closest(this.mainBlockSelector)
          }
          parentScroll = parentNode?.scrollTop || 0

          this.scrollHeight = 0
          this.scrollWidth = 0
          const el = this.$el.getElementsByClassName('content')[0]
          if (this.scrollHeight !== el.scrollHeight) {
            this.scrollHeight = el.scrollHeight
          }
          if (this.scrollWidth !== el.scrollWidth) {
            this.scrollWidth = el.scrollWidth
          }

          if (parentNode && parentScroll) {
            this.$nextTick(() => {
              if (parentNode) {
                parentNode.scrollTop = parentScroll
              }
            })
          }
        })
      })
    }
  }
}
