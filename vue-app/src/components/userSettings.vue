<template>
  <div class="settingsWrapper">
    <h1>User Settings</h1>
    <div class="fieldLabel">
      <label>FTP:</label>
      <input v-model=newFtp :placeholder=ftp />
    </div>
    <div class="fieldLabel">
      <label>Weigh:</label>
      <input v-model=newWeight :placeholder=weight />
    </div>
    <div class="submitButtons">
      <button  v-on:click='saveAndClose'>Save and Close</button>
      <button  v-on:click='closeView'>Close</button>
    </div>

  </div>

</template>

<script>
// import axios from 'axios';
import { mapActions } from "vuex";
export default{
  name: 'userSettings',
  computed:{
    ftp : function(){return this.$store.getters.StateFtp},
    weight: function(){return this.$store.getters.StateWeight},
    user : function(){return this.$store.getters.StateUser}
  },
  data(){
    return{
        newFtp: null,
        newWeight:null,
    }
  },
  methods:{
    ...mapActions(["updateUserSettings"]),
    closeView(){
      this.$emit('closeUserView')
    },
    async saveAndClose(){
      // If statements to handle if a user setting hasn't been amended (otherwise it saves null to the Database)
      if(this.newFtp == null){
        this.newFtp = this.ftp
      }
      if(this.newWeight == null){
        this.newWeight = this.weight
      }

      var newSettings = {
        username: this.user,
        ftp: this.newFtp,
        weight: this.newWeight,
      }
      try{
        var updatedData = await this.updateUserSettings(newSettings)
        if (updatedData == 200){
          console.log("Settings updated and set to store successfully");
          this.closeView();
        }
      } catch (err){
        console.log(err)
      }


    },
  }
}
</script>

<style>

::placeholder {
  color: black;
  font-style: italic;
}

.settingsWrapper{
  border-style: solid;
  border-color: coral;
  padding: 50px;
  margin-top: -200px;
  margin-left: -200px;
}

.fieldLabel{
  margin:10px;

}

.fieldLabel label{
  margin:20px;
  text-align: left;
}

.submitButtons{
  display: block;
  margin:20px;
}

.submitButtons button{
  margin:10px;
}

</style>
