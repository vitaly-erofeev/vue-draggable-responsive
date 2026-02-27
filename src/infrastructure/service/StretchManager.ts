// stretchManager.ts
type Stretchable = {
  el: Element
  update: () => void
}

type Observer = {
  disconnect: () => void
  observe: () => void
}

const items = new Set<Stretchable>()
const observers = new Set<Observer>()

let raf: number | null = null

function schedule () {
  if (raf) return

  raf = requestAnimationFrame(() => {
    raf = null

    observers.forEach(o => o.disconnect())

    items.forEach(item => {
      if (!item.el.isConnected) return
      item.update()
    })

    observers.forEach(o => o.observe())
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

  registerObserver (observer: Observer) {
    observers.add(observer)
  },

  unregisterObserver (observer: Observer) {
    observers.delete(observer)
  },

  notify () {
    console.log('NOTIFY StretchManager', items)
    schedule()
  }
}
