<template>
  <form @submit.prevent='submit'>
    <h3>Sign up</h3>

    <div class= 'form-group'>
      <label>First Name</label>
      <input type='text' class='form-control' v-model='form.firstName' placeholder='First Name' />
    </div>
    <div class= 'form-group'>
      <label>Last Name</label>
      <input type='text' class='form-control' v-model='form.lastName' placeholder='Last Name' />
    </div>
    <div class= 'form-group'>
      <label>User Name</label>
      <input type='text' class='form-control' v-model='form.username' placeholder='Username' />
    </div>
    <div class= 'form-group'>
      <label>Email</label>
      <input type='text' class='form-control' v-model='form.email' placeholder='Email' />
    </div>
    <div class= 'form-group'>
      <label>Password</label>
      <input type='password' class='form-control' v-model='form.password' placeholder='Password' />
    </div>
    <div class= 'form-group'>
      <label>Password</label>
      <input type='password' class='form-control' v-model='form.passwordConfirm' placeholder='Confirm Password' />
    </div>
    <button type='submit'>Submit</button>
  </form>

</template>

<script>
import { mapActions } from "vuex";
export default{
  name:'register',
  data(){
    return{

    form:{
      firstName:'',
      lastName:'',
      username:'',
      email:'',
      password:'',
      passwordConfirm:''
    },
  showError: false
  }
},
  methods:{
    ...mapActions(["Register"]),
      async submit(){
        try {
          let resp = await this.Register(this.form);
          console.log(resp)
          if(resp==200){
            this.$router.push("/calendar");
            this.showError = false
        } else{
          throw new Error
        }
      } catch (error) {
          this.showError = true
      }
    }
}
}
</script>
