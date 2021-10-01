// jshint esversion: 8

import Vue from 'vue';
import Router from 'vue-router';
import calendar from './components/calendar';
import login from './components/login';
import register from './components/register';
import dashboard from './components/dashboard';


Vue.use(Router);

export default new Router ({
  mode: 'hash',
  base: '/trainingapp-prod',
  routes:[
    {path:'/', component: login},
    {path:'/calendar', component: calendar},
    {path:'/register', component: register},
    {path:'/dashboard', component: dashboard}
  ]
});
