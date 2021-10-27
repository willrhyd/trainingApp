<template>
  <div class="google-map">
    <template v-if="Boolean(this.google) && Boolean(this.map)">
        <slot
          :google="google"
          :map="map"
        />
      </template>
    </div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';

export default {
  name: 'googleMapLoader',
  data() {
    return {
      google: null,
      map:null,
    }
  },
  async mounted(){
    const loader = new Loader({
      apiKey: 'AIzaSyChIdw0EIui2Hp3Zy0JkUoG2QT55jSnGdE',
      version: "weekly",
      libraries: ["places"]
    });

    // this.google = loader;

    const mapOptions = {
      center: {
        lat: 0,
        lng: 0
      },
      zoom: 4
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

</style>
