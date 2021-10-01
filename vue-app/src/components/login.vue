<template>
  <div id="login">
    <navbar id="navBar"/>
    <p v-if="showError" id="error">Username or Password is incorrect</p>
    <form @submit.prevent='submit'>
      <div class= 'form-group'>
        <label>Username</label>
        <input type='text' class='form-control' v-model='username' placeholder='Username' />
      </div>
      <div class= 'form-group'>
        <label>Password</label>
        <input type='password' class='form-control' v-model='password' placeholder='Password' />
      </div>
      <button>Log in</button>
    </form>
    <p>
      Not registered?<a href='/register'> Sign Up</a>
    </p>
  </div>
</template>

<script>
import navbar from './navbar.vue'
import { mapActions } from "vuex";
export default {
  name: "login",
  components: {
    navbar
  },
  data(){
    return{
        username:'',
        password:'',
        showError: false,
    }
  },
  methods:{
    ...mapActions(["LogIn"]),
    // Log in and emit 'loggedIn' event to router
    async submit(){
      const User = {
        username: this.username,
        password: this.password
      }
      try{
        const login = await this.LogIn(User);
        // console.log(login)
        if(login==200) {
        this.$router.push('/calendar');
        this.showError = false
      } else {
        throw new Error("Login failed")
      }
      } catch (err){
        console.log(err)
        this.showError = true
        this.$router.push('/');
      }
    }
  }
}


</script>
<style>


</style>
