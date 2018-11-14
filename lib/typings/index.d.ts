import VueSlider from '../vue-slider'

export interface Styles {
  [key: string]: any
}

export type TDirection = 'ltr' | 'rtl' | 'ttb' | 'btt'

export type TValue = number | string | symbol

export interface Marks {
  [key: string]: string | { label?: string; style?: CSSStyleDeclaration }
}

export interface DotState {
  disabled?: boolean
  lock?: boolean
}

export interface DotOption extends DotState {
  style?: Styles
  focusStyle?: Styles
  disabledStyle?: Styles
}

export declare interface Dot extends DotOption {
  pos: number
  value: TValue
  focus: boolean
}

export default VueSlider