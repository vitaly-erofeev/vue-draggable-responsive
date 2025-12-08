<template>
  <div class="grid-area-selector">
    <div class="selector-header">
      <div class="current-selection">
        <div class="selection-info">
          <strong>Выделено:</strong> {{ selectionInfo }}
        </div>
        <div class="selection-actions">
          <!-- <div
            v-if="hasSelection"
            @click="clearSelection"
            class="btn btn-clear"
          >
            Очистить
          </div> -->
          <div
            @click="cancel"
            class="btn btn-cancel"
          >
            Отмена
          </div>
        </div>
      </div>
    </div>

    <!-- Сетка квадратов -->
    <div class="grid-display">
      <div
        class="grid-preview"
        :style="gridStyles"
      >
        <div
          v-for="cell in cells"
          :key="cell.id"
          class="grid-cell"
          :class="getCellClasses(cell)"
          :data-row="cell.row"
          :data-col="cell.col"
          @mousedown="startSelection(cell, $event)"
          @mouseenter="handleMouseEnter(cell)"
          @click="handleCellClick(cell, $event)"
        >
          <span class="cell-coords">{{ cell.row }}:{{ cell.col }}</span>

          <!-- Индикатор существующего контейнера -->
          <!-- <div
            v-if="isCellOccupied(cell) && !isCellInCurrentSelection(cell)"
            class="existing-container-overlay"
            :title="`Занято контейнером ${getContainerName(cell)}`"
          >
            📦
          </div> -->
        </div>
      </div>

      <!-- Легенда -->
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color available"></div>
          <span>Свободно</span>
        </div>
        <div class="legend-item">
          <div class="legend-color selected"></div>
          <span>Выбрано</span>
        </div>
        <div class="legend-item">
          <div class="legend-color occupied"></div>
          <span>Занято другим</span>
        </div>
        <div class="legend-item" v-if="editingContainer">
          <div class="legend-color editing"></div>
          <span>Текущий контейнер</span>
        </div>
      </div>
    </div>

    <!-- Результат -->
    <div class="result-section" v-if="hasSelection">
      <div class="validation" v-if="!isValidSelection">
        <div class="warning">
          ⚠️ Выделение должно быть прямоугольной областью!
        </div>
      </div>

      <div class="actions">
        <div
          @click="applySelection"
          class="btn btn-primary"
          :disabled="!isValidSelection"
        >
          {{ editingContainer ? 'Обновить контейнер' : 'Создать контейнер' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridAreaSelector',

  props: {
    container: {
      type: Object,
      default: null
    },
    allContainers: {
      type: Array,
      default: () => []
    },
    initialConfig: {
      type: Object,
      default: () => ({
        columns: 12,
        rows: 3
      })
    }
  },

  data () {
    return {
      localColumns: this.initialConfig.columns,
      localRows: this.initialConfig.rows,
      cells: [],
      selectedCells: new Set(),
      selecting: false,
      selectionStart: null,
      selectionEnd: null
    }
  },

  computed: {
    gridStyles () {
      return {
        'grid-template-columns': `repeat(${this.localColumns}, 1fr)`,
        'grid-template-rows': `repeat(${this.localRows}, 1fr)`,
        'gap': '2px'
      }
    },

    editingContainer () {
      return this.container
    },

    selectionInfo () {
      if (this.selectedCells.size === 0) return 'нет выделения'

      const cells = this.getSelectedCells()
      const rows = cells.map(c => c.row)
      const cols = cells.map(c => c.col)

      const width = Math.max(...cols) - Math.min(...cols) + 1
      const height = Math.max(...rows) - Math.min(...rows) + 1

      return `${this.selectedCells.size} ячеек (${width}×${height})`
    },

    hasSelection () {
      return this.selectedCells.size > 0
    },

    isValidSelection () {
      if (this.selectedCells.size === 0) return false

      const cells = this.getSelectedCells()
      const rows = cells.map(c => c.row)
      const cols = cells.map(c => c.col)

      const minRow = Math.min(...rows)
      const maxRow = Math.max(...rows)
      const minCol = Math.min(...cols)
      const maxCol = Math.max(...cols)

      // Считаем ожидаемое количество ячеек в прямоугольнике
      const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1)

      if (expectedCount !== this.selectedCells.size) {
        return false
      }

      // Проверяем, что все ячейки в прямоугольнике выделены
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cellId = `${row}-${col}`
          if (!this.selectedCells.has(cellId)) {
            return false
          }
        }
      }

      return true
    }
  },

  watch: {
    localColumns () {
      this.updateGrid()
    },

    localRows () {
      this.updateGrid()
    },

    container: {
      immediate: true,
      handler (newContainer) {
        if (newContainer) {
          this.loadContainerSelection(newContainer)
        } else {
          this.clearSelection()
        }
      }
    }
  },

  mounted () {
    this.initializeGrid()
    this.setupEventListeners()
  },

  beforeDestroy () {
    this.cleanupEventListeners()
  },

  methods: {
    // Парсим gridArea строку в объект
    parseGridArea (gridArea) {
      if (!gridArea) return null
      const parts = gridArea.split('/').map(part => parseInt(part.trim()))
      return {
        rowStart: parts[0],
        colStart: parts[1],
        rowEnd: parts[2],
        colEnd: parts[3]
      }
    },

    // Получаем все ячейки, занимаемые контейнером
    getContainerCells (container) {
      const area = this.parseGridArea(container.gridArea)
      if (!area) return []

      const cells = []
      for (let row = area.rowStart; row < area.rowEnd; row++) {
        for (let col = area.colStart; col < area.colEnd; col++) {
          cells.push({ row, col })
        }
      }
      return cells
    },

    initializeGrid () {
      this.cells = []

      for (let row = 1; row <= this.localRows; row++) {
        for (let col = 1; col <= this.localColumns; col++) {
          this.cells.push({
            id: `${row}-${col}`, // Используем id, а не guid
            row,
            col,
            occupiedBy: this.getContainerForCell(row, col)
          })
        }
      }
    },

    updateGrid () {
      const oldSelection = new Set(this.selectedCells)
      this.initializeGrid()

      // Восстанавливаем выделение
      const newSelection = new Set()
      oldSelection.forEach(id => {
        if (this.cells.some(cell => cell.id === id)) {
          newSelection.add(id)
        }
      })

      this.selectedCells = newSelection
    },

    getContainerForCell (row, col) {
      if (!this.allContainers) return null

      for (const container of this.allContainers) {
        if (this.editingContainer && container.guid === this.editingContainer.guid) {
          continue
        }

        const area = this.parseGridArea(container.gridArea)
        if (!area) continue

        if (row >= area.rowStart && row < area.rowEnd &&
            col >= area.colStart && col < area.colEnd) {
          return container.guid
        }
      }
      return null
    },

    loadContainerSelection (container) {
      this.selectedCells.clear()

      if (container && container.gridArea) {
        const area = this.parseGridArea(container.gridArea)
        if (area) {
          for (let row = area.rowStart; row < area.rowEnd; row++) {
            for (let col = area.colStart; col < area.colEnd; col++) {
              this.selectedCells.add(`${row}-${col}`)
            }
          }
        }
      }
    },

    getCellClasses (cell) {
      const classes = []

      if (this.selectedCells.has(cell.id)) {
        if (this.editingContainer && this.isCellInOriginalSelection(cell)) {
          classes.push('editing')
        } else {
          classes.push('selected')
        }
      } else if (cell.occupiedBy && cell.occupiedBy !== this.editingContainer?.guid) {
        classes.push('occupied')
      }

      if (this.selecting && this.isInSelectionArea(cell)) {
        classes.push('selecting')
      }

      return classes
    },

    isCellOccupied (cell) {
      return cell.occupiedBy && cell.occupiedBy !== this.editingContainer?.guid
    },

    isCellInCurrentSelection (cell) {
      return this.selectedCells.has(cell.id)
    },

    isCellInOriginalSelection (cell) {
      if (!this.editingContainer || !this.editingContainer.gridArea) return false

      const area = this.parseGridArea(this.editingContainer.gridArea)
      if (!area) return false

      return cell.row >= area.rowStart && cell.row < area.rowEnd &&
             cell.col >= area.colStart && cell.col < area.colEnd
    },

    // getContainerName (cell) {
    //   if (!cell.occupiedBy) return ''
    //   const container = this.allContainers.find(c => c.guid === cell.occupiedBy)
    //   return container ? container.guid : ''
    // },

    startSelection (cell, event) {
      if (event.ctrlKey || event.metaKey) {
        this.toggleCellSelection(cell)
        return
      }

      if (this.isCellOccupied(cell) && !this.isCellInCurrentSelection(cell)) {
        return
      }

      this.selecting = true
      this.selectionStart = cell
      this.selectionEnd = cell

      // Начинаем новое выделение
      this.selectedCells.clear()
      this.selectedCells.add(cell.id)
    },

    handleMouseEnter (cell) {
      if (!this.selecting) return

      this.selectionEnd = cell
      this.updateRectangularSelection()
    },

    handleCellClick (cell, event) {
      // Убрали проверку на Ctrl - теперь просто выделяем
      if (!this.selecting) {
        this.selectedCells.clear()
        this.selectedCells.add(cell.id)
      }
    },

    updateRectangularSelection () {
      if (!this.selectionStart || !this.selectionEnd) return

      const startRow = Math.min(this.selectionStart.row, this.selectionEnd.row)
      const endRow = Math.max(this.selectionStart.row, this.selectionEnd.row)
      const startCol = Math.min(this.selectionStart.col, this.selectionEnd.col)
      const endCol = Math.max(this.selectionStart.col, this.selectionEnd.col)

      const tempSelection = new Set()

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellId = `${row}-${col}`
          const cell = this.cells.find(c => c.id === cellId)

          if (cell && !this.isCellOccupied(cell)) {
            tempSelection.add(cellId)
          }
        }
      }

      // Заменяем выделение на новое
      this.selectedCells = tempSelection
    },

    toggleCellSelection (cell) {
      if (this.isCellOccupied(cell) && !this.isCellInCurrentSelection(cell)) {
        return
      }

      if (this.selectedCells.has(cell.id)) {
        this.selectedCells.delete(cell.id)
      } else {
        this.selectedCells.add(cell.id)
      }
    },

    isInSelectionArea (cell) {
      if (!this.selectionStart || !this.selectionEnd) return false

      const startRow = Math.min(this.selectionStart.row, this.selectionEnd.row)
      const endRow = Math.max(this.selectionStart.row, this.selectionEnd.row)
      const startCol = Math.min(this.selectionStart.col, this.selectionEnd.col)
      const endCol = Math.max(this.selectionStart.col, this.selectionEnd.col)

      return cell.row >= startRow &&
             cell.row <= endRow &&
             cell.col >= startCol &&
             cell.col <= endCol
    },

    getSelectedCells () {
      return Array.from(this.selectedCells)
        .map(id => this.cells.find(cell => cell.id === id))
        .filter(Boolean)
    },

    clearSelection () {
      this.selectedCells.clear()
    },

    cancel () {
      this.$emit('cancel')
    },

    applySelection () {
      if (!this.isValidSelection) {
        alert('Пожалуйста, выберите прямоугольную область!')
        return
      }

      const cells = this.getSelectedCells()
      const rows = cells.map(c => c.row)
      const cols = cells.map(c => c.col)

      const gridArea = {
        rowStart: Math.min(...rows),
        rowEnd: Math.max(...rows) + 1,
        colStart: Math.min(...cols),
        colEnd: Math.max(...cols) + 1,
        cells: cells.map(cell => ({
          row: cell.row,
          col: cell.col
        }))
      }

      this.$emit('apply', gridArea)
    },

    generateGridAreaClass (rows, cols) {
      const minRow = Math.min(...rows)
      const maxRow = Math.max(...rows)
      const minCol = Math.min(...cols)
      const maxCol = Math.max(...cols)

      return `area-${minRow}-${minCol}-${maxRow}-${maxCol}`
    },

    applyPreset (preset) {
      this.clearSelection()

      const startRow = Math.floor((this.localRows - preset.rows) / 2) + 1
      const startCol = Math.floor((this.localColumns - preset.cols) / 2) + 1

      for (let r = 0; r < preset.rows; r++) {
        for (let c = 0; c < preset.cols; c++) {
          const cellId = `${startRow + r}-${startCol + c}`
          const cell = this.cells.find(c => c.id === cellId)
          if (cell && !this.isCellOccupied(cell)) {
            this.selectedCells.add(cellId)
          }
        }
      }
    },

    setupEventListeners () {
      const handleMouseUp = () => {
        this.selecting = false
        this.selectionStart = null
        this.selectionEnd = null
      }

      document.addEventListener('mouseup', handleMouseUp)

      this.cleanupEventListeners = () => {
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }
}
</script>

