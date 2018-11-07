<template>
  <div
    v-show="show"
    ref="container"
    :class="containerClasses"
    :style="containerStyles"
    @click="clickHandle"
    aria-hidden="true"
  >
    <!-- dots -->
    <vue-slider-dot
      v-for="(dot, index) in dots"
      ref="dot"
      :key="index"
      :dot-size="dotSize"
      :value="dot"
      :tooltip="true"
      :disabled="false"
      :dot-style="dotStyle"
      :style="[dotBaseStyle, {
        [mainDirection]: `${dot.pos}%`,
        transition: `${mainDirection} ${animateTime}s`
      }]"
      @drag-start="dragStart"
      @dragging="(pos) => dragMove(pos, index)"
      @drag-end="dragEnd"
      @click.native.stop
    >
      <slot
        name="dot"
        :value="value"
        :disabled="false"
      />
    </vue-slider-dot>

    <!-- piecewise -->
    <!-- <piecewise /> -->
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue } from 'vue-property-decorator'
import VueSliderDot from './vue-slider-dot.vue'

import { toPx } from './utils'
import Decimal from './utils/decimal'
import Control, { TValue, ERROR_TYPE } from './utils/control'

export type TDirection = 'ltr' | 'rtl' | 'ttb' | 'btt'

export interface IDot {
  pos: number,
  value: TValue,
}

export interface IPosObject {
  x: number,
  y: number
}

const DEFAULT_SLIDER_SIZE = 6

@Component({
  components: {
    VueSliderDot,
  },
})
export default class VueSlider extends Vue {
  private control!: Control
  private animateTime: number = 0
  dots: IDot[] = []

  $refs!: {
    container: HTMLDivElement,
    dot: VueSliderDot[],
  }

  // slider value
  @Model('change', { default: 0 })
  value!: TValue | TValue[]

  // display of the component
  @Prop({ default: true })
  show!: boolean

  // component width
  @Prop()
  width?: number

  // component height
  @Prop()
  height?: number

  // the size of the slider, optional [width, height] | size
  @Prop({ default: 8 })
  dotSize!: [number, number] | number

  // the direction of the slider
  @Prop({ default: 'ltr' })
  direction!: TDirection

  // 最小值
  @Prop({ default: 0 })
  min!: number

  // 最小值
  @Prop({ default: 100 })
  max!: number

  // 间隔
  @Prop({ default: 1 })
  interval!: number

  // 运动速度
  @Prop({ default: 0.5 })
  speed!: number

  // 自定义数据
  @Prop({ default: null })
  data!: TValue[] | null

  // 是否懒同步值
  @Prop({ default: false })
  lazy!: boolean

  // 初始化时候是否有过渡动画
  @Prop({ default: false })
  startAnimation!: boolean

  // 是否允许滑块交叉
  @Prop({ default: true })
  enableCross!: boolean

  // 是否固定滑块见间隔
  @Prop({ default: false })
  fixed!: boolean

  // 滑块之间的最小距离
  @Prop()
  minRange?: number

  // 滑块之间的最大距离
  @Prop()
  maxRange?: number

  // dot tyle
  @Prop()
  dotStyle?: CSSStyleDeclaration

  // 轨道尺寸
  get trackSize() {
    return (this.isHorizontal ? this.height : this.width) || DEFAULT_SLIDER_SIZE
  }

  // 容器类
  get containerClasses() {
    return [
      'vue-slider-component',
      `vue-slider-${this.direction}`,
      //  disabledClass, stateClass, { 'vue-slider-has-label': piecewiseLabel }
    ]
  }

  // 容器样式
  get containerStyles() {
    const [dotWidth, dotHeight] = Array.isArray(this.dotSize) ? this.dotSize : [this.dotSize, this.dotSize]
    const containerWidth = this.width ? toPx(this.width) : (this.isHorizontal ? 'auto' : toPx(DEFAULT_SLIDER_SIZE))
    const containerHeight = this.height ? toPx(this.height) : (this.isHorizontal ? toPx(DEFAULT_SLIDER_SIZE) : 'auto')
    return {
      margin: `${dotHeight / 2}px ${dotWidth / 2}px`,
      width: containerWidth,
      height: containerHeight,
    }
  }

