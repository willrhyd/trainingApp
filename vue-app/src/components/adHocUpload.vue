<template>
<div class="adHoc-view">

  <div  class="data-one">
    <div class="dataFieldLabels">
      <label>Date:</label>
      <label>Distance:</label>
      <label>Time:</label>
      <label>TSS:</label>
    </div>
    <div class="dataFieldValues">
      <form ref="newRideForm">
        <input class="dataFieldValueInput" placeholder="Date" v-model="clickedDateUk"/>
        <input class="dataFieldValueInput" placeholder="Distance" v-model="formData.distance"/>
        <input class="dataFieldValueInput" placeholder="Time" v-model="formData.time"/>
        <input class="dataFieldValueInput" placeholder="TSS" v-model="formData.tss"/>
      </form>

    </div>
  </div>
  <div id="buttonContainer">
    <button @click="adHocUploadClose()">Close</button>
    <button @click="adHocUploadSaveAndClose()">Save and Close</button>

  </div>


</div>
</template>



<script>
import axios from 'axios';
export default {
  name: "adHocUpload",
  props: ['clickedDate'],
  computed:{
    clickedDateUk: function(){return this.clickedDate.toLocaleDateString('en-gb')},
  },
  data() {
    return {
      formData: {
        date: this.clickedDate,
        distance: null,
        time: null,
        tss: null,
      }
    }
  },
  methods: {
    adHocUploadClose() {
      this.$emit('closeAdHocUpload');
    },
    async adHocUploadSaveAndClose(){
      this.$refs.newRideForm.submit()

      try{
      let submit = await axios.post('/adHocUpload', this.formData);
        if(submit.status == 200){
          this.$emit('ridesSubmitted')
          this.$emit('rideUploadEvent')
          this.$refs.newRideForm.reset();
          this.$emit('closeAdHocUploadAndSave');
        }
      }
        catch (err) {
          console.log(err);
        }
      },
},
created(){

}
}
</script>

<style>
.adHoc-view {
  background: white;
  display: grid;
  grid-template-columns: 2.5% 25% 35% 35% 2.5%;
  grid-template-rows: 50% 40% 10%;
  min-height: 75vh;
}


/* .dataFieldLabels {
  display: inline-block;
  padding: 0 20px 0 0;
  text-align: left;
} */

.dataFieldValues {
  display: inline-block;
  text-align: right;
}



#buttonContainer {
  display: inline;
  grid-column: 1 / span 3;
  grid-row: 3 / span 1;
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
