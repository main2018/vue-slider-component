import { Component, Model, Prop, Watch, Vue } from 'vue-property-decorator'
import { TValue } from './utils/control'
import { getPos } from './utils'

import './styles/dot.scss'

export const enum DotState {
  None   = 0,
  Drag   = 1 << 0,
  FOCUS  = 1 << 1,
  KEY    = 1 << 2
}

export interface DotPos {
  x: number,
  y: number
}

@Component
export default class VueSliderDot extends Vue {
  states: DotState = DotState.None
  wrapWidth: number = 0

  $refs!: {
    dot: HTMLDivElement
  }

  // slider value
  @Prop({ default: 0 })
  value!: TValue

  // 滑块大小
  @Prop({ default: 16 })
  dotSize!: number | [number, number]

  // dot 样式
  @Prop()
  dotStyle?: CSSStyleDeclaration

  // 是否禁用状态
  @Prop({ default: false })
  disabled!: boolean

  get dotClasses() {
    return [
      'vue-slider-dot',
      {
        'vue-slider-dot-drag': this.states & DotState.Drag
      }
    ]
  }

  mounted() {
    this.bindEvent()
  }

  beforeDestroy() {
    this.unbindEvent()
  }

  bindEvent() {
    document.addEventListener('touchmove', this.dragMove, { passive: false })
    document.addEventListener('touchend', this.dragEnd, { passive: false })
    document.addEventListener('mousemove', this.dragMove)
    document.addEventListener('mouseup', this.dragEnd)
    document.addEventListener('mouseleave', this.dragEnd)
  }

  unbindEvent() {
    document.removeEventListener('touchmove', this.dragMove)
    document.removeEventListener('touchend', this.dragEnd)
    document.removeEventListener('mousemove', this.dragMove)
    document.removeEventListener('mouseup', this.dragEnd)
    document.removeEventListener('mouseleave', this.dragEnd)
  }

  // 设置滑块状态
  setState(state: DotState) {
    this.states |= state
  }

  // 移除滑块状态
  deleteState(state: DotState) {
    this.states &= ~state
  }

  // 拖拽开始
  dragStart(e: MouseEvent | TouchEvent) {
    if (this.disabled) {
      return false
    }

    this.setState(DotState.Drag)
    this.$emit('dragStart')
  }

  // 拖拽中
  dragMove(e: MouseEvent | TouchEvent) {
    if (!(this.states & DotState.Drag)) {
      return false
    }

    const pos = getPos(e, (this.$parent.$el as HTMLDivElement))
    this.$emit('dragging', pos)
  }

  // 拖拽结束
  dragEnd() {
    if (this.states & DotState.Drag) {
      this.deleteState(DotState.Drag)
      this.$emit('dragEnd')
    }
  }

  render() {
    return (
      <div
        ref='dot'
        class={this.dotClasses}
        onMousedown={this.dragStart}
        onTouchstart={this.dragStart}
      >
        <slot
          value={this.value}
          disabled={this.disabled}
        >
          <div
            class='vue-slider-dot-handle'
            style={this.dotStyle}
          ></div>
        </slot>
      </div>
    )
  }
}
