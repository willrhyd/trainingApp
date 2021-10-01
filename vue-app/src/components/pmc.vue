<template>
<div>
  <form @submit.prevent='changeView'>
    <label>Trailing Days</label>
    <input type='text' class='form-control' v-model='trailingDays' placeholder='Number of trailing days' />
<!-- Forecast days needs configuring on backend -->
    <!-- <label>Forecast Days</label>
    <input type='text' class='form-control' v-model='forecastDays' placeholder='Number of forecast days' /> -->
    <button type='submit'>Update</button>
  </form>
  <canvas id="pmc"></canvas>
</div>
</template>

<script>
import Chart from 'chart.js'
import axios from 'axios'
export default {
  name: 'pmc',
  data(){
    return {
      trailingDays: 20,
      forecastDays: 15,
      pmc: null,
      pmcData: {
        type: "line",
        data: {
          labels: null,
          datasets: [
            {
              label: "CTL",
              data: null,
              backgroundColor: "rgba(54,73,93,.5)",
              borderColor: "#36495d",
              borderWidth: 3
            },
            {
              label: "ATL",
              data: null,
              backgroundColor: "red",
              borderColor: "#36495d",
              borderWidth: 3
            },
            {
              label: "TSB",
              data: null,
              backgroundColor: "green",
              borderColor: "#36495d",
              borderWidth: 3
            },
          ]
        },
        options: {
          responsive: true,
          lineTension: 1,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  padding: 25
                }
              }
            ]
          }
        }
      }
    }
  },
  computed:{
    user : function(){return this.$store.getters.StateUser}
  },
  methods:{
    // Fetch initial PMC data
    async fetchPmc(){
      // const ctx = document.getElementById('pmc');
      var labels = [];
      var ctl = [];

      try{
        // The API returns a 2d array containing CTL, then ATL, then TSB values
        let pmc = await axios.get('/pmc/' + this.user);
        for (var i = 1; i <= this.trailingDays; i++){
          var arrLen = pmc.data.length

          labels.unshift(pmc.data[arrLen-i].date)
          ctl.unshift(pmc.data[arrLen-i].ctl);
        }
      } catch(err) {
        console.log(err)
      }
      this.pmcData.data.labels = labels;
      this.pmcData.data.datasets[0].data = ctl;

    },
    // Redraw chart based on user selected periods
    async changeView() {
      var labels = [];
      var ctl = [];

      // Work on PMC so you can look at a date range and even forecast
      try{
        let pmc = await axios.get('/pmc/' + this.user);
        for (var i = 1; i <= this.trailingDays; i++){
          var arrLen = pmc.data.length
          console.log(pmc.data[arrLen-i].date)
          labels.unshift(pmc.data[arrLen-i].date)
          ctl.unshift(pmc.data[arrLen-i].ctl);
      }
    } catch(err) {
        console.log(err)
      }
      this.pmcData.data.labels = labels;
      this.pmcData.data.datasets[0].data = ctl;
      this.pmc.update();
}
  },
  async created(){
   await this.fetchPmc();
   const canvas = document.getElementById('pmc');
   this.pmc = Chart.Line(canvas, this.pmcData);
   this.pmc;
  },

}
</script>

<style>



</style>
