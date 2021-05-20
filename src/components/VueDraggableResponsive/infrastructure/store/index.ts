import Vuex, { Module } from 'vuex'
import { InterfaceState, initialState } from './state'
import { actions } from '@/components/VueDraggableResponsive/infrastructure/store/actions'
import { mutations } from '@/components/VueDraggableResponsive/infrastructure/store/mutations'
import { getters } from '@/components/VueDraggableResponsive/infrastructure/store/getters'
import Vue from 'vue'

Vue.use(Vuex)

const store: Module<InterfaceState, any> = {
  state: initialState,
  actions,
  mutations,
  getters
}

export default new Vuex.Store(store)
