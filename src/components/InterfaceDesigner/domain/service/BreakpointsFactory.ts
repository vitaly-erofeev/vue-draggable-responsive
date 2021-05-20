import { Breakpoints } from '../model/Breakpoints'
import { Sticky } from '../model/Sticky'

const MAP = {
  [Breakpoints.W]: {
    client: 'clientX',
    movement: 'movementX',
    offset: 'width',
    size: 'width',
    inverse: false
  },
  [Breakpoints.H]: {
    client: 'clientY',
    movement: 'movementY',
    offset: 'height',
    size: 'height',
    inverse: false
  },
  [Breakpoints.Y]: {
    client: 'clientY',
    movement: 'movementY',
    size: 'height',
    offset: 'top',
    inverse: false
  },
  [Breakpoints.X]: {
    client: 'clientX',
    movement: 'movementX',
    size: 'width',
    offset: 'left',
    inverse: false
  }
}

const STICKY_OFFSET_MAP:{[index: string]: any} = {
  [Breakpoints.X]: {
    [Sticky.TR]: { offset: 'right', inverse: true },
    [Sticky.TL]: { offset: 'left', inverse: false },
    [Sticky.BL]: { offset: 'left', inverse: false },
    [Sticky.BR]: { offset: 'right', inverse: true }
  },
  [Breakpoints.Y]: {
    [Sticky.TR]: { offset: 'top', inverse: false },
    [Sticky.TL]: { offset: 'top', inverse: false },
    [Sticky.BL]: { offset: 'bottom', inverse: true },
    [Sticky.BR]: { offset: 'bottom', inverse: true }
  }
}
export default class BreakpointsFactory {
  public static build (type: Breakpoints, sticky: Sticky): {
    client: string, movement: string, size: string, offset: string, inverse: boolean
  } {
    const options = (STICKY_OFFSET_MAP[type] || {})[sticky] || null
    if (options) {
      return Object.assign(MAP[type], options)
    }

    return MAP[type]
  }
}
