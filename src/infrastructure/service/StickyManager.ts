import ResizeObserver from 'resize-observer-polyfill'
import { StickyToType } from '@/domain/model/StickyTo'

type StickyBlock = {
  guid: string
  element: HTMLElement
  stickyTo: HTMLElement
  type: StickyToType
  offset: string
}

class StickyManager {
  private blocks: Map<string, StickyBlock> = new Map()
  private dependentsMap: Map<string, Set<string>> = new Map()
  private elementToGuidMap: Map<HTMLElement, string> = new Map()
  private resizeObservers: Map<HTMLElement, ResizeObserver> = new Map()

  private actualUpdatesRafMap: Map<string, boolean> = new Map()

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
        const observedGuid = this.elementToGuidMap.get(stickyTo)
        if (observedGuid) {
          this.updateDependentsRecursively(observedGuid)
        }
      })
      observer.observe(stickyTo)
      this.resizeObservers.set(stickyTo, observer)
    }

    this.updateOne(guid)
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

    const { width, height } = stickyTo.getBoundingClientRect()

    const top = `calc(${stickyTo.style.top || 0} + ${height}px + ${offset})`
    const left = `calc(${stickyTo.style.left || 0} + ${width}px + ${offset})`

    if (type === StickyToType.TOP) {
      element.style.top = top
    } else if (type === StickyToType.LEFT) {
      element.style.left = left
    }
  }

  private updateDependentsRecursively (guid: string) {
    if (!guid) return

    if (this.actualUpdatesRafMap.has(guid)) {
      return
    }
    this.actualUpdatesRafMap.set(guid, true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.actualUpdatesRafMap.delete(guid)

        const stack = [guid]
        const visited = new Set<string>()

        while (stack.length > 0) {
          const current = stack.pop()!
          if (visited.has(current)) continue
          visited.add(current)

          const dependents = this.dependentsMap.get(current)
          if (dependents) {
            for (const dep of dependents) {
              this.updateOne(dep)
              stack.push(dep)
            }
          }
        }
      })
    })
  }
}

export const stickyManager = new StickyManager()
