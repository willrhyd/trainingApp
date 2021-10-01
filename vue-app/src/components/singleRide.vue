<template>

  <div class="single-view">
    <div id="rideMap">

    </div>
    <div id="savedData">
      <div class="dataFieldLabels">
        <label >Date:</label>
        <label >Distance:</label>
        <label >Time:</label>
      </div>
      <div class="dataFieldValues">
        <input class="dataFieldValueInput" v-model=newDate :placeholder=this.selectedRide.data.date />
        <input class="dataFieldValueInput" v-model=newDate :placeholder=selectedRide.data.distance.toFixed(2) />
        <input class="dataFieldValueInput" v-model=newDate :placeholder=secondsToTime(selectedRide.data.duration) />
      </div>
    </div>

    <div id="buttonContainer">
      <button  @click="singleRideViewClose()">Close</button>
      <button  @click="singleRideViewClose()">Save and Close</button>
      <button @click="deleteOneRide(selectedRide.data.id)">Delete</button>
    </div>


  </div>

</template>



<script>
import {
  mapActions
} from "vuex";
export default{
  name: "singleRideView",
  props:{
    selectedRide: {
      type: Object
    }
  },
  data(){
    return{
      newDate:null,
      d: null,
    }

  },
  methods: {
    ...mapActions(["deleteRide"]),
    // Emit event called 'singleRideViewClose' to the Calendar component
    singleRideViewClose(){
      this.$emit('closeSingleView');
    },
    logData(){
      // console.log(this.selectedRide)
    },
    async deleteOneRide(id){
      try {
        await this.deleteRide(id)
        this.$emit('rideDeletionEvent');
        this.$emit('closeSingleView');
      } catch (err){
        console.log(err);
      }
  },
  secondsToTime(timeInSeconds){
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time = parseFloat(timeInSeconds).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60);

    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
  }
  },

mounted(){
  this.d = new Date(this.selectedRide.data.date).toLocaleDateString("en-gb")
},



}

</script>
<style>
.single-view{
  border-color: black;
  border-width: thin;
  border-style: solid;
  background: white;
  padding:2.5%;
  position: absolute;

  right: 30%;
  top: 30%;
  z-index: 1;
}

.dataFieldLabels{
  display: inline-block;
  text-align: left;
}

.dataFieldValues{
  display: inline-block;
  text-align: right;
}

.dataFieldLabels label{
  padding: 0 20px 0 0;
  display: block;
}

.dataFieldValues input{
  display: block;
}

#buttonContainer{
  margin: 25px;
}
</style>
