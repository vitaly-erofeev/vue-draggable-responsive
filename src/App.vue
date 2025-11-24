<template>
  <div id="app" class="playground">
    <header class="playground__header">
      <div>
        <h1>Vue Draggable Responsive playground</h1>
        <p class="subtitle">
          Выбирай сценарий, добавляй свои блоки и синхронизируй превью — удобно тестировать sticky, stretched, replication и tabs.
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
      <div class="controls__scenario">
        <label for="scenario">Сценарий</label>
        <select id="scenario" v-model="scenarioKey" @change="loadScenario(scenarioKey)">
          <option v-for="scenario in scenarios" :key="scenario.key" :value="scenario.key">
            {{ scenario.name }}
          </option>
        </select>
        <p class="hint">{{ selectedScenario.description }}</p>
        <button class="secondary" type="button" @click="loadScenario(scenarioKey)">
          Перезагрузить сценарий
        </button>
      </div>
      <div class="controls__actions">
        <button type="button" @click="addContainer">+ Контейнер</button>
        <button type="button" :disabled="!activeBlockGuid" @click="addChildToActive">+ Дочерний блок</button>
        <button type="button" @click="addInteractive($event)">Добавить под курсор</button>
        <button class="secondary" type="button" @click="syncPreview">Синхронизировать превью</button>
      </div>
      <div class="controls__meta">
        <div>Активный блок: <strong>{{ activeBlockLabel }}</strong></div>
        <div class="status" v-if="statusMessage">{{ statusMessage }}</div>
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
import { TabPosition } from '@/domain/model/TabProperties'
import { cloneBlocks, percentSizeTypes, playgroundScenarios } from '@/dev/scenarios'

export default Vue.extend({
  name: 'App',
  components: {
    VueDraggableResponsiveDesigner,
    VueDraggableResponsivePreviewer
  },
  data () {
    return {
      scenarioKey: playgroundScenarios[0].key,
      autoPreview: true,
      showPreview: true,
      showHidden: false,
      activeBlockGuid: '',
      statusMessage: '',
      scenarios: playgroundScenarios
    }
  },
  computed: {
    selectedScenario () {
      return this.scenarios.find(scenario => scenario.key === this.scenarioKey) || this.scenarios[0]
    },
    activeBlockLabel (): string {
      if (!this.activeBlockGuid) {
        return '—'
      }
      const active = this.getDesigner()?.getMainParents(this.activeBlockGuid)
      const alias = (active as any)?.alias
      return alias ? `${alias} (${this.activeBlockGuid})` : this.activeBlockGuid
    }
  },
  mounted () {
    this.loadScenario(this.scenarioKey)
  },
  methods: {
    getDesigner (): any {
      return this.$refs.designer as any
    },
    getPreviewer (): any {
      return this.$refs.previewer as any
    },
    loadScenario (key: string): void {
      const scenario = this.scenarios.find(item => item.key === key)
      if (!scenario) {
        return
      }
      const designer = this.getDesigner()
      if (!designer) {
        return
      }
      designer.setBlocks(cloneBlocks(scenario.blocks))
      this.activeBlockGuid = ''
      this.statusMessage = `Загружен сценарий "${scenario.name}"`
      this.syncPreview()
    },
    handleDesignerClick (event: { block: any }): void {
      this.activeBlockGuid = event?.block?.guid || ''
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
    syncPreview (): void {
      const designer = this.getDesigner()
      const previewer = this.getPreviewer()
      if (!designer || !previewer) {
        return
      }
      const blocks = cloneBlocks(designer.getBlocks())
      previewer.setBlocks(blocks)
    },
    togglePreview (): void {
      this.showPreview = !this.showPreview
      if (this.showPreview) {
        this.syncPreview()
      }
    },
    onDesignerMutated (): void {
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  background: #fff;
  padding: 16px;
  border: 1px solid #e3e8f0;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;
}

.controls__scenario select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #cfd8e3;
  background: #f7f9fc;
}

.controls__actions,
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

.demo-block.header { background: #e6f0ff; }
.demo-block.sidebar { background: #f9f1e7; }
.demo-block.content { background: #e8f7ed; }
.demo-block.sticky { background: #fff2d6; }
.demo-block.tabs { background: #f6ecff; }
.demo-block.footer { background: #e9eef5; }
.demo-block.replication { background: #e1f5fe; }
.demo-block.center { background: #f0f4ff; }

@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
