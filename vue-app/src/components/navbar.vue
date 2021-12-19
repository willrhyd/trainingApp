<template>
  <div>
    <div id="navContainer">
      <!-- Have to split the navbar into two halves to get the plus button, logout, and signup to float right -->
      <ul class='navFirstHalf'>
        <li class="navLink" v-if='isLoggedIn' v-on:click="userView" rel="noopener">{{user}}</li>
        <li class="navLink" v-if='isLoggedIn' v-on:click="clickCal" rel="noopener">Calendar</li>
        <li class="navLink" v-if='isLoggedIn' v-on:click="clickDash"  rel="noopener">Dashboard</li>
      </ul>
      <ul class='navSecondHalf'>
        <li class="navLink" v-if='isLoggedIn==false' v-on:click="clickReg"  rel="noopener">Sign Up</li>
        <li class="navLink" v-if='isLoggedIn' v-on:click="logout"   rel="noopener">Logout</li>
        <fileUpload v-if='isLoggedIn' id="uploadFormPlus" @submittingRides='ridesSubmitting(true)' v-on:ridesSubmitted='ridesSubmitting(false)'/>
      </ul>
    </div>
    <div class="submitting" v-if='submittingRides' @submittingRides='ridesSubmitting(true)'>Submitting</div>
    <userSettings class='userSettings' v-if="userSettingsVisible" @userViewEvent="userView(true)" v-on:closeUserView="userView(false)"></userSettings>
  </div>
</template>

<script>
import userSettings from './userSettings.vue'
import fileUpload from './upload.vue'
export default {
  name: 'navbar',
  components: {
    userSettings,
    fileUpload
  },
  data(){
    return{
      userSettingsVisible: false,
      submittingRides: false,
      // isLoggedIn: false,
    }
  },
  computed: {
     isLoggedIn : function(){return this.$store.getters.isAuthenticated},
     user : function(){return this.$store.getters.StateUser}
   },
  
   mounted(){
     this.isLoggedIn = function(){return this.$store.getters.isAuthenticated}
   },
  methods: {
    ridesSubmitting(submitting) {
      this.submittingRides = submitting;
      this.$emit('ridesSubmitted');
    },
     async logout(){
       await this.$store.dispatch('LogOut');
       await this.$store.dispatch('ClearRideCache');
        this.$router.push('/');
    },
    userView(visible){
      this.userSettingsVisible = visible;
   },
    clickCal(){
     this.$router.push('/calendar');
   },
   clickDash(){
    this.$router.push('/dashboard');
  },
  clickReg(){
   this.$router.push('/register');
 },
 userViewToggle(visible) {
   this.userSettingsVisible = visible;
 },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
}

li{
  padding: 10px;
}


.navLink{
  color: #FBFD8D;
  display: flex;
  flex: 1;
  margin-right: 10px;
  max-width: 75px;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
    padding-bottom: 20px;
}

.navLink:hover{
  background-color: #76BEFE;
  color: #13203C;
}

.userSettings{
  position: fixed;
  background-color: white;
  left:50%;
  top: 50%;
}

.navFirstHalf{
  display: flex;
  padding: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.navSecondHalf{
  display: flex;
  flex-direction: row-reverse;
  padding: 0;
  margin-top: 0;
  margin-bottom: 0;
}

#navContainer{
  background-color: #13203C;
  display: flex;
  justify-content: space-between;
  margin-bottom:25px;
}

#uploadFormPlus{
  color: #FBFD8D;
  display: flex;
  margin-left: auto;
  margin:3px 5px 3px 0;
  padding: 10px;
}

#uploadFormPlus:hover{
  color: #76BEFE;
}

.submitting {
  border-color: black;
  border-width: thin;
  border-style: solid;
  background: white;
  padding: 2.5%;
  position: absolute;

  right: 40%;
  top: 40%;
}
</style>
