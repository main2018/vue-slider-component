import { Component, Model, Prop, Watch, Vue } from 'vue-property-decorator'
import { TValue } from './utils/control'
import State, { StateMap } from './utils/state'

import './styles/dot.scss'

export const DotState: StateMap = {
  None: 0,
  Drag: 1 << 0,
  FOCUS: 1 << 1,
  KEY: 1 << 2,
}

export interface DotPos {
  x: number
  y: number
}

@Component
export default class VueSliderDot extends Vue {
  states: State = new State(DotState)
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
  @Prop() dotStyle?: CSSStyleDeclaration

  // 是否禁用状态
  @Prop({ default: false })
  disabled!: boolean

  get dotClasses() {
    return [
      'vue-slider-dot',
      {
        'vue-slider-dot-disabled': this.disabled,
        'vue-slider-dot-focus': this.states.has(DotState.Drag),
      },
    ]
  }

  get handleClasses() {
    return [
      'vue-slider-handle',
      {
        'vue-slider-handle-disabled': this.disabled,
        'vue-slider-handle-focus': this.states.has(DotState.Drag),
      },
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

  // 拖拽开始
  dragStart(e: MouseEvent | TouchEvent) {
    if (this.disabled) {
      return false
    }

    this.states.add(DotState.Drag)
    this.$emit('dragStart')
  }

  // 拖拽中
  dragMove(e: MouseEvent | TouchEvent) {
    if (!this.states.has(DotState.Drag)) {
      return false
    }

    this.$emit('dragging', e)
  }

  // 拖拽结束
  dragEnd() {
    if (this.states.has(DotState.Drag)) {
      this.states.delete(DotState.Drag)
      this.$emit('dragEnd')
    }
  }

  render() {
    return (
      <div
        ref="dot"
        class={this.dotClasses}
        onMousedown={this.dragStart}
        onTouchstart={this.dragStart}
      >
        {this.$slots.default || (
          <div class={this.handleClasses} style={this.dotStyle} />
        )}
      </div>
    )
  }
}
