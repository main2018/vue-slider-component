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
  value = 50
  // value = [0, 50, 150, 200]
  // value = ['01', '03']
  show = true

  sliderOptions = {
    width: 320,
    height: 6,
    // width: 6,
    // height: 380,
    // dotSize: 16,
    min: 0,
    max: 200,
    interval: 1,
    // order: false,
    // disabled: true,
    // enableCross: false,
    // direction: 'ttb',
    // fixed: true,
    // lazy: true,
    // minRange: 10,
    // maxRange: 60,
    // interval: 2,
    // data: ['01', '02', '03', '04', '05', '06'],
    // process: (dots: number[], marks: number[]) => [[marks[0], dots[0]],
    // process: (dots: any) => [[dots[0].pos, dots[1].pos], [dots[2].pos, dots[3].pos]],
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
        },
      },
    },
    // tailStyle: {
    //   backgroundColor: '#ccc',
    //   boxShadow: 'inset 1px 1px 0 0 rgba(0, 0, 0, .26)'
    // },
    // dotStyle: {
    //   style: {
    //     borderColor: 'pink'
    //   }
    // },
    // dotOptions: [{
    //   style: {
    //     borderColor: 'red'
    //   }
    // }]
    // dotOptions: [
    //   {
    //     disabledStyle: {
    //       opacity: .6
    //     },
    //     style: {
    //       backgroundColor: 'pink',
    //       border: 'none'
    //     },
    //   },
    //   {
    //     disabledStyle: {
    //       opacity: .6
    //     },
    //     style: {
    //       backgroundColor: 'blue',
    //       border: 'none'
    //     },
    //   },
    //   {
    //     disabled: true,
    //     disabledStyle: {
    //       opacity: .6
    //     },
    //     style: {
    //       backgroundColor: 'green',
    //       border: 'none'
    //     },
    //   },
    // ],
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
