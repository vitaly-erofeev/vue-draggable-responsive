import Vue from 'vue'
import VueDraggableResponsive from '../VueDraggableResponsive/index.vue'

const Components = {
  VueDraggableResponsive
}
Object.keys(Components).forEach(name => {
  Vue.use(name, Components[name])
})

export default Components
