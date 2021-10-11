<template>
<div>
  <form @submit.prevent='changeView'>
    <label>Trailing Days</label>
    <input type='text' class='form-control' v-model='trailingDays' placeholder='Number of trailing days' />

    <label>Forecast Days</label>
    <input type='text' class='form-control' v-model='forecastDays' placeholder='Number of forecast days' />
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
      trailingDays: 50,
      forecastDays: 25,
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
              label: "Projected CTL",
              data: null,
              borderColor: "#36495d",
              borderDash: [10,5],
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
          elements:{
            point:{
                      radius: 0
                  }
          },
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
      var completedCtl = [];
      var projectedCtl = [];

      try{
        // The API returns a 2d array containing CTL, then ATL, then TSB values
        let pmc = await axios.get('/pmc/' + this.user + "." + this.forecastDays);
        let startDate = new Date(pmc.data[0].date)
        // let endDate = new Date(pmc.data[pmc.data.length-1].date)
        let today = new Date()
        const todayPosn = Math.round((today - startDate)/86400000);

        // Push data entries to the completed portion of the PMC
        for (let i = 0; i <= this.trailingDays; i++){

          labels.unshift(pmc.data[todayPosn - i].date)
          completedCtl.unshift(pmc.data[todayPosn - i].ctl);
          projectedCtl.unshift(pmc.data[todayPosn - i].ctl);
        }
        this.pmcData.data.datasets[0].data = completedCtl;

        // Push Data entries to the projected portion of the PMC
        for (let i = todayPosn; i <= (pmc.data.length - 1); i++){
          // var arrLen = pmc.data.length

          labels.push(pmc.data[i].date)
          projectedCtl.push(pmc.data[i].ctl);
        }
        this.pmcData.data.datasets[1].data = projectedCtl;

      } catch(err) {
        console.log(err)
      }
      this.pmcData.data.labels = labels;
    },
    // Redraw chart based on user selected periods
    async changeView() {

      var labels = [];
      var completedCtl = [];
      var projectedCtl = [];

      try{
        // The API returns a 2d array containing CTL, then ATL, then TSB values
        let pmc = await axios.get('/pmc/' + this.user + "." + this.forecastDays);
        let startDate = new Date(pmc.data[0].date)
        // let endDate = new Date(pmc.data[pmc.data.length-1].date)
        let today = new Date()
        const todayPosn = Math.round((today - startDate)/86400000);

        // Push data entries to the completed portion of the PMC
        for (let i = 0; i <= this.trailingDays; i++){

          labels.unshift(pmc.data[todayPosn - i].date)
          completedCtl.unshift(pmc.data[todayPosn - i].ctl);
          projectedCtl.unshift(pmc.data[todayPosn - i].ctl);
        }
        this.pmcData.data.datasets[0].data = completedCtl;

        // Push Data entries to the projected portion of the PMC
        for (let i = todayPosn; i <= (pmc.data.length - 1); i++){
          // var arrLen = pmc.data.length

          labels.push(pmc.data[i].date)
          projectedCtl.push(pmc.data[i].ctl);
        }
        this.pmcData.data.datasets[1].data = projectedCtl;

      } catch(err) {
        console.log(err)
      }
      this.pmcData.data.labels = labels;

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
