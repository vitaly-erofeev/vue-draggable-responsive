<template>
  <div id="app" style="height: 100%">
    <div style="width: 20%;display:inline-block;float: left;height: 100%; overflow: auto">
      <button @click="addContainer(0)">add</button>
      <button @click="addContainer(1, $event)">addT</button>
      <button @click="addContainer(1, $event, true)">addStretched</button>
      <button @click="addChildren">addChild</button>
      <button @click="load">load</button>
      <button @click="addSticky($event)">addSticky</button>
      <button @click="get">get</button>
      <button @click="addWithTabs(1, $event)">addWithTabs</button>
      <button @click="addTab">addTab</button>
      <button @click="removeTab">removeTab</button>
      <button @click="preview = !preview">preview: {{ preview }}</button>
      <button @click="remove">remove active</button>
      <button @click="clearActive">clear active</button>
      <button @click="addReplication(1, $event)">add replication</button>
      <button @click="toggleHide">toggle hide</button>
      <button @click="switchWidth">switch width</button>
      <button @click="switchSticky">sticky</button>
      <button @click="addContainerPercent(1, $event)">percent container</button>
      <button @click="addContainerPixel(1, $event)">pixel container</button>
      <button @click="addMinMax()">add min_max</button>
      <button @click="addHorizontalCenter()">add hor center</button>
      <button @click="addVerticalCenter()">add ver center</button>
      <button @click="disableMove">disable move</button>
      <button @click="showHidden = !showHidden">toggle show hidden: {{ showHidden }}</button>
      <select v-model="(activeBlock || {}).sticky">
        <option value="tr">Top-Right</option>
        <option value="tl">Top-Left</option>
        <option value="br">Bottom-Right</option>
        <option value="bl">Bottom-Left</option>
      </select>
      <pre>{{ activeBlock }}</pre>
    </div>
    <vue-draggable-responsive
        ref="designer"
        style="height: 500px;width: 1059px;display: inline-block"
        :step="1"
        :show-hidden="showHidden"
        @start-drag="onStartDrag"
        v-show="!preview"
        @contextmenu="oncontext"
    >
      <template v-slot:content="{ block }">
        {{ block.guid }}
      </template>
    </vue-draggable-responsive>
    <vue-draggable-responsive-previewer
        v-if="preview"
        ref="previewer"
        style="height: 500px;width: 1059px;display: inline-block"
        :replication-callback="cl"
    >
      <template v-slot:content="{block}">
          <textarea :value="block.guid">
          </textarea>
      </template>
    </vue-draggable-responsive-previewer>
  </div>
</template>

<script>
import VueDraggableResponsive from './index.vue'
import VueDraggableResponsivePreviewer from '@/previewer.vue'
import { StickyToType } from '@/domain/model/StickyTo'
import { SizeTypes } from '@/domain/model/SizeTypes'
import { TabPosition } from '@/domain/model/TabProperties'

