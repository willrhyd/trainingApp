<template>
<div class="single-view">

  <div id="rideMap">

  </div>
  <div  id="data">
    <div class="dataFieldLabels">
      <label>Date:</label>
      <label>Distance:</label>
      <label>Time:</label>
      <label>TSS:</label>
    </div>
    <div class="dataFieldValues">
      <form ref="newRideForm">
        <input class="dataFieldValueInput" placeholder="Date" v-model="formData.date"/>
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
  data() {
    return {
      formData: {
        date: this.clickedDate.toLocaleDateString('en-gb'),
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
      // Sort out date formatting from UK format to US format, then create Date object
      let ukDateString = this.formData.date
      const splitDate = ukDateString.split('/');
      const month = splitDate[1]-1;
      let usFormatDate = new Date(splitDate[2], month, splitDate[0])
      this.formData.date = usFormatDate;

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
}
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
  z-index: 1;
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
