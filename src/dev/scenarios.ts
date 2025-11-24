import { Sticky } from '@/domain/model/Sticky'
import { StickyToType } from '@/domain/model/StickyTo'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { TabPosition } from '@/domain/model/TabProperties'
import { BlockProperties } from '@/domain/model/BlockProperties'

export interface PlaygroundScenario {
  key: string,
  name: string,
  description: string,
  blocks: BlockProperties[]
}

export const percentSizeTypes = {
  width: SizeTypes.PERCENT,
  height: SizeTypes.PERCENT,
  top: SizeTypes.PERCENT,
  right: SizeTypes.PERCENT,
  bottom: SizeTypes.PERCENT,
  left: SizeTypes.PERCENT
}

const stretchedLayout: BlockProperties[] = [
  {
    guid: 'layout-root',
    alias: 'Рабочая область',
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    sticky: Sticky.TL,
    sizeTypes: percentSizeTypes,
    isStretched: true,
    children: [
      {
        guid: 'layout-header',
        alias: 'Шапка (stretched)',
        width: 100,
        height: 15,
        top: 0,
        left: 0,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: true,
        className: 'demo-block header'
      },
      {
        guid: 'layout-sidebar',
        alias: 'Сайдбар',
        width: 26,
        height: 70,
        top: 18,
        left: 0,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: true,
        className: 'demo-block sidebar',
        children: [
          {
            guid: 'layout-sidebar-sticky',
            alias: 'Липкий к шапке',
            width: 100,
            height: 20,
            top: 4,
            left: 0,
            sticky: Sticky.TL,
            sizeTypes: percentSizeTypes,
            isStretched: false,
            stickyTo: {
              guid: 'layout-header',
              type: StickyToType.BOTTOM
            },
            className: 'demo-block sticky'
          }
        ]
      },
      {
        guid: 'layout-content',
        alias: 'Контент',
        width: 70,
        height: 70,
        top: 18,
        left: 28,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: true,
        className: 'demo-block content'
      }
    ]
  }
]

const tabsAndSticky: BlockProperties[] = [
  {
    guid: 'tabs-root',
    alias: 'Tabs playground',
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    sticky: Sticky.TL,
    sizeTypes: percentSizeTypes,
    isStretched: true,
    children: [
      {
        guid: 'tabs-container',
        alias: 'Вкладки',
        width: 90,
        height: 60,
        top: 4,
        left: 5,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: true,
        tabs: {
          use: true,
          position: TabPosition.TOP,
          list: [
            { guid: 'tab-main', name: 'Основное' },
            { guid: 'tab-extra', name: 'Дополнительно' }
          ]
        },
        className: 'demo-block tabs'
      },
      {
        guid: 'sticky-note',
        alias: 'Sticky к контейнеру',
        width: 32,
        height: 14,
        top: 70,
        left: 5,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: false,
        stickyTo: {
          guid: 'tabs-container',
          type: StickyToType.BOTTOM
        },
        className: 'demo-block sticky'
      },
      {
        guid: 'tabs-footer',
        alias: 'Нижний блок',
        width: 90,
        height: 20,
        bottom: 2,
        left: 5,
        sticky: Sticky.BL,
        sizeTypes: percentSizeTypes,
        isStretched: true,
        className: 'demo-block footer'
      }
    ]
  }
]

const replicationPlayground: BlockProperties[] = [
  {
    guid: 'replication-root',
    alias: 'Демонстрация репликации',
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    sticky: Sticky.TL,
    sizeTypes: percentSizeTypes,
    isStretched: true,
    children: [
      {
        guid: 'replication-grid',
        alias: 'Сетка 2xN',
        width: 96,
        height: 80,
        top: 6,
        left: 2,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: true,
        replication: {
          columns: 2,
          horizontalMargin: {
            type: SizeTypes.PIXEL,
            value: 12
          },
          verticalMargin: {
            type: SizeTypes.PIXEL,
            value: 12
          },
          function: async () => {
            await new Promise(resolve => setTimeout(resolve, 200))
            return Array.from({ length: 6 }).map((_, index) => ({
              id: index + 1,
              title: `Элемент #${index + 1}`
            }))
          }
        },
        className: 'demo-block replication'
      },
      {
        guid: 'center-block',
        alias: 'Центрирование',
        width: 60,
        height: 12,
        top: 86,
        left: 20,
        sticky: Sticky.TL,
        sizeTypes: percentSizeTypes,
        isStretched: false,
        onCenter: {
          horizontal: true,
          vertical: false
        },
        className: 'demo-block center'
      }
    ]
  }
]

export const playgroundScenarios: PlaygroundScenario[] = [
  {
    key: 'stretched-layout',
    name: 'Stretched + Sticky',
    description: 'Шапка, сайдбар, контент и дочерний sticky-элемент для проверки линий прилипания и растяжения.',
    blocks: stretchedLayout
  },
  {
    key: 'tabs-and-sticky',
    name: 'Tabs + Sticky to sibling',
    description: 'Сценарий с вкладками, липкой заметкой и нижним блоком для теста разных sticky-точек.',
    blocks: tabsAndSticky
  },
  {
    key: 'replication',
    name: 'Replication + Center',
    description: 'Проверка асинхронной репликации, зазоров и горизонтального центрирования.',
    blocks: replicationPlayground
  }
]

export function cloneBlocks (blocks: BlockProperties[]): BlockProperties[] {
  return blocks.map((block) => ({
    ...block,
    sizeTypes: { ...block.sizeTypes },
    stickyTo: block.stickyTo ? { ...block.stickyTo } : undefined,
    tabs: block.tabs
      ? {
        ...block.tabs,
        list: block.tabs.list?.map(tab => ({ ...tab }))
      }
      : undefined,
    replication: block.replication ? { ...block.replication } : undefined,
    minMax: block.minMax ? { ...block.minMax } : undefined,
    onCenter: block.onCenter ? { ...block.onCenter } : undefined,
    children: block.children ? cloneBlocks(block.children as unknown as BlockProperties[]) : []
  }))
}
