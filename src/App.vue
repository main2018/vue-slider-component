<template>
  <div id="app">
    <vue-slider
      v-show="show"
      class="slider"
      v-model="value"
      v-bind="sliderOptions"
      @error="({ type, message }) => log('error', type, message)"
    >
    </vue-slider>
    <h1 @click="show = !show">{{ value }}</h1>
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
  value = [0, 20]
  // value = ['01', '03']
  show = true

  sliderOptions = {
    width: 180,
    height: 4,
    min: 0,
    max: 100,
    interval: 20,
    // disabled: true,
    // enableCross: false,
    // direction: 'rtl',
    // fixed: true,
    minRange: 1,
    // maxRange: 2,
    // interval: 2,
    // data: ['01', '02', '03', '04', '05', '06'],
    // process: (dots: number[], marks: number[]) => [[marks[0], dots[0]],
    marks: {
      '-10': '10℃',
      '0': '0',
      '26': '26℃',
      '37': '37℃',
      '50': '50℃',
      '100': {
        label: '100℃',
        style: {
          color: 'red',
        }
      },
    },
    tailStyle: {
      // backgroundColor: '#999'
    },
    dotOption: [{
      disabled: false,
      style: {
        // opacity: .7
      }
    }, {
      disabled: true,
      style: {
        // opacity: .7
      },
      focusStyle: {
        borderColor: 'red'
      }
    }]
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
