<template>
  <div class="google-map">
    <template v-if="Boolean(this.google) && Boolean(this.map)">
        <slot 
          :google="google"
          :map="map"
          >
        </slot>
      </template>
    </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';

export default {
  name: 'googleMapLoader',
  props:{
    centre: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
      google: null,
      map:null,
    }
  },
  async mounted(){
    const loader = new Loader({
      apiKey: process.env.VUE_APP_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    // this.google = loader;

    const mapOptions = {
      center: this.centre,
      zoom: 10
    };
    try{
      await loader.load().then(google => {
        this.google = google;
        this.map = new google.maps.Map(document.querySelector('.google-map'), mapOptions);
      })

    } catch(e){
      console.log(e);
    }
  }
};


</script>

<style>
.google-map{
  width: 100%;
}
</style>