export default {
  name: 'App',
  components: {
    VueDraggableResponsivePreviewer,
    VueDraggableResponsive
  },
  data () {
    return {
      activeBlock: undefined,
      preview: false,
      blocks: [],
      showHidden: false
    }
  },
  watch: {
    preview (value) {
      if (value) {
        this.blocks = this.$refs.designer.getBlocks()
        this.$nextTick(() => {
          this.$refs.previewer.setBlocks(this.blocks)
        })
      }
    }
  },
  methods: {
    addVerticalCenter () {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        onCenter: {
          vertical: true
        },
        sizeTypes: {
          width: '%',
          height: '%',
          top: 'px',
          left: '%'
        }
      })
    },
    addHorizontalCenter () {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        onCenter: {
          horizontal: true
        },
        sizeTypes: {
          width: '%',
          height: '%',
          top: 'px',
          left: '%'
        }
      })
    },
    addMinMax () {
      this.$refs.designer.addBlock({
        width: 100,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        minMax: {
          maxWidth: 200
        },
        onCenter: {
          horizontal: true
        },
        sizeTypes: {
          width: '%',
          height: '%',
          top: 'px',
          left: '%'
        }
      })
    },
    cl (event) {
      console.log(event)
    },
    switchSticky () {
      if (this.activeBlock) {
        if (this.activeBlock.stickyTo?.guid) {
          this.activeBlock.stickyTo.guid = undefined
          return false
        }
        let block = this.$refs.designer.getBlocks().filter((item) => item.guid !== this.activeBlock.guid)[0]
        this.activeBlock.stickyTo = {
          guid: block.guid,
          type: StickyToType.TOP
        }
      }
    },
    toggleHide () {
      if (this.activeBlock) {
        this.activeBlock.isHidden = !this.activeBlock.isHidden
      }
    },
    addReplication (type, event) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        type,
        sizeTypes: {
          width: 'px',
          height: 'px',
          top: 'px',
          left: 'px'
        },
        event,
        parentGuid: this.activeBlock?.guid,
        className: 'red',
        replication: {
          columns: 1,
          function: async () => {
            const count = 7
            let counter = 0
            let answer = []
            while (count > counter) {
              answer.push({ id: counter + 1 })
              counter++
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
            return answer
          },
          verticalMargin: {
            type: 'px',
            value: 20
          },
          horizontalMargin: {
            type: 'px',
            value: 20
          }
        }
      })
    },
    clearActive () {
      this.$refs.designer.clearActiveBlock()
      this.activeBlock = undefined
    },
    oncontext (a) {
      console.log(a)
    },
    removeTab () {
      if (this.activeBlock) {
        if (this.activeBlock.tabs?.use) {
          this.activeBlock.tabs.list.splice(0, 1)
        }
      }
    },
    addTab () {
      if (this.activeBlock) {
        if (!this.activeBlock.tabs) {
          this.$set(this.activeBlock, 'tabs', {
            use: false,
            list: [],
            position: TabPosition.TOP
          })
        }
        this.activeBlock.tabs.use = true
        if (this.activeBlock.tabs?.use) {
          this.activeBlock.tabs.list.push({
            name: `Новая вкладка - ${this.activeBlock.tabs.list.length}`,
            guid: Date.now()
          })
        }
      }
    },
    disableMove () {
      this.$set(this.activeBlock, 'disabledMove', !(this.activeBlock.disabledMove || false))
    },
    switchWidth () {
      if (!this.activeBlock) {
        return false
      }
      this.activeBlock.sizeTypes.bottom = this.activeBlock.sizeTypes.bottom ===
      SizeTypes.PERCENT ? SizeTypes.PIXEL : SizeTypes.PERCENT
    },
    addWithTabs (type, event) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 10,
        top: 30,
        right: 0,
        sticky: 'tl',
        type,
        event,
        isStretched: true,
        tabs: {
          class: 'test',
          use: true,
          containerStyle: 'background: grey',
          tabStyle: 'color:black',
          tabArrowsClass: 'testArr',
          activeTabStyle: 'color:green',
          requiredTabs: ['asdasdas'],
          list: [
            {
              guid: 'asdasdas',
              name: 'test'
            },
            {
              guid: 'asdasdas2',
              name: 'test2'
            }
          ],
          position: 'top'
        }
      })
    },
    load () {
      this.activeBlock = undefined
      this.$refs.designer.setBlocks([
        {
          'alias': 'Контейнер 0',
          'bottom': 1128,
          'children': [
            {
              'bottom': 889,
              'children': [],
              'disabledMove': false,
              'guid': '234e558e-b9de-4154-8eb3-f5281ad0cc38',
              'height': 54,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': true,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 88,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 182,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': 'px',
                'top': 'px',
                'width': 'px'
              },
              'sticky': 'tr',
              'top': 13,
              'width': 137
            },
            {
              'bottom': 970,
              'children': [],
              'disabledMove': false,
              'guid': '8c4b1fb8-ea2d-40f7-8442-b511a381d0cb',
              'height': 42,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 2,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 69,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': '%',
                'top': 'px',
                'width': '%'
              },
              'sticky': 'tl',
              'top': 19.2578125,
              'width': 63
            },
            {
              'alias': 'Контейнер 0.2',
              'bottom': 1139,
              'children': [
                {
                  'bottom': 1081,
                  'children': [],
                  'disabledMove': false,
                  'guid': '824dcde7-f0e7-4a04-8242-357d8f8b9e05',
                  'height': 91,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 0,
                  'parentGuid': 'f4372a2e-981d-4492-adba-51268a1acc24',
                  'properties': [],
                  'right': 80,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 0.416656494140625,
                  'width': 54
                }
              ],
              'disabledMove': false,
              'guid': 'f4372a2e-981d-4492-adba-51268a1acc24',
              'height': 95,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': true,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': true,
              'left': 2,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 78,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': '%',
                'top': 'px',
                'width': '%'
              },
              'sticky': 'tl',
              'stickyTo': {
                'guid': '8c4b1fb8-ea2d-40f7-8442-b511a381d0cb',
                'type': 'top'
              },
              'style': '',
              'top': 0,
              'width': 72
            },
            {
              'bottom': 727,
              'children': [],
              'disabledMove': false,
              'guid': '5660309a-97cf-4ad5-a4cc-91da02922a9b',
              'height': 40,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 37,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 68,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': '%',
                'top': 'px',
                'width': '%'
              },
              'sticky': 'tl',
              'top': 18,
              'width': 23
            },
            {
              'bottom': 976,
              'children': [],
              'disabledMove': false,
              'guid': '624246fd-ec75-4340-8dfb-f3611132a602',
              'height': 47,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 65,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 78,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': '%',
                'top': 'px',
                'width': '%'
              },
              'sticky': 'tl',
              'top': 0.265625,
              'width': 9
            },
            {
              'bottom': 981,
              'children': [],
              'disabledMove': false,
              'guid': '0fad9501-d68d-4292-b0cc-d351a48f97bf',
              'height': 55,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 77,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 101,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': 'px',
                'top': 'px',
                'width': 'px'
              },
              'sticky': 'tr',
              'top': 12,
              'width': 70
            },
            {
              'bottom': 981,
              'children': [],
              'disabledMove': false,
              'guid': 'ac3209cc-39f4-4c95-b1b9-d46d9b240cb2',
              'height': 55,
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 77,
              'parentGuid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
              'properties': [],
              'right': 23,
              'sizeTypes': {
                'bottom': '%',
                'height': 'px',
                'left': '%',
                'right': 'px',
                'top': 'px',
                'width': 'px'
              },
              'sticky': 'tr',
              'top': 12,
              'width': 70
            }
          ],
          'disabledMove': false,
          'guid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
          'height': 89,
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': true,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': true,
          'left': 7,
          'properties': [],
          'right': 82,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'style': 'position: absolute;\nbackground: #FFFFFF;\nborder-top: 6px solid #4682B4;\nborder-left: 1px solid #D2D6DA;\nborder-right: 1px solid #D2D6DA;\nborder-radius: 8px 8px 0px 0px;\n--overflow: hidden;\n--background: #4682B4;\n',
          'top': 1,
          'width': 86
        },
        {
          'alias': 'Контейнер 0',
          'bottom': 1124,
          'children': [
            {
              'alias': 'Контейнер 0',
              'bottom': 1130,
              'children': [
                {
                  'alias': 'Контейнер 0.2',
                  'bottom': 1126,
                  'children': [
                    {
                      'bottom': 1009,
                      'children': [],
                      'disabledMove': false,
                      'guid': '8faaafde-7156-43b4-9d88-ad82673c0ca1',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow: hidden;\n',
                      'top': 22,
                      'width': 50
                    },
                    {
                      'bottom': 998,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'ad37dfc6-adbc-48a5-97c1-109aa853af8f',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 77,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '8faaafde-7156-43b4-9d88-ad82673c0ca1',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 965,
                      'children': [],
                      'disabledMove': false,
                      'guid': '12163615-a4b4-4838-9f56-e811cfa98db6',
                      'height': 37,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 69,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 33,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'top': 188,
                      'width': 480
                    },
                    {
                      'bottom': 920,
                      'children': [],
                      'disabledMove': false,
                      'guid': '755c8f62-a34a-4544-a12b-ba0459853150',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 74,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'eee8b0d7-a736-4d5e-aecd-98b8a22a187a',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 870,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'e88e00b5-d1e1-44bf-b845-7f21ad30dbcc',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 71,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 34,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'style': 'overflow: hidden;\n',
                      'top': 22,
                      'width': 480
                    },
                    {
                      'bottom': 841,
                      'children': [],
                      'disabledMove': false,
                      'guid': '1b5597f6-a115-4e2e-b636-6d9ac6865b77',
                      'height': 56,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 70,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 34,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'style': 'overflow: hidden;\n',
                      'top': 78,
                      'width': 480
                    },
                    {
                      'bottom': 938,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'eee8b0d7-a736-4d5e-aecd-98b8a22a187a',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'ad37dfc6-adbc-48a5-97c1-109aa853af8f',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 930,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9065eea5-a970-403d-8a1b-f38d656697cb',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 63,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 34,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'style': 'overflow: hidden;\n',
                      'top': 135,
                      'width': 480
                    },
                    {
                      'bottom': 969,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'ab9dafb4-bab9-41a7-93a9-995c4a03a3e3',
                      'height': 28,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 81,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 5,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'top': 193,
                      'width': 227
                    },
                    {
                      'bottom': 571,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'b106076e-4292-40c4-84c0-71cda8b88dce',
                      'height': 41,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '31babdfc-76d7-4c31-a996-44305c96dadd',
                        'type': 'top'
                      },
                      'top': 2,
                      'width': 50
                    },
                    {
                      'bottom': 536,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c9698ede-6963-4b40-a844-73bb52b5a064',
                      'height': 102,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 53,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 7,
                      'width': 13
                    },
                    {
                      'bottom': 766,
                      'children': [],
                      'disabledMove': false,
                      'guid': '8ca3e359-cc8f-43b6-9cdd-396975fc898d',
                      'height': 44,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 81,
                      'onCenter': {
                        'horizontal': false,
                        'vertical': false
                      },
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 7,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'style': 'overflow:hidden',
                      'top': 184,
                      'width': 159
                    },
                    {
                      'bottom': 770,
                      'children': [],
                      'disabledMove': false,
                      'guid': '76b8cd3e-16ff-472f-adc4-14b21ea9770d',
                      'height': 93,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 64,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'b106076e-4292-40c4-84c0-71cda8b88dce',
                        'type': 'top'
                      },
                      'style': 'overflow:hidden',
                      'top': 0,
                      'width': 45
                    },
                    {
                      'bottom': 765,
                      'children': [],
                      'disabledMove': false,
                      'guid': '247b8eb9-9cf2-4a46-b93c-f0bed0e676bf',
                      'height': 26,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 1159,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 323,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'style': 'overflow:hidden',
                      'top': 236,
                      'width': 190
                    },
                    {
                      'bottom': 1091,
                      'children': [],
                      'disabledMove': false,
                      'guid': '4a0106b8-adee-4cf1-85ee-76eb7607163d',
                      'height': 27,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 85,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 34,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 236,
                      'width': 218
                    },
                    {
                      'bottom': 1063,
                      'children': [],
                      'disabledMove': false,
                      'guid': '3a028b34-48bd-4f8b-9491-f52c1e557c05',
                      'height': 57,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 85,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 34,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 260,
                      'width': 218
                    },
                    {
                      'bottom': 911,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'fc2b30a1-71f9-42af-bc12-cd0bafa6411f',
                      'height': 55,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '755c8f62-a34a-4544-a12b-ba0459853150',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 975,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'd6cceb53-01fa-4b44-a2ae-83ebebf02675',
                      'height': 57,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 69,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 281,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': 'px',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 260,
                      'width': 233
                    },
                    {
                      'bottom': 736,
                      'children': [],
                      'disabledMove': false,
                      'guid': '31babdfc-76d7-4c31-a996-44305c96dadd',
                      'height': 55,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'fc2b30a1-71f9-42af-bc12-cd0bafa6411f',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 981,
                      'children': [],
                      'disabledMove': false,
                      'guid': '5eccccda-902c-4dfa-9889-5d1f18f5776a',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 83,
                      'parentGuid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                      'properties': [],
                      'right': 5,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tr',
                      'style': 'overflow:hidden',
                      'top': 186,
                      'width': 195
                    }
                  ],
                  'disabledMove': false,
                  'guid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                  'height': 361,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 79,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'style': 'overflow: hidden;\nborder-left: 1px solid #D2D6DA;\nborder-right: 1px solid #D2D6DA;\nborder-buttom : 1px solid #D2D6DA;\nborder-top : 1px solid #D2D6DA;\n-box-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);\nborder-radius: 4px;',
                  'top': 14,
                  'width': 98
                },
                {
                  'alias': 'Контейнер 0.1',
                  'bottom': 1126,
                  'children': [
                    {
                      'bottom': 933,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'd0a0e2d7-e935-4135-8329-0f2c52393b62',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 20,
                      'width': 50
                    },
                    {
                      'bottom': 901,
                      'children': [],
                      'disabledMove': false,
                      'guid': '00f4c53b-e7aa-40c3-bb66-486fe7104033',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'd0a0e2d7-e935-4135-8329-0f2c52393b62',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 881,
                      'children': [],
                      'disabledMove': false,
                      'guid': '69f6591a-2c2f-4e7f-bfb0-f011af7041f0',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '00f4c53b-e7aa-40c3-bb66-486fe7104033',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 860,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'e979808a-962b-46af-9b34-230a8f9599ac',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 73,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '69f6591a-2c2f-4e7f-bfb0-f011af7041f0',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 625,
                      'children': [],
                      'disabledMove': false,
                      'guid': '4d77ffae-d637-450d-89a8-a3cc4dae3d48',
                      'height': 100,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 2,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e979808a-962b-46af-9b34-230a8f9599ac',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 2,
                      'width': 50
                    },
                    {
                      'bottom': 984,
                      'children': [],
                      'disabledMove': false,
                      'guid': '18092c7e-77ba-4333-a9b9-c2c53ad8e5ed',
                      'height': 100,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 79,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 73,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 115.28515625,
                      'width': 20
                    },
                    {
                      'bottom': 658,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'cbef3145-4801-4676-bc20-d9339bd800fc',
                      'height': 100,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 79,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 9,
                      'width': 20
                    },
                    {
                      'bottom': 789,
                      'children': [],
                      'disabledMove': false,
                      'guid': '4b89d108-293f-4b21-8eb8-8eeb87b988fd',
                      'height': 73,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 45,
                      'parentGuid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 249.79998779296875,
                      'width': 50
                    }
                  ],
                  'disabledMove': false,
                  'guid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                  'height': 349,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 79,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '695a4c21-9782-41f6-bdfb-a5676215abc8',
                    'type': 'top'
                  },
                  'style': '--border-left: 1px solid #D2D6DA;\n--border-right: 1px solid #D2D6DA;\n-box-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);\n--border-radius: 4px;\noverflow: hidden;',
                  'top': 25,
                  'width': 98
                },
                {
                  'alias': 'Контейнер 0.3',
                  'bottom': 1136,
                  'children': [
                    {
                      'bottom': 991,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'e94694cf-0d4e-4695-beb6-7918e2ba04d7',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 29,
                      'width': 11
                    },
                    {
                      'bottom': 970,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f8f98d16-2887-400b-a466-fcd56138ee13',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 26,
                      'width': 85
                    },
                    {
                      'bottom': 969,
                      'children': [],
                      'disabledMove': false,
                      'guid': '2244a2d7-54d2-49ff-8e14-d00a4fb7ef88',
                      'height': 41,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 29,
                      'width': 63
                    },
                    {
                      'bottom': 979,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f841add7-0f49-46fb-9882-474d973397f0',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e94694cf-0d4e-4695-beb6-7918e2ba04d7',
                        'type': 'top'
                      },
                      'top': 3,
                      'width': 11
                    },
                    {
                      'bottom': 985,
                      'children': [],
                      'disabledMove': false,
                      'guid': '73be1623-3fd8-4c36-bfa0-4c48176fe8d8',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e94694cf-0d4e-4695-beb6-7918e2ba04d7',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 85
                    },
                    {
                      'bottom': 966,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f5fdf2ea-329a-4de7-8c8e-6873d351d01b',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e94694cf-0d4e-4695-beb6-7918e2ba04d7',
                        'type': 'top'
                      },
                      'top': 3,
                      'width': 63
                    },
                    {
                      'bottom': 959,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'e5f9e08a-a3e5-4fa6-8979-9d798c216ed8',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f841add7-0f49-46fb-9882-474d973397f0',
                        'type': 'top'
                      },
                      'top': 3,
                      'width': 11
                    },
                    {
                      'bottom': 956,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'a05a1af1-135e-4768-8453-4003a19f25d6',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f841add7-0f49-46fb-9882-474d973397f0',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 85
                    },
                    {
                      'bottom': 966,
                      'children': [],
                      'disabledMove': false,
                      'guid': '7d7c060b-7ea4-4275-9c93-a200838a3c3d',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f841add7-0f49-46fb-9882-474d973397f0',
                        'type': 'top'
                      },
                      'top': 3,
                      'width': 63
                    },
                    {
                      'bottom': 838,
                      'children': [],
                      'disabledMove': false,
                      'guid': '13baef0d-8211-4a7b-8186-b052608ae509',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e5f9e08a-a3e5-4fa6-8979-9d798c216ed8',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 11
                    },
                    {
                      'bottom': 966,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9c991eb3-8217-4b8b-b069-76015aca92d3',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e5f9e08a-a3e5-4fa6-8979-9d798c216ed8',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 63
                    },
                    {
                      'bottom': 824,
                      'children': [],
                      'disabledMove': false,
                      'guid': '01261853-feb3-457e-a588-ee1c15c6b728',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 66,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e5f9e08a-a3e5-4fa6-8979-9d798c216ed8',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 85
                    },
                    {
                      'bottom': 1060,
                      'children': [],
                      'disabledMove': false,
                      'guid': '6ee197a2-a556-4d25-8a60-2c756375c7d9',
                      'height': 420,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                      'properties': [],
                      'right': 77,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '01261853-feb3-457e-a588-ee1c15c6b728',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden\n',
                      'top': 0,
                      'width': 96
                    }
                  ],
                  'disabledMove': false,
                  'guid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                  'height': 620,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': true,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '1a46e300-aa83-4e5f-8528-44a4fd7c8c66',
                    'type': 'top'
                  },
                  'style': '{"block":{"isStretched":false,"isActive":false,"isActiveAsParent":false,"isHover":false,"isHidden":false,"isHighlight":false,"properties":[],"top":568.3333129882812,"right":77,"bottom":1060,"left":3,"sticky":"tl","sizeTypes":{"top":"px","left":"%","right":"%","width":"%","bottom":"%","height":"px"},"children":[],"width":96,"height":420,"style":"overflow-y: hidden\\n","parentTabGuid":"7169c1d1-f3fa-4190-8afa-36a3d7eb4921","isEditing":false,"component":{"guid":"20063514-e5e6-41e9-8177-ed17a3cc1083","name":"basic/AnalyticTable/index","group":"basic","rendered":true,"isSelected":true,"properties":{"CSS":"height: 90%;","margin":"0px","source":{"type":"query","entityId":398,"queryParameters":[{"type":"field","alias":"adres","isKey":false,"isXref":false,"isActive":true,"attribute":"attr_6897_","equalsType":"eq","setTimeFilter":false},{"type":"field","alias":"kvart","isKey":false,"isXref":false,"isActive":true,"attribute":"attr_6879_","equalsType":"eq","setTimeFilter":false}]},"columns":[{"guid":"27814447-32c0-45d6-a4d0-2e1452e78187","type":["stringField"],"field":"vid_r","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Тип работ","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"f27b716d-de9b-4364-a557-849dc582cb54","type":["stringField"],"field":"vid_otkl","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Вид отключения","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"c6d14d88-65c7-4028-832a-13cafb1ba89a","type":["stringField"],"field":"vid_rab","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Вид работ","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"c279d718-c656-4e97-b697-439b868427c8","type":["stringField"],"field":"opisanie","action":{"saveCard":{"isCloseAfterSave":false},"type":"open_card","filters":[],"card":{"registryId":null,"type":"read","fieldId":null,"cardId":null,"queryRegistry":"id_object","queryCard":"otk_card","queryRecord":"id_card","isWindow":false,"windowWidth":25,"windowTitle":null,"frameGuid":null,"defaults":[],"componentsGuid":[]},"refreshReplication":{"blocks":[]}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Описание работ","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"51b7f4e1-6125-4a35-9462-e9c0ff9d9c76","type":["stringField"],"field":"adres_dashb","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Адрес","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"8ad4b7e8-8158-413a-934f-ab59a1b6ebce","type":["stringField"],"field":"kv","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Квартира","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"6bbbeb5a-d438-47c3-aaad-333026a74578","type":["dateField"],"field":"date_start","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agDateColumnFilter","columnType":"dateField","headerName":"Дата возникновения ","isExtended":true,"enableRowGroup":true},{"guid":"d402ae40-3f37-4f0f-842d-2e35d8790b23","type":["stringField"],"field":"vr_nach","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Время начала работ","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"2a292a76-1b2f-49a4-a869-21d464d7ced0","type":["stringField"],"field":"vr_oconch","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","columnType":"stringField","headerName":"Время окончания работ","isExtended":true,"filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"enableRowGroup":true},{"guid":"684e54d2-e2ac-4e1f-91dc-559e501181c9","type":["dateField"],"field":"create_date","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agDateColumnFilter","columnType":"dateField","headerName":"Дата создания записи в системе","isExtended":true,"enableRowGroup":true},{"headerName":"Номер отключения ","field":"num_ot","type":["stringField"],"enableRowGroup":true,"columnType":"stringField","guid":"a7c68bea-5705-4687-8853-0b841ebfaa58","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agTextColumnFilter","filterParams":{"filterOptions":["contains","notContains","equals","notEqual","blank","notBlank"]},"isExtended":true},{"headerName":"Плановая дата устранения","field":"date_plan_close","type":["dateField"],"enableRowGroup":true,"columnType":"dateField","guid":"af754b84-e740-4578-a9bb-1e97849a7179","action":{"saveCard":{"isCloseAfterSave":false}},"filter":"agDateColumnFilter","isExtended":true}],"filters":[],"pageSize":50,"CSSClasses":"","isReadonly":{"type":"never","allowOldFormat":true,"isComplex":false,"condition_type":"and","conditions":[],"expressions":{"children":[],"logicalOperator":"and"}},"wrapHeader":true,"filterModel":{},"isPivotMode":false,"rowClassRules":[],"isShowBtnRefresh":true,"initialColumnState":[{"colId":"num_ot","width":128,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"vid_r","width":165,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"vid_otkl","width":200,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"vid_rab","width":236,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"opisanie","width":495,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"adres_dashb","width":200,"hide":true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"kv","width":200,"hide":true,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"date_start","width":173,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"vr_nach","width":148,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"vr_oconch","width":166,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"create_date","width":144,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null},{"colId":"date_plan_close","width":146,"hide":false,"pinned":null,"sort":null,"sortIndex":null,"aggFunc":null,"rowGroup":false,"rowGroupIndex":null,"pivot":false,"pivotIndex":null,"flex":null}],"isHiddenFromTab":false},"initialType":"AnalyticTable/index"}}}overflow: hidden;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);\nborder-radius: 4px;',
                  'top': 25,
                  'width': 98
                },
                {
                  'alias': 'Контейнер 0.3',
                  'bottom': 1138,
                  'children': [
                    {
                      'bottom': 838,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'a27b75e9-5086-43a7-a91c-d71badade02f',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 72,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow: hidden;',
                      'top': 20,
                      'width': 50
                    },
                    {
                      'bottom': 775,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9a6c34f5-1621-462f-a93c-dec961805d7d',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 53,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow: hidden;',
                      'top': 20,
                      'width': 20
                    },
                    {
                      'bottom': 973,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'ada08d87-8790-482f-bc23-333c0ec842f2',
                      'height': 64,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 72,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 74,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 12.02734375,
                      'width': 4
                    },
                    {
                      'bottom': 771,
                      'children': [],
                      'disabledMove': false,
                      'guid': '453332bd-89c3-449f-89ce-25dacb68c9aa',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'a27b75e9-5086-43a7-a91c-d71badade02f',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 634,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'd7676124-3e15-4943-a9c0-f63beed07351',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 53,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '9a6c34f5-1621-462f-a93c-dec961805d7d',
                        'type': 'top'
                      },
                      'style': 'overflow:hidden',
                      'top': 0,
                      'width': 46
                    },
                    {
                      'bottom': 729,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9e6ddddf-33b1-43bf-93df-73c87dbe56ac',
                      'height': 49,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 85,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 5,
                      'width': 14
                    },
                    {
                      'bottom': 753,
                      'children': [],
                      'disabledMove': false,
                      'guid': '6dafd04d-a77d-400f-949d-e87ff0786994',
                      'height': 94,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 83,
                      'parentGuid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                      'properties': [],
                      'right': 63,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 0.361083984375,
                      'width': 15
                    }
                  ],
                  'disabledMove': false,
                  'guid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                  'height': 150,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 79,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '556b0789-1b64-4bb9-b0cf-df2712c05874',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);',
                  'top': 25,
                  'width': 98,
                  'widthCalc': {
                    'type': '-',
                    'value': null
                  }
                },
                {
                  'alias': 'Контейнер 0.4',
                  'bottom': 1128,
                  'children': [
                    {
                      'bottom': 910,
                      'children': [],
                      'disabledMove': false,
                      'guid': '4fab06a5-08a3-4ce3-9826-7cebb5d0cb80',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow: hidden;\n',
                      'top': 20,
                      'width': 50
                    },
                    {
                      'bottom': 856,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f75c42e8-7a0a-47bc-b2b5-66935529b22c',
                      'height': 201,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 2,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 77,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '4fab06a5-08a3-4ce3-9826-7cebb5d0cb80',
                        'type': 'top'
                      },
                      'top': 16,
                      'width': 57
                    },
                    {
                      'bottom': 836,
                      'children': [],
                      'disabledMove': false,
                      'guid': '30ddc979-92b6-4d13-9c84-2d81d7a919ad',
                      'height': 197,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '0c77b23b-a6c0-468e-ab9d-974fe019f516',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 57
                    },
                    {
                      'bottom': 699,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'b1596fc9-cb58-4ec2-a569-1653fdcdd41b',
                      'height': 55,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 74,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '30ddc979-92b6-4d13-9c84-2d81d7a919ad',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;\n',
                      'top': 2,
                      'width': 50
                    },
                    {
                      'bottom': 558,
                      'children': [],
                      'disabledMove': false,
                      'guid': '0c77b23b-a6c0-468e-ab9d-974fe019f516',
                      'height': 310,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 2,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 66,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f75c42e8-7a0a-47bc-b2b5-66935529b22c',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 57
                    },
                    {
                      'bottom': 585,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'cdfaf045-53fe-406f-a449-75481d09a759',
                      'height': 26,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 77,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f75c42e8-7a0a-47bc-b2b5-66935529b22c',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden',
                      'top': 6,
                      'width': 16
                    },
                    {
                      'bottom': 726,
                      'children': [],
                      'disabledMove': false,
                      'guid': '88e07a71-66e2-44d7-9aca-c7bc99325711',
                      'height': 52,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 85,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 14,
                      'width': 15
                    },
                    {
                      'bottom': 736,
                      'children': [],
                      'disabledMove': false,
                      'guid': '7844a59a-979d-493b-8e2d-02fea3cb9ab1',
                      'height': 46,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 77,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 239,
                      'width': 20
                    },
                    {
                      'bottom': 627,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f75ae843-65eb-436e-941c-07c744ee1073',
                      'height': 83,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 53,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 54,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 3,
                      'width': 30
                    },
                    {
                      'bottom': 736,
                      'children': [],
                      'disabledMove': false,
                      'guid': '6ad37d14-3edc-484e-a5fe-9c602996b7f3',
                      'height': 745,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 61,
                      'parentGuid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                      'properties': [],
                      'right': 78,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'top': 65,
                      'width': 37
                    }
                  ],
                  'disabledMove': false,
                  'guid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                  'height': 852,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '80d5db30-cbe3-4ee1-85e8-9dcb4d9b3306',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);',
                  'top': 25,
                  'width': 98,
                  'widthCalc': {
                    'type': '-',
                    'value': null
                  }
                },
                {
                  'alias': 'Контейнер 0.7',
                  'bottom': 1135,
                  'children': [
                    {
                      'alias': 'Контейнер 0.7.11',
                      'bottom': 1128,
                      'children': [
                        {
                          'bottom': 786,
                          'children': [],
                          'disabledMove': false,
                          'guid': '027bb994-d0c2-4a67-a851-bf01fbc1e55c',
                          'height': 113,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 0,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 73,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'top': 30.27734375,
                          'width': 2
                        },
                        {
                          'bottom': 960,
                          'children': [],
                          'className': 'addex',
                          'disabledMove': false,
                          'guid': '69309b71-55a6-456a-9231-9d2f9d4ff289',
                          'height': 62,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 75,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'style': 'overflow: hidden;',
                          'top': 0,
                          'width': 96
                        },
                        {
                          'bottom': 992,
                          'children': [],
                          'className': 'addex',
                          'disabledMove': false,
                          'guid': '0b695395-1774-47b6-a646-142ade38775d',
                          'height': 62,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 76,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': '69309b71-55a6-456a-9231-9d2f9d4ff289',
                            'type': 'top'
                          },
                          'style': 'overflow: hidden;',
                          'top': 0,
                          'width': 96
                        },
                        {
                          'bottom': 913,
                          'children': [],
                          'className': 'addex',
                          'disabledMove': false,
                          'guid': '0d214e8f-b291-46f3-92e1-eda8a7a0601c',
                          'height': 62,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 75,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': '52cb4f27-7df3-41a3-abfb-4af6166e6658',
                            'type': 'top'
                          },
                          'style': 'overflow: hidden;',
                          'top': 15,
                          'width': 96
                        },
                        {
                          'alias': 'Контейнер 0.7.11.8',
                          'bottom': 1101,
                          'children': [
                            {
                              'bottom': 933,
                              'children': [],
                              'disabledMove': false,
                              'guid': 'b9a57350-9b89-47b9-b2b1-c6c71289ad8e',
                              'height': 705,
                              'interactive': {
                                'action': {
                                  '_': null,
                                  'saveCard': {
                                    'isCloseAfterSave': false
                                  }
                                },
                                'containerHoverStyle': '',
                                'pluginName': null
                              },
                              'isActive': false,
                              'isActiveAsParent': false,
                              'isEditing': false,
                              'isHidden': false,
                              'isHighlight': false,
                              'isHover': false,
                              'isLoading': false,
                              'isStretched': false,
                              'left': 2,
                              'parentGuid': '52cb4f27-7df3-41a3-abfb-4af6166e6658',
                              'parentTabGuid': '51104280-23da-4f2c-85fc-0ffe73f77e1c',
                              'properties': [],
                              'right': 74,
                              'sizeTypes': {
                                'bottom': '%',
                                'height': 'px',
                                'left': '%',
                                'right': '%',
                                'top': 'px',
                                'width': '%'
                              },
                              'sticky': 'tl',
                              'stickyTo': {
                                'type': 'top'
                              },
                              'top': 0,
                              'width': 96
                            }
                          ],
                          'disabledMove': false,
                          'guid': '52cb4f27-7df3-41a3-abfb-4af6166e6658',
                          'height': 710,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': true,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 0,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 80,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': '0b695395-1774-47b6-a646-142ade38775d',
                            'type': 'top'
                          },
                          'tabs': {
                            'activeGuid': 'e67ddbbe-ba31-4fa2-99d7-ab9977624daa',
                            'list': [
                              {
                                'guid': 'e67ddbbe-ba31-4fa2-99d7-ab9977624daa',
                                'name': 'Без  таблицы'
                              },
                              {
                                'guid': '51104280-23da-4f2c-85fc-0ffe73f77e1c',
                                'name': ''
                              }
                            ],
                            'position': 'top',
                            'use': true
                          },
                          'top': 0,
                          'width': 100
                        },
                        {
                          'alias': 'Контейнер 0.7.11.8',
                          'bottom': 1091,
                          'children': [
                            {
                              'bottom': 933,
                              'children': [],
                              'disabledMove': false,
                              'guid': 'ad76725e-0aed-4d19-a628-230d1f3b2192',
                              'height': 705,
                              'interactive': {
                                'action': {
                                  '_': null,
                                  'saveCard': {
                                    'isCloseAfterSave': false
                                  }
                                },
                                'containerHoverStyle': '',
                                'pluginName': null
                              },
                              'isActive': false,
                              'isActiveAsParent': false,
                              'isEditing': false,
                              'isHidden': false,
                              'isHighlight': false,
                              'isHover': false,
                              'isLoading': false,
                              'isStretched': false,
                              'left': 2,
                              'parentGuid': 'f7f4fc3a-0859-4769-a88e-4b3a6bc93a37',
                              'parentTabGuid': '6cccbd79-db1f-4e3d-afd4-f4d6a6a1b39d',
                              'properties': [],
                              'right': 74,
                              'sizeTypes': {
                                'bottom': '%',
                                'height': 'px',
                                'left': '%',
                                'right': '%',
                                'top': 'px',
                                'width': '%'
                              },
                              'sticky': 'tl',
                              'stickyTo': {
                                'type': 'top'
                              },
                              'top': 0,
                              'width': 96
                            }
                          ],
                          'disabledMove': false,
                          'guid': 'f7f4fc3a-0859-4769-a88e-4b3a6bc93a37',
                          'height': 705,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': true,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 0,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 80,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': '0d214e8f-b291-46f3-92e1-eda8a7a0601c',
                            'type': 'top'
                          },
                          'tabs': {
                            'activeGuid': '925159b1-28aa-47a1-bb8d-5f4ad769cb8e',
                            'list': [
                              {
                                'guid': '925159b1-28aa-47a1-bb8d-5f4ad769cb8e',
                                'name': 'Без таблицы'
                              },
                              {
                                'guid': '6cccbd79-db1f-4e3d-afd4-f4d6a6a1b39d',
                                'name': ''
                              }
                            ],
                            'position': 'top',
                            'use': true
                          },
                          'top': 0,
                          'width': 100
                        },
                        {
                          'bottom': 946,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'b5192685-36dd-4603-822b-aba62a78f104',
                          'height': 40,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 340,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 71,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': 'px',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'top': 15,
                          'width': 76
                        },
                        {
                          'bottom': 932,
                          'children': [],
                          'disabledMove': false,
                          'guid': '809d6b78-010a-4179-a1af-de2ac1c2c690',
                          'height': 40,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 340,
                          'parentGuid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                          'properties': [],
                          'right': 72,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': 'px',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': '52cb4f27-7df3-41a3-abfb-4af6166e6658',
                            'type': 'top'
                          },
                          'top': 30,
                          'width': 76
                        }
                      ],
                      'disabledMove': false,
                      'guid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                      'height': 64,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 78,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'ec48a802-c780-407d-ba04-3aad379a5639',
                        'type': 'top'
                      },
                      'style': 'overflow-x: hidden\n',
                      'top': 15,
                      'width': 100
                    },
                    {
                      'alias': '',
                      'bottom': 967,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': '46a55289-17bd-4c1f-87fe-0806f8882a23',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow: hidden;',
                      'top': 0,
                      'width': 96
                    },
                    {
                      'bottom': 969,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': 'b257e50d-bee7-49f8-968e-dd3c858465fe',
                      'height': 63,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '7058a490-b12e-4daa-ab18-44665a71a39c',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 956,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': '99c359fd-a6c2-4c3a-aea9-8991e593d1f8',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'ebac547a-6527-45b6-a606-0ac585168ed7',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 977,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': '10bf23df-c4d8-4338-a14c-43402e4e39a7',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '99ebfe08-6c20-4e53-bac4-6eb38f7d8f42',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 967,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': '9eff666d-3a3c-44aa-8824-e5bd9afd567b',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '02f7b7df-bb5a-47c0-9a8d-10833e2c9f51',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 983,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': '8e4086e6-1f73-46db-ab16-b1a09c61cb10',
                      'height': 64,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 992,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': 'e948a227-f6d2-4e7b-ae07-e738d8603405',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '846567b8-b737-421c-afea-1b1b2b5819da',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 992,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': 'b656c352-abfb-4aa2-ba71-a95bd941511b',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f1bbdccc-0e24-462f-bf9f-5e8b901d4c7a',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'bottom': 992,
                      'children': [],
                      'className': 'addex',
                      'disabledMove': false,
                      'guid': 'f9d9dea4-bb1c-48a5-b313-9c2be0fa7c29',
                      'height': 62,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'c59d2ff6-7d16-4491-976c-877a5014e14c',
                        'type': 'top'
                      },
                      'style': 'overflow: hidden;',
                      'top': 15,
                      'width': 96
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1091,
                      'children': [
                        {
                          'bottom': 969,
                          'children': [],
                          'disabledMove': false,
                          'guid': '8d5086bc-8784-4045-a683-8347f06d838b',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '7058a490-b12e-4daa-ab18-44665a71a39c',
                          'parentTabGuid': '9c1584a9-afac-416e-9769-e90315c1e9ef',
                          'properties': [],
                          'right': 75,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': '46a55289-17bd-4c1f-87fe-0806f8882a23',
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': '7058a490-b12e-4daa-ab18-44665a71a39c',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '46a55289-17bd-4c1f-87fe-0806f8882a23',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '62850a62-6d09-4552-9a5a-8cd59fe32a77',
                        'list': [
                          {
                            'guid': '62850a62-6d09-4552-9a5a-8cd59fe32a77',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': '9c1584a9-afac-416e-9769-e90315c1e9ef',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1093,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'e9dc8131-dac3-4c45-9db4-87673b7dea14',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'ebac547a-6527-45b6-a606-0ac585168ed7',
                          'parentTabGuid': 'ed7419eb-6a77-481f-8d1e-97d0de882105',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'ebac547a-6527-45b6-a606-0ac585168ed7',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 79,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'b257e50d-bee7-49f8-968e-dd3c858465fe',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': 'f94f080b-c2f5-4c2f-9a2f-22da96d8b44b',
                        'list': [
                          {
                            'guid': 'f94f080b-c2f5-4c2f-9a2f-22da96d8b44b',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': 'ed7419eb-6a77-481f-8d1e-97d0de882105',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 2,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1092,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'a00729d8-358f-4164-96f6-c3915a5e03d1',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '99ebfe08-6c20-4e53-bac4-6eb38f7d8f42',
                          'parentTabGuid': 'd2395631-3b98-4b40-92c6-d1a34f5c14ac',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': '99ebfe08-6c20-4e53-bac4-6eb38f7d8f42',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '99c359fd-a6c2-4c3a-aea9-8991e593d1f8',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '78fc2832-241f-4472-a7b1-2eeed6980dc6',
                        'list': [
                          {
                            'guid': '78fc2832-241f-4472-a7b1-2eeed6980dc6',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': 'd2395631-3b98-4b40-92c6-d1a34f5c14ac',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1090,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': '9d94f6de-71de-4f46-93b2-53c8923b49d4',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '02f7b7df-bb5a-47c0-9a8d-10833e2c9f51',
                          'parentTabGuid': '3feae998-ecdf-482a-a4c5-ce876fdda15e',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': '02f7b7df-bb5a-47c0-9a8d-10833e2c9f51',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '10bf23df-c4d8-4338-a14c-43402e4e39a7',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '203e7ba6-0fbd-43ee-a8f2-9134bb5ccd38',
                        'list': [
                          {
                            'guid': '203e7ba6-0fbd-43ee-a8f2-9134bb5ccd38',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': '3feae998-ecdf-482a-a4c5-ce876fdda15e',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1092,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'c88698d1-dea1-480a-b734-c5b5a671a12c',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'ec48a802-c780-407d-ba04-3aad379a5639',
                          'parentTabGuid': '7624e3ef-8848-46f8-baa1-09329b6ee3d4',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'ec48a802-c780-407d-ba04-3aad379a5639',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '9eff666d-3a3c-44aa-8824-e5bd9afd567b',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '5960b45f-748b-4fef-a900-12109fabed25',
                        'list': [
                          {
                            'guid': '5960b45f-748b-4fef-a900-12109fabed25',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': '7624e3ef-8848-46f8-baa1-09329b6ee3d4',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1087,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': '372e6300-624e-4341-a08f-aa65a74b32cd',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '846567b8-b737-421c-afea-1b1b2b5819da',
                          'parentTabGuid': '64a604da-cd1a-46cb-956a-6f2f94b9b260',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': '846567b8-b737-421c-afea-1b1b2b5819da',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 79,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '8e4086e6-1f73-46db-ab16-b1a09c61cb10',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '944db1e1-df57-48a1-91b1-028e1ea0e3db',
                        'list': [
                          {
                            'guid': '944db1e1-df57-48a1-91b1-028e1ea0e3db',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': '64a604da-cd1a-46cb-956a-6f2f94b9b260',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1078,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'cdf64ee7-d5c5-4ef8-be44-c44cc8578d15',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': true,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'f1bbdccc-0e24-462f-bf9f-5e8b901d4c7a',
                          'parentTabGuid': 'd1b335f5-102a-4197-b0f3-36f6ef1b2950',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'f1bbdccc-0e24-462f-bf9f-5e8b901d4c7a',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'e948a227-f6d2-4e7b-ae07-e738d8603405',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '2b475841-3552-4aa7-9125-f6bf7f21ea98',
                        'list': [
                          {
                            'guid': '2b475841-3552-4aa7-9125-f6bf7f21ea98',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': 'd1b335f5-102a-4197-b0f3-36f6ef1b2950',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1077,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'e7b64a78-fe9f-4e18-a6d9-c5257d7b6e5c',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'c59d2ff6-7d16-4491-976c-877a5014e14c',
                          'parentTabGuid': '8be64531-7a33-4945-a92a-40c0f433a99d',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': 'b656c352-abfb-4aa2-ba71-a95bd941511b',
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'c59d2ff6-7d16-4491-976c-877a5014e14c',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'b656c352-abfb-4aa2-ba71-a95bd941511b',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '51295180-a54c-43be-b958-f921891fb965',
                        'list': [
                          {
                            'guid': '51295180-a54c-43be-b958-f921891fb965',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': '8be64531-7a33-4945-a92a-40c0f433a99d',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'alias': 'Контейнер 0.7.28',
                      'bottom': 1081,
                      'children': [
                        {
                          'bottom': 933,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'efce24f0-3869-4817-8ee3-85459aeff5a6',
                          'height': 705,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': true,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': '64e475e3-ec85-4de6-bbd5-b77aad76620b',
                          'parentTabGuid': 'b85764be-5aee-4dd1-a521-9c853390af58',
                          'properties': [],
                          'right': 74,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': '64e475e3-ec85-4de6-bbd5-b77aad76620b',
                      'height': 710,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 79,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f9d9dea4-bb1c-48a5-b313-9c2be0fa7c29',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '14dfcd24-372a-48be-bdb2-14fa0d6bdf61',
                        'list': [
                          {
                            'guid': '14dfcd24-372a-48be-bdb2-14fa0d6bdf61',
                            'name': 'Без таблицы'
                          },
                          {
                            'guid': 'b85764be-5aee-4dd1-a521-9c853390af58',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    },
                    {
                      'bottom': 926,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'e0b41353-a5d2-447c-ae19-2d6e107ee3a9',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 15,
                      'width': 76
                    },
                    {
                      'bottom': 933,
                      'children': [],
                      'disabledMove': false,
                      'guid': '8888edc6-04a2-48b0-a59a-2c62ac1da693',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '7058a490-b12e-4daa-ab18-44665a71a39c',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 946,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9910c0be-09b4-44af-89e6-11c0c6b06ded',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'ebac547a-6527-45b6-a606-0ac585168ed7',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 932,
                      'children': [],
                      'disabledMove': false,
                      'guid': '921678b2-39b7-48f5-9978-075e03a83ded',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '99ebfe08-6c20-4e53-bac4-6eb38f7d8f42',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 926,
                      'children': [],
                      'disabledMove': false,
                      'guid': '15cd48cb-13c1-4786-82c5-b8992545b949',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '02f7b7df-bb5a-47c0-9a8d-10833e2c9f51',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 927,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c4174254-966a-4f82-a307-eba04e992ec8',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '3cb4a484-783d-4788-b7de-b1dd3e346862',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 921,
                      'children': [],
                      'disabledMove': false,
                      'guid': '5e2b947f-f503-43c6-98c1-4ebb992a99d4',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 71,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '846567b8-b737-421c-afea-1b1b2b5819da',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 946,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'e14deb49-9d39-4c93-8273-181bc74aa47e',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 72,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'f1bbdccc-0e24-462f-bf9f-5e8b901d4c7a',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    },
                    {
                      'bottom': 928,
                      'children': [],
                      'disabledMove': false,
                      'guid': '5767325f-8ed1-4422-a830-557466304c0b',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 340,
                      'parentGuid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                      'properties': [],
                      'right': 72,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': 'px',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'c59d2ff6-7d16-4491-976c-877a5014e14c',
                        'type': 'top'
                      },
                      'top': 30,
                      'width': 76
                    }
                  ],
                  'disabledMove': false,
                  'guid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                  'height': 462,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': true,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '3b094e78-8aba-4f1c-985f-43a547791efb',
                    'type': 'top'
                  },
                  'style': 'overflow-x: hidden',
                  'top': 25,
                  'width': 100,
                  'widthCalc': {
                    'type': '-',
                    'value': 4
                  }
                },
                {
                  'bottom': 591,
                  'children': [],
                  'disabledMove': false,
                  'guid': '85a3fb77-ac75-4c2f-abf8-c2ee273cbb97',
                  'height': 85,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '9bba0fd2-6c81-44aa-8d98-0ba4345ea104',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 50
                },
                {
                  'bottom': 562,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'd07211e3-96cb-4ca1-8777-925497705ecf',
                  'height': 172,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '85a3fb77-ac75-4c2f-abf8-c2ee273cbb97',
                    'type': 'top'
                  },
                  'top': 1,
                  'width': 50
                },
                {
                  'bottom': 984,
                  'children': [],
                  'disabledMove': false,
                  'guid': '136004fe-800e-4224-a695-dad04b92c496',
                  'height': 59,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 53,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '85a3fb77-ac75-4c2f-abf8-c2ee273cbb97',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden',
                  'top': 7,
                  'width': 74
                },
                {
                  'bottom': 896,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'fd08b23a-4224-4f66-b1b4-5116ad1b9560',
                  'height': 400,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '1e2ccc0a-475d-4a8a-8565-38b49838ab34',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '1eef9f38-e9ac-4775-864a-b80ca6748eb0',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 96
                },
                {
                  'bottom': 974,
                  'children': [],
                  'disabledMove': false,
                  'guid': '1eef9f38-e9ac-4775-864a-b80ca6748eb0',
                  'height': 35,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '1e2ccc0a-475d-4a8a-8565-38b49838ab34',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 22,
                  'width': 96
                },
                {
                  'bottom': 974,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'f1502e98-4146-4046-9471-0d8ff8e8c620',
                  'height': 35,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '1e2ccc0a-475d-4a8a-8565-38b49838ab34',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'fd08b23a-4224-4f66-b1b4-5116ad1b9560',
                    'type': 'top'
                  },
                  'top': 22,
                  'width': 96
                },
                {
                  'bottom': 963,
                  'children': [],
                  'disabledMove': false,
                  'guid': '9887b3e8-3687-4c2c-8c43-79c9a28961ad',
                  'height': 410,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '1e2ccc0a-475d-4a8a-8565-38b49838ab34',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'f1502e98-4146-4046-9471-0d8ff8e8c620',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 96
                },
                {
                  'bottom': 984,
                  'children': [],
                  'disabledMove': false,
                  'guid': '0ee58231-bdc9-4d92-bfee-64ce3549f7e0',
                  'height': 77,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 77,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '052339f3-2de1-4ab4-a205-4e7bb960e217',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 20
                },
                {
                  'bottom': 505,
                  'children': [],
                  'disabledMove': false,
                  'guid': '1d7d2f63-b350-4a7c-a921-20395b015b89',
                  'height': 100,
                  'heightCalc': {
                    'type': '-',
                    'value': 220
                  },
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': '%',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 211,
                  'width': 50
                },
                {
                  'bottom': 827,
                  'children': [],
                  'disabledMove': false,
                  'guid': '33d36616-5c86-425f-8754-2c3d20c378de',
                  'height': 62,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 68,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '0990649e-ad36-4519-afa0-361141c20b92',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 0,
                  'width': 50
                },
                {
                  'alias': 'Контейнер 0.19',
                  'bottom': 1129,
                  'children': [
                    {
                      'bottom': 973,
                      'children': [],
                      'disabledMove': false,
                      'guid': '4da08bcf-6549-461c-988a-cc1af84f4491',
                      'height': 45,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 12,
                      'width': 32
                    },
                    {
                      'bottom': 898,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c7815bd7-4326-46ff-8c7b-5e0c00810421',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '4da08bcf-6549-461c-988a-cc1af84f4491',
                        'type': 'top'
                      },
                      'top': 4,
                      'width': 43
                    },
                    {
                      'bottom': 817,
                      'children': [],
                      'disabledMove': false,
                      'guid': '548ee0d8-81f6-40b6-967e-191381940454',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 45,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '4da08bcf-6549-461c-988a-cc1af84f4491',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 34
                    },
                    {
                      'bottom': 600,
                      'children': [],
                      'disabledMove': false,
                      'guid': '5d502906-773d-4142-aa43-869ad6c34a74',
                      'height': 27,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 45,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'c7815bd7-4326-46ff-8c7b-5e0c00810421',
                        'type': 'top'
                      },
                      'top': 1,
                      'width': 34
                    },
                    {
                      'bottom': 898,
                      'children': [],
                      'disabledMove': false,
                      'guid': '3ed169d6-b509-48d4-8aea-96716736c928',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'c7815bd7-4326-46ff-8c7b-5e0c00810421',
                        'type': 'top'
                      },
                      'top': 2,
                      'width': 43
                    },
                    {
                      'bottom': 582,
                      'children': [],
                      'disabledMove': false,
                      'guid': '81f35070-5666-45f8-9920-3dfe92b352bf',
                      'height': 70,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '3ed169d6-b509-48d4-8aea-96716736c928',
                        'type': 'top'
                      },
                      'top': 5,
                      'width': 50
                    },
                    {
                      'bottom': 682,
                      'children': [],
                      'disabledMove': false,
                      'guid': '3ca811df-d6d8-4304-a431-d7cebf9df724',
                      'height': 79,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 62,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '81f35070-5666-45f8-9920-3dfe92b352bf',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 581,
                      'children': [],
                      'disabledMove': false,
                      'guid': '3156001e-956e-4377-b0f5-0bfa78797530',
                      'height': 25,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 54,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '3ca811df-d6d8-4304-a431-d7cebf9df724',
                        'type': 'top'
                      },
                      'top': 1,
                      'width': 30
                    },
                    {
                      'bottom': 898,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'bba27ccc-5016-4317-ac32-b70881d4d82a',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '3ca811df-d6d8-4304-a431-d7cebf9df724',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 43
                    },
                    {
                      'bottom': 731,
                      'children': [],
                      'disabledMove': false,
                      'guid': '01d24188-0453-40d9-91bd-ae816ab6cf51',
                      'height': 86,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'bba27ccc-5016-4317-ac32-b70881d4d82a',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 50
                    },
                    {
                      'alias': 'date_vozvr',
                      'bottom': 735,
                      'children': [],
                      'disabledMove': false,
                      'guid': '8c585c0e-8de8-4d02-b54a-81d06f46d819',
                      'height': 69,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '01d24188-0453-40d9-91bd-ae816ab6cf51',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 50
                    },
                    {
                      'alias': 'Контейнер 0.19.13',
                      'bottom': 1093,
                      'children': [
                        {
                          'bottom': 712,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'fcabd19b-cb80-4fa5-9959-2271a8f8d176',
                          'height': 290,
                          'interactive': {
                            'action': {
                              '_': null,
                              'saveCard': {
                                'isCloseAfterSave': false
                              }
                            },
                            'containerHoverStyle': '',
                            'pluginName': null
                          },
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'e64be6f5-ad2c-464c-93fb-59ebde934c78',
                          'parentTabGuid': 'c6df1f11-af49-4ce0-bb6a-99dc2548c6e7',
                          'properties': [],
                          'right': 73,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 96
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'e64be6f5-ad2c-464c-93fb-59ebde934c78',
                      'height': 294,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 0,
                      'parentGuid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '8c585c0e-8de8-4d02-b54a-81d06f46d819',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '6b69df88-42d0-4f12-9fb3-db7db8316b3b',
                        'list': [
                          {
                            'guid': '6b69df88-42d0-4f12-9fb3-db7db8316b3b',
                            'name': ''
                          },
                          {
                            'guid': 'c6df1f11-af49-4ce0-bb6a-99dc2548c6e7',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 2,
                      'width': 100
                    }
                  ],
                  'disabledMove': false,
                  'guid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                  'height': 806,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                    'type': 'top'
                  },
                  'style': 'overflow-x: hidden;\nborder-left: 1px solid #D2D6DA;\n--border-right: 1px solid #D2D6DA;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);',
                  'top': 25,
                  'width': 98
                },
                {
                  'alias': 'Контейнер 0.20',
                  'bottom': 860,
                  'children': [
                    {
                      'bottom': 973,
                      'children': [],
                      'disabledMove': false,
                      'guid': '7ff67800-9125-4738-b3d1-689e7ec804f3',
                      'height': 44,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 12,
                      'width': 47
                    },
                    {
                      'bottom': 898,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'd2c10bc1-7130-4b4a-8005-ce8da025edb6',
                      'height': 35,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '7ff67800-9125-4738-b3d1-689e7ec804f3',
                        'type': 'top'
                      },
                      'top': 1,
                      'width': 54
                    },
                    {
                      'bottom': 681,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'a0a69a12-1ba0-45f6-88bb-8b4bd5b6bf1a',
                      'height': 25,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 89,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 46,
                      'width': 8
                    },
                    {
                      'bottom': 745,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f42cb0dc-c701-426f-9d97-a35ca31090d1',
                      'height': 26,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 88,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 66,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 88,
                      'width': 9
                    },
                    {
                      'bottom': 898,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'd2e66aa1-1bd9-4764-a7e3-58ddce0fcecc',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'd2c10bc1-7130-4b4a-8005-ce8da025edb6',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 54
                    },
                    {
                      'bottom': 742,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c1a16a89-14d8-4f19-b542-cb37a6422ec9',
                      'height': 26,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 88,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 66,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 127,
                      'width': 10
                    },
                    {
                      'bottom': 898,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'a1d1c3dc-5e79-47d2-b3f2-ffa00770e376',
                      'height': 35,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'd2e66aa1-1bd9-4764-a7e3-58ddce0fcecc',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 54
                    },
                    {
                      'bottom': 734,
                      'children': [],
                      'disabledMove': false,
                      'guid': '255aed59-7201-47e8-8c90-71ea8baa6b94',
                      'height': 68,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 63,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'a1d1c3dc-5e79-47d2-b3f2-ffa00770e376',
                        'type': 'top'
                      },
                      'top': 3,
                      'width': 50
                    },
                    {
                      'bottom': 645,
                      'children': [],
                      'disabledMove': false,
                      'guid': '731d66d1-d328-4fdf-ad82-f14c2e1b8a2a',
                      'height': 79,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 64,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '255aed59-7201-47e8-8c90-71ea8baa6b94',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 739,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9881e6fd-8503-4d39-ad19-5a699314d60e',
                      'height': 65,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '731d66d1-d328-4fdf-ad82-f14c2e1b8a2a',
                        'type': 'top'
                      },
                      'top': 1,
                      'width': 50
                    }
                  ],
                  'disabledMove': false,
                  'guid': '826dc92d-ee80-4fed-b07e-b45ba8c574b0',
                  'height': 566,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'b469a7fc-0f79-4e3e-b9b7-dc72915fa88f',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nborder-left: 1px solid #D2D6DA;\n--border-right: 1px solid #D2D6DA;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);\nborder-radius: 4px;',
                  'top': 25,
                  'width': 41
                },
                {
                  'alias': 'Контейнер 0.21',
                  'bottom': 856,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'ab405aaf-dc0c-473f-8e7f-0c558512d81d',
                  'height': 63,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '69814986-28cb-4bcf-8bd1-e9eea931cbb9',
                    'type': 'top'
                  },
                  'top': 1,
                  'width': 98
                },
                {
                  'bottom': 722,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'f5dee42c-505b-4122-99de-92805e114425',
                  'height': 28,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '51edc0ff-9778-491b-95af-2f8068b50c41',
                  'properties': [],
                  'right': 60,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 11,
                  'width': 96
                },
                {
                  'bottom': 722,
                  'children': [],
                  'disabledMove': false,
                  'guid': '272a53e5-65fa-4ecd-8bdd-bf9ed322928f',
                  'height': 27,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 60,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 11,
                  'width': 96
                },
                {
                  'bottom': 553,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8d81fa23-4fd5-4dbd-bea5-f71d27845be3',
                  'height': 100,
                  'heightCalc': {
                    'type': '-',
                    'value': 65
                  },
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': '%',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'top': 47,
                  'width': 96
                },
                {
                  'bottom': 722,
                  'children': [],
                  'disabledMove': false,
                  'guid': '052339f3-2de1-4ab4-a205-4e7bb960e217',
                  'height': 33,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 60,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 11,
                  'width': 96
                },
                {
                  'bottom': 722,
                  'children': [],
                  'disabledMove': false,
                  'guid': '9bba0fd2-6c81-44aa-8d98-0ba4345ea104',
                  'height': 45,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                  'properties': [],
                  'right': 60,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 11,
                  'width': 96
                },
                {
                  'bottom': 772,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'f722f259-576b-44bf-9e13-0b42eb517c83',
                  'height': 112,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 58,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 1.265625,
                  'width': 20
                },
                {
                  'bottom': 886,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8a53230f-1b00-4e1e-902b-98d62a5fc763',
                  'height': 114,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 73,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 76,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 1.26953125,
                  'width': 19
                },
                {
                  'bottom': 537,
                  'children': [],
                  'disabledMove': false,
                  'guid': '0137da6b-d0a8-476e-98d0-a6c865608e4f',
                  'height': 56,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 53,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 64,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '0990649e-ad36-4519-afa0-361141c20b92',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 10,
                  'width': 12
                },
                {
                  'bottom': 511,
                  'children': [],
                  'disabledMove': false,
                  'guid': '69d67b6c-ed76-49b2-a967-4ac4a636da9d',
                  'height': 85,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 53,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 66,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '33d36616-5c86-425f-8754-2c3d20c378de',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 11,
                  'width': 12
                },
                {
                  'bottom': 842,
                  'children': [],
                  'disabledMove': false,
                  'guid': '0990649e-ad36-4519-afa0-361141c20b92',
                  'height': 58,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 72,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '54a5d2e1-f681-4904-8e58-6c36ed14a0f2',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 1,
                  'width': 50
                },
                {
                  'bottom': 772,
                  'children': [],
                  'disabledMove': false,
                  'guid': '40bfc972-a7d0-4b67-9ae9-129d7cd1c746',
                  'height': 43,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 67,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 76,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 256,
                  'width': 25
                },
                {
                  'alias': 'Контейнер 0.35',
                  'bottom': 1119,
                  'children': [
                    {
                      'bottom': 951,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'a491e222-4338-4acc-a845-8e47d89cb6aa',
                      'height': 531,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'b469a7fc-0f79-4e3e-b9b7-dc72915fa88f',
                      'properties': [],
                      'right': 78,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'a2275f6b-4dd4-4699-8edd-ab7c8a434657',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 96
                    },
                    {
                      'bottom': 1005,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'a2275f6b-4dd4-4699-8edd-ab7c8a434657',
                      'height': 200,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 2,
                      'parentGuid': 'b469a7fc-0f79-4e3e-b9b7-dc72915fa88f',
                      'properties': [],
                      'right': 75,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 20,
                      'width': 96
                    }
                  ],
                  'disabledMove': false,
                  'guid': 'b469a7fc-0f79-4e3e-b9b7-dc72915fa88f',
                  'height': 774,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': true,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '0f61501b-b828-40cc-9dae-a9fa377fb21c',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);',
                  'top': 25,
                  'width': 98,
                  'widthCalc': []
                },
                {
                  'bottom': 992,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'c37d4457-c136-4dc6-bfaa-39b30512962f',
                  'height': 92,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 67,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '0990649e-ad36-4519-afa0-361141c20b92',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 0,
                  'width': 28
                },
                {
                  'bottom': 553,
                  'children': [],
                  'disabledMove': false,
                  'guid': '22fab091-d54a-489b-a482-c6ee9663ff1b',
                  'height': 100,
                  'heightCalc': {
                    'type': '-',
                    'value': 65
                  },
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '51edc0ff-9778-491b-95af-2f8068b50c41',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': '%',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'top': 38,
                  'width': 96
                },
                {
                  'bottom': 501,
                  'children': [],
                  'disabledMove': false,
                  'guid': '54a5d2e1-f681-4904-8e58-6c36ed14a0f2',
                  'height': 43,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                  'properties': [],
                  'right': 65,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '052339f3-2de1-4ab4-a205-4e7bb960e217',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden;',
                  'top': 2,
                  'width': 50
                },
                {
                  'bottom': 752,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'e5b3afea-9099-403e-80f8-5deeafbc49ad',
                  'height': 100,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 23,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 43.79998779296875,
                  'width': 20
                },
                {
                  'bottom': 714,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'dc317b28-f154-47bd-aea8-fed9c364e642',
                  'height': 268,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 64,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'd1bd4c31-9c00-424f-ba58-41b8342c5cd4',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden',
                  'top': 0,
                  'width': 50
                },
                {
                  'bottom': 638,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'd1bd4c31-9c00-424f-ba58-41b8342c5cd4',
                  'height': 82,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 70,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'c01e79ec-89c7-462a-bc3a-0f5b7ba868c0',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden',
                  'top': 0,
                  'width': 50
                },
                {
                  'bottom': 594,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8c6162f7-973d-4bb3-a561-0676a2cd0487',
                  'height': 45,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 71,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 63,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'top': 207,
                  'width': 10
                },
                {
                  'bottom': 740,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'e1582e9b-cfd0-4825-aecc-e985c0de7833',
                  'height': 50,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 54,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 66,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'd1bd4c31-9c00-424f-ba58-41b8342c5cd4',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 14
                },
                {
                  'bottom': 739,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'b3ab763a-4556-4142-83c9-894a530093f9',
                  'height': 48,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 54,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 68,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 255,
                  'width': 14
                },
                {
                  'bottom': 733,
                  'children': [],
                  'disabledMove': false,
                  'guid': '5f34057b-1de7-43d3-a2df-5411f486e74a',
                  'height': 53,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 54,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 68,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 308,
                  'width': 15
                },
                {
                  'bottom': 755,
                  'children': [],
                  'disabledMove': false,
                  'guid': '0948b75c-4ffe-4be3-8e09-2e29c2de16b0',
                  'height': 52,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 83,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 205,
                  'width': 15
                },
                {
                  'bottom': 753,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'e288a7f9-2a55-42d3-a7e7-b90fd0287cbd',
                  'height': 39,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 63,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '51edc0ff-9778-491b-95af-2f8068b50c41',
                  'properties': [],
                  'right': 67,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 72,
                  'width': 12
                },
                {
                  'bottom': 734,
                  'children': [],
                  'disabledMove': false,
                  'guid': '69bcca47-d72b-43cb-baeb-5b8bef3bb1dc',
                  'height': 52,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 54,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 68,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 366,
                  'width': 21
                },
                {
                  'bottom': 726,
                  'children': [],
                  'disabledMove': false,
                  'guid': '1c1ec801-077d-4813-85be-d6caba93f22c',
                  'height': 53,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 54,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 67,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 195,
                  'width': 15
                },
                {
                  'bottom': 730,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'a4525c65-2bb9-4502-a56e-eb45e7adf6c6',
                  'height': 47,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 75,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 66,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 275,
                  'width': 22
                },
                {
                  'bottom': 725,
                  'children': [],
                  'disabledMove': false,
                  'guid': '9dfc0b7a-4ad9-4a8b-9ff7-7f7ff5db6308',
                  'height': 47,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 45,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 67,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 51,
                  'width': 7
                },
                {
                  'bottom': 658,
                  'children': [],
                  'disabledMove': false,
                  'guid': '0e250ee0-71d0-4af6-b3aa-58978a901d8a',
                  'height': 450,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'e4a5de1d-96fd-4a20-bd4c-1dd96ae6c1b6',
                  'properties': [],
                  'right': 41,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '76f60d07-ab18-4c68-8595-ec3a6f7d9462',
                    'type': 'top'
                  },
                  'top': 2,
                  'width': 97
                },
                {
                  'bottom': 757,
                  'children': [],
                  'disabledMove': false,
                  'guid': '6e1f47e5-1a03-44b1-89b0-8dce28a07663',
                  'height': 51,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 76,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 70,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 368,
                  'width': 14
                },
                {
                  'alias': 'Контейнер 0.50',
                  'bottom': 894,
                  'children': [
                    {
                      'bottom': 650,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'f09917b8-a5a7-4277-8ad0-a5bd9f946d38',
                      'height': 52,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 28,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 28,
                      'width': 19
                    },
                    {
                      'bottom': 775,
                      'children': [],
                      'disabledMove': false,
                      'guid': '48221731-bf05-4e87-beba-f3f63f2c1c92',
                      'height': 25,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 130,
                      'width': 27
                    },
                    {
                      'bottom': 749,
                      'children': [],
                      'disabledMove': false,
                      'guid': '45878def-58b3-4ebe-8845-6330b1b5d441',
                      'height': 50,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 28,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 64,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 112,
                      'width': 19
                    },
                    {
                      'bottom': 723,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c2fa939e-3fd7-4780-a6cc-20f43b38fa30',
                      'height': 38,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 48,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 129,
                      'width': 23
                    },
                    {
                      'bottom': 752,
                      'children': [],
                      'disabledMove': false,
                      'guid': '24dd6d1a-2df6-4904-82b2-1e09ee9f3cc4',
                      'height': 24,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 170,
                      'width': 27
                    },
                    {
                      'bottom': 729,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'ca35ab67-a327-4e09-8ee2-c7eda79f6e44',
                      'height': 49,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 28,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 72,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 153,
                      'width': 19
                    },
                    {
                      'bottom': 776,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'fc4b0d95-6ce4-437b-98a8-1bd58349d420',
                      'height': 60,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 193,
                      'width': 44
                    },
                    {
                      'bottom': 751,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'b7af4afb-8e77-49f9-81ac-23737d683382',
                      'height': 48,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 49,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 200,
                      'width': 17
                    },
                    {
                      'bottom': 973,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'afacf265-76b6-4fb3-9c58-414439db3b0a',
                      'height': 23,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 22,
                      'onCenter': {
                        'horizontal': true,
                        'vertical': false
                      },
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 8,
                      'width': 47
                    },
                    {
                      'bottom': 699,
                      'children': [],
                      'disabledMove': false,
                      'guid': '5536efbc-632d-41a7-a066-4793b2a1abac',
                      'height': 139,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'cce25f7e-603e-4b60-81cb-70287ff23f83',
                        'type': 'top'
                      },
                      'style': 'overflow:hidden',
                      'top': 76,
                      'width': 92
                    },
                    {
                      'bottom': 804,
                      'children': [],
                      'disabledMove': false,
                      'guid': '6f8181fd-1c0a-4bc8-92f1-5c3661f64880',
                      'height': 22,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 49,
                      'width': 29
                    },
                    {
                      'bottom': 1098,
                      'children': [],
                      'disabledMove': false,
                      'guid': '9d95f361-97dd-4f2f-92ec-150f253fb7ff',
                      'height': 94,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 63,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'cce25f7e-603e-4b60-81cb-70287ff23f83',
                        'type': 'top'
                      },
                      'top': 10,
                      'width': 61
                    },
                    {
                      'bottom': 939,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'ae27f19c-73de-4618-be18-6cdbb2bbb94e',
                      'height': 94,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 68,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 63,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'cce25f7e-603e-4b60-81cb-70287ff23f83',
                        'type': 'top'
                      },
                      'top': 10,
                      'width': 28
                    },
                    {
                      'bottom': 966,
                      'children': [],
                      'disabledMove': false,
                      'guid': '861421ee-42a9-4c2a-ba51-6c172a6a79e3',
                      'height': 19,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 64,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 87.6666259765625,
                      'width': 25
                    },
                    {
                      'bottom': 650,
                      'children': [],
                      'disabledMove': false,
                      'guid': '277bcbae-7240-4799-8b7b-387455bbc7a6',
                      'height': 52,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 28,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 67,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'style': 'overflow:hidden',
                      'top': 70,
                      'width': 19
                    },
                    {
                      'bottom': 1078,
                      'children': [],
                      'disabledMove': false,
                      'guid': '24cbb018-d077-4b88-9751-9ff5a9373d77',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 73,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 62,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tl',
                      'top': 150.33331298828125,
                      'width': 220
                    },
                    {
                      'bottom': 903,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'cce25f7e-603e-4b60-81cb-70287ff23f83',
                      'height': 88,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 4,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 249.5,
                      'width': 92
                    },
                    {
                      'bottom': 1066,
                      'children': [],
                      'disabledMove': false,
                      'guid': '0135e6b4-d0b2-4d3b-a88e-e5b70424e45c',
                      'height': 46,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 67,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 202,
                      'width': 21
                    },
                    {
                      'bottom': 1021,
                      'children': [],
                      'disabledMove': false,
                      'guid': '3ded5240-add8-4750-9022-1285f8f0ffa7',
                      'height': 36,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 73,
                      'parentGuid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                      'properties': [],
                      'right': 60,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 111.265625,
                      'width': 23
                    }
                  ],
                  'disabledMove': false,
                  'guid': '2a32d61f-79db-4bd1-b8a9-42c50e46d430',
                  'height': 566,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 43,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'b469a7fc-0f79-4e3e-b9b7-dc72915fa88f',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nborder-left: 1px solid #D2D6DA;\n--border-right: 1px solid #D2D6DA;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);\nborder-radius: 4px;',
                  'top': 21,
                  'width': 56
                },
                {
                  'bottom': 531,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'fb2b4ec2-6205-4a51-95c0-731efb8b0d7e',
                  'height': 75,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 14,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 70,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\n',
                  'top': 4,
                  'width': 228
                },
                {
                  'bottom': 720,
                  'children': [],
                  'disabledMove': false,
                  'guid': '9a949f82-4b47-43ae-ac56-3cff127c214a',
                  'height': 45,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 53,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 63,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'style': 'overflow:hidden;\ncolor: red',
                  'top': 61,
                  'width': 24
                },
                {
                  'bottom': 753,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'd3445a4b-947d-43dd-a032-2bd90a77d005',
                  'height': 445,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 81,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'fb2b4ec2-6205-4a51-95c0-731efb8b0d7e',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 97
                },
                {
                  'bottom': 740,
                  'children': [],
                  'disabledMove': false,
                  'guid': '57e04543-819e-46b7-b8a3-10a460661232',
                  'height': 75,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 255,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'style': 'overflow: hidden;\n',
                  'top': 4,
                  'width': 283
                },
                {
                  'bottom': 946,
                  'children': [],
                  'disabledMove': false,
                  'guid': '1f3b89ae-ba47-4a98-b782-d84ad7218136',
                  'height': 43,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 550,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'top': 8.49609375,
                  'width': 226
                },
                {
                  'bottom': 946,
                  'children': [],
                  'disabledMove': false,
                  'guid': '26f99905-2ada-442d-b25f-32ae89636a5b',
                  'height': 46,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 551,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'top': 57.49609375,
                  'width': 227
                },
                {
                  'bottom': 946,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'a426131d-60cd-4e5a-8fa1-a1742de7f847',
                  'height': 54,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 786,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'top': 5.49609375,
                  'width': 277
                },
                {
                  'bottom': 946,
                  'children': [],
                  'disabledMove': false,
                  'guid': '03f9567b-d3ad-48db-9b48-f003fc2ca96d',
                  'height': 48,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 784,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': 'px',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'top': 59.49609375,
                  'width': 326
                },
                {
                  'bottom': 992,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'a8416b03-c614-4fb0-9d6c-c448207e6a61',
                  'height': 100,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 588.3333129882812,
                  'width': 20
                },
                {
                  'bottom': 992,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'b3af1af1-32bb-45f9-a31a-37cf90463a47',
                  'height': 100,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 23,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 591.3333129882812,
                  'width': 20
                },
                {
                  'alias': 'Контейнер 0.62',
                  'bottom': 885,
                  'children': [
                    {
                      'bottom': 744,
                      'children': [],
                      'disabledMove': false,
                      'guid': '85a2b7da-cccb-451a-a4d8-fae1758e62c9',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 1,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 8,
                      'width': 13
                    },
                    {
                      'bottom': 744,
                      'children': [],
                      'disabledMove': false,
                      'guid': '99c4ca17-c0af-4d68-b9a6-9338a10a3532',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 16,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 8,
                      'width': 13
                    },
                    {
                      'bottom': 744,
                      'children': [],
                      'disabledMove': false,
                      'guid': '0970ed78-65aa-456e-98c6-7a67a2167d1c',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 31,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 8,
                      'width': 13
                    },
                    {
                      'bottom': 744,
                      'children': [],
                      'disabledMove': false,
                      'guid': '76a12fab-b574-436c-9365-08360c655ca6',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 46,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 8,
                      'width': 13
                    },
                    {
                      'bottom': 744,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c00a50f3-d222-4971-8dcc-4fdfec4e7c10',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 61,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 8,
                      'width': 13
                    },
                    {
                      'bottom': 744,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'bc18eeec-3cdc-4a09-882b-8c24989f8112',
                      'height': 45,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 76,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 8,
                      'width': 13
                    },
                    {
                      'bottom': 677,
                      'children': [],
                      'disabledMove': false,
                      'guid': '6adc08e1-8914-4949-b6b9-8112e1c87b6c',
                      'height': 100,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                      'properties': [],
                      'right': 66,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tl',
                      'top': 60,
                      'width': 280
                    }
                  ],
                  'disabledMove': false,
                  'guid': '7e7c5d75-b3ef-4ff4-b630-1e88fb642dce',
                  'height': 101,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 45,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'style': '/*тестирование возврата в работу*/',
                  'top': 589,
                  'width': 53
                },
                {
                  'bottom': 722,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'fab43868-bef7-46cf-b201-6a229fa3aabb',
                  'height': 28,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '8cebc482-0cbd-4f94-b4bb-129b67f0cba6',
                  'properties': [],
                  'right': 60,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 16,
                  'width': 96
                },
                {
                  'bottom': 1017,
                  'children': [],
                  'disabledMove': false,
                  'guid': '6910e29c-4201-4d5c-ab83-29c765f10cca',
                  'height': 100,
                  'heightCalc': {
                    'type': '-',
                    'value': 65
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '8cebc482-0cbd-4f94-b4bb-129b67f0cba6',
                  'properties': [],
                  'right': 78,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': '%',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 48,
                  'width': 96
                },
                {
                  'alias': 'Контейнер 0.64',
                  'bottom': 1075,
                  'children': [
                    {
                      'bottom': 781,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'cc30ef8f-68e1-48ca-8b12-be2bb9994c93',
                      'height': 69,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 74,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '41459b9e-4266-4bd1-b91b-12265c7460db',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 50
                    },
                    {
                      'bottom': 938,
                      'children': [],
                      'disabledMove': false,
                      'guid': '4c8ff50c-dc37-49b6-9958-1c04cf8c5959',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 53,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '41459b9e-4266-4bd1-b91b-12265c7460db',
                        'type': 'top'
                      },
                      'top': 1,
                      'width': 205
                    },
                    {
                      'bottom': 838,
                      'children': [],
                      'disabledMove': false,
                      'guid': '84f9f425-bf69-406a-acd7-4d3e701c2fa3',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 65,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'top': 20,
                      'width': 11
                    },
                    {
                      'bottom': 991,
                      'children': [],
                      'disabledMove': false,
                      'guid': '41459b9e-4266-4bd1-b91b-12265c7460db',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '84f9f425-bf69-406a-acd7-4d3e701c2fa3',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 11
                    },
                    {
                      'bottom': 969,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c59d3f3b-1e89-4486-9210-24f4aaf358c7',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'top': 20,
                      'width': 63
                    },
                    {
                      'bottom': 969,
                      'children': [],
                      'disabledMove': false,
                      'guid': '155c7277-3bc6-4919-8930-a20da8fbbadd',
                      'height': 41,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 68,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '84f9f425-bf69-406a-acd7-4d3e701c2fa3',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 63
                    },
                    {
                      'bottom': 970,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'b77340b6-edf9-4311-a305-e9054365ca1b',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '84f9f425-bf69-406a-acd7-4d3e701c2fa3',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 85
                    },
                    {
                      'bottom': 985,
                      'children': [],
                      'disabledMove': false,
                      'guid': '1f6b7a36-ab93-4b10-8834-564ce31d00e8',
                      'height': 40,
                      'interactive': {
                        'action': {
                          '_': null,
                          'saveCard': {
                            'isCloseAfterSave': false
                          }
                        },
                        'containerHoverStyle': '',
                        'pluginName': null
                      },
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 13,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 69,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'type': 'top'
                      },
                      'top': 20,
                      'width': 85
                    },
                    {
                      'bottom': 938,
                      'children': [],
                      'disabledMove': false,
                      'guid': '0886b238-422f-494a-920a-b868f9bf0f10',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 70,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '41459b9e-4266-4bd1-b91b-12265c7460db',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 177
                    },
                    {
                      'bottom': 938,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'c370206a-3379-4d62-86d7-862c5e6c07a1',
                      'height': 40,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 85,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 76,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': 'px'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '41459b9e-4266-4bd1-b91b-12265c7460db',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 177
                    },
                    {
                      'alias': 'Контейнер 0.64.12',
                      'bottom': 1093,
                      'children': [
                        {
                          'bottom': 740,
                          'children': [],
                          'disabledMove': false,
                          'guid': '4737f942-993e-4209-9042-fb8b6f56aff0',
                          'height': 109,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': true,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'c6a6b746-1d9c-4001-b455-02572080d124',
                          'parentTabGuid': 'eeaf5c4e-1c38-4961-b932-3cd2f0c81bca',
                          'properties': [],
                          'right': 70,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'guid': 'bc48e62d-5cd1-459b-979b-16362310f30f',
                            'type': 'top'
                          },
                          'top': 2,
                          'width': 96
                        },
                        {
                          'bottom': 1027,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'bc48e62d-5cd1-459b-979b-16362310f30f',
                          'height': 480,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 2,
                          'parentGuid': 'c6a6b746-1d9c-4001-b455-02572080d124',
                          'parentTabGuid': 'eeaf5c4e-1c38-4961-b932-3cd2f0c81bca',
                          'properties': [],
                          'right': 76,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': '%'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'style': 'overflow: hidden',
                          'top': 0,
                          'width': 96
                        },
                        {
                          'bottom': 1001,
                          'children': [],
                          'disabledMove': false,
                          'guid': '872020a2-51e4-4b28-983a-6e35a53331a6',
                          'height': 44,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 87,
                          'parentGuid': 'c6a6b746-1d9c-4001-b455-02572080d124',
                          'parentTabGuid': 'eeaf5c4e-1c38-4961-b932-3cd2f0c81bca',
                          'properties': [],
                          'right': 77,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': 'px',
                            'right': '%',
                            'top': 'px',
                            'width': 'px'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 42
                        },
                        {
                          'bottom': 1021,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'e171419e-e064-404e-aec9-35477fb80c04',
                          'height': 43,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 133,
                          'parentGuid': 'c6a6b746-1d9c-4001-b455-02572080d124',
                          'parentTabGuid': 'eeaf5c4e-1c38-4961-b932-3cd2f0c81bca',
                          'properties': [],
                          'right': 78,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': 'px',
                            'right': '%',
                            'top': 'px',
                            'width': 'px'
                          },
                          'sticky': 'tl',
                          'stickyTo': {
                            'type': 'top'
                          },
                          'top': 0,
                          'width': 51
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'c6a6b746-1d9c-4001-b455-02572080d124',
                      'height': 488,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': true,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 0,
                      'parentGuid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': 'cc30ef8f-68e1-48ca-8b12-be2bb9994c93',
                        'type': 'top'
                      },
                      'tabs': {
                        'activeGuid': '951cf15f-d725-4dbc-92be-a596d87ebb11',
                        'list': [
                          {
                            'guid': '951cf15f-d725-4dbc-92be-a596d87ebb11',
                            'name': ''
                          },
                          {
                            'guid': 'eeaf5c4e-1c38-4961-b932-3cd2f0c81bca',
                            'name': ''
                          }
                        ],
                        'position': 'top',
                        'use': true
                      },
                      'top': 0,
                      'width': 100
                    }
                  ],
                  'disabledMove': false,
                  'guid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                  'height': 167,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 80,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'eb28ce19-7c78-4d82-96d7-e2233af58323',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nbox-shadow: 0px 1px 10px #FF69B4, 0px 1px 1px rgba(0, 0, 0, 0.01);',
                  'top': 25,
                  'width': 98
                },
                {
                  'alias': 'Контейнер 0.65',
                  'bottom': 1105,
                  'children': [
                    {
                      'bottom': 940,
                      'children': [],
                      'disabledMove': false,
                      'guid': '61dc6c6f-de9a-4e8f-8ffa-8c3996809157',
                      'height': 36,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 2,
                      'parentGuid': '0f61501b-b828-40cc-9dae-a9fa377fb21c',
                      'properties': [],
                      'right': 70,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'top': 4.77734375,
                      'width': 23
                    },
                    {
                      'bottom': 736,
                      'children': [],
                      'disabledMove': false,
                      'guid': 'b54483e7-cdbb-4362-b222-bb059a40b7b4',
                      'height': 354,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 2,
                      'parentGuid': '0f61501b-b828-40cc-9dae-a9fa377fb21c',
                      'properties': [],
                      'right': 78,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '61dc6c6f-de9a-4e8f-8ffa-8c3996809157',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 47
                    },
                    {
                      'bottom': 757,
                      'children': [],
                      'disabledMove': false,
                      'guid': '0961d70c-b6ea-4ff9-bf06-56a7c0d097c7',
                      'height': 107,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': true,
                      'left': 51,
                      'parentGuid': '0f61501b-b828-40cc-9dae-a9fa377fb21c',
                      'properties': [],
                      'right': 73,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '61dc6c6f-de9a-4e8f-8ffa-8c3996809157',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 47
                    },
                    {
                      'alias': 'Контейнер 0.65.3',
                      'bottom': 1085,
                      'children': [
                        {
                          'bottom': 950,
                          'children': [],
                          'disabledMove': false,
                          'guid': 'dd083fba-9d11-4a5e-9e5c-476b67f71ddb',
                          'height': 31,
                          'isActive': false,
                          'isActiveAsParent': false,
                          'isEditing': false,
                          'isHidden': false,
                          'isHighlight': false,
                          'isHover': false,
                          'isLoading': false,
                          'isStretched': false,
                          'left': 13,
                          'parentGuid': 'e40dc32e-fd11-446c-8e24-34421cfb0045',
                          'properties': [],
                          'right': 0,
                          'sizeTypes': {
                            'bottom': '%',
                            'height': 'px',
                            'left': '%',
                            'right': '%',
                            'top': 'px',
                            'width': 'px'
                          },
                          'sticky': 'tr',
                          'top': 1,
                          'width': 249
                        }
                      ],
                      'disabledMove': false,
                      'guid': 'e40dc32e-fd11-446c-8e24-34421cfb0045',
                      'height': 70,
                      'isActive': false,
                      'isActiveAsParent': false,
                      'isEditing': false,
                      'isHidden': false,
                      'isHighlight': false,
                      'isHover': false,
                      'isLoading': false,
                      'isStretched': false,
                      'left': 51,
                      'parentGuid': '0f61501b-b828-40cc-9dae-a9fa377fb21c',
                      'properties': [],
                      'right': 80,
                      'sizeTypes': {
                        'bottom': '%',
                        'height': 'px',
                        'left': '%',
                        'right': '%',
                        'top': 'px',
                        'width': '%'
                      },
                      'sticky': 'tl',
                      'stickyTo': {
                        'guid': '0961d70c-b6ea-4ff9-bf06-56a7c0d097c7',
                        'type': 'top'
                      },
                      'top': 0,
                      'width': 47
                    }
                  ],
                  'disabledMove': false,
                  'guid': '0f61501b-b828-40cc-9dae-a9fa377fb21c',
                  'height': 399,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': true,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                  'properties': [],
                  'right': 79,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'e4415a0d-06cb-4f35-bbf3-8a1db8657e44',
                    'type': 'top'
                  },
                  'style': 'overflow: hidden;\nbox-shadow: 0px 1px 10px #4682B4, 0px 1px 1px rgba(0, 0, 0, 0.01);',
                  'top': 25,
                  'width': 98
                },
                {
                  'bottom': 872,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8c7e17d5-2ff3-4697-9b13-29e3a79904f6',
                  'height': 50,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '7169c1d1-f3fa-4190-8afa-36a3d7eb4921',
                  'properties': [],
                  'right': 75,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': '%',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 47,
                  'width': 100,
                  'widthCalc': {
                    'type': '-',
                    'value': 65
                  }
                },
                {
                  'bottom': 955,
                  'children': [],
                  'disabledMove': false,
                  'guid': '6b05d84a-ad72-453e-a4d5-edcd90c9df81',
                  'height': 52,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 77,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '7169c1d1-f3fa-4190-8afa-36a3d7eb4921',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 0.51171875,
                  'width': 20
                },
                {
                  'bottom': 984,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'b32d37a1-3385-4c65-8074-2487bd4874e3',
                  'height': 59,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 53,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                  'properties': [],
                  'right': 73,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': '85a3fb77-ac75-4c2f-abf8-c2ee273cbb97',
                    'type': 'top'
                  },
                  'style': 'overflow:hidden',
                  'top': 10,
                  'width': 74
                },
                {
                  'bottom': 722,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'c01e79ec-89c7-462a-bc3a-0f5b7ba868c0',
                  'height': 45,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 60,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 12,
                  'width': 96
                },
                {
                  'bottom': 1041,
                  'children': [],
                  'disabledMove': false,
                  'guid': '1d3b5f0b-85e5-4692-87bb-af22fb1a008a',
                  'height': 44,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 69,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'd1bd4c31-9c00-424f-ba58-41b8342c5cd4',
                    'type': 'top'
                  },
                  'top': 0,
                  'width': 19
                },
                {
                  'bottom': 1040,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'b043136b-7350-420b-a3c8-69f2f163af27',
                  'height': 100,
                  'heightCalc': {
                    'type': '-',
                    'value': 335
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                  'properties': [],
                  'right': 81,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': '%',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'type': 'top'
                  },
                  'top': 315,
                  'width': 96
                },
                {
                  'bottom': 646,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'e4fe13fd-e6a6-4887-bf13-f2ef71fd7371',
                  'height': 245,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 75,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'stickyTo': {
                    'guid': 'dc317b28-f154-47bd-aea8-fed9c364e642',
                    'type': 'top'
                  },
                  'top': 12,
                  'width': 95
                },
                {
                  'bottom': 947,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'af4853fd-7c54-4393-9c06-d4377f77f032',
                  'height': 100,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 2,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 75,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 699.5,
                  'width': 20
                },
                {
                  'bottom': 981,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8e1a7230-e5c7-44f8-9484-8b069a5186ef',
                  'height': 38,
                  'interactive': {
                    'action': {
                      '_': null,
                      'saveCard': {
                        'isCloseAfterSave': false
                      }
                    },
                    'containerHoverStyle': '',
                    'pluginName': null
                  },
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 83,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                  'properties': [],
                  'right': 18,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': 'px'
                  },
                  'sticky': 'tr',
                  'style': 'overflow:hidden',
                  'top': 24,
                  'width': 195
                },
                {
                  'bottom': 967,
                  'children': [],
                  'disabledMove': false,
                  'guid': '14272b5e-20d0-4552-98a7-93f99f4f307d',
                  'height': 74,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': true,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 85,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'e4a5de1d-96fd-4a20-bd4c-1dd96ae6c1b6',
                  'properties': [],
                  'right': 74,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 0.5078125,
                  'width': 14
                },
                {
                  'bottom': 866,
                  'children': [],
                  'disabledMove': false,
                  'guid': '76f60d07-ab18-4c68-8595-ec3a6f7d9462',
                  'height': 450,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'e4a5de1d-96fd-4a20-bd4c-1dd96ae6c1b6',
                  'properties': [],
                  'right': 51,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 23.51171875,
                  'width': 97
                },
                {
                  'bottom': 1060,
                  'children': [],
                  'disabledMove': false,
                  'guid': '20063514-e5e6-41e9-8177-ed17a3cc1083',
                  'height': 420,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 1,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '7169c1d1-f3fa-4190-8afa-36a3d7eb4921',
                  'properties': [],
                  'right': 77,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'style': 'overflow-y: hidden\n',
                  'top': 548.3333129882812,
                  'width': 96
                },
                {
                  'bottom': 773,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'c2b02cb5-ff80-4f4b-ab6c-717de50f3305',
                  'height': 34,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 74,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 65,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 222,
                  'width': 10
                },
                {
                  'bottom': 735,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8aecdbd5-8d67-444d-8b8d-b5d151040ad6',
                  'height': 28,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 85,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 67,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 73,
                  'width': 11
                },
                {
                  'bottom': 718,
                  'children': [],
                  'disabledMove': false,
                  'guid': '352355c2-c286-4ac4-9280-8c18cad0130d',
                  'height': 28,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 85,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 68,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 103,
                  'width': 11
                },
                {
                  'bottom': 752,
                  'children': [],
                  'disabledMove': false,
                  'guid': '8c62cf38-89b4-4ad5-9e78-ea6788eb2590',
                  'height': 44,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 80,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 68,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'style': 'overflow:hidden',
                  'top': 68,
                  'width': 4
                },
                {
                  'bottom': 537,
                  'children': [],
                  'disabledMove': false,
                  'guid': '78996a8d-75ff-4610-8fa8-2aaa651a2db4',
                  'height': 64,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 91,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 67,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 137,
                  'width': 8
                },
                {
                  'bottom': 750,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'da45acff-a49c-4e61-a261-67d240470675',
                  'height': 34,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 70,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 99,
                  'width': 5
                },
                {
                  'bottom': 741,
                  'children': [],
                  'disabledMove': false,
                  'guid': '5b23ab5e-a9bd-4871-b946-7997fa444e6e',
                  'height': 100,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 18,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'e4a5de1d-96fd-4a20-bd4c-1dd96ae6c1b6',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 527,
                  'width': 20
                },
                {
                  'bottom': 795,
                  'children': [],
                  'disabledMove': false,
                  'guid': 'b1751cd6-58da-4782-b48f-67e46baa0246',
                  'height': 100,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 35,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 67,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 0,
                  'width': 20
                },
                {
                  'bottom': 724,
                  'children': [],
                  'disabledMove': false,
                  'guid': '1bc317d0-e122-48bd-85d3-483c2a331303',
                  'height': 58,
                  'isActive': false,
                  'isActiveAsParent': false,
                  'isEditing': false,
                  'isHidden': false,
                  'isHighlight': false,
                  'isHover': false,
                  'isLoading': false,
                  'isStretched': false,
                  'left': 23,
                  'parentGuid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
                  'parentTabGuid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                  'properties': [],
                  'right': 69,
                  'sizeTypes': {
                    'bottom': '%',
                    'height': 'px',
                    'left': '%',
                    'right': '%',
                    'top': 'px',
                    'width': '%'
                  },
                  'sticky': 'tl',
                  'top': 8,
                  'width': 11
                }
              ],
              'disabledMove': false,
              'guid': '47cffc46-2884-4962-ae27-a3cea1ea96ed',
              'height': 100,
              'heightCalc': {
                'type': '-',
                'value': 50
              },
              'interactive': {
                'action': {
                  '_': null,
                  'saveCard': {
                    'isCloseAfterSave': false
                  }
                },
                'containerHoverStyle': '',
                'pluginName': null
              },
              'isActive': false,
              'isActiveAsParent': false,
              'isEditing': false,
              'isHidden': false,
              'isHighlight': false,
              'isHover': false,
              'isLoading': false,
              'isStretched': false,
              'left': 0,
              'parentGuid': '22f5a152-5dbc-4092-978d-e2163c56d3e5',
              'properties': [],
              'right': 81,
              'sizeTypes': {
                'bottom': '%',
                'height': '%',
                'left': '%',
                'right': '%',
                'top': 'px',
                'width': '%'
              },
              'sticky': 'tl',
              'style': 'background: #FFFFFF;\noverflow-x: hidden\n\n',
              'tabs': {
                'activeGuid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                'activeTabStyle': '\nborder-bottom: 5px solid #4682B4;\npadding: 5px',
                'containerStyle': 'overflow: hidden;\nheight: 40px;\n',
                'list': [
                  {
                    'guid': 'b2d33731-1c5c-4e2f-813a-a7ca88b3ef13',
                    'name': 'Регистрация заявки'
                  },
                  {
                    'guid': '3dc0414f-e704-4b4b-98b3-f565880c35dd',
                    'name': 'Доработка '
                  },
                  {
                    'guid': '1e2ccc0a-475d-4a8a-8565-38b49838ab34',
                    'name': 'История заявок'
                  },
                  {
                    'guid': '0bed6d7e-c537-4cae-8a4e-b77140028413',
                    'name': 'Запрос'
                  },
                  {
                    'guid': '9c187789-2294-4edb-95b0-b6b6c6d9dd9e',
                    'name': 'СМС информирование'
                  },
                  {
                    'guid': '6827ff27-6906-4948-a95b-adb54dc543c1',
                    'name': 'Информирование ГП'
                  },
                  {
                    'guid': '8cebc482-0cbd-4f94-b4bb-129b67f0cba6',
                    'name': 'Переписка'
                  },
                  {
                    'guid': '51edc0ff-9778-491b-95af-2f8068b50c41',
                    'name': 'Ответы'
                  },
                  {
                    'guid': 'e4a5de1d-96fd-4a20-bd4c-1dd96ae6c1b6',
                    'name': 'Файлы '
                  },
                  {
                    'guid': '7169c1d1-f3fa-4190-8afa-36a3d7eb4921',
                    'name': 'Тестирование отключений '
                  },
                  {
                    'guid': 'c01a868e-62e0-4396-b5aa-0e3ce01cca1e',
                    'name': 'История статуса заявки'
                  }
                ],
                'position': 'top',
                'tabStyle': 'font-style: normal;\nfont-size: 17px;\ncursor: pointer;\ncolor: #6E7B87;\ntext-align:center;\nwidth: 230px;\npadding: 5px',
                'use': true
              },
              'top': 44,
              'width': 100
            }
          ],
          'disabledMove': false,
          'guid': '22f5a152-5dbc-4092-978d-e2163c56d3e5',
          'height': 100,
          'heightCalc': {
            'type': '-',
            'value': 95
          },
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': true,
          'left': 7,
          'properties': [],
          'right': 81,
          'sizeTypes': {
            'bottom': '%',
            'height': '%',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'stickyTo': {
            'guid': '79118bee-ab9b-4b33-9d5c-8b671e09d062',
            'type': 'top'
          },
          'style': 'overflow: hidden;\nborder-left: 1px solid #D2D6DA;\nborder-right: 1px solid #D2D6DA;\nbox-shadow: 0px 4px 8px rgba(0, 0, 0, 0.12);\nborder-radius: 8px;',
          'top': 1,
          'width': 86
        },
        {
          'bottom': 1014,
          'children': [],
          'disabledMove': false,
          'guid': '7d2472e6-7cf1-4a39-a4aa-236ca162145e',
          'height': 119,
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 1,
          'properties': [],
          'right': 78,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 111.26171875,
          'width': 4
        },
        {
          'bottom': 918,
          'children': [],
          'disabledMove': false,
          'guid': '3117e4cd-c2ca-4005-9bd1-c647287d4fc9',
          'height': 103,
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 1,
          'properties': [],
          'right': 74,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 242.265625,
          'width': 4
        },
        {
          'bottom': 859,
          'children': [],
          'disabledMove': false,
          'guid': '819bac21-9f01-49a3-9e10-d377943b023a',
          'height': 127,
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 1,
          'properties': [],
          'right': 77,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 355,
          'width': 4
        },
        {
          'bottom': 819,
          'children': [],
          'disabledMove': false,
          'guid': '75ef6ec9-89c0-4a52-97b9-cfc4b1016b2d',
          'height': 54,
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 1,
          'properties': [],
          'right': 57,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 691.6666564941406,
          'width': 4
        },
        {
          'bottom': 809,
          'children': [],
          'disabledMove': false,
          'guid': '5b6564e4-cb42-4e97-b0d6-727c132c1856',
          'height': 81,
          'interactive': {
            'action': {
              '_': null,
              'saveCard': {
                'isCloseAfterSave': false
              }
            },
            'containerHoverStyle': '',
            'pluginName': null
          },
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 3,
          'properties': [],
          'right': 63,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 642.7999877929688,
          'width': 4
        },
        {
          'bottom': 312,
          'children': [],
          'disabledMove': false,
          'guid': '3fd8b5a2-0481-422e-bce9-519fc03ea905',
          'height': 69,
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 0,
          'properties': [],
          'right': 59,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 83.39999389648438,
          'width': 3
        },
        {
          'bottom': 635,
          'children': [],
          'disabledMove': false,
          'guid': '0beb9772-2199-41f5-8895-ea7fcfb50d85',
          'height': 76,
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 3,
          'properties': [],
          'right': 69,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 528.7777709960938,
          'width': 4
        },
        {
          'bottom': 725,
          'children': [],
          'disabledMove': false,
          'guid': '3a8fb94a-162c-4d0c-8742-54ac84aca1be',
          'height': 50,
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 0,
          'properties': [],
          'right': 77,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 0,
          'width': 5
        },
        {
          'bottom': 769,
          'children': [],
          'disabledMove': false,
          'guid': '0f3a39d0-e7f6-438b-ad7d-e177b5df22ea',
          'height': 63,
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 0,
          'properties': [],
          'right': 71,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 55,
          'width': 5
        },
        {
          'bottom': 998,
          'children': [],
          'disabledMove': false,
          'guid': '8338dbf8-fb54-42d9-99c4-54743a962478',
          'height': 89,
          'isActive': false,
          'isActiveAsParent': false,
          'isEditing': false,
          'isHidden': false,
          'isHighlight': false,
          'isHover': false,
          'isLoading': false,
          'isStretched': false,
          'left': 0,
          'properties': [],
          'right': 76,
          'sizeTypes': {
            'bottom': '%',
            'height': 'px',
            'left': '%',
            'right': '%',
            'top': 'px',
            'width': '%'
          },
          'sticky': 'tl',
          'top': 768.4921875,
          'width': 5
        }
      ])
    },
    remove () {
      if (this.activeBlock) {
        this.$refs.designer.removeBlock(this.activeBlock.guid)
        this.activeBlock = undefined
      }
    },
    get () {
      console.log(this.$refs.designer.getBlocks())
    },
    onStartDrag (block) {
      this.activeBlock = block
      this.$refs.designer.setActiveBlock(block.guid)
    },
    addSticky (event) {
      if (this.activeBlock) {
        this.$refs.designer.addBlock({
          width: 40,
          height: 100,
          top: 10,
          left: 20,
          sticky: 'tl',
          parentGuid: this.activeBlock.parentGuid,
          sizeTypes: {
            width: '%',
            height: 'px',
            top: 'px',
            left: '%'
          },
          stickyTo: {
            guid: this.activeBlock.guid,
            type: StickyToType.TOP
          },
          event,
          type: 1
        })
      }
    },
    addContainer (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 100,
        top: 30,
        right: 0,
        className: 'green',
        parentGuid: this.activeBlock?.guid || null,
        sticky: 'tl',
        sizeTypes: {
          width: '%',
          height: 'px',
          top: 'px',
          left: '%'
        },
        type,
        event,
        isStretched
      })
    },
    addContainerPixel (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 100,
        top: 30,
        right: 0,
        sticky: 'tl',
        sizeTypes: {
          width: 'px',
          height: 'px',
          top: 'px',
          left: 'px',
          right: 'px',
          bottom: 'px'
        },
        type,
        event,
        isStretched
      })
    },
    addContainerPercent (type, event, isStretched = false) {
      this.$refs.designer.addBlock({
        width: 70,
        height: 100,
        top: 30,
        right: 0,
        sticky: 'tl',
        sizeTypes: {
          width: '%',
          height: '%',
          top: '%',
          left: '%'
        },
        type,
        event,
        isStretched
      })
    },
    addChildren (event) {
      this.$refs.designer.addBlock(
        {
          width: 70,
          height: 100,
          sizeTypes: {
            width: '%',
            height: 'px',
            top: 'px',
            left: '%'
          },
          top: 30,
          left: 20,
          parentGuid: this.activeBlock.guid,
          type: 1,
          event: event
        }
      )
    }
  }
}
</script>

<style>
.red {
  background: transparent;
}

.green {
  background: transparent;
}
</style>
