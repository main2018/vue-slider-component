import Decimal from './decimal';

export type TValue = number | string | symbol;

export interface Marks {
  [key: string]: string | { label?: string; style?: CSSStyleDeclaration };
}

export const enum ERROR_TYPE {
  VALUE = 1, // 值的类型不正确
  INTERVAL, // interval 不合法
  MIN, // 超过最小值
  MAX
}

const ERROR_MSG = {
  [ERROR_TYPE.VALUE]: 'The type of the "value" is illegal',
  [ERROR_TYPE.INTERVAL]:
    'The prop "interval" is invalid, "(max - min)" cannot be divisible by "interval"',
  [ERROR_TYPE.MIN]: 'The "value" cannot be less than the minimum.',
  [ERROR_TYPE.MAX]: 'The "value" cannot be greater than the maximum.'
};

export default class Control {
  scale: number = 1; // 比例，1% = ${scale}px
  dotsPos: number[] = []; // 每个滑块的位置
  dotsValue: TValue[] = []; // 每个滑块的值
  inDrag: boolean = false; // 是否拖拽状态 (拖拽状态下，滑块顺序不排序)

  constructor(
    value: TValue | TValue[],
    private data: TValue[] | null,
    private enableCross: boolean,
    private fixed: boolean,
    private max: number,
    private min: number,
    private interval: number,
    private minRange?: number,
    private maxRange?: number,
    private marks?: boolean | Marks,
    private onError?: (type: ERROR_TYPE, message: string) => void
  ) {
    this.setValue(value);
  }

  // 设置是否拖拽状态中
  setDragState(inDrag: boolean) {
    this.inDrag = inDrag;
  }

  // 设置滑块的值
  setValue(value: TValue | TValue[]) {
    this.dotsValue = Array.isArray(value) ? value : [value];
    this.syncDotsPos();
  }

  // 设置滑块位置
  setDotsPos(dotsPos: number[], isDrag: boolean = true) {
    const list = [...dotsPos].sort((a, b) => a - b);
    this.dotsPos = isDrag ? dotsPos : list;
    this.dotsValue = list.map(dotPos => this.parsePos(dotPos));
  }

  // 排序滑块位置
  sortDotsPos() {
    this.dotsPos = [...this.dotsPos].sort((a, b) => a - b);
  }

  // 同步滑块位置
  syncDotsPos() {
    this.dotsPos = this.dotsValue.map(v => this.parseValue(v));
  }

  // 得到所有标志
  // get marks(): Marks {
  //   return
  // }

  /**
   * 设置单个滑块的位置
   *
   * @param {number} pos 滑块在组件中的位置
   * @param {number} index 滑块的索引
   */
  setDotPos(pos: number, index?: number) {
    if (index === void 0) {
      index = this.getRecentDot(pos);
    }
    // 滑块变化的距离
    const changePos = this.getValidPos(pos, index).pos - this.dotsPos[index];

    // 没有变化则不更新位置
    if (!changePos) {
      return false;
    }

    let changePosArr: number[] = new Array(this.dotsPos.length);
    if (this.fixed) {
      changePosArr = this.getFixedChangePosArr(changePos, index);
    } else if (this.minRange || this.maxRange) {
      changePosArr = this.getLimitRangeChangePosArr(pos, changePos, index);
    } else {
      changePosArr[index] = changePos;
    }

    this.setDotsPos(
      this.dotsPos.map((curPos, i) => curPos + (changePosArr[i] || 0))
    );
  }

  /**
   * 在 fixed 模式下，得到全部滑块变化的位置
   *
   * @param {number} changePos 单个滑块的变化距离
   * @param {number} index 滑块的索引
   * @returns {number[]}
   * @memberof Control
   */
  private getFixedChangePosArr(changePos: number, index: number): number[] {
    this.dotsPos.forEach((originPos, i) => {
      if (i !== index) {
        const { pos: lastPos, inRange } = this.getValidPos(
          originPos + changePos,
          i
        );
        if (!inRange) {
          changePos =
            Math.min(Math.abs(lastPos - originPos), Math.abs(changePos)) *
            (changePos < 0 ? -1 : 1);
        }
      }
    });
    return this.dotsPos.map(_ => changePos);
  }

