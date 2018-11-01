<template>
  <div
    ref="dot"
    :class="dotClasses"
    @mousedown="dragStart"
    @touchstart="dragStart"
  >
    <slot
      :value="value"
      :disabled="disabled"
    >
      <div
        class="vue-slider-dot-handle"
        :style="[
          dotStyle,
        ]"
      ></div>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Watch, Vue } from 'vue-property-decorator'
import { TValue } from './vue-slider.vue'
import { getPos } from './utils'

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

  @Prop({ default: 0 })
  scale!: number

  // slider value
  @Prop({ default: 0 })
  value!: TValue

  // 滑块大小
  @Prop({ default: 16 })
  dotSize!: number | [number, number]

  // dot 样式
  @Prop()
  dotStyle?: CSSStyleDeclaration

  // 滑动范围
  @Prop({ default: () => [0, 100] })
  range!: [number, number]

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
    this.$emit('drag-start')
  }

  // 拖拽中
  dragMove(e: MouseEvent | TouchEvent) {
    if (!(this.states & DotState.Drag)) {
      return false
    }

    const pos = getPos(e, (this.$parent.$el as HTMLDivElement))
    const changePos = pos.x / this.scale
    this.$emit('dragging', this.getPos(changePos))
  }

  // 拖拽结束
  dragEnd() {
    if (this.states & DotState.Drag) {
      this.deleteState(DotState.Drag)
      this.$emit('drag-end')
    }
  }

  // 得到最后滑块位置
  getPos(changePos: number): { pos: number, inRange: boolean } {
    const range = this.range
    let pos = changePos
    let inRange = true
    if (changePos < range[0]) {
      pos = range[0]
      inRange = false
    } else if (changePos > range[1]) {
      pos = range[1]
      inRange = false
    }
    return {
      pos,
      inRange
    }
  }
}
</script>

<style lang="scss">
  // dot
  .vue-slider-dot {
    position: absolute;
    cursor: pointer;
    will-change: transform;
    transition: all 0s;
    z-index: 5;
  }
  .vue-slider-dot-handle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, .2);
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
  }
</style>
