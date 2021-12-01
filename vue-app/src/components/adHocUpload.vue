<template>
<div class="adHoc-view">
  <input ref="title" id="title" type="text"  v-model="formData.title"/>
  <textarea id="description" ref="description" v-model="formData.description" placeholder="Activity description...">
  </textarea>
  <div id="sportIconContainer">
    <button type="button" class="sportIcon" @click="selectSport('cycling', $event)"><font-awesome-icon :icon="['fas', 'biking']" size="2x" ref="cyclingIcon" pointer-events="none"/></button>
    <button type="button" class="sportIcon" @click="selectSport('running', $event)"><font-awesome-icon :icon="['fas', 'running']" size="2x" ref="runningIcon" pointer-events="none"/> </button>
    
    
  </div>

  <div  class="adHocDataFields">
    <div class="adHocDataFieldLabels">
      <label>Date:</label>
      <label>Distance:</label>
      <label>Time:</label>
      <label>TSS:</label>
    </div>
    <div class="adHocDataFieldValues">
      
      
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
        adHoc: true,
        date: this.clickedDate,
        description: null,
        distance: null,
        planned: null,
        manual: null,
        selectedSportIcon: null,
        sport: null,
        time: null,
        title: null,
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
      this.formData.planned = (this.clickedDate > new Date()); //planned if clicked date is after "now"
      this.formData.manual = !this.formData.planned; //manual is opposite of planned

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
      selectSport(sport, event){
        if(this.selectedSportIcon){
          this.selectedSportIcon.classList.remove("sportIconClicked");
        }
        this.formData.sport = sport;
        this.selectedSportIcon = event.target;
        this.formData.title = `${sport} - ${this.clickedDate.toDateString()}`
        this.selectedSportIcon.classList.add("sportIconClicked");
      }
},
created(){
  console.log(this.manual)
  
},
mounted(){
  
}

}
</script>

<style>
.adHoc-view {
  background: white;
  display: grid;
  grid-template-columns: 2.5% 25% 35% 35% 2.5%;
  grid-template-rows: 2.5% 5% 2.5% 35% 2.5% 7.5% 2.5% 40% 2.5%;
  min-height: 75vh;
}

#title{
  grid-column: 2 / 5;
  grid-row: 2 / 2;
}

#description{
  grid-column: 2 / 5;
  grid-row: 4/ 4;
  resize: none;
}


.adHocDataFields {
  display: flex;
  grid-column: 2 / span 3;
  grid-row: 8;
  

}

.adHocDataFieldValues {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin: auto;
}
.adHocDataFieldValues form{
 display: flex;
 flex-direction: column;
}


.adHocDataFieldLabels {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin: auto;
}

.adHocDataFieldLabels label{
  height: 22px;
  
}

#sportIconContainer{
 
  grid-row-start: 6;
  grid-column: 2 / span 3;

}
.sportIcon{
  fill:#1D3460;
  padding: 10px;
  border-radius: 100%;
  transition: .5s;
  width: 64px;
}

.sportIcon:hover{
  background-color: #1D3460;
  fill: #FBFD8D;
  color: #FBFD8D;
  box-shadow: 0 0 5px #FBFD8D;
}

.sportIconClicked path{
  fill: #FBFD8D;
}

.sportIconClicked{
  background-color: #1D3460;
  box-shadow: 0 0 5px #FBFD8D;
}
#buttonContainer {
  align-items: flex-end;
  display: flex;
  grid-column: 1 / span 4;
  grid-row: 8 ;
}

#buttonContainer button{
margin: 0 10px;
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
