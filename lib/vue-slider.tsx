import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator'
import { TValue, Marks, DotOption, DotState, Dot, TDirection } from './typings'
import VueSliderDot from './vue-slider-dot'

import { toPx, getPos } from './utils'
import Decimal from './utils/decimal'
import Control, { ERROR_TYPE } from './utils/control'
import State, { StateMap } from './utils/state'

import './styles/slider.scss'
import './styles/mark.scss'

export const SliderState: StateMap = {
  None: 0,
  Drag: 1 << 0,
}

const DEFAULT_SLIDER_SIZE = 6

@Component({
  data() {
    return {
      control: null,
    }
  },
  components: {
    VueSliderDot,
  },
})
export default class VueSlider extends Vue {
  private control!: Control
  private states: State = new State(SliderState)
  private scale: number = 1 // 比例，1% = ${scale}px

  focusDotIndex: number = 0

  $refs!: {
    container: HTMLDivElement
    dot: VueSliderDot[]
  }

  // slider value
  @Model('change', { default: 0 })
  value!: TValue | TValue[]

  // display of the component
  @Prop({ type: Boolean, default: true })
  show!: boolean

  // component width
  @Prop(Number) width?: number

  // component height
  @Prop(Number) height?: number

  // the size of the slider, optional [width, height] | size
  @Prop({ default: 12 })
  dotSize!: [number, number] | number

  // the direction of the slider
  @Prop({ default: 'ltr', validator: dir => ['ltr', 'rtl', 'ttb', 'btt'].indexOf(dir) > -1 })
  direction!: TDirection

  // 最小值
  @Prop({ type: Number, default: 0 })
  min!: number

  // 最小值
  @Prop({ type: Number, default: 100 })
  max!: number

  // 间隔
  @Prop({ type: Number, default: 1 })
  interval!: number

  // 运动速度
  @Prop({ type: Number, default: 0.5 })
  speed!: number

  // 是否禁用滑块
  @Prop() disabled?: boolean

  // 自定义数据
  @Prop(Array)
  data!: TValue[] | null

  // 是否懒同步值
  @Prop({ type: Boolean, default: false })
  lazy!: boolean

  // 初始化时候是否有过渡动画
  @Prop({ type: Boolean, default: false })
  startAnimation!: boolean

  // 是否允许滑块交叉
  @Prop({ type: Boolean, default: true })
  enableCross!: boolean

  // 是否固定滑块见间隔
  @Prop({ type: Boolean, default: false })
  fixed!: boolean

  // 滑块之间的最小距离
  @Prop(Number) minRange?: number

  // 滑块之间的最大距离
  @Prop(Number) maxRange?: number

  // 滑块之间的最大距离
  @Prop() marks?: boolean | Marks

  // tail style
  @Prop() tailStyle?: CSSStyleDeclaration

  // 滑块的配置
  @Prop() dotOption?: DotOption | DotOption[]

  // 轨道尺寸
  get tailSize() {
    return (this.isHorizontal ? this.height : this.width) || DEFAULT_SLIDER_SIZE
  }

  // 容器类
  get containerClasses() {
    return [
      'vue-slider-component',
      `vue-slider-${this.direction}`,
      {
        'vue-slider-disabled': this.disabled,
      },
      //  disabledClass, stateClass, { 'vue-slider-has-label': piecewiseLabel }
    ]
  }

  // 容器样式
  get containerStyles() {
    const [dotWidth, dotHeight] = Array.isArray(this.dotSize)
      ? this.dotSize
      : [this.dotSize, this.dotSize]
    const containerWidth = this.width
      ? toPx(this.width)
      : this.isHorizontal
        ? 'auto'
        : toPx(DEFAULT_SLIDER_SIZE)
    const containerHeight = this.height
      ? toPx(this.height)
      : this.isHorizontal
        ? toPx(DEFAULT_SLIDER_SIZE)
        : 'auto'
    return {
      padding: `${dotHeight / 2}px ${dotWidth / 2}px`,
      width: containerWidth,
      height: containerHeight,
    }
  }

