// stretchManager.ts
import ResizeObserver from 'resize-observer-polyfill'

type Stretchable = {
  container: Element
  update: () => void
}

const items = new Set<Stretchable>()
const containerToItem = new Map<Element, Stretchable>()
const elementToItem = new Map<Element, Stretchable>()
const itemElements = new Map<Stretchable, Set<Element>>()

let ro: ResizeObserver | null = null
let mo: MutationObserver | null = null

function ensureObservers () {
  if (ro) return

  ro = new ResizeObserver(entries => {
    /* const toUpdate = new Set<Stretchable>() */
    /* for (const entry of entries) {
      const item = elementToItem.get(entry.target)
      if (item) toUpdate.add(item)
    } */
    Array.from(elementToItem.values()).forEach(item => item.update())
  })

  mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type !== 'childList') continue

      // Найти Stretchable-владельца через ближайший зарегистрированный контейнер
      let el: Element | null = m.target as Element
      let item: Stretchable | undefined
      while (el) {
        item = containerToItem.get(el)
        if (item) break
        el = el.parentElement
      }
      if (!item) continue

      m.addedNodes.forEach(node => {
        if (node instanceof Element) {
          observeElement(node, item!)
        }
      })
    }
  })
}

function observeElement (el: Element, item: Stretchable) {
  elementToItem.set(el, item)
  let elements = itemElements.get(item)
  if (!elements) {
    elements = new Set()
    itemElements.set(item, elements)
  }
  elements.add(el)
  ro!.observe(el)
}

export const StretchManager = {
  register (item: Stretchable) {
    ensureObservers()
    items.add(item)
    containerToItem.set(item.container, item)

    // Наблюдать за существующими дочерними элементами
    const children = item.container.children
    for (let i = 0; i < children.length; i++) {
      observeElement(children[i], item)
    }

    // Следить за добавлением новых дочерних элементов
    mo!.observe(item.container, { childList: true, subtree: true })
  },

  unregister (item: Stretchable) {
    items.delete(item)
    containerToItem.delete(item.container)

    // Отписать все элементы этого item от ResizeObserver
    const elements = itemElements.get(item)
    if (elements) {
      elements.forEach(el => {
        elementToItem.delete(el)
        ro!.unobserve(el)
      })
      itemElements.delete(item)
    }

    // Переподключить MutationObserver для оставшихся контейнеров
    mo!.disconnect()
    containerToItem.forEach((_, container) => {
      mo!.observe(container, { childList: true, subtree: true })
    })
  }
}
