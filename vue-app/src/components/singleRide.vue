<template>
<div class="single-view">
  <div id='loadingNotification' v-if='loading == "loading"' ref='loadingNotification'>
    Loading
  </div>

  <div id="rideMap">
    <googleMapLoader
      :centre="selectedRide.latLngArr[0]"
    >
      <template slot-scope="{ google, map }">
        <googleMapPolyline
          :google="google"
          :map="map"
          :path="selectedRide.latLngArr"
        ></googleMapPolyline>
      </template>
    </googleMapLoader>
  </div>


  <div class="dataFieldLabels">
    <label>Date:</label>
    <label>Distance:</label>
    <label>Time:</label>
    <label>TSS:</label>
  </div>
  <div class="data-one">
    <h3 class="data-heading">Planned</h3>
    <div class="dataFieldValues">
      <input class="dataFieldValueInput" :placeholder="selectedRide.date" />
      <input class="dataFieldValueInput" :placeholder="selectedRide.plannedDistance.toFixed(2)" />
      <input class="dataFieldValueInput" :placeholder="secondsToTime(selectedRide.plannedDuration)" />
      <input class="dataFieldValueInput" :placeholder="selectedRide.plannedTss" />
    </div>
  </div>
  <div class="data-two">
    <h3 class="data-heading">Completed</h3>
    <div class="dataFieldValues" v-if="selectedRide.completion > 0 || selectedRide.completion== -1">
      <input class="dataFieldValueInput" :placeholder="selectedRide.date" />
      <input class="dataFieldValueInput" :placeholder="selectedRide.completedDistance.toFixed(2)" />
      <input class="dataFieldValueInput" :placeholder="secondsToTime(selectedRide.completedDuration)" />
      <input class="dataFieldValueInput" :placeholder="selectedRide.completedTss.toFixed(0)" />
    </div>
    <div class="dataFieldValues" v-else>
      <input class="dataFieldValueInput" :placeholder="selectedRide.date" />
      <input class="dataFieldValueInput" :placeholder="0" />
      <input class="dataFieldValueInput" :placeholder="0" />
      <input class="dataFieldValueInput" :placeholder="0" />
    </div>
  </div>

  <div id="buttonContainer">
    <button @click="singleRideViewClose()">Close</button>
    <!-- <button @click="singleRideViewClose()">Save and Close</button> -->
    <button @click="deleteOneRide(selectedRide.id)">Delete</button>
  </div>


</div>
</template>



<script>
import {
  mapActions
} from "vuex";
import googleMapLoader from './googleMapLoader.vue';
import googleMapPolyline from "./googleMapPolyline";

export default {
  name: "singleRideView",
  components: {
    googleMapLoader,
    googleMapPolyline
  },
  computed: {
    selectedRide: function() {
      return this.$store.getters.SelectedRide
    },
    loading: function() {
      return this.$store.getters.RidesLoading
    },
  },
  data() {
    return {
      d: null,
      path:this.selectedRide.latLngArr,
    }
  },
  methods: {
    ...mapActions(["deleteRide", "ClearSingleRide"]),

    // Emit event called 'singleRideViewClose' to the Calendar component
    singleRideViewClose() {
      this.$emit('closeSingleView');
    },
    async deleteOneRide(id) {
      try {
        await this.deleteRide(id)
        this.$emit('rideDeletionEvent');
        this.$emit('closeSingleView');
        this.ClearSingleRide();
      } catch (err) {
        console.log(err);
      }
    },

    secondsToTime(timeInSeconds) {
      var pad = function(num, size) {
          return ('000' + num).slice(size * -1);
        },
        time = parseFloat(timeInSeconds).toFixed(3),
        hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor(time - minutes * 60);

      return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
    }
  },

}
</script>

<style>
.single-view {
  background: white;
  display: grid;
  grid-template-columns: 2.5% 25% 35% 35% 2.5%;
  grid-template-rows: 50% 40% 10%;
  min-height: 75vh;


}

.data-one {

  display: grid;
  grid-column-start: 3;
  grid-row: 2;
  margin: auto;

}

.data-two {

  display: grid;
  grid-column: 4;
  grid-row: 2;
  margin: auto;

}


.data-heading {
  display: block;
  margin: 0;
}

.dataFieldLabels {
  display: grid;
  grid-column-start: 2;
  grid-row-start: 2;
  padding-top: 25px;
  text-align: left;
  margin: auto;
}

.dataFieldLabels label {
  display: block;
  width: 10%;
  margin: 1.8px 0;
}

.dataFieldValues {
  display: inline;

}

.dataFieldValues input {
  width: 80%;
}

#rideMap {
  display: grid;
  grid-column: 2/ span 3;
  grid-row: 1 / span 1;
  margin: 15px auto 5px auto;
  width: 90%;

}

#buttonContainer {
  display: grid;
  grid-column: 2/ span 3;
  grid-row: 2 / span 1;
  margin: 15px auto 5px auto;
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
</style>
