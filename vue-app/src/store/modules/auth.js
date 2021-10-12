// jshint esversion:8
//store/modules/auth.js
import axios from 'axios';
import Cookies from 'js-cookie';

const state = {
  user: null,
  ftp: null,
  weight: null,
};

const getters = {
  isAuthenticated: function(state) {
    return !!state.user || !!Cookies.get('trainingApp');
  },
  StateUser: state => state.user,
  StateFtp: state => state.ftp,
  StateWeight: state => state.weight,
};

const actions = {
  async Register({
    dispatch
  }, form) {
    let user = {
      username: form.username,
      password: form.password,
    };
    try {
      var resp = await axios.post('/register', form);
      if (resp.status == 200) {
        var log_in = await dispatch('LogIn', user);
        if (log_in == 200) {
          return 200;
        }
      } else {
        throw new Error("Failed to register user");
      }
    } catch (err) {
      console.log(err);
      return 401;
    }
  },
  async LogIn({
    commit
  }, User) {
    try {
      const login = await axios.post('/login', User);

      if (login.status == 200) {
        console.log("Logged in, user ftp" + login.data.ftp);
        User.ftp = login.data.ftp;
        User.weight = login.data.weight;
        commit('setUser', User);
        return 200;
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      console.log(err);
      return 401;
    }
  },
  async LogOut({
    commit
  }) {
    try {
      let user = null;
      await axios.get('/logout');
      await commit('LogOut', user);
    } catch (err) {
      console.log(err);
    }
  },
  async updateUserSettings({
    commit
  }, newSettings) {
    try {
      const updatedData = await axios.put('/userupdate/' + newSettings.username, newSettings);
      if (updatedData.status == 200) {
        await commit('setUser', updatedData.data);
        return 200;
      }
    } catch (err) {
      console.log(err);
    }
  },
};

const mutations = {
  setUser(state, User) {
    state.user = User.username;
    state.ftp = User.ftp;
    state.weight = User.weight;
  },
  LogOut(state) {
    state.user = null;
    state.ftp = null;
    state.weight = null;
    Cookies.remove('trainingApp');
  },
};

export default {
  state,
  getters,
  actions,
  mutations
};
