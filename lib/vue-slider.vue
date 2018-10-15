<template>
  <div
    v-show="show"
    ref="container"
    :class="containerClasses"
    :style="containerStyles"
    @click="clickHandle"
  >
    <div
      ref="elem"
      aria-hidden="true"
      class="vue-slider"
      :style="elemStyles"
    >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue } from 'vue-property-decorator'

type TDirection = 'horizontal' | 'vertical'

@Component({
  components: {
  },
})
export default class VueSlider extends Vue {
  name = 'vue-slider-component'

  // slider value
  @Model('input')
  value: any = 0

  // display of the component
  @Prop({ default: true })
  show!: boolean

  // component width
  @Prop({ default: 'auto' })
  width!: number | string

  // component height
  @Prop({ default: 6 })
  height!: number | string

  // the size of the slider, optional [width, height] | size
  @Prop({ default: 16 })
  dotSize!: [number, number] | number

  // the direction of the slider
  @Prop({ default: 'horizontal' })
  direction!: TDirection

  // whether the component reverse
  @Prop({ default: false })
  reverse!: boolean

  // background tyle
  @Prop()
  bgStyle?: CSSStyleDeclaration

  get containerClasses() {
    return [
      'vue-slider-component',
      `vue-slider-${this.direction + (this.reverse ? '-reverse' : '')}`,
      //  disabledClass, stateClass, { 'vue-slider-has-label': piecewiseLabel }
    ]
  }

  get containerStyles() {
    const dotSizes = Array.isArray(this.dotSize) ? this.dotSize : [this.dotSize, this.dotSize]
    const [dotWidth, dotHeight] = dotSizes
    return [
      this.direction === 'vertical' ? {
        height: typeof this.height === 'number' ? `${this.height}px` : this.height,
        padding: `${dotHeight / 2}px ${dotWidth / 2}px`,
      } : {
        width: typeof this.width === 'number' ? `${this.width}px` : this.width,
        padding: `${dotHeight / 2}px ${dotWidth / 2}px`,
      },
      // boolDisabled ? disabledStyle : null
    ]
  }

  get elemStyles() {
    return [
      this.direction === 'vertical' ? {
        width: `${this.width}px`,
        height: '100%',
      } : {
        height: `${this.height}px`,
      },
      this.bgStyle,
    ]
  }

  clickHandle() {
    console.log('click')
  }
}
</script>

<style lang="scss">
  @import './styles/index';
</style>
