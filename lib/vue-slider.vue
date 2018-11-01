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
      ref="dot"
      :key="index"
      :dot-size="dotSize"
      :scale="scale"
      :value="dotPos"
      :tooltip="true"
      :disabled="false"
      :dot-style="dotStyle"
      :style="[dotBaseStyle, {
        [mainDirection]: `${dotPos}%`,
        transition: `${mainDirection} ${animateTime}s`
      }]"
      :range="valuePosRange[index]"
      @drag-start="dragStart"
      @dragging="({ pos }) => dragMove(pos, index)"
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
  [ERROR_TYPE.INTERVAL]: 'The prop "interval" is invalid, "(max - min)" cannot be divisible by "interval"',
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
  animateTime: number = 0

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
  minRange!: number

  // 滑块之间的最大距离
  @Prop()
  maxRange!: number

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
  get isReverse(): boolean {
    return this.direction === 'rtl' || this.direction === 'ttb'
  }

  // 所有可用值的个数
  get total(): number {
    let total = 0
    if (this.data) {
      total = this.data.length - 1
    } else {
      total = new Decimal(this.max).minusChain(this.min).divide(this.interval)
    }
    if (total - Math.floor(total) !== 0) {
      this.emitError(ERROR_TYPE.INTERVAL)
      return 0
    }
    return total
  }

  // 每个可用值之间的距离
  get gap(): number {
    return 100 / this.total
  }

  // 每个可用值的位置
  get valuePos(): number[] {
    const gap = this.gap
    return Array.from(new Array(this.total), (_, index) => {
      return index * gap
    }).concat([100])
  }

  // 两个滑块最小的距离
  get minRangeDir(): number {
    return this.minRange ? this.minRange * this.gap : 0
  }

  // 两个滑块最大的距离
  get maxRangeDir(): number {
    return this.maxRange ? this.maxRange * this.gap : 100
  }

  // 每个滑块的滑动范围
  get valuePosRange(): Array<[number, number]> {
    const dotsPos = this.dotsPos
    const valuePosRange: Array<[number, number]> = []

    dotsPos.forEach((pos, i) => {
      const prevPos = valuePosRange[i - 1] || [0, 100]
      valuePosRange.push([
        this.minRange ?
          this.minRangeDir * i :
          !this.enableCross ?
          dotsPos[i - 1] || 0 :
          0,
        this.minRange ?
          (100 - this.minRangeDir * (dotsPos.length - 1 - i)) :
          !this.enableCross ?
          dotsPos[i + 1] || 100 :
          100,
      ])
    })

    return valuePosRange
  }

  mounted() {
    this.syncPosByValue(this.startAnimation ? this.speed : 0)
  }

  getScale() {
    this.scale = new Decimal(~~this.$refs.container.offsetWidth).divide(100)
  }

  // 计算出滑块的位置
  parseValue(val: TValue): number {
    if (this.data) {
      val = this.data.indexOf(val)
    } else if (typeof val === 'number') {
      if (val < this.min) {
        return this.emitError(ERROR_TYPE.MIN)
      }
      if (val > this.max) {
        return this.emitError(ERROR_TYPE.MAX)
      }
      val = new Decimal(val).minusChain(this.min).divide(this.interval)
    }

    if (typeof val !== 'number') {
      return this.emitError(ERROR_TYPE.VALUE)
    }

    return this.valuePos[val]
  }

  // 通过位置计算出值
  parsePos(pos: number): TValue {
    const index = Math.round(pos / this.gap)
    return this.data ?
      this.data[index] :
      new Decimal(index).multiplyChain(this.interval).plus(this.min)
  }

  // 同步滑块位置
  syncPosByValue(speed: number = 0) {
    this.dotsPos = Array.isArray(this.value) ? this.value.map(v => this.parseValue(v)) : [this.parseValue(this.value)]
    this.animateTime = speed
  }

  // 同步值
  syncValueByPos() {
    const values = [...this.dotsPos].sort((a, b) => a - b).map(pos => this.parsePos(pos))
    this.$emit('change', values.length === 1 ? values[0] : values)
  }

  // 返回错误
  emitError(type: ERROR_TYPE): ERROR_TYPE {
    this.$emit('error', {
      type,
      message: ERROR_MSG[type]
    })
    return type
  }

  // 设置单个滑块的位置
  setDotPos(pos: number, index: number) {
    // 滑块变化的距离
    let changePos = pos - this.dotsPos[index]
    let changePosArr: number[] = new Array(this.dotsPos.length)

    // 固定模式下，同步更新其他滑块的位置，若有滑块超过范围，则不更新位置
    if (this.fixed) {
      this.dotsPos.forEach((originPos, i) => {
        if (i !== index) {
          const { pos: lastPos, inRange } = this.$refs.dot[i].getPos(originPos + changePos)
          if (!inRange) {
            changePos = Math[changePos < 0 ? 'max' : 'min'](lastPos - originPos, changePos)
          }
        }
      })
      changePosArr = this.dotsPos.map(_ => changePos)
    } else {
      changePosArr[index] = changePos
    }

    // 最小范围模式中
    // if (this.minRange) {
    // }

    // 没有变化则不更新位置
    if (!changePos) {
      return false
    }

    this.dotsPos = this.dotsPos.map((curPos, i) => curPos + (changePosArr[i] || 0))
  }

  // 拖拽开始
  dragStart() {
    this.getScale()
    this.$emit('drag-start')
    this.animateTime = 0
  }

  // 拖拽中
  dragMove(pos: number, index: number) {
    this.setDotPos(pos, index)
    if (!this.lazy) {
      this.syncValueByPos()
    }
    this.$emit('dragging')
  }

  // 拖拽结束
  dragEnd() {
    if (this.lazy) {
      this.syncValueByPos()
    }
    this.$emit('drag-end')
    this.animateTime = 0
    this.dotsPos = [...this.dotsPos].sort((a, b) => a - b)
    this.$nextTick(() => {
      this.syncPosByValue(this.speed)
    })
  }

  clickHandle() {
    console.log('click')
  }
}
</script>

<style lang="scss">
  @import './styles/slider';
</style>
