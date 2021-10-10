<template>
<div class="uploadContainer">
  <font-awesome-icon id="uploadPlus" :icon="['far', 'plus-square']" size="2x" @click="clickPlus();"/>
  <form id="hiddenSubmitForm" @submit.prevent="onSubmit" ref="uploadForm" enctype="multipart/form-data">

    <div class="fields">
      <label>Upload File</label><br />
      <input type="file" multiple="multiple" ref="file" @change="onSelect(); onSubmit();" />
    </div>
    <div class="fields">
      <button>Submit</button>
    </div>
    <div class="message">
      <h5>{{message}}</h5>
    </div>
  </form>
</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'fileUpload',
  data() {
    return {
      file: "",
      message: "",
      }
  },
  methods: {
    clickPlus(){
      this.$refs.file.click();
    },
    onSelect() {
      // const allowedTypes = ["fit"];
      const file = this.$refs.file.files[0];
      this.file = file;
      console.log(file.type)
      // if(!allowedTypes.includes(file.type)){
      //   this.message= file.name.
      // }
    },
    async onSubmit() {
      if(this.$refs.file.files.length!=0){this.$emit('submittingRides');}
      let formData = new FormData();
      for (var i = 0; i < this.$refs.file.files.length; i++) {
        let file = this.$refs.file.files[i];
        formData.append('files[' + i + ']', file);
      }
      try{
      let submit = await axios.post('/fileUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        });

        if(submit.status == 200){
          this.$emit('ridesSubmitted')
          this.$emit('rideUploadEvent')
          this.$refs.uploadForm.reset();
          // Add action here to reset the calendar follwoing submit
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
#hiddenSubmitForm{
  display: none;
}

.uploadContainer{
  text-align: center;
  display: inline-block;

}
</style>
