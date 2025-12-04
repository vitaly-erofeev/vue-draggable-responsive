<template>
  <div class="grid-layout" :style="gridStyle">
    <div
      v-for="container of containers"
      :key="container.guid"
      :class="{
        'container-item': true,
        active: container.isActive,
        active_parent: container.isActiveAsParent,
        hidden: container.isHidden,
        [container.className]: !!container.className,
      }"
      :style="getContainerStyle(container)"
      :data-guid="attrGuid(container)"
      @click.stop="setActiveContainer(container)"
      @contextmenu.prevent="removeContainer(container)"
    >
      <slot
        :blocks="container.children"
        name="content"
      ></slot>
    </div>

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

  </div>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import { BlockDTOV2 } from 'e:/vue-draggable-responsive/src/blockRelative/model/types'
// import Vue_, { VueConstructor } from 'vue'
// export default Vue.extend({
export default {
  name: 'BlockGridLayout',
  props: {
    isDesigner: {
      type: Boolean,
      default: false
    },
    storeV2: {
      type: Object
    }
  },
  data (): {
    containers: BlockDTOV2[];
    gridConfig: { columns: number; rows: number };
    showGridSelector: boolean;
    selectedContainer: BlockDTOV2 | null;
    } {
    return {
      gridConfig: {
        columns: 3,
        rows: 3
      },
      containers: [
        // {
        //   id: 1,
        //   name: 'Шапка',
        //   gridArea: '1 / 1 / 2 / 13', // row-start / col-start / row-end / col-end
        //   widthArea: 12,
        //   heightArea: 1
        // },
      ],
      showGridSelector: false,
      selectedContainer: null
    }
  },
  computed: {
    gridStyle () {
      return {
        display: 'grid',
        'box-sizing': 'border-box',
        height: 'inherit',
        'grid-template-columns': `repeat(${this.gridConfig.columns}, 1fr)`,
        'grid-template-rows': `repeat(${this.gridConfig.rows}, minmax(100px, auto))`,
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
      for (let row = 1; row <= this.gridConfig.rows; row++) {
        for (let col = 1; col <= this.gridConfig.columns; col++) {
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
        this.adjustContainersToGrid()
      }
    }
  },
  methods: {
    getSelectionContainer () {
      return this.selectedContainer
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

      // Даем время на отрисовку
      this.$nextTick(() => {
        if (this.$refs.gridSelector) {
          // Виджет сам загрузит выделение контейнера
        }
      })
    },

    closeGridSelector () {
      this.showGridSelector = false
      this.selectedContainer = null
    },

    // applyGridArea (gridAreaData) {
    //   if (this.selectedContainer) {
    //     // Обновляем существующий контейнер
    //     this.selectedContainer.gridArea = `${gridAreaData.rowStart} / ${gridAreaData.colStart} / ${gridAreaData.rowEnd} / ${gridAreaData.colEnd}`
    //     this.selectedContainer.widthArea =
    //       gridAreaData.colEnd - gridAreaData.colStart
    //     this.selectedContainer.heightArea =
    //       gridAreaData.rowEnd - gridAreaData.rowStart
    //   } else {
    //     // Создаем новый контейнер
    //     const newContainer = {
    //       guid: Date.now(),
    //       name: `Контейнер ${this.containers.length + 1}`,
    //       gridArea: `${gridAreaData.rowStart} / ${gridAreaData.colStart} / ${gridAreaData.rowEnd} / ${gridAreaData.colEnd}`,
    //       widthArea: gridAreaData.colEnd - gridAreaData.colStart,
    //       heightArea: gridAreaData.rowEnd - gridAreaData.rowStart
    //     }
    //     this.containers.push(newContainer)
    //   }

    //   // this.saveLayout()
    //   this.closeGridSelector()
    // },

    addNewContainer (parametersBlock: BlockDTOV2): BlockDTOV2 | null {
      // Находим первую свободную ячейку 1x1
      let foundCell = null

      for (let row = 1; row <= this.gridConfig.rows; row++) {
        for (let col = 1; col <= this.gridConfig.columns; col++) {
          const isOccupied = this.containers.some((container) => {
            const { rowStart, rowEnd, colStart, colEnd } = this.parseGridArea(
              container.gridArea || ''
            )
            return (
              row >= rowStart && row < rowEnd && col >= colStart && col < colEnd
            )
          })

          if (!isOccupied) {
            foundCell = { row, col }
            break
          }
        }
        if (foundCell) break
      }

      if (foundCell) {
        console.log('foundCell', parametersBlock)
        const newContainer: BlockDTOV2 = {
          ...parametersBlock,
          gridArea: `${foundCell.row} / ${foundCell.col} / ${
            foundCell.row + 1
          } / ${foundCell.col + 1}`,
          widthArea: 1,
          heightArea: 1
        }
        this.containers.push(newContainer)
        return newContainer

        // this.saveLayout()
      } else {
        alert(
          'Нет свободного места! Увеличьте grid или удалите некоторые контейнеры.'
        )
        return null
      }
    },

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
      // return newContainer
      // this.saveLayout()
    },

    removeContainer (guid: string) {
      // if (confirm(`Удалить контейнер ?`)) {
      const index = this.containers.findIndex(
        (c) => c.guid === guid
      )
      if (index > -1) {
        this.containers.splice(index, 1)
        // this.saveLayout()
      }
      // }
    },

    adjustContainersToGrid () {
      // Проверяем и корректируем контейнеры при изменении grid
      this.containers.forEach((container) => {
        const { rowEnd, colEnd } = this.parseGridArea(container.gridArea || '')

        // Если контейнер выходит за пределы новой сетки
        if (
          rowEnd > this.gridConfig.rows + 1 ||
          colEnd > this.gridConfig.columns + 1
        ) {
          // Автоматически уменьшаем или предлагаем пользователю исправить
          const newRowEnd = Math.min(rowEnd, this.gridConfig.rows + 1)
          const newColEnd = Math.min(colEnd, this.gridConfig.columns + 1)

          const [rowStartStr, colStartStr] = (container.gridArea || '').split('/')
          const rowStart = Number(rowStartStr)
          const colStart = Number(colStartStr)
          container.gridArea = `${rowStart} / ${colStart} / ${newRowEnd} / ${newColEnd}`
          container.widthArea = newColEnd - colStart
          container.heightArea = newRowEnd - rowStart
        }
      })

      // this.saveLayout()
    },

    saveLayout () {
      const layout = {
        gridConfig: this.gridConfig,
        containers: this.containers,
        timestamp: new Date().toISOString()
      }

      localStorage.setItem('grid-layout-v2', JSON.stringify(layout))
      console.log('Layout saved:', layout)
    },

    loadLayout (blocks: BlockDTOV2[]) {
      // @ts-ignore
      this.gridConfig = blocks.gridConfig || this.gridConfig
      this.containers = blocks || []
    },

    resetLayout () {
      if (confirm('Сбросить весь макет? Все контейнеры будут удалены.')) {
        this.containers = []
        this.gridConfig = { columns: 12, rows: 3 }
        localStorage.removeItem('grid-layout-v2')
      }
    }
  }
}
// })
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.container-name {
  font-weight: 600;
  color: #333;
}

.btn-remove {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  opacity: 0.7;
}

.btn-remove:hover {
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
