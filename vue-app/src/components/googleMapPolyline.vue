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
  }
},

mounted(){
  console.log(this.path)
  new this.google.maps.Polyline({
      path: this.path,
      map: this.map,
      // ...LINE_PATH_CONFIG
    })
}
}
</script>
