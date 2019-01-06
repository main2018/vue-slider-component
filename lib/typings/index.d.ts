import VueSlider from '../vue-slider'

export interface Styles {
  [key: string]: any
}

export type TDirection = 'ltr' | 'rtl' | 'ttb' | 'btt'

export type TValue = number | string | symbol

export interface Mark {
  label: TValue
  style?: Styles
  activeStyle?: Styles
}
export interface Marks {
  [key: string]: string | Mark
}
export type MarksFunction = (value: TValue) => boolean
export type MarksProp = boolean | Marks | TValue[] | MarksFunction

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
