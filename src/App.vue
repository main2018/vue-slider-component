<template>
  <div id="app">
    <h1>{{ value }}</h1>
    <vue-slider
      v-model="value"
    ></vue-slider>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VueSlider from '../lib'

@Component({
  components: {
    VueSlider,
  },
})
export default class App extends Vue {
  value = 0
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
