// jshint esversion:8

import axios from 'axios';

const state = {
  rides: null,
  loading: null,
};

const getters = {
  StateRides: state => state.rides,

  // "loading" is a computed property in Calendar for this state - triggers loading symbol while the axios response is pending
  RidesLoading: state => state.loading,
};

const actions = {
  async getRides({commit}, dates) {
    var dateOne = new Date (dates.dateOne);
    var dateTwo = new Date (dates.dateTwo);
    try{
      await commit('setLoading', 'loading');
      var resp = await axios.get('/showRides/' + dateOne + '.' + dateTwo);
      console.log(resp.data);
      if(resp.status==200){
        await commit('setRides', resp.data);
        await commit('setLoading', null);
      } else {
        throw new Error("Failed to get rides");
      }
    } catch (err){
      console.log(err);
      return err;
    }
},
async ClearRideCache({commit}){
  try{
  await commit('ClearRides');
} catch (err) {
  console.log(err);
}
},
async deleteRide({commit}, id){
  try {
    let del = await axios.delete('/file_delete/' + id);
    if (del.status ==200){
      await commit ('RemoveOneRide', id);
    }
  } catch (err){
    console.log(err);
  }
},
};

const mutations = {
  setRides(state, rides){
    state.rides = rides;
  },
  ClearRides(state){
      state.rides = null;
    },
    setLoading(state, loading){
      state.loading = loading;
    },
    RemoveOneRide(state, id){
      state.rides.forEach( ride => {
        if(ride.id == id){
          state.rides.splice(state.rides.indexOf(ride), 1);
        }
      });
    }
};

export default {
  state,
  getters,
  actions,
  mutations
};
