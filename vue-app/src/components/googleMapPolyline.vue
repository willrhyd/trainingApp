<script>
export default{
props: {
  google: {
    type: Object,
    required: true
  },
  map: {
    type: Object,
    required: true
  },
  path: {
    type: Array,
    required: true,
    default: function(){
      return [{lat:1, lng:1}, {lat:30, lng:30}];
    }
  }
},

mounted(){
  new this.google.maps.Polyline({
      path: this.path,
      map: this.map,
      // ...LINE_PATH_CONFIG
    })
}
}
</script>