<style scoped>
.grid-area-selector {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.selector-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.current-selection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 6px;
}

.selection-info {
  font-size: 14px;
}

.selection-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  display: inline-block;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-clear {
  background: #ff6b6b;
  color: white;
}

.btn-clear:hover {
  background: #ff5252;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.grid-display {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.grid-preview {
  display: grid;
  flex: 1;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
  min-height: 300px;
}

.grid-cell {
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  font-size: 11px;
  color: #666;
}

.grid-cell:hover {
  border-color: #409eff;
  transform: scale(1.05);
  z-index: 1;
}

.grid-cell.selected {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.grid-cell.editing {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

.grid-cell.occupied {
  background: #ffc107;
  border-color: #ffc107;
  cursor: not-allowed;
  opacity: 0.7;
}

.grid-cell.selecting:not(.selected):not(.occupied) {
  background: rgba(64, 158, 255, 0.3);
  border-color: rgba(64, 158, 255, 0.5);
}

.existing-container-overlay {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  opacity: 0.8;
}

.legend {
  width: 150px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.legend-color.available {
  background: white;
}

.legend-color.selected {
  background: #409eff;
}

.legend-color.occupied {
  background: #ffc107;
}

.legend-color.editing {
  background: #42b983;
}

.result-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.validation {
  margin: 10px 0;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
}

.actions {
  text-align: right;
}

.btn-primary {
  background: #42b983;
  color: white;
  padding: 10px 20px;
  font-size: 14px;
}

.btn-primary:hover {
  background: #3da876;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.preset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-preset {
  background: #e9ecef;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-preset:hover {
  background: #dee2e6;
}
</style>
