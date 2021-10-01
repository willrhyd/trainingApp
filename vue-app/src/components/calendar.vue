<template>
<div id="appContainer">
  <navbar id="navBar"/>

  <h3 class="visibleEnd" v-if="visibleEnd">{{visibleEnd.toLocaleString('default', {year: 'numeric', month: 'long', day: 'numeric'})}}</h3>
  <div class="calendar" ref='cal'>
    <div id='loadingNotification' v-if='loading == "loading"' ref='loadingNotification'>
      Loading
    </div>
    <div class="weekdays">
      <div class="weekday">Monday</div>
      <div class="weekday">Tuesday</div>
      <div class="weekday">Wednesday</div>
      <div class="weekday">Thursday</div>
      <div class="weekday">Friday</div>
      <div class="weekday">Saturday</div>
      <div class="weekday">Sunday</div>
    </div>
    <div class="week" v-for="week in weeks" :key="week[0].date.getDate()" :id="week[0].date">
      <div class="day" v-for="day in week" :key="day.date.getDate()">
        <div class="dayDate" v-if="day.date.getDate()==1">
          <!-- Add "monthFirst" class to span to make 1st of each month more visisble on the grid-->
          <span class="monthFirst">{{day.date.getDate()}} {{day.date.toLocaleString('default', { month: 'short' })}}</span>
        </div>
        <div class="dayDate" v-else>
          {{day.date.getDate()}}
        </div>
        <!-- <div v-if="day.activities != []" class="activityWrapper"> -->
          <div v-for="activity in day.activities" :key="activity.id" class="activity" @click="fetchSingleRide(activity.id, true);" >
            <p>Dist: {{Math.round(activity.distance)}}km</p>
            <p>NP: {{Math.round(activity.np)}}w</p>
            <p>TSS: {{Math.round(activity.tss)}}</p>
          </div>

        </div>
      <!-- </div> -->
    </div>
  </div>
  <singleRideView v-if="singleRideVisible"  :selected-ride="selectedRide" v-on:closeSingleView="singleRideViewToggle(false)" @rideDeletionEvent="attachRidesToWeeks">
  </singleRideView>

  <div class="footer">Icons made by <a href="https://www.freepik.com" title='Freepik'> Freepik</a> from <a href='https://www.flaticon.com/' title='Flaticon'>www.flaticon.com</a></div>
</div>
</template>

<script>
import navbar from './navbar.vue'
import singleRideView from './singleRide.vue'
import axios from 'axios';
import {
  mapActions
} from "vuex";