  /**
   * 在 minRange/maxRange 模式下，得到全部滑块变化的位置
   *
   * @param {number} pos 单个滑块的位置
   * @param {number} changePos 单个滑块的变化距离
   * @param {number} index 滑块的索引
   * @returns {number[]}
   * @memberof Control
   */
  private getLimitRangeChangePosArr(
    pos: number,
    changePos: number,
    index: number
  ): number[] {
    const changeDots = [{ index, changePos }];
    const newChangePos = changePos;
    [this.minRange, this.maxRange].forEach(
      (isLimitRange?: number, rangeIndex?: number) => {
        if (!isLimitRange) {
          return false;
        }
        const next =
          changePos > 0
            ? rangeIndex === 0
              ? 1
              : -1
            : rangeIndex === 0
            ? -1
            : 1;
        const inLimitRange = (pos1: number, pos2: number) =>
          rangeIndex === 0
            ? Math.abs(pos1 - pos2) < this.minRangeDir
            : Math.abs(pos1 - pos2) > this.maxRangeDir;

        let i = index + next;
        let nextPos = this.dotsPos[i];
        let prevPos = pos;
        while (this.isPos(nextPos) && inLimitRange(nextPos, prevPos)) {
          const { pos: lastPos } = this.getValidPos(nextPos + newChangePos, i);
          changeDots.push({
            index: i,
            changePos: lastPos - nextPos
          });
          i = i + next;
          prevPos = lastPos;
          nextPos = this.dotsPos[i];
        }
      }
    );

    return this.dotsPos.map((_, i) => {
      const changeDot = changeDots.find(dot => dot.index === i);
      return changeDot ? changeDot.changePos : 0;
    });
  }

  private isPos(pos: any): boolean {
    return typeof pos === 'number';
  }

  /**
   * 通过位置得到最近的一个滑块索引
   *
   * @param {number} pos
   * @returns {number}
   * @memberof Control
   */
  private getRecentDot(pos: number): number {
    const arr = this.dotsPos.map(dotPos => Math.abs(dotPos - pos));
    return arr.indexOf(Math.min(...arr));
  }

  /**
   * 得到最后滑块位置
   *
   * @private
   * @param {number} newPos 新的滑块位置
   * @param {number} index 滑块索引
   * @returns {{ pos: number, inRange: boolean }}
   */
  private getValidPos(
    newPos: number,
    index: number
  ): { pos: number; inRange: boolean } {
    const range = this.valuePosRange[index];
    let pos = newPos;
    let inRange = true;
    if (newPos < range[0]) {
      pos = range[0];
      inRange = false;
    } else if (newPos > range[1]) {
      pos = range[1];
      inRange = false;
    }
    return {
      pos,
      inRange
    };
  }

  /**
   * 根据值计算出滑块的位置
   *
   * @private
   * @param {TValue} val
   * @returns {number}
   */
  private parseValue(val: TValue): number {
    if (this.data) {
      val = this.data.indexOf(val);
    } else if (typeof val === 'number') {
      if (val < this.min) {
        this.emitError(ERROR_TYPE.MIN);
        return 0;
      }
      if (val > this.max) {
        this.emitError(ERROR_TYPE.MAX);
        return 0;
      }
      val = new Decimal(val).minusChain(this.min).divide(this.interval);
    }

    if (typeof val !== 'number') {
      this.emitError(ERROR_TYPE.VALUE);
      return 0;
    }

    return this.valuePos[val];
  }

  /**
   * 通过位置计算出值
   *
   * @private
   * @param {number} pos
   * @returns {TValue}
   * @memberof Control
   */
  private parsePos(pos: number): TValue {
    const index = Math.round(pos / this.gap);
    return this.data
      ? this.data[index]
      : new Decimal(index).multiplyChain(this.interval).plus(this.min);
  }

  /**
   * 返回错误
   *
   * @private
   * @param {ERROR_TYPE} type 错误类型
   * @memberof Control
   */
  private emitError(type: ERROR_TYPE) {
    if (this.onError) {
      this.onError(type, ERROR_MSG[type]);
    }
  }

  // 所有可用值的个数
  private get total(): number {
    let total = 0;
    if (this.data) {
      total = this.data.length - 1;
    } else {
      total = new Decimal(this.max).minusChain(this.min).divide(this.interval);
    }
    if (total - Math.floor(total) !== 0) {
      this.emitError(ERROR_TYPE.INTERVAL);
      return 0;
    }
    return total;
  }

  // 每个可用值之间的距离
  private get gap(): number {
    return 100 / this.total;
  }

  // 每个可用值的位置
  private get valuePos(): number[] {
    const gap = this.gap;
    return Array.from(new Array(this.total), (_, index) => {
      return index * gap;
    }).concat([100]);
  }

  // 两个滑块最小的距离
  private get minRangeDir(): number {
    return this.minRange ? this.minRange * this.gap : 0;
  }

  // 两个滑块最大的距离
  private get maxRangeDir(): number {
    return this.maxRange ? this.maxRange * this.gap : 100;
  }

  // 每个滑块的滑动范围
  private get valuePosRange(): Array<[number, number]> {
    const dotsPos = this.dotsPos;
    const valuePosRange: Array<[number, number]> = [];

    dotsPos.forEach((pos, i) => {
      const prevPos = valuePosRange[i - 1] || [0, 100];
      valuePosRange.push([
        this.minRange
          ? this.minRangeDir * i
          : !this.enableCross
          ? dotsPos[i - 1] || 0
          : 0,
        this.minRange
          ? 100 - this.minRangeDir * (dotsPos.length - 1 - i)
          : !this.enableCross
          ? dotsPos[i + 1] || 100
          : 100
      ]);
    });

    return valuePosRange;
  }
}
