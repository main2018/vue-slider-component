import { Component, Prop, Vue } from 'vue-property-decorator'
import { TValue } from './typings'

import './styles/dot.scss'

@Component
export default class VueSliderDot extends Vue {
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

  @Prop(Boolean) focus?: boolean = false

  // 是否禁用状态
  @Prop({ default: false })
  disabled!: boolean

  get dotClasses() {
    return [
      'vue-slider-dot',
      {
        'vue-slider-dot-disabled': this.disabled,
        'vue-slider-dot-focus': this.focus,
      },
    ]
  }

  get handleClasses() {
    return [
      'vue-slider-handle',
      {
        'vue-slider-handle-disabled': this.disabled,
        'vue-slider-handle-focus': this.focus,
      },
    ]
  }

  // 拖拽开始
  dragStart(e: MouseEvent | TouchEvent) {
    if (this.disabled) {
      return false
    }

    this.$emit('dragStart')
  }

  render() {
    return (
      <div
        ref="dot"
        class={this.dotClasses}
        onMousedown={this.dragStart}
        onTouchstart={this.dragStart}
      >
        {this.$slots.default || <div class={this.handleClasses} style={this.dotStyle} />}
      </div>
    )
  }
}
