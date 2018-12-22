import VueSlider from '../vue-slider'

export interface Styles {
  [key: string]: any
}

export type TDirection = 'ltr' | 'rtl' | 'ttb' | 'btt'

export type TValue = number | string | symbol

export interface Marks {
  [key: string]: string | { label?: string; style?: CSSStyleDeclaration }
}

export interface DotStyle {
  style?: Styles
  focusStyle?: Styles
  disabledStyle?: Styles
}
export interface DotOption extends DotStyle {
  disabled: boolean
}

export declare interface Dot extends DotOption {
  pos: number
  value: TValue
  focus: boolean
}

export default VueSlider