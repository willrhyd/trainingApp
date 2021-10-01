<template>
<div>



  <h3>{{view.toDateString()}}</h3>
  <div class="calendar" ref='cal'>
    <div id='loadingNotification' v-if='loading == "loading"' ref='loadingNotification'>
      Loading
    </div>
      <div class="weekday">Monday</div>
      <div class="weekday">Tuesday</div>
      <div class="weekday">Wednesday</div>
      <div class="weekday">Thursday</div>
      <div class="weekday">Friday</div>
      <div class="weekday">Saturday</div>
      <div class="weekday">Sunday</div>


    <div class="day" v-for="day in days" :key="day.date.toDateString()">
      <div v-if="day.date.getDate()==1">
        <!-- Add "monthFirst" class to span to make 1st of each month more visisble on the grid-->
        <span class="monthFirst">{{day.date.getDate()}} {{day.date.toLocaleString('default', { month: 'short' })}}</span>
      </div>
      <div v-else>
        {{day.date.getDate()}}
      </div>
      <div v-if="day.activities != []"  class="activityWrapper">
        <div v-for="activity in day.activities" :key="activity.id" class="individualActivity">
          <button class="rideButton" @click="fetchSingleRide(activity.id); singleRideViewToggle(true); "></button>
          <p>Dist: {{Math.round(activity.distance)}}km</p>
          <p>NP: {{Math.round(activity.np)}}w</p>
          <p>TSS: {{Math.round(activity.tss)}}</p>
        </div>
      </div>
    </div>
<transition name="flip">
  <singleRideView v-if="singleRideVisible" :singleRideViewToggle="singleRideVisible" @singleRideViewEvent="singleRideViewToggle" :selected-ride="selectedRide" v-on:closeSingleView="singleRideViewToggle(false)">
</singleRideView></transition>

  </div>
  <fileUpload  @submittingRides='ridesSubmitting(true)' v-on:ridesSubmitted='ridesSubmitting(false)'/>
  <!-- <button  @click="showDialog(false)">Close</button> -->
  <button v-on:click="moveWeekBack">Back 1 Week</button>
  <!-- <span>{{this.d1.toDateString()}}</span> -->
  <button v-on:click="moveWeekForward">Forward 1 Week</button>

  <div class="submitting" v-if='submittingRides' @submittingRides='ridesSubmitting(true)'>Submitting</div>
  <div>Icons made by <a href="https://www.freepik.com" title='Freepik'> Freepik</a> from <a href='https://www.flaticon.com/' title='Flaticon'>www.flaticon.com</a></div>
</div>
</template>

<script>
import singleRideView from './singleRide.vue'
import fileUpload from './upload.vue'
import axios from 'axios';
import { mapActions } from "vuex";

