
import Control, { TValue, ERROR_TYPE } from './utils/control'

declare module 'vue-slider-component' {
  interface IPosObject {
    x: number,
    y: number
  }
  interface IDot {
    pos: number,
    value: TValue,
  }
}