import { debounce } from '@/infrastructure/service/utils'
import { StretchManager } from '@/infrastructure/service/StretchManager'
import ResizeObserver from 'resize-observer-polyfill'

export default {
  data () {
    return {
      scrollHeight: 0,
      scrollWidth: 0,
      _stretchItem: null,
      setStretchedSize: () => {
      }
    }
  },
  mounted () {
    if (!this.block?.isStretched) return

    let children = this.$refs.container.children
    const observer = new ResizeObserver(() => {
      this.setStretchedSize()
    })

    for (let item of children) {
      observer.observe(item)
    }
    const observerInserted = new MutationObserver(mutationList => {
      mutationList.filter(m => m.type === 'childList').forEach(m => {
        m.addedNodes.forEach(node => node instanceof Element && observer.observe(node))
      })
    })
    observerInserted.observe(this.$refs.container, { childList: true, subtree: true })
  },
  beforeDestroy () {
    if (this._stretchItem) {
      StretchManager.unregister(this._stretchItem)
      this._stretchItem = null
    }
  },
  created () {
    this.setStretchedSize = debounce(this._setStretchedSize.bind(this), 100)
  },
  methods: {
    _setStretchedSize () {
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
        this.scrollHeight = this.$el.getElementsByClassName('content')[0].scrollHeight
        this.scrollWidth = this.$el.getElementsByClassName('content')[0].scrollWidth
        if (parentNode && parentScroll) {
          this.$nextTick(() => {
            if (parentNode) {
              parentNode.scrollTop = parentScroll
            }
          })
        }
      })
    }
  }
}
