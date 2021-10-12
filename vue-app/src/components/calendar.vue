<template>
<div id="appContainer">
  <navbar id="navBar" v-on:ridesSubmitted='buildWeekGridBack()' />

  <h3 class="visibleEnd" v-if="visibleEnd">{{visibleEnd.toLocaleString('default', {year: 'numeric', month: 'long', day: 'numeric'})}}</h3>


  <div class="calendar" ref='cal'>
    <div class="week" id="weekdays">
      <div class="weekday">Monday</div>
      <div class="weekday ">Tuesday</div>
      <div class="weekday ">Wednesday</div>
      <div class="weekday ">Thursday</div>
      <div class="weekday ">Friday</div>
      <div class="weekday ">Saturday</div>
      <div class="weekday ">Sunday</div>
    </div>

    <div id='loadingNotification' v-if='loading == "loading"' ref='loadingNotification'>
      Loading
    </div>

    <div class="week" v-for="week in weeks" :key="week[0].date.toDateString()" :id="week[0].date">
      <div class="day" v-for="day in week" :key="day.date.toDateString()">
        <div class="dayDate" v-if="day.date.getDate()==1">
          <!-- Add "monthFirst" class to span to make 1st of each month more visisble on the grid-->
          <span class="monthFirst">{{day.date.getDate()}} {{day.date.toLocaleString('default', { month: 'short' })}}</span>
        </div>
        <div class="dayDate" v-else>
          {{day.date.getDate()}}
        </div>
        <div v-for="activity in day.activities" :key="activity.id" class="activity" @click="fetchSingleRide(activity.id, true);">
          <div v-if="activity.completion == 0" class='plannedRide'>
            Planned Ride
            <p>Dist: {{Math.round(activity.plannedDistance)}}km</p>
            <!-- <p>NP: {{Math.round(activity.np)}}w</p> -->
            <!-- <p>TSS: {{Math.round(activity.plannedTss)}}</p> -->
          </div>
          <div v-if="activity.completion > 0 || activity.completion== -1" class="completed" :class="{ 'green' : activity.green, 'amber' : activity.amber, 'red' : activity.red, 'unplanned': activity.unplanned}">
            Completed Ride
            <p class="calSummaryText">Dist: {{Math.round(activity.completedDistance)}}km</p>
            <p class="calSummaryText">NP: {{Math.round(activity.completednPwr)}}w</p>
            <p class="calSummaryText">TSS: {{Math.round(activity.completedTss)}}</p>
          </div>

        </div>
        <div id="adHocPlus" @click="addToDate();">
          <font-awesome-icon :icon="['far', 'plus-square']" size="2x" @click="adHocUploadPlusClick(day.date, true);" />
        </div>

      </div>
      <!-- </div> -->
    </div>
  </div>
  <singleRideView v-if="singleRideVisible" v-on:closeSingleView="singleRideViewToggle(false)" @rideDeletionEvent="attachRidesToWeeks">
  </singleRideView>

  <adHocUpload v-if="adHocUplodVisible" :clickedDate="adHocDateProp" v-on:closeAdHocUpload="adHocUploadToggle(false)" v-on:closeAdHocUploadAndSave="adHocUploadToggle(false); refreshRides();">

  </adHocUpload>

</div>
</template>

