<template>
  <div id="app" class="playground">
    <header class="playground__header">
      <div>
        <h1>Vue Draggable Responsive playground</h1>
        <p class="subtitle">
          Добавляйте блоки, меняйте их свойства и сразу проверяйте результат в превью.
        </p>
      </div>
      <div class="header__toggles">
        <label class="checkbox">
          <input v-model="autoPreview" type="checkbox"> Автообновление превью
        </label>
        <label class="checkbox">
          <input v-model="showHidden" type="checkbox"> Показывать скрытые
        </label>
        <button class="secondary" type="button" @click="togglePreview">
          {{ showPreview ? 'Скрыть превью' : 'Показать превью' }}
        </button>
      </div>
    </header>

    <section class="controls">
      <div class="controls__actions">
        <div class="panel__title">Быстрое добавление</div>
        <div class="controls__buttons">
          <button type="button" @click="addContainer">+ Контейнер</button>
          <button type="button" :disabled="!activeBlockGuid" @click="addChildToActive">+ Дочерний блок</button>
          <button type="button" @click="addInteractive($event)">Добавить под курсор</button>
          <button class="secondary" type="button" @click="syncPreview">Синхронизировать превью</button>
        </div>
      </div>
      <div class="controls__meta">
        <div>Активный блок: <strong>{{ activeBlockLabel }}</strong></div>
        <div class="status" v-if="statusMessage">{{ statusMessage }}</div>
      </div>
    </section>

    <section class="inspector">
      <div class="inspector__panel">
        <div class="panel__title">Свойства активного блока</div>
        <div class="hint" v-if="!activeBlock">Выберите блок в designer, чтобы редактировать его свойства.</div>
        <form class="properties" @submit.prevent="applyBlockChanges" v-else>
          <div class="properties__grid">
            <label>
              <span>Alias</span>
              <input v-model="form.alias" type="text" placeholder="Название блока">
            </label>
            <label>
              <span>Sticky</span>
              <select v-model="form.sticky">
                <option v-for="option in stickyOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label>
              <span>Ширина (%)</span>
              <input v-model.number="form.width" type="number" step="1" min="0">
            </label>
            <label>
              <span>Высота (%)</span>
              <input v-model.number="form.height" type="number" step="1" min="0">
            </label>
            <label>
              <span>Top</span>
              <input v-model.number="form.top" type="number" step="1">
            </label>
            <label>
              <span>Left</span>
              <input v-model.number="form.left" type="number" step="1">
            </label>
            <label>
              <span>Right</span>
              <input v-model.number="form.right" type="number" step="1">
            </label>
            <label>
              <span>Bottom</span>
              <input v-model.number="form.bottom" type="number" step="1">
            </label>
            <label>
              <span>StickyTo guid</span>
              <select v-model="form.stickyToGuid">
                <option value="">— не привязан —</option>
                <option v-for="option in stickyTargets" :key="option.guid" :value="option.guid">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label>
              <span>StickyTo type</span>
              <select v-model="form.stickyToType">
                <option v-for="option in stickyToTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
          </div>
          <div class="properties__toggles">
            <label class="checkbox">
              <input v-model="form.isStretched" type="checkbox"> Stretched
            </label>
            <label class="checkbox">
              <input v-model="form.isHidden" type="checkbox"> Hidden
            </label>
          </div>
          <div class="properties__actions">
            <button type="submit">Сохранить</button>
            <button class="secondary" type="button" @click="resetForm">Сбросить</button>
          </div>
        </form>
      </div>
      <div class="inspector__panel">
        <div class="panel__title">JSON активного блока</div>
        <pre class="json-viewer">{{ activeBlockJson }}</pre>
      </div>
    </section>

    <section class="workspace">
      <div class="workspace__panel">
        <div class="panel__title">Designer</div>
        <vue-draggable-responsive-designer
          ref="designer"
          :show-hidden="showHidden"
          :step="1"
          class="board"
          @click="handleDesignerClick"
          @stop-drag="onDesignerMutated"
          @block-remove="onDesignerMutated"
        >
          <template #content="{ block }">
            <div class="block-preview">
              <strong>{{ block.alias || block.guid }}</strong>
              <span class="block-preview__meta">{{ block.width }}x{{ block.height }} ({{ block.sticky }})</span>
            </div>
          </template>
        </vue-draggable-responsive-designer>
      </div>
      <div v-if="showPreview" class="workspace__panel">
        <div class="panel__title">Previewer</div>
        <vue-draggable-responsive-previewer
          ref="previewer"
          class="board board--preview"
        >
          <template #content="{ block }">
            <div class="block-preview block-preview--preview">
              <strong>{{ block.alias || block.guid }}</strong>
              <span class="block-preview__meta">parent: {{ block.parentGuid || 'root' }}</span>
            </div>
          </template>
        </vue-draggable-responsive-previewer>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VueDraggableResponsiveDesigner from './index.vue'
