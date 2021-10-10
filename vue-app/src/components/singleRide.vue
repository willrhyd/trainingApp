<template>
<div class="single-view">
  <div id='loadingNotification' v-if='loading == "loading"' ref='loadingNotification'>
    Loading
  </div>
  <div id="rideMap">

  </div>
  <div v-if=" selectedRide.completion > 0 || selectedRide.completion== -1" id="completedData">
    <span>Completed</span>
    <div class="dataFieldLabels">
      <label>Date:</label>
      <label>Distance:</label>
      <label>Time:</label>
    </div>
    <div class="dataFieldValues">
      <input class="dataFieldValueInput" :placeholder="selectedRide.date"  />
      <input class="dataFieldValueInput" :placeholder="selectedRide.completedDistance.toFixed(2)" />
      <input class="dataFieldValueInput" :placeholder="secondsToTime(selectedRide.completedDuration)"  />
    </div>
  </div>
  <div v-if="selectedRide.completion == 0" id="plannedData">
    <span>Planned</span>
    <div class="dataFieldLabels">
      <label>Date:</label>
      <label>Distance:</label>
      <label>Time:</label>
    </div>
    <div class="dataFieldValues">
      <input class="dataFieldValueInput" :placeholder="selectedRide.date"  />
      <input class="dataFieldValueInput" :placeholder="selectedRide.plannedDistance.toFixed(2)" />
      <input class="dataFieldValueInput" :placeholder="secondsToTime(selectedRide.plannedDuration)"  />
    </div>
  </div>
  <div id="buttonContainer">
    <button @click="singleRideViewClose()">Close</button>
    <button @click="singleRideViewClose()">Save and Close</button>
    <button @click="deleteOneRide(selectedRide.id)">Delete</button>
  </div>


</div>
</template>



<script>
import {
  mapActions
} from "vuex";
export default {
  name: "singleRideView",
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
  border-color: black;
  border-width: thin;
  border-style: solid;
  background: white;
  padding: 2.5%;
  position: absolute;

  right: 30%;
  top: 30%;
  z-index: 2;
}

#data{

}

.dataFieldLabels {
  display: inline-block;
  text-align: left;
}

.dataFieldValues {
  display: inline-block;
  text-align: right;
}

.dataFieldLabels label {
  padding: 0 20px 0 0;
  display: block;
}

.dataFieldValues input {
  display: block;
}

#buttonContainer {
  margin: 120px auto 5px auto;
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