  // dot style
  get dotBaseStyle() {
    const [dotWidth, dotHeight] = Array.isArray(this.dotSize) ? this.dotSize : [this.dotSize, this.dotSize]
    let dotPos: { [key: string]: string }
    if (this.isHorizontal) {
      dotPos = {
        marginTop: `-${(dotHeight - this.trackSize) / 2}px`,
        [this.direction === 'ltr' ? 'marginLeft' : 'marginRight']: `-${dotWidth / 2}px`,
        top: '0',
        [this.direction === 'ltr' ? 'left' : 'right']: '0',
      }
    } else {
      dotPos = {
        marginLeft: `-${(dotWidth - this.trackSize) / 2}px`,
        [this.direction === 'btt' ? 'marginBottom' : 'marginTop']: `-${dotHeight / 2}px`,
        left: '0',
        [this.direction === 'btt' ? 'bottom' : 'top']: '0',
      }
    }
    return {
      width: `${dotWidth}px`,
      height: `${dotHeight}px`,
      ...dotPos,
    }
  }

  // 滑块滑动的主方向
  get mainDirection(): string {
    switch (this.direction) {
      case 'ltr':
        return 'left'
      case 'rtl':
        return 'right'
      case 'btt':
        return 'bottom'
      case 'ttb':
        return 'top'
    }
  }

  // 是否水平方向组件
  get isHorizontal(): boolean {
    return this.direction === 'ltr' || this.direction === 'rtl'
  }

  // 是否反向
  // @maybe deprecation
  get isReverse(): boolean {
    return this.direction === 'rtl' || this.direction === 'ttb'
  }

  created() {
    this.initControl()
  }

  mounted() {
    this.syncPosByValue(this.startAnimation ? this.speed : 0)
  }

  getScale() {
    this.control.scale = new Decimal(~~this.$refs.container.offsetWidth).divide(100)
  }

  initControl() {
    this.control = new Control(
      this.value,
      this.data,
      this.enableCross,
      this.fixed,
      this.max,
      this.min,
      this.interval,
      this.minRange,
      this.maxRange,
      this.emitError
    )
  }

  // 同步滑块位置
  private syncPosByValue(speed: number = 0) {
    this.dots = this.control.getDots()
    this.animateTime = speed
  }

  // 同步值
  private syncValueByPos() {
    // const values = [...this.dotsPos].sort((a, b) => a - b).map(pos => this.parsePos(pos))
    const values = this.dots.map(dot => dot.value)
    this.$emit('change', values.length === 1 ? values[0] : values)
  }

  // 返回错误
  private emitError(type: ERROR_TYPE, message: string) {
    this.$emit('error', {
      type,
      message
    })
  }

  // 拖拽开始
  private dragStart() {
    this.getScale()
    this.$emit('drag-start')
    this.animateTime = 0
  }

  // 拖拽中
  private dragMove(pos: IPosObject, index: number) {
    this.control.setDotPos(this.isHorizontal ? pos.x : pos.y, index)
    this.syncPosByValue()
    if (!this.lazy) {
      this.syncValueByPos()
    }
    this.$emit('dragging')
  }

  // 拖拽结束
  private dragEnd() {
    if (this.lazy) {
      this.syncValueByPos()
    }
    this.$emit('drag-end')
    this.animateTime = 0
    // this.dotsPos = [...this.dotsPos].sort((a, b) => a - b)
    this.$nextTick(() => {
      this.syncPosByValue(this.speed)
    })
  }

  private clickHandle() {
    console.log('click')
  }
}
</script>

<style lang="scss">
  @import './styles/slider';
</style>