  // dot style
  get dotBaseStyle() {
    const [dotWidth, dotHeight] = Array.isArray(this.dotSize)
      ? this.dotSize
      : [this.dotSize, this.dotSize]
    let dotPos: { [key: string]: string }
    if (this.isHorizontal) {
      dotPos = {
        marginTop: `-${(dotHeight - this.tailSize) / 2}px`,
        [this.direction === 'ltr' ? 'marginLeft' : 'marginRight']: `-${dotWidth / 2}px`,
        top: '0',
        [this.direction === 'ltr' ? 'left' : 'right']: '0',
      }
    } else {
      dotPos = {
        marginLeft: `-${(dotWidth - this.tailSize) / 2}px`,
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

  // 得到所有的滑块
  get dots(): Dot[] {
    return this.control.dotsPos.map((pos, index) => ({
      pos,
      value: this.control.dotsValue[index],
      focus: this.states.has(SliderState.Drag) && this.focusDotIndex === index,
      ...((Array.isArray(this.dotOption) ? this.dotOption[index] : this.dotOption) || {}),
    }))
  }

  get animateTime(): number {
    if (this.states.has(SliderState.Drag)) {
      return 0
    }
    return this.speed
  }

  get dotStates(): DotState[] {
    if (!this.dotOption) {
      return this.control.dotsValue.map(() => ({
        disabled: false,
        lock: false
      }))
    } else {
      return Array.isArray(this.dotOption) ? this.dotOption.map(dot => ({
        disabled: dot.lock || !!dot.disabled,
        lock: !!dot.lock
      })) : this.control.dotsValue.map(() => {
        const { disabled, lock } = (this.dotOption as DotOption)
        return {
          disabled: lock || !!disabled,
          lock: !!lock
        }
      })
    }
  }

  created() {
    this.initControl()
  }

  getScale() {
    this.scale = new Decimal(
      Math.floor(this.isHorizontal ? this.$el.offsetWidth : this.$el.offsetHeight),
    ).divide(100)
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
      this.dotStates,
      this.minRange,
      this.maxRange,
      this.marks,
      this.emitError,
    )
  }

  // 同步值
  private syncValueByPos() {
    const values = this.control.dotsValue
    this.$emit('change', values.length === 1 ? values[0] : values)
  }

  // 返回错误
  private emitError(type: ERROR_TYPE, message: string) {
    this.$emit('error', {
      type,
      message,
    })
  }

  // 拖拽开始
  private dragStart(index: number) {
    this.focusDotIndex = index
    this.getScale()
    this.states.add(SliderState.Drag)
    this.$emit('dragStart')
  }

  // 拖拽中
  private dragMove(e: MouseEvent | TouchEvent, index: number) {
    this.control.setDotPos(this.getPosByEvent(e), index)
    if (!this.lazy) {
      this.syncValueByPos()
    }
    this.$emit('dragging')
  }

  // 拖拽结束
  private dragEnd() {
    // NOTE: 滑块交叉后恢复滑块顺序位置
    this.control.sortDotsPos()
    if (this.lazy) {
      this.syncValueByPos()
    }

    setTimeout(() => {
      // NOTE: 拖拽完毕后同步滑块的位置
      this.control.syncDotsPos()

      this.states.delete(SliderState.Drag)
      this.$emit('dragEnd')
    })
  }

  private clickHandle(e: MouseEvent | TouchEvent) {
    if (this.states.has(SliderState.Drag)) {
      return
    }
    this.getScale()
    const pos = this.getPosByEvent(e)
    this.control.setDotPos(pos)
    this.syncValueByPos()
  }

  private getPosByEvent(e: MouseEvent | TouchEvent): number {
    return (
      getPos(e, this.$el as HTMLDivElement, this.isReverse)[this.isHorizontal ? 'x' : 'y'] /
      this.scale
    )
  }

  render() {
    return (
      <div
        v-show={this.show}
        class={this.containerClasses}
        style={this.containerStyles}
        onClick={this.clickHandle}
        aria-hidden={true}
      >
        <div class="vue-slider-rail" style={this.tailStyle}>
          {this.dots.map((dot, index) => (
            <vue-slider-dot
              ref="dot"
              key={index}
              dotSize={this.dotSize}
              value={dot.pos}
              disabled={dot.disabled}
              dot-style={[
                dot.style,
                dot.disabled ? dot.disabledStyle : null,
                dot.focus ? dot.focusStyle : null,
              ]}
              style={[
                this.dotBaseStyle,
                {
                  [this.mainDirection]: `${dot.pos}%`,
                  transition: `${this.mainDirection} ${this.animateTime}s`,
                },
              ]}
              onDragStart={() => this.dragStart(index)}
              onDragging={(e: MouseEvent | TouchEvent) => this.dragMove(e, index)}
              onDragEnd={this.dragEnd}
            >
              {this.$scopedSlots.dot
                ? this.$scopedSlots.dot({
                    ...dot,
                  })
                : null}
            </vue-slider-dot>
          ))}
        </div>
      </div>
    )
  }
}
