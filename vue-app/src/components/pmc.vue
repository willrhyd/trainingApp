<template>
<div>
  <form @submit.prevent='fetchPmc'>
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
              borderWidth: 2,
              yAxisID: "CTL"
            },
            {
              label: "Projected CTL",
              data: null,
              borderColor: "#36495d",
              borderDash: [10,5],
              borderWidth: 2,
              yAxisID: "CTL"
            },
            {
              label: "ATL",
              data: null,
              borderColor: "red",
              borderWidth: 2,
              fill: false,
              yAxisID: "ATL"
            },
            {
              label: "Projected ATL",
              data: null,
              borderColor: "red",
              borderDash: [10,5],
              borderWidth: 2,
              fill: false,
              yAxisID: "ATL"
            },
            {
              label: "TSB",
              data: null,
              borderColor: "green",
              borderWidth: 2,
              fill: false,
              yAxisID: "TSB"
            },
            {
              label: "Projected TSB",
              data: null,
              borderColor: "green",
              borderDash: [10,5],
              borderWidth: 2,
              fill: false,
              yAxisID: "TSB"
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
                id: "CTL",
                ticks: {
                  beginAtZero: true,
                  padding: 25
                }
              },
              {
                id: "ATL",
                position: "right",
                ticks: {
                  beginAtZero: false,
                  padding: 25
                }
              },
              {
                id: "TSB",
                position: "right",
                ticks: {
                  beginAtZero: false,
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
      let labels = [];
      let completedCtl = [];
      let projectedCtl = [];
      let completedAtl = [];
      let projectedAtl = [];
      let completedTsb = [];
      let projectedTsb = [];

      try{
        // The API returns an array of "day" objects which holds the date labels, CTL, ATL, and TSB values
        let pmc = await axios.get('/pmc/' + this.user + "." + this.forecastDays);
        
        let startDate = new Date(pmc.data[0].date)
        
        // let endDate = new Date(pmc.data[pmc.data.length-1].date)
        let today = new Date()
        const todayPosn = Math.round((today - startDate)/86400000);

      
        // Push data entries to the completed portion of the PMC
        for (let i = 1; i <= this.trailingDays; i++){

          if(i==todayPosn+1){break;}//needed to prevent undefined array referencing
          
          labels.unshift(pmc.data[todayPosn - i].date)
          completedCtl.unshift(pmc.data[todayPosn - i].ctl);
          projectedCtl.unshift(pmc.data[todayPosn - i].ctl); 
          completedAtl.unshift(pmc.data[todayPosn - i].atl);
          projectedAtl.unshift(pmc.data[todayPosn - i].atl);
          completedTsb.unshift(pmc.data[todayPosn - i].tsb);
          projectedTsb.unshift(pmc.data[todayPosn - i].tsb);
        }
        this.pmcData.data.datasets[0].data = completedCtl;
        this.pmcData.data.datasets[2].data = completedAtl;
        this.pmcData.data.datasets[4].data = completedTsb;

        // Push Data entries to the projected portion of the PMC
        for (let i = todayPosn+1; i <= (pmc.data.length - 1); i++){
      

          labels.push(pmc.data[i].date)
          projectedCtl.push(pmc.data[i].ctl);
          projectedAtl.push(pmc.data[i].atl);
          projectedTsb.push(pmc.data[i].tsb);
        }
        this.pmcData.data.datasets[1].data = projectedCtl;
        this.pmcData.data.datasets[3].data = projectedAtl;
        this.pmcData.data.datasets[5].data = projectedTsb;
      } catch(err) {
        console.log(err)
      }
      this.pmcData.data.labels = labels;

      if(this.pmc){this.pmc.update();}
    },
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

#pmc{
  
  border:2px solid black;
  margin-top: 10px;
  max-height: 60vh;
  max-width: 50%;
}

</style>