export default {
  name: "calendar",
  computed: {
    rides: function() {
      return this.$store.getters.StateRides
    },
    loading: function() {
      return this.$store.getters.RidesLoading
    },

  },
  components: {
    navbar,
    singleRideView,

  },
  props: ['selectedRide'],
  data() {
    return {
      calendarScroll: null,
      weeks: [],
      view: null,
      // loadingRides: false,
      singleRideVisible: false,
      visibleStart: null,
      visibleEnd:null,
    }
  },
  methods: {
    ...mapActions(["getRides", "ClearRideCache"]),
    singleRideViewToggle(visible) {
      this.singleRideVisible = visible;

    },
    // Currently mutating the prop directly which is apparently an anti-pattern but works well enough for now
    async fetchSingleRide(id, visible) {
      try {
        this.selectedRide = await axios.get('/showRide/' + id)
        this.selectedRide.data.date = new Date(this.selectedRide.data.date).toLocaleDateString("en-gb");
        this.singleRideVisible = visible;
      } catch(error) {
          console.log(error);
        }

    },
    // async fetchRides(dateOne, dateTwo) {
    //
    //   try {
    //     var newRides = await axios.get('/showRides/' + dateOne + '.' + dateTwo)
    //     return newRides;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },

    setInitialView() {
      this.view = new Date()
    },

    attachRidesToWeeks() {
      this.weeks.forEach(week => {
        week.forEach(day => {
          day.activities = []
          var d1 = new Date(day.date)
          var d2 = new Date(day.date)
          d1.setHours(0, 0, 0)
          d2.setHours(23, 59, 59);
          if (this.rides != null) {
            this.rides.forEach(ride => {
              let chkDate = new Date(ride.date)
              if (chkDate < d2 && chkDate > d1) {
                day.activities.push(ride);
              }
            });
          }
        })
      })
    },
    onIntersection(entries) {

      if(entries[0].boundingClientRect.y > this.$refs.cal.offsetHeight){
        this.visibleEnd = new Date(entries[0].target.id)
      }
          },
    handleScroll() {
      // If calendar.scrollTop is above 200px then topOfCal is false
      let topOfCal = this.$refs.cal.scrollTop > 200;

      // If topOfCal is true, i.e. less than 200px from top then do the following:
      if (!topOfCal) {
        this.buildWeekGrid()

      }

    },
    async buildWeekGrid() {
      try {


        if (this.view == null) {
          this.setInitialView();
        }
        var i;
        var j;

        for (j = 0; j < 8; j++) {
          var days = [];
          switch (this.view.getDay()) {
            case 1:

              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)

              break

            case 2:

              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i - 1)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)

              break

            case 3:

              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i - 2)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)

              break

            case 4:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i - 3)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)
              break

            case 5:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i - 4)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)
              break

            case 6:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i - 5)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)
              break

            case 0:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i - 6)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() - 7)
              this.weeks.unshift(days)
              break

            default:
          }
        }

        var dates = {
          dateOne: new Date(this.weeks[0][0].date),
          dateTwo: new Date(),
        }
        // Query rides between dateOne and dateTwo and store in Local Storage
        await this.getRides(dates);

        this.rides.forEach(ride => {
          ride.attached = false;
        });
        // For each ride found, attach them to the correct div on the calendar grid
        this.attachRidesToWeeks();

        let observer = new IntersectionObserver(this.onIntersection, {
          root: this.$refs.cal, // default is the viewport
          threshold: 0.1 // percentage of taregt's visible area. Triggers "onIntersection"
        })

        this.weeks.forEach(week => {
          // Use the bserver to observe an element
          observer.observe(document.getElementById(`${week[0].date}`))
        })


      } catch (err) {
        console.log(err)
      }
    }
  },



  async created() {
    try {
      // Build the initial grid of dates
      await this.buildWeekGrid()
      console.log(this.$refs.cal.scrollHeight)
      this.$refs.cal.scrollTop = this.$refs.cal.scrollHeight;
      this.$refs.cal.addEventListener('scroll', this.handleScroll)
    } catch (err) {
      console.log(err);
    }
    this.visibleEnd = new Date(this.weeks[this.weeks.length-1][0].date)
  },

}
</script>

<style>

/* width */
::-webkit-scrollbar {
  padding-left: 2px;
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #1D3460;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #13203C;
}



.calendar {
  border-style: solid;
  border-color: grey;
  display: flex;
  flex-wrap: wrap;
  max-height: 500px;
  overflow: scroll;
  overflow-x: hidden;
  position: absolute;
  top: 22%;
  z-index: -1;
}

.week {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.weekdays {
  border:none;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  position: sticky;
  top: 0;
}

.day {
  border: solid;
  border-color: grey;
  border-width: thin;
  flex: 1;
  /* max-width: 14%; */
  min-height: 75px;

}

.dayDate{
  background-color: #76BEFE;
  margin: -1px;
  border: solid;
  border-color: grey;
  border-width: thin;
}
.activity{
  border: solid;
  border-width: thin;
  margin: 15px;
}

.week:hover{
  box-shadow: 0 0 8px 0 grey, 0 5px 3px -3px;
}

.activity:hover{
  box-shadow: 0 0 5px 0 grey, 0 5px 3px -3px;
}

.plus:hover{
  color: red;
}

.weekday {
  align-self: flex-start;
  background-color: white;
  border: solid;
  font-weight: bold;
  border-width: thin;
  flex: 1;
}

.rideButton {
  background-color: #04AA6D;
  border-radius: 50%;
  height: 25px;
  width: 25px;
}



.monthFirst {
  font-weight: bold;
}

.visibleEnd{
  position: fixed;
  left: 0px;
  padding-bottom: 20px;
  padding-left: 20px;
}

.footer{
  position: absolute;
  bottom: 10px;
}
#loadingNotification {
  border-color: black;
  border-width: thin;
  border-style: solid;
  background: white;
  padding: 2.5%;
  position: absolute;

  right: 40%;
  top: 40%;
}



span {
  padding: 0px 10px;
}
</style>
