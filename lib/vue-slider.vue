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
      v-for="(dotPos, index) in dotsPos"
      :key="index"
      :dot-size="dotSize"
      :scale="scale"
      :value="dotPos"
      :tooltip="true"
      :disabled="false"
      :dot-style="dotStyle"
      :style="[dotBaseStyle, {
        [mainDirection]: `${dotPos}%`
      }]"
      @drag-start="dragStart"
      @dragging="pos => dragMove(pos, index)"
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

export type TDirection = 'ltr' | 'rtl' | 'ttb' | 'btt'

export type TValue = number | string | symbol

export const enum ERROR_TYPE {
  VALUE = 1, // 值的类型不正确
  INTERVAL, // interval 不合法
  MIN, // 超过最小值
  MAX,
}

const ERROR_MSG = {
  [ERROR_TYPE.VALUE]: 'The type of the "value" is illegal',
  [ERROR_TYPE.INTERVAL]: 'The prop "interval" is invalid, please ensure that (max - min) can be divisible by "interval"',
  [ERROR_TYPE.MIN]: 'The "value" cannot be less than the minimum.',
  [ERROR_TYPE.MAX]: 'The "value" cannot be greater than the maximum.',
}

const DEFAULT_SLIDER_SIZE = 6

@Component({
  components: {
    VueSliderDot,
  },
})
export default class VueSlider extends Vue {
  dotsPos: number[] = []
  scale: number = 1 // 比例，1% = ${scale}px

  $refs!: {
    container: HTMLDivElement
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
  @Prop({ default: 16 })
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

  // 自定义数据
  @Prop({ default: null })
  data!: TValue[] | null

  // 是否懒同步值
  @Prop({ default: false })
  lazy!: boolean

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
  get isReverse(): boolean {
    return this.direction === 'rtl' || this.direction === 'ttb'
  }

  mounted() {
    this.dotsPos = Array.isArray(this.value) ? this.value.map(v => this.parseValue(v)) : [this.parseValue(this.value)]
  }

  getScale() {
    this.scale = new Decimal(~~this.$refs.container.offsetWidth).divide(100)
  }

  // 计算出滑块的位置
  parseValue(val: TValue): number {
    let min = this.min
    let max = this.max
    if (this.data) {
      min = 0
      max = this.data.length - 1
      val = this.data.indexOf(val)
    } else if (typeof val === 'number') {
      if (val < this.min) {
        return this.emitError(ERROR_TYPE.MIN)
      }
      if (val > this.max) {
        return this.emitError(ERROR_TYPE.MAX)
      }
      val = new Decimal(val).minus(min)
    }

    if (typeof val !== 'number') {
      return this.emitError(ERROR_TYPE.VALUE)
    }

    return new Decimal(val).divide(new Decimal(max).minus(min)) * 100
  }

  // 通过位置计算出值
  parsePos(pos: number): TValue {
    let gap = 0
    if (this.data) {
      gap = this.data.length
    } else {
      gap = new Decimal(this.max).minusChain(this.min).divide(this.interval)
    }
    if (gap - Math.floor(gap) !== 0) {
      this.emitError(ERROR_TYPE.INTERVAL)
      return 0
    }
    const gapPos = 100 / gap
    const index = Math.round(pos / gapPos)
    return this.data ? this.data[index] : new Decimal(index).multiplyChain(this.interval).plus(this.min)
  }

  // 同步值
  syncValueByPos() {
    const values = this.dotsPos.map(pos => this.parsePos(pos))
    this.$emit('change', values.length === 1 ? values[0] : values)
  }

  dotPosChanged(pos: number, index: number) {
    this.dotsPos = this.dotsPos.map((p, i) => i === index ? pos : p).sort()
  }

  // 返回错误
  emitError(type: ERROR_TYPE): ERROR_TYPE {
    this.$emit('error', {
      type,
      message: ERROR_MSG[type]
    })
    return type
  }

  // 拖拽开始
  dragStart() {
    this.getScale()
    this.$emit('drag-start')
  }

  // 拖拽中
  dragMove(pos: number, index: number) {
    this.dotPosChanged(pos, index)
    !this.lazy && this.syncValueByPos()
    this.$emit('dragging')
  }

  // 拖拽结束
  dragEnd() {
    this.$emit('drag-end')
    this.lazy && this.syncValueByPos()
  }

  clickHandle() {
    console.log('click')
  }
}
</script>

<style lang="scss">
  @import './styles/slider';
</style>
