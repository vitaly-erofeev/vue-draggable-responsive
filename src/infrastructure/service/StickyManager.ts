import ResizeObserver from 'resize-observer-polyfill'
import { StickyToType } from '@/domain/model/StickyTo'

type StickyBlock = {
  guid: string
  element: HTMLElement
  stickyTo: HTMLElement
  type: StickyToType
  offset: number
  cachedOffset?: { top?: number, left?: number }
}

class StickyManager {
  private blocks: Map<string, StickyBlock> = new Map()
  private dependentsMap: Map<string, Set<string>> = new Map()
  private elementToGuidMap: Map<HTMLElement, string> = new Map()
  private resizeObservers: Map<HTMLElement, ResizeObserver> = new Map()
  private stickySizes: Map<HTMLElement, { width: number, height: number }> = new Map()

  private initialized = false
  private scheduleUpdateTimer?: number

  addBlock ({ element, stickyTo, type, offset, guid }: StickyBlock) {
    this.blocks.set(guid, { element, stickyTo, type, offset, guid })
    this.elementToGuidMap.set(element, guid)

    if (!this.elementToGuidMap.has(stickyTo)) {
      const stickyToGuid = `__external__-${Math.random().toString(36).slice(2)}`
      this.elementToGuidMap.set(stickyTo, stickyToGuid)
    }

    const stickyToGuid = this.elementToGuidMap.get(stickyTo)
    if (stickyToGuid) {
      if (!this.dependentsMap.has(stickyToGuid)) {
        this.dependentsMap.set(stickyToGuid, new Set())
      }
      this.dependentsMap.get(stickyToGuid)!.add(guid)
    }

    // Подключаем ResizeObserver только один раз на stickyTo
    if (!this.resizeObservers.has(stickyTo)) {
      const observer = new ResizeObserver(() => {
        this.stickySizes.delete(stickyTo)
        const observedGuid = this.elementToGuidMap.get(stickyTo)
        if (observedGuid) {
          this.updateDependentsRecursively(observedGuid)
        }
      })
      observer.observe(stickyTo)
      this.resizeObservers.set(stickyTo, observer)
    }

    this.updateOne(guid)
    this.scheduleSmartUpdateAll()
  }

  private scheduleSmartUpdateAll () {
    // Отменяем предыдущий таймер, чтобы дождаться конца добавлений
    if (this.scheduleUpdateTimer) {
      clearTimeout(this.scheduleUpdateTimer)
    }

    this.scheduleUpdateTimer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        this.updateAll()
        // Делаем повторный прогон — иногда первый расчет не попадает в правильные размеры
        requestAnimationFrame(() => this.updateAll())
        this.initialized = true
      })
    }, 0)
  }

  removeBlock (guid: string) {
    const block = this.blocks.get(guid)
    if (!block) return

    this.blocks.delete(guid)
    this.elementToGuidMap.delete(block.element)

    // Удаляем из карты зависимостей
    for (const dependents of this.dependentsMap.values()) {
      dependents.delete(guid)
    }
    this.dependentsMap.delete(guid)

    // Удаляем observer, если никто больше не использует stickyTo
    const stillUsed = [...this.blocks.values()]
      .some(b => b.stickyTo === block.stickyTo && b.guid !== guid)

    if (!stillUsed) {
      this.stickySizes.delete(block.stickyTo)
      const observer = this.resizeObservers.get(block.stickyTo)
      if (observer) {
        observer.disconnect()
        this.resizeObservers.delete(block.stickyTo)
      }
    }
  }

  updateOne (guid: string) {
    const block = this.blocks.get(guid)
    if (!block) return

    const { element, stickyTo, type, offset } = block
    const cachedOffset = this.getCachedOffset(block)

    if (type === StickyToType.TOP && cachedOffset.top !== undefined) {
      element.style.top = `${cachedOffset.top}px`
    } else if (type === StickyToType.LEFT && cachedOffset.left !== undefined) {
      element.style.left = `${cachedOffset.left}px`
    }
  }

  private getStickySize (stickyTo: HTMLElement) {
    if (this.stickySizes.has(stickyTo)) {
      return this.stickySizes.get(stickyTo)!
    }

    const { width, height } = stickyTo.getBoundingClientRect()
    const size = { width, height }

    this.stickySizes.set(stickyTo, size)
    return size
  }

  private getCachedOffset (block: StickyBlock) {
    if (block.cachedOffset) {
      return block.cachedOffset
    }

    const { stickyTo, offset, type } = block
    const size = this.getStickySize(stickyTo)

    const baseTop = stickyTo.offsetTop || 0
    const baseLeft = stickyTo.offsetLeft || 0

    const offsets: { top?: number, left?: number } = {}
    if (type === StickyToType.TOP) {
      offsets.top = baseTop + size.height + offset
    } else if (type === StickyToType.LEFT) {
      offsets.left = baseLeft + size.width + offset
    }

    block.cachedOffset = offsets
    return offsets
  }

  private updateDependentsRecursively (guid: string) {
    if (!guid) return

    const stack = [guid]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      visited.add(current)

      const dependents = this.dependentsMap.get(current)
      if (dependents) {
        for (const dep of dependents) {
          this.clearBlockCache(dep)
          this.updateOne(dep)
          stack.push(dep)
        }
      }
    }
  }

  updateAll () {
    for (const guid of this.blocks.keys()) {
      this.clearBlockCache(guid)
      this.updateOne(guid)
    }
  }

  private clearBlockCache (guid: string) {
    const block = this.blocks.get(guid)
    if (!block) return

    block.cachedOffset = undefined
  }
}

export const stickyManager = new StickyManager()
