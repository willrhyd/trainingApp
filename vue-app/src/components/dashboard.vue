<!-- API call for chart data is now working but need to figure out chart rendering -->

<template>
  <div>
    <navbar/>
    <pmc></pmc>
  </div>
</template>

<script>
// import axios from 'axios'
// import pmc from './pmc'
import pmc from './pmc.vue'
import navbar from './navbar.vue'

  export default{
    name: 'dashboard',
    components:{
      pmc,
      navbar
    },
  }
</script>

<style>



</style>
