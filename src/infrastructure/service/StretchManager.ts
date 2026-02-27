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

function getDepth (el: Element): number {
  let depth = 0
  let node = el.parentElement
  while (node) {
    depth++
    node = node.parentElement
  }
  return depth
}

// --- Каскадное обновление по глубине ---
const pendingUpdates = new Set<Stretchable>()
let cascadeRaf: number | null = null

function scheduleCascadeUpdate (source: Iterable<Stretchable>) {
  for (const item of source) {
    pendingUpdates.add(item)
  }
  if (cascadeRaf !== null) cancelAnimationFrame(cascadeRaf)
  cascadeRaf = requestAnimationFrame(() => {
    cascadeRaf = null
    runCascade()
  })
}

function runCascade () {
  if (pendingUpdates.size === 0) return

  // Группируем по глубине DOM
  const byDepth = new Map<number, Stretchable[]>()
  pendingUpdates.forEach(item => {
    if (!items.has(item)) return // item был удалён
    const d = getDepth(item.container)
    let arr = byDepth.get(d)
    if (!arr) {
      arr = []
      byDepth.set(d, arr)
    }
    arr.push(item)
  })
  pendingUpdates.clear()

  const depths = [...byDepth.keys()].sort((a, b) => b - a) // самые глубокие первыми
  let level = 0

  function processLevel () {
    if (level >= depths.length) return
    byDepth.get(depths[level])!.forEach(item => item.update())
    level++
    if (level < depths.length) {
      // Следующий уровень в следующем кадре — Vue успеет обновить DOM
      requestAnimationFrame(processLevel)
    }
  }

  processLevel()
}

// --- Observers ---
function ensureObservers () {
  if (ro) return

  ro = new ResizeObserver(entries => {
    const toUpdate = new Set<Stretchable>()
    for (const entry of entries) {
      const item = elementToItem.get(entry.target)
      if (item) toUpdate.add(item)
    }
    if (toUpdate.size > 0) {
      scheduleCascadeUpdate(toUpdate)
    }
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

    // Запланировать каскадное обновление всех items
    scheduleCascadeUpdate(items)
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
