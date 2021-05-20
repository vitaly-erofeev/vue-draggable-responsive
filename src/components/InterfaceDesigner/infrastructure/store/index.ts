import Vuex, { Module } from 'vuex'
import { InterfaceState, initialState } from './state'
import { actions } from '@/components/InterfaceDesigner/infrastructure/store/actions'
import { mutations } from '@/components/InterfaceDesigner/infrastructure/store/mutations'
import { getters } from '@/components/InterfaceDesigner/infrastructure/store/getters'
import Vue from 'vue'

Vue.use(Vuex)

const store: Module<InterfaceState, any> = {
  state: initialState,
  actions,
  mutations,
  getters
}

export default new Vuex.Store(store)
