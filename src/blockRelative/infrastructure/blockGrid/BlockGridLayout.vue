<template>
  <div class="grid-layout" :style="gridStyle">
    <div
      v-for="container of containers"
      :key="container.guid"
      :class="{
        'container-item': true,
        active: isDesigner ? container.isActive : null,
        active_parent: isDesigner ? container.isActiveAsParent : null,
        hidden: container.isHidden,
        [container.className]: !!container.className,
      }"
      :style="getContainerStyle(container)"
      :data-guid="attrGuid(container)"
      @click.stop="setActiveContainer(container)"
    >
      <div class="container-header" v-if="isDesigner">
        <button class="btn-edit" @click.prevent="openGridSelector(container)" title="Настройки размера"></button>
      </div>
      <slot
        :blocks="container.children"
        name="content"
      ></slot>
    </div>

    <!-- Пустые ячейки  -->
    <template v-if="isDesigner">
      <div
        v-for="cell in emptyCells"
        :key="`empty-${cell.row}-${cell.col}`"
        class="empty-cell"
        :style="getCellStyle(cell)"
        @click.stop="addNewContainerAt(cell)"
      >
        <span class="cell-coords">{{ cell.row }}:{{ cell.col }}</span>
      </div>
    </template>
    <!-- Виджет для выбора/редактирования области -->
    <div v-if="showGridSelector" class="modal-overlay">
      <div class="modal-content">
        <grid-area-selector
          ref="gridSelector"
          :container="selectedContainer"
          :all-containers="containers"
          :initial-config="localGridConfig"
          @apply="applyGridArea"
          @cancel="closeGridSelector"
        />
      </div>
    </div>

  </div>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2 } from '@/blockRelative/model/types'
