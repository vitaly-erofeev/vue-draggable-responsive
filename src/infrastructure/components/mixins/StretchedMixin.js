import ResizeObserver from 'resize-observer-polyfill'

export default {
  data () {
    return {
      scrollHeight: 0,
      scrollWidth: 0,
      rObserver: null,
      mObserver: null,
      _raf: null
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.setStretchedSize()
    })

    if (this.block?.isStretched && this.$refs.container && this.$refs.container instanceof Element) {
      let children = this.$refs.container.children
      this.rObserver = new ResizeObserver(() => {
        this.setStretchedSize()
      })

      for (let item of children) {
        this.rObserver.observe(item)
      }
      this.mObserver = new MutationObserver(mutationList => {
        mutationList.filter(m => m.type === 'childList').forEach(m => {
          m.addedNodes.forEach(node => node instanceof Element && this.rObserver.observe(node))
        })
      })
      this.mObserver.observe(this.$refs.container, { childList: true, subtree: true })
    }
  },
  beforeDestroy () {
    if (this.rObserver) {
      this.rObserver.disconnect()
    }
    if (this.mObserver) {
      this.mObserver.disconnect()
    }
  },
  methods: {
    setStretchedSize () {
      if (this._raf) {
        return
      }
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
          this.$nextTick(() => {
            const el = this.$el.getElementsByClassName('content')[0]
            this.scrollHeight = el.scrollHeight
            this.scrollWidth = el.scrollWidth
            if (parentNode && parentScroll) {
              this.$nextTick(() => {
                if (parentNode) {
                  parentNode.scrollTop = parentScroll
                }
              })
            }
          })
        })
      })
    }
  }
}
