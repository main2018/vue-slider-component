import { Component, Prop, Vue } from 'vue-property-decorator'
import { TValue, Mark } from './typings'

import './styles/marks.scss'

@Component
export default class VueSlideMarks extends Vue {
  $refs!: {
    marks: HTMLDivElement
  }

  // slider value
  @Prop({ default: 0 })
  value!: TValue

  // 显示标识
  @Prop({ type: Array, required: true })
  markList!: Mark[]

  get marksClasses() {
    return [
      'vue-slider-marks',
      {
      },
    ]
  }

  render() {
    return (
      <div
        ref="marks"
        class={this.marksClasses}
      >
        {this.$slots.default || this.markList.map(mark => (
          <div class="vue-slider-mark" style={mark.style}>
            <div class="vue-slider-mark-point"></div>
            <div class="vue-slider-mark-label">{mark.label}</div>
          </div>
        ))}
      </div>
    )
  }
}