import GridAreaSelector from '@/blockRelative/shared/ui/GridGenerator.vue'
// eslint-disable-next-line no-unused-vars
import { DataSourceInjected } from '@/infrastructure/domain/model/DataSourceInjected'
// eslint-disable-next-line no-unused-vars
import Vue_, { VueConstructor } from 'vue'
const Vue = Vue_ as VueConstructor<Vue_ & DataSourceInjected>
export default Vue.extend({
// export default {
  name: 'BlockGridLayout',
  components: {
    GridAreaSelector
  },
  props: {
    isDesigner: {
      type: Boolean,
      default: false
    },
    storeV2: {
      type: Object
    },
    gridConfig: {
      type: Object as () => {
        columns: number,
        rows: number
      },
      default: () => ({
        columns: 3,
        rows: 2
      })
    }
  },
  data (): {
    containers: BlockDTOV2[];
    localGridConfig: { columns: number; rows: number };
    showGridSelector: boolean;
    selectedContainer: BlockDTOV2 | null;
    } {
    return {
      localGridConfig: this.gridConfig,
      containers: [],
      showGridSelector: false,
      selectedContainer: null
    }
  },
  computed: {
    gridStyle (): Record<string, string> {
      return {
        display: 'grid',
        'box-sizing': 'border-box',
        height: 'auto',
        'grid-template-columns': `repeat(${this.localGridConfig.columns}, 1fr)`,
        'grid-template-rows': `repeat(${this.localGridConfig.rows}, minmax(100px, auto))`,
        gap: '10px',
        padding: '20px',
        'background-color': '#f5f5f5',
        'min-height': '500px',
        position: 'relative'
      }
    },

    emptyCells () {
      const occupied = new Set()

      // Собираем все занятые ячейки
      this.containers.forEach((container) => {
        const { rowStart, rowEnd, colStart, colEnd } = this.parseGridArea(
          container.gridArea || ''
        )
        for (let row = rowStart; row < rowEnd; row++) {
          for (let col = colStart; col < colEnd; col++) {
            occupied.add(`${row}-${col}`)
          }
        }
      })

      // Возвращаем все свободные ячейки
      const cells = []
      for (let row = 1; row <= this.localGridConfig.rows; row++) {
        for (let col = 1; col <= this.localGridConfig.columns; col++) {
          if (!occupied.has(`${row}-${col}`)) {
            cells.push({ row, col })
          }
        }
      }

      return cells
    }
  },
  watch: {
    gridConfig: {
      deep: true,
      handler () {
        console.log('gridConfig changed', this.gridConfig)
        this.localGridConfig = this.gridConfig
        this.adjustContainersToGrid()
      }
    }
  },
  methods: {
    getSelectionContainer (): BlockDTOV2 | null {
      return this.selectedContainer
    },
    clearActiveContainer () {
      this.selectedContainer = null
    },
    attrGuid (container: BlockDTOV2) {
      return (container.guid && container.guid.slice(0, 8)) || ''
    },
    setActiveContainer (container: BlockDTOV2) {
      this.selectedContainer = container
      this.$emit('set-active-block', container)
    },
    parseGridArea (gridArea: string) {
      // Парсим строку вида "1 / 1 / 2 / 13"
      const [rowStart, colStart, rowEnd, colEnd] = gridArea
        .split('/')
        .map(Number)
      return { rowStart, colStart, rowEnd, colEnd }
    },

    getContainerStyle (container: BlockDTOV2) {
      const style: Record<string, string> = {
        'grid-area': container.gridArea || '',
        background: 'white',
        padding: '15px',
        cursor: 'pointer',
        display: 'flex',
        'flex-direction': 'column',
        overflow: 'hidden'
      }

      // Подсветка выбранного контейнера
      if (this.isDesigner) return style
      if (
        this.selectedContainer &&
        this.selectedContainer.guid === container.guid
      ) {
        style.outline = '3px solid #42b983'
      }

      return style
    },

    getCellStyle (cell: Record<string, string>) {
      return {
        'grid-column': cell.col,
        'grid-row': cell.row,
        background: 'rgba(0,0,0,0.05)',
        border: '1px dashed #ccc',
        'border-radius': '4px',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        cursor: 'pointer',
        'min-height': '50px'
      }
    },

    openGridSelector (container = null) {
      this.selectedContainer = container
      this.showGridSelector = true
    },

    closeGridSelector () {
      this.showGridSelector = false
      this.selectedContainer = null
    },

    applyGridArea (gridAreaData: {
          rowStart: number;
          rowEnd: number;
          colStart: number;
          colEnd: number;
          cells: any;
      }) {
      if (this.selectedContainer) {
        Object.assign(this.selectedContainer, {
          gridArea: `${gridAreaData.rowStart} / ${gridAreaData.colStart} / ${gridAreaData.rowEnd} / ${gridAreaData.colEnd}`,
          cells: gridAreaData.cells
        })
      }
      this.closeGridSelector()
    },

    // addNewContainer (parametersBlock: BlockDTOV2): BlockDTOV2 | null {
    //   // Находим первую свободную ячейку 1x1
    //   let foundCell = null

    //   for (let row = 1; row <= this.gridConfig.rows; row++) {
    //     for (let col = 1; col <= this.gridConfig.columns; col++) {
    //       const isOccupied = this.containers.some((container) => {
    //         const { rowStart, rowEnd, colStart, colEnd } = this.parseGridArea(
    //           container.gridArea || ''
    //         )
    //         return (
    //           row >= rowStart && row < rowEnd && col >= colStart && col < colEnd
    //         )
    //       })

    //       if (!isOccupied) {
    //         foundCell = { row, col }
    //         break
    //       }
    //     }
    //     if (foundCell) break
    //   }

    //   if (foundCell) {
    //     console.log('foundCell', parametersBlock)
    //     const newContainer: BlockDTOV2 = {
    //       ...parametersBlock,
    //       gridArea: `${foundCell.row} / ${foundCell.col} / ${
    //         foundCell.row + 1
    //       } / ${foundCell.col + 1}`,
    //       widthArea: 1,
    //       heightArea: 1
    //     }
    //     this.containers.push(newContainer)
    //     return newContainer

    //     // this.saveLayout()
    //   } else {
    //     alert(
    //       'Нет свободного места! Увеличьте grid или удалите некоторые контейнеры.'
    //     )
    //     return null
    //   }
    // },

    addNewContainerAt (cell: { row: number; col: number; }) {
      console.log('addNewContainerAt', cell)
      const createBlock = this.storeV2.createBlock()
      const newContainer: BlockDTOV2 = {
        ...createBlock,
        gridArea: `${cell.row} / ${cell.col} / ${cell.row + 1} / ${
          cell.col + 1
        }`,
        widthArea: 1,
        heightArea: 1
      }
      this.containers.push(newContainer)
      this.storeV2.addBlock(newContainer)
    },

    removeContainer (guid: string) {
      const index = this.containers.findIndex(
        (c) => c.guid === guid
      )
      if (index > -1) {
        this.containers.splice(index, 1)
      }
    },

    adjustContainersToGrid () {
      // Проверяем и корректируем контейнеры при изменении grid
      this.containers.forEach((container) => {
        const { rowEnd, colEnd } = this.parseGridArea(container.gridArea || '')

        // Если контейнер выходит за пределы новой сетки
        if (
          rowEnd > this.localGridConfig.rows + 1 ||
          colEnd > this.localGridConfig.columns + 1
        ) {
          // Автоматически уменьшаем или предлагаем пользователю исправить
          const newRowEnd = Math.min(rowEnd, this.localGridConfig.rows + 1)
          const newColEnd = Math.min(colEnd, this.localGridConfig.columns + 1)

          const [rowStartStr, colStartStr] = (container.gridArea || '').split('/')
          const rowStart = Number(rowStartStr)
          const colStart = Number(colStartStr)
          container.gridArea = `${rowStart} / ${colStart} / ${newRowEnd} / ${newColEnd}`
          container.widthArea = newColEnd - colStart
          container.heightArea = newRowEnd - rowStart
        }
      })
    },
    loadLayout (blocks: BlockDTOV2[]) {
      this.localGridConfig = this.gridConfig
      this.containers = blocks || []
    },

    resetLayout () {
      if (confirm('Сбросить весь макет? Все контейнеры будут удалены.')) {
        this.containers = []
        this.localGridConfig = { columns: 12, rows: 3 }
        localStorage.removeItem('grid-layout-v2')
      }
    }
  }
// }
})
</script>
<style scoped>

