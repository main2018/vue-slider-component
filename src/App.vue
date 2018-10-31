<template>
  <div id="app">
    <vue-slider
      class="slider"
      v-model="value"
      v-bind="sliderOptions"
      @error="({ type, message }) => log('error', type, message)"
    >
    </vue-slider>
    <h1>{{ value }}</h1>
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

  sliderOptions = {
    width: 280,
    height: 8,
    min: 0,
    max: 9,
    interval: 3,
    // interval: 2,
    // data: ['01', '02', '03', '04', '05', '10'],
    // marks: {
    //   '-10': '10℃',
    //   0: '0',
    //   26: '26℃',
    //   37: '37℃',
    //   50: '50℃',
    //   100: {
    //     label: '100℃',
    //     value: '热死了',
    //     style: {
    //       color: 'red',
    //     }
    //   },
    // },
  }

  log(name: string, ...args: any[]) {
    console.log(`[${name} Log]:`, args)
  }
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
