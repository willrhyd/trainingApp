import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);
axios.defaults.baseURL = 'https://axios.trainingappserver.uk';
axios.defaults.withCredentials = true;
