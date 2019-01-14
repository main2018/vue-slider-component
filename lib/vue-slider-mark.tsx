import { Component, Prop, Vue } from 'vue-property-decorator'
import { Mark } from './typings'

import './styles/mark.scss'

@Component
export default class VueSlideMark extends Vue {
  // 显示标识
  @Prop({ required: true })
  mark!: Mark

  get marksClasses() {
    return [
      'vue-slider-mark',
      {
        'vue-slider-mark-active': this.mark.active,
      },
    ]
  }

  get stepClasses() {
    return [
      'vue-slider-mark-step',
      {
        'vue-slider-mark-step-active': this.mark.active,
      },
    ]
  }

  get labelClasses() {
    return [
      'vue-slider-mark-label',
      {
        'vue-slider-mark-label-active': this.mark.active,
      },
    ]
  }

  render() {
    const mark = this.mark
    return (
      <div class={this.marksClasses} style={[mark.style, mark.active ? mark.activeStyle : null]}>
        {this.$scopedSlots.step || (
          <div
            class={this.stepClasses}
            style={[mark.stepStyle, mark.active ? mark.stepActiveStyle : null]}
          />
        )}
        {this.$scopedSlots.label || (
          <div
            class={this.labelClasses}
            style={[mark.labelStyle, mark.active ? mark.labelActiveStyle : null]}
          >
            {mark.label}
          </div>
        )}
      </div>
    )
  }
}
