<template>
  <div id="app">


    <!-- <rideList msg="this is where the calendar goes"/> -->
    <router-view/>
  </div>
</template>

<script>


// import rideList from './components/rideList.vue'


export default {
  name: 'App',

}

</script>

<style>
#app {
  
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}
</style>
