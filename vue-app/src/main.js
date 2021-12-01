// jshint esversion:8

import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './axios.js'
import store from './store/store.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { faRunning, faBiking } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueMoment from "vue-moment";
import {moment} from "moment-timezone";
import VueCarousel from 'vue-carousel';



Vue.use(VueMoment, { moment });
Vue.use(VueCarousel);

library.add(faPlusSquare);
library.add(faRunning);
library.add(faBiking);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
