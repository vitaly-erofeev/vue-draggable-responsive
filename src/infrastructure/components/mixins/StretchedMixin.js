import { debounce } from '@/infrastructure/service/utils'

export default {
  data () {
    return {
      scrollHeight: 0,
      scrollWidth: 0,
      setStretchedSize: () => {
      }
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