export default {
  name: "calendar",
  computed:{
    rides : function(){return this.$store.getters.StateRides},
    loading: function(){return this.$store.getters.RidesLoading}
  },
  components: {
    singleRideView,
    fileUpload
  },
  props: ['selectedRide'],
  data() {
    return {
      calendarScroll: null,
      days: [],
      // loadingRides: false,
      singleRideVisible: false,
      submittingRides: false,
      view: null,
    }
  },
  methods: {
    ...mapActions(["getRides"]),

    ridesSubmitting(submitting){
      console.log('Submitting event triggered: ' + submitting)
      this.submittingRides = submitting;
    },

    singleRideViewToggle(visible) {
      this.singleRideVisible = visible;

    },
    // Currently mutating the prop directly which is apparently an anti-pattern but works well enough for now
    async fetchSingleRide(id) {
      console.log(id);
      this.selectedRide = await axios.get('/showRide/' + id)
        .catch(function(error) {
          console.log(error);
        })

    },
    async fetchRides(dateOne, dateTwo) {

      try {
      var newRides = await axios.get('/showRides/' + dateOne + '.' + dateTwo)
      return newRides;
        } catch(error) {
          console.log(error);
        }
      },

    setInitialView() {
      this.view = new Date()
    },

    moveWeekBack() {
      this.view.setDate(this.view.getDate() - 7);
      this.buildDateGrid();
    },
    moveWeekForward() {
      this.view.setDate(this.view.getDate() + 7);
      this.buildDateGrid();
    },
    async buildInitialDateGrid() {
// Trigger loading symbol visible

      console.log(this.loading)
      try{
      if (this.view == null) {
        this.setInitialView();
      }
      var i;

      switch (this.view.getDay()) {
        case 1:
          for (i = 0; i < 56; i++) {
            // console.log(i);
            let day = {
              date: new Date(this.view),
              activities: [],
              attached: false
            }
            day.date.setDate(this.view.getDate() + i - 42)
            this.days.push(day);
          }
          break

        case 2:
          for (i = 0; i < 56; i++) {
            let day = {
              date: new Date(this.view),
              activities: [],
              attached: false
            }
            day.date.setDate(this.view.getDate() + i - 43)
            this.days.push(day);
          }
          break

        case 3:
          for (i = 0; i < 56; i++) {
            let day = {
              date: new Date(this.view),
              activities: [],
              attached: false
            }
            day.date.setDate(this.view.getDate() + i - 44)
            this.days.push(day);
          }
          break

        case 4:
          for (i = 0; i < 56; i++) {
            let day = {
              date: new Date(this.view),
              activities: [],
              attached: false
            }
            day.date.setDate(this.view.getDate() + i - 45)
            this.days.push(day);
          }
          break

        case 5:
          for (i = 0; i < 56; i++) {
            let day = {
              date: new Date(this.view),
              activities: [],
              attached: false
            }
            day.date.setDate(this.view.getDate() + i - 46)
            this.days.push(day);
            }
          break

        case 6:
          for (i = 0; i < 56; i++) {
            let day = {
              date: new Date(this.view),
              activities: [],
              attached: false
            }
            day.date.setDate(this.view.getDate() + i - 47)
            this.days.push(day);
          }
          break

        case 0:
        for (i = 0; i < 56; i++) {
          let day = {
            date: new Date(this.view),
            activities: [],
            attached: false
          }
          day.date.setDate(this.view.getDate() + i - 48)
          this.days.push(day);
        }
          break

        default:
      }

      var dates = {
        dateOne: new Date(this.days[0].date).setDate(this.days[0].date.getDate()-112),
        dateTwo: new Date(),
      }
      // Query rides between dateOne and dateTwo and store in Local Storage
      await this.getRides(dates);

      // For each ride found, attach them to the correct div on the calendar grid
      this.attachRidesToDays();

    }catch(err){
      console.log(err)
    }

// Hide loading symbol
    this.loadingRides = false;
    },
    buildAdditionalDateGrid(){
      for (var i = 0; i < 56; i++) {
        this.view = this.days[0].date - 86400000
        // console.log(this.view)
        let dateWithCorrectMonth = new Date(this.view)

        let day = {
          date: new Date(dateWithCorrectMonth),
          activities: [],
          attached: false
        }
        this.days.unshift(day);
      }

    },
    attachRidesToDays(){
      this.days.forEach(day => {
        var d1 = new Date(day.date)
        var d2 = new Date(day.date)
        d1.setHours(0,0,0)
        d2.setHours(23,59,59);
        if(this.rides != null) {
        this.rides.forEach(ride => {
          let chkDate = new Date(ride.date)
          if (chkDate < d2 && chkDate > d1 && day.attached === false ){
            day.activities.push(ride);
            day.attached= true;
          }
        });
        }
      });

    },

    handleScroll() {
// If calendar.scrollTop is above 200px then topOfCal is false
        let topOfCal = this.$refs.cal.scrollTop > 200;
// If topOfCal is true, i.e. less than 200px from top then do the following:
        if (!topOfCal) {
          this.buildAdditionalDateGrid()
          var dates = {
            dateOne: new Date(this.days[0].date).setDate(this.days[0].date.getDate()-56),
            dateTwo: new Date(),
          }
          this.getRides(dates);
          this.attachRidesToDays()
          this.view = new Date(this.view)
        }

    }
  },
  created() {

    // Build the initial grid of dates
    this.buildInitialDateGrid();

  },
  mounted(){

    this.$refs.cal.scrollTop = this.$refs.cal.scrollHeight;
    this.$refs.cal.addEventListener('scroll', this.handleScroll)
    // ['calendar'].scrollTop(500);


  }
}
</script>

<style>
.calendar {
  display: flex;
  flex-wrap: wrap;
  overflow: scroll;
  max-height: 500px;
  overflow-x: hidden;
  border-style: solid;
  border-color: coral;
}

.day {
  border: solid;
  border-width: thin;
  flex: 1 0 13%;
  max-width: 13%;
  padding: 20px 0;

}

.day:hover{
  background-color: pink;
}


/* .weekdays {
  display: flex;
  flex-wrap: wrap;
  padding: 50px 0 0 0;

} */

.weekday {
  align-self: flex-start;
  background-color: white;
  border: solid;
  font-weight: bold;
  top: 0;
  border-width: thin;
  flex: 1 0 13%;
  max-width: 13%;
  position: sticky;

}
.rideButton{
  background-color: #04AA6D;
  border-radius:50%;
  height:25px;
  width:25px;
}
.submitting{
  border-color: black;
  border-width: thin;
  border-style: solid;
  background: white;
  padding:2.5%;
  position: absolute;

  right: 40%;
  top: 40%;
}

.monthFirst{
  font-weight: bold;
}

#loadingNotification{
  border-color: black;
  border-width: thin;
  border-style: solid;
  background: white;
  padding:2.5%;
  position: absolute;

  right: 40%;
  top: 40%;
}
span {
  padding: 0px 10px;
}

</style>