<script>
import navbar from './navbar.vue'
import singleRideView from './singleRide.vue'
import adHocUpload from './adHocUpload.vue'

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
    adHocUpload,
  },
  // props: ['adHocDateProp'],
  data() {
    return {
      calendarScroll: null,
      weeks: [],
      view: null,
      // loadingRides: false,
      singleRideVisible: false,
      adHocUplodVisible: false,
      visibleStart: null,
      visibleEnd: null,
    }
  },
  methods: {
    ...mapActions(["getRides", "getSingleRide", "ClearRideCache"]),
    singleRideViewToggle(visible) {
      this.singleRideVisible = visible;
    },
    adHocUploadToggle(visible) {
      this.adHocUplodVisible = visible;
    },
    async refreshRides() {
      var dates = {
        dateOne: new Date(this.weeks[0][0].date),
        dateTwo: new Date(this.weeks[this.weeks.length-1][6].date),
      }
      // Query rides between dateOne and dateTwo and store in Local Storage
      await this.getRides(dates);
      this.attachRidesToWeeks();
    },
    adHocUploadPlusClick(clickedDate, visible) {
      this.adHocUploadToggle(visible)
      this.adHocDateProp = clickedDate;
    },
    async fetchSingleRide(id) {
      const rideId = id;
      try {
        const singleRideLoaded = await this.getSingleRide(rideId);

        if (singleRideLoaded == 200) {
          this.singleRideViewToggle(true);
        }
      } catch (error) {
        console.log(error);
      }
    },
    setInitialView(view) {
      this.view = new Date(view)
    },
    attachRidesToWeeks() {
      this.weeks.forEach(week => {
        week.forEach(day => {
          day.activities = []
          var d1 = new Date(day.date)
          var d2 = new Date(day.date)
          d1.setHours(0, 0, 0)
          d2.setHours(23, 59, 59, 999);
          if (this.rides != null) {
            this.rides.forEach(ride => {

              if (ride.completion > 0.70 && ride.completion < 1.20) {
                ride.green = true;
              } else {
                ride.green = false
              }
              if ((ride.completion <= 0.70 && ride.completion >= 0.40) || (ride.completion >= 1.20 && ride.completion <= 1.50)) {
                ride.amber = true;
              } else {
                ride.amber = false
              }
              if ((ride.completion < 0.40 && ride.completion > 0) || ride.completion > 1.50) {
                ride.red = true;
              } else {
                ride.red = false
              }
              if (ride.completion < 0) {
                ride.unplanned = true;
              }

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
      if (entries[0].boundingClientRect.y > this.$refs.cal.offsetHeight) {
        this.visibleEnd = new Date(entries[0].target.id)
      }
    },
    async handleScroll() {
      // console.log("Scroll Top: " + this.$refs.cal.scrollTop)
      // console.log("Scroll Height: " + this.$refs.cal.scrollHeight)
      // If calendar.scrollTop is above 200px then topOfCal is false
      let topOfCal = this.$refs.cal.scrollTop < 50;
      let bottomOfCal = this.$refs.cal.scrollTop > this.$refs.cal.scrollHeight - 600;
      try {
        // If less than 50px from top then do the following:
        if (topOfCal) {
          await this.buildWeekGridBack()
        }
        if (bottomOfCal) {
          this.buildWeekGridForward()
        }
      } catch (err) {
        console.log(err);
      }
    },
    async buildWeekGridBack() {

      if (this.view == null) {
        this.setInitialView(new Date());
      } else {
        this.setInitialView(this.weeks[0][0].date)
      }

      var i;
      var j;
      try {
        for (j = 0; j < 4; j++) {
          var days = [];
          switch (this.view.getDay()) {
            case 1:

              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() - i - 1)
                days.unshift(day);
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
                day.date.setDate(this.view.getDate() - i)
                days.unshift(day);
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
                day.date.setDate(this.view.getDate() - i)
                days.unshift(day);
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
                day.date.setDate(this.view.getDate() - i)
                days.unshift(day);
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
                day.date.setDate(this.view.getDate() - i)
                days.unshift(day);
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
                day.date.setDate(this.view.getDate() - i)
                days.unshift(day);
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
                day.date.setDate(this.view.getDate() - i)
                days.unshift(day);
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
    },
    async buildWeekGridForward() {
      this.setInitialView(this.weeks[this.weeks.length - 1][6].date)
      var i;
      var j;
      try {
        for (j = 0; j < 4; j++) {
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
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)

              break

            case 2:

              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)

              break

            case 3:

              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)

              break

            case 4:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)
              break

            case 5:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)
              break

            case 6:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)
              break

            case 0:
              for (i = 0; i < 7; i++) {
                let day = {
                  date: new Date(this.view),
                  activities: [],
                  attached: false
                }
                day.date.setDate(this.view.getDate() + i + 1)
                days.push(day);
              }
              this.view.setDate(this.view.getDate() + 7)
              this.weeks.push(days)
              break

            default:
          }
        }

        const dates = {
          dateOne: new Date(this.weeks[0][0].date),
          dateTwo: new Date(this.weeks[this.weeks.length - 1][6].date),
        }

        // Query rides between dateOne and dateTwo and store in Local Storage
        await this.getRides(dates);

        // For each ride found, attach them to the correct div on the calendar grid
        this.attachRidesToWeeks();

        let observer = new IntersectionObserver(this.onIntersection, {
          root: this.$refs.cal, // default is the viewport
          threshold: 0.1 // percentage of taregt's visible area. Triggers "onIntersection"
        })

        await this.weeks.forEach((week) => {
          // Use the observer to observe an element
          observer.observe(document.getElementById(`${week[0].date}`))
        })
      } catch (err) {
        console.log(err)
      }
    }
    // Need weekGrid destructor functions to stop the grid getting too big and slowing the app down
  },
  async created() {
    try {
      // Build the initial grid of dates
      await this.buildWeekGridBack();
      await this.buildWeekGridForward();
      this.$refs.cal.scrollTop = 100;
      this.$refs.cal.addEventListener('scroll', this.handleScroll)

      this.visibleEnd = new Date(this.weeks[this.weeks.length - 1][0].date)
      console.log("is logged in:" + this.isLoggedIn)
    } catch (err) {
      console.log(err)
    }
  },
  mounted() {

  }

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
  /* position: fixed; */
  /* top: 141px; */

}

.week {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

#weekdays {
  background: white;
  font-weight: bold;
  position: sticky;
  top: 0px;
  z-index: 1;
}

.weekday {
  border: solid;
  border-color: grey;
  border-width: thin;
  flex: 1;

}

.day {
  border: solid;
  border-color: grey;
  border-width: thin;
  flex: 1;
  /* max-width: 14%; */
  min-height: 75px;

}

.dayDate {
  background-color: #76BEFE;
  margin: -1px;
  border: solid;
  border-color: grey;
  border-width: thin;
}

.activity {
  border: solid;
  border-width: thin;
  margin: 15px;
}

.week:hover {
  box-shadow: 0 0 8px 0 grey, 0 5px 3px -3px;
}

.activity:hover {
  box-shadow: 0 0 5px 0 grey, 0 5px 3px -3px;
}

.plus:hover {
  color: red;
}



.rideButton {
  background-color: #04AA6D;
  border-radius: 50%;
  height: 25px;
  width: 25px;
}

.calSummaryText{
  margin-bottom: 0;
}

.monthFirst {
  font-weight: bold;
}

.visibleEnd {

  left: 0px;
  /* padding-bottom: 20px; */
  padding-left: 20px;
}

.footer {
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
  z-index: 5;
  right: 40%;
  top: 40%;
}

#adHocPlus {
  padding: 10px;
  color: #1D3460;
  margin: auto;
  opacity: 0.5;
  margin: 5% auto 5% auto;
  width: 50%;
}

#adHocPlus:hover {
  opacity: 1;
  box-shadow: 0 0 5px 0 grey, 0 5px 3px -3px;
}

span {
  padding: 0px 10px;
}

.completed.green {
  background: green;
}

.completed.amber {
  background: orange;
}

.completed.red {
  background: red;
}

.completed.unplanned {
  background: #1D3460;
  color: white;
}
</style>
