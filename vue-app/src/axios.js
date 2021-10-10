import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);
// axios.defaults.baseURL = 'http://localhost:3000'; //localhost
axios.defaults.baseURL = 'https://axios.trainingappserver.uk/'; //production
axios.defaults.withCredentials = true;