.container-item {
  position: relative;
}

/* .container-item:hover {
  outline: 2px solid #42b983;
} */
.container-item.active {
  outline: 3px solid #8fb942;
}

.container-header {
  position: absolute;
  z-index: 9999;
  left: 14px;
}

.container-name {
  font-weight: 600;
  color: #333;
}

.btn-edit {
  background: #5bb458;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.btn-edit:hover {
  opacity: 1;
  transform: scale(1.1);
}

.container-content {
  font-size: 12px;
  color: #666;
  flex-grow: 1;
}

.empty-cell:hover {
  background: rgba(64, 158, 255, 0.1) !important;
  border: 1px dashed #409eff !important;
}

.cell-coords {
  font-size: 10px;
  color: #999;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  /* z-index: 1000; */
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.control-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  margin: 0 20px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  min-width: 70px;
}

.control-group input[type="range"] {
  width: 120px;
}

.control-group input[type="number"] {
  width: 60px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-add,
.btn-save,
.btn-reset {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add {
  background: #409eff;
  color: white;
}

.btn-add:hover {
  background: #337ecc;
}

.btn-save {
  background: #42b983;
  color: white;
}

.btn-save:hover {
  background: #3da876;
}

.btn-reset {
  background: #ff6b6b;
  color: white;
}

.btn-reset:hover {
  background: #ff5252;
}
</style>
