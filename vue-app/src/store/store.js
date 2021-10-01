// jshint esversion:6

import Vuex from 'vuex';
import Vue from 'vue';
import createPersistedState from "vuex-persistedstate";
import auth from './modules/auth.js';
import rides from './modules/rides.js';

// Load Vuex
Vue.use(Vuex);
// Create store
export default new Vuex.Store({
  modules: {
    auth,
    rides,
  },
  plugins: [createPersistedState()]
});
