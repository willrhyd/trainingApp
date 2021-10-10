// jshint esversion:8

import axios from 'axios';

const state = {
  rides: null,
  selectedRide: null,
  loading: null,
};

const getters = {
  StateRides: state => state.rides,

  SelectedRide: state=> state.selectedRide,

  // "loading" is a computed property in Calendar for this state - triggers loading symbol while the axios response is pending
  RidesLoading: state => state.loading,
};

const actions = {
  async getRides({
    commit
  }, dates) {
    var dateOne = new Date(dates.dateOne);
    var dateTwo = new Date(dates.dateTwo);
    try {
      await commit('setLoading', 'loading');
      const resp = await axios.get('/showRides/' + dateOne + '.' + dateTwo);
      console.log(resp)
      if (resp.status == 200) {
        commit('setRides', resp.data);

      } else {
        throw new Error("Failed to get rides");
      }
      commit('setLoading', null);
    } catch (err) {
      console.log(err);
      return err;
    }
  },

  async getSingleRide({
    commit
  }, id) {
      commit('setLoading', 'loading');
      await axios.get('/showRide/' + id).then((selectedRide) => {
        if (selectedRide.status == 200) {
          selectedRide.data.date = new Date(selectedRide.data.date).toLocaleDateString("en-gb");
          commit('setSelectedRide', selectedRide.data);
          commit('setLoading', null);
        } else {
          throw new Error("Failed to get rides");
        }
      }).catch (error => {
      console.log(error);
    });
    commit('setLoading', null);
    return 200;
  },
  async ClearRideCache({
    commit
  }) {
    try {
      await commit('ClearRides');
    } catch (err) {
      console.log(err);
    }
  },
  async ClearSingleRide({
    commit
  }) {
    try {
      await commit('ClearSingleRide');
    } catch (err) {
      console.log(err);
    }
  },
  async deleteRide({
    commit
  }, id) {
    try {
      let del = await axios.delete('/file_delete/' + id);
      if (del.status == 200) {
        await commit('RemoveOneRide', id);
      }
    } catch (err) {
      console.log(err);
    }
  },
};

const mutations = {
  setRides(state, rides) {
    state.rides = rides;
  },
  setSelectedRide(state, selectedRide) {
    state.selectedRide = selectedRide;
  },
  ClearRides(state) {
    state.rides = null;
    state.selectedRide = null;
  },
  ClearSingleRide(state){
    state.selectedRide = null;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  RemoveOneRide(state, id) {
    state.rides.forEach(ride => {
      if (ride.id == id) {
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