import VueDraggableResponsivePreviewer from './previewer.vue'
import { AddBlockType } from '@/domain/model/AddBlockType'
import { Sticky } from '@/domain/model/Sticky'
import { StickyToType } from '@/domain/model/StickyTo'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { TabPosition } from '@/domain/model/TabProperties'
// eslint-disable-next-line no-unused-vars
import type { BlockProperties } from '@/domain/model/BlockProperties'

const percentSizeTypes = {
  width: SizeTypes.PERCENT,
  height: SizeTypes.PERCENT,
  top: SizeTypes.PERCENT,
  right: SizeTypes.PERCENT,
  bottom: SizeTypes.PERCENT,
  left: SizeTypes.PERCENT
}

function cloneBlocks (blocks: BlockProperties[]): BlockProperties[] {
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

export default Vue.extend({
  name: 'App',
  components: {
    VueDraggableResponsiveDesigner,
    VueDraggableResponsivePreviewer
  },
  data () {
    return {
      autoPreview: true,
      showPreview: true,
      showHidden: false,
      activeBlockGuid: '',
      statusMessage: '',
      blocksSnapshot: [] as BlockProperties[],
      form: {
        alias: '',
        width: 0,
        height: 0,
        top: undefined as number | undefined,
        left: undefined as number | undefined,
        right: undefined as number | undefined,
        bottom: undefined as number | undefined,
        sticky: Sticky.TL,
        stickyToGuid: '',
        stickyToType: StickyToType.TOP,
        isStretched: false,
        isHidden: false
      }
    }
  },
  computed: {
    activeBlock (): BlockProperties | undefined {
      if (!this.activeBlockGuid) return undefined
      return this.findBlock(this.activeBlockGuid, this.blocksSnapshot)
    },
    activeBlockLabel (): string {
      if (!this.activeBlockGuid) {
        return '—'
      }
      const active = this.getDesigner()?.getMainParents(this.activeBlockGuid)
      const alias = (active as any)?.alias
      return alias ? `${alias} (${this.activeBlockGuid})` : this.activeBlockGuid
    },
    stickyOptions () {
      return [
        { value: Sticky.TL, label: 'Top left' },
        { value: Sticky.TR, label: 'Top right' },
        { value: Sticky.BL, label: 'Bottom left' },
        { value: Sticky.BR, label: 'Bottom right' }
      ]
    },
    stickyToTypeOptions () {
      return [
        { value: StickyToType.TOP, label: 'top' },
        { value: StickyToType.RIGHT, label: 'right' },
        { value: StickyToType.BOTTOM, label: 'bottom' },
        { value: StickyToType.LEFT, label: 'left' }
      ]
    },
    stickyTargets () {
      const blocks = this.flattenBlocks(this.blocksSnapshot)
      return blocks
        .filter(block => block.guid !== this.activeBlockGuid)
        .map(block => ({
          guid: block.guid,
          label: `${block.alias || 'Без имени'} (${block.guid})`
        }))
    },
    activeBlockJson (): string {
      if (!this.activeBlock) return '—'
      return JSON.stringify(this.activeBlock, null, 2)
    }
  },
  watch: {
    activeBlock: {
      handler (block: BlockProperties | undefined) {
        if (!block) return
        this.form.alias = block.alias || ''
        this.form.width = block.width || 0
        this.form.height = block.height || 0
        this.form.top = block.top
        this.form.left = block.left
        this.form.right = block.right
        this.form.bottom = block.bottom
        this.form.sticky = block.sticky || Sticky.TL
        this.form.stickyToGuid = block.stickyTo?.guid || ''
        this.form.stickyToType = block.stickyTo?.type || StickyToType.TOP
        this.form.isStretched = Boolean(block.isStretched)
        this.form.isHidden = Boolean((block as any).isHidden)
      },
      immediate: true
    }
  },
  mounted () {
    this.updateBlocksSnapshot()
  },
  methods: {
    getDesigner (): any {
      return this.$refs.designer as any
    },
    getPreviewer (): any {
      return this.$refs.previewer as any
    },
    findBlock (guid: string, blocks: BlockProperties[]): BlockProperties | undefined {
      for (const block of blocks) {
        if (block.guid === guid) return block
        if (block.children) {
          const found = this.findBlock(guid, block.children as unknown as BlockProperties[])
          if (found) return found
        }
      }
      return undefined
    },
    flattenBlocks (blocks: BlockProperties[]): BlockProperties[] {
      const acc: BlockProperties[] = []
      blocks.forEach((block) => {
        acc.push(block)
        if (block.children && block.children.length) {
          acc.push(...this.flattenBlocks(block.children as unknown as BlockProperties[]))
        }
      })
      return acc
    },
    updateBlocksSnapshot (): void {
      const designer = this.getDesigner()
      if (!designer) return
      this.blocksSnapshot = cloneBlocks(designer.getBlocks())
    },
    handleDesignerClick (event: { block: any }): void {
      this.activeBlockGuid = event?.block?.guid || ''
      this.updateBlocksSnapshot()
    },
    addContainer (): void {
      const designer = this.getDesigner()
      if (!designer) {
        return
      }
      const guid = designer.addBlock({
        width: 40,
        height: 25,
        top: 8,
        left: 8,
        sticky: Sticky.TL,
        sizeTypes: { ...percentSizeTypes },
        isStretched: true,
        alias: 'Новый контейнер',
        tabs: {
          use: false,
          list: [],
          position: TabPosition.TOP
        }
      })
      this.statusMessage = `Добавлен контейнер ${guid}`
      this.onDesignerMutated()
    },
    addChildToActive (): void {
      if (!this.activeBlockGuid) {
        this.statusMessage = 'Выберите родительский блок'
        return
      }
      const designer = this.getDesigner()
      if (!designer) {
        return
      }
      const guid = designer.addBlock({
        width: 50,
        height: 18,
        top: 4,
        left: 4,
        sticky: Sticky.TL,
        sizeTypes: { ...percentSizeTypes },
        isStretched: false,
        parentGuid: this.activeBlockGuid,
        alias: 'Дочерний блок'
      })
      this.statusMessage = `Дочерний блок ${guid} добавлен`
      this.onDesignerMutated()
    },
    addInteractive (event: MouseEvent): void {
      const designer = this.getDesigner()
      if (!designer) {
        return
      }
      const guid = designer.addBlock({
        width: 18,
        height: 12,
        sticky: Sticky.TL,
        sizeTypes: { ...percentSizeTypes },
        isStretched: false,
        type: AddBlockType.INTERACTIVE,
        event,
        alias: 'Интерактивный блок'
      })
      this.statusMessage = `Интерактивный блок ${guid} добавлен`
      this.onDesignerMutated()
    },
    applyBlockChanges (): void {
      if (!this.activeBlockGuid) return
      const designer = this.getDesigner()
      const store = designer?.getStore?.()
      if (!designer || !store) return

      const numericOrUndefined = (value: number | undefined) => (value === null || typeof value === 'undefined' || Number.isNaN(value)) ? undefined : value

      store.change(this.activeBlockGuid, 'alias', this.form.alias)
      store.change(this.activeBlockGuid, 'width', numericOrUndefined(this.form.width))
      store.change(this.activeBlockGuid, 'height', numericOrUndefined(this.form.height))
      store.change(this.activeBlockGuid, 'top', numericOrUndefined(this.form.top))
      store.change(this.activeBlockGuid, 'left', numericOrUndefined(this.form.left))
      store.change(this.activeBlockGuid, 'right', numericOrUndefined(this.form.right))
      store.change(this.activeBlockGuid, 'bottom', numericOrUndefined(this.form.bottom))
      store.change(this.activeBlockGuid, 'sticky', this.form.sticky)
      store.change(this.activeBlockGuid, 'isStretched', this.form.isStretched)
      store.change(this.activeBlockGuid, 'isHidden', this.form.isHidden)

      const stickyTo = this.form.stickyToGuid
        ? {
          guid: this.form.stickyToGuid,
          type: this.form.stickyToType
        }
        : undefined
      store.change(this.activeBlockGuid, 'stickyTo', stickyTo)

      this.statusMessage = 'Свойства обновлены'
      this.updateBlocksSnapshot()
      this.onDesignerMutated()
    },
    resetForm (): void {
      if (!this.activeBlock) return
      const block = this.activeBlock
      this.form.alias = block.alias || ''
      this.form.width = block.width || 0
      this.form.height = block.height || 0
      this.form.top = block.top
      this.form.left = block.left
      this.form.right = block.right
      this.form.bottom = block.bottom
      this.form.sticky = block.sticky || Sticky.TL
      this.form.stickyToGuid = block.stickyTo?.guid || ''
      this.form.stickyToType = block.stickyTo?.type || StickyToType.TOP
      this.form.isStretched = Boolean(block.isStretched)
      this.form.isHidden = Boolean((block as any).isHidden)
    },
    syncPreview (): void {
      const designer = this.getDesigner()
      const previewer = this.getPreviewer()
      if (!designer || !previewer) {
        return
      }
      const blocks = cloneBlocks(designer.getBlocks())
      previewer.setBlocks(blocks)
      this.updateBlocksSnapshot()
    },
    togglePreview (): void {
      this.showPreview = !this.showPreview
      if (this.showPreview) {
        this.syncPreview()
      }
    },
    onDesignerMutated (): void {
      this.updateBlocksSnapshot()
      if (this.autoPreview) {
        this.$nextTick(() => this.syncPreview())
      }
    }
  }
})
</script>

<style scoped>
.playground {
  min-height: 100vh;
  padding: 24px;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1b1f24;
  background: #f7f9fc;
  box-sizing: border-box;
}

.playground__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.playground__header h1 {
  margin: 0 0 6px;
  font-size: 24px;
}

.subtitle {
  margin: 0;
  color: #52616b;
}

.header__toggles {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #39434a;
}

.controls {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border: 1px solid #e3e8f0;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;
}

.controls__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls__buttons,
.controls__meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.hint {
  color: #6c7a89;
  margin: 8px 0;
}

.status {
  padding: 6px 10px;
  background: #eef6ff;
  border: 1px solid #c7ddff;
  border-radius: 6px;
  color: #2d4d80;
  font-size: 13px;
}

.inspector {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.inspector__panel {
  background: #fff;
  border: 1px solid #e3e8f0;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.properties {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.properties__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.properties label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #1f2933;
}

.properties input,
.properties select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #cfd8e3;
  background: #f7f9fc;
  font-size: 14px;
}

.properties__toggles {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.properties__actions {
  display: flex;
  gap: 10px;
}

.json-viewer {
  background: #0b1021;
  color: #e1e7ff;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #0f172a;
  min-height: 260px;
  max-height: 420px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.45;
}

.workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.workspace__panel {
  background: #fff;
  border: 1px solid #e3e8f0;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__title {
  font-weight: 600;
  color: #1f2933;
}

.board {
  height: 520px;
}

.board--preview {
  background: #fbfcff;
}

button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #1f7aec;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

button.secondary {
  background: #f3f6fb;
  color: #1f2933;
  border-color: #d6deeb;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(31, 122, 236, 0.15);
}

.block-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(31, 122, 236, 0.08);
  color: #1f2933;
  font-size: 13px;
}

.block-preview--preview {
  background: rgba(46, 198, 109, 0.12);
}

.block-preview__meta {
  color: #52616b;
  font-size: 12px;
}

@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .inspector {
    grid-template-columns: 1fr;
  }
}
</style>
