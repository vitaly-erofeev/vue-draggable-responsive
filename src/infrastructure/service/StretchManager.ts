// stretchManager.ts
type Stretchable = {
  el: Element
  update: () => void
}

const items = new Set<Stretchable>()

let raf: number | null = null

function schedule () {
  if (raf) return

  raf = requestAnimationFrame(() => {
    raf = null
    items.forEach(item => {
      if (!item.el.isConnected) return
      item.update()
    })
  })
}

export const StretchManager = {
  register (item: Stretchable) {
    items.add(item)
    schedule()
  },

  unregister (item: Stretchable) {
    items.delete(item)
  },

  notify () {
    schedule()
  }
}
