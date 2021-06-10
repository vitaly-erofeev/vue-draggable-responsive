import VueDraggableResponsiveDesigner from './index.vue'
import VueDraggableResponsivePreviewer from './previewer.vue'

const VueDraggableResponsive = {
  VueDraggableResponsiveDesigner,
  VueDraggableResponsivePreviewer
}

export function install (Vue) {
  if (install.installed) return
  install.installed = true
  Object.keys(VueDraggableResponsive).forEach(name => {
    Vue.component(name, VueDraggableResponsive[name])
  })
}

const plugin = {
  install
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default VueDraggableResponsive
export { VueDraggableResponsiveDesigner, VueDraggableResponsivePreviewer }
