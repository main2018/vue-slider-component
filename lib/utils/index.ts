// 将数字或字符串格式化成像素格式
export const toPx = (value: number | string): string => {
  return typeof value === 'number' ? `${value}px` : value
}

// 得到当前鼠标在元素中的位置
export const getPos = (e: MouseEvent | TouchEvent, elem: HTMLDivElement): { x: number, y: number } => {
  const event = e instanceof TouchEvent ? e.targetTouches[0] : e
  return {
    x: event.pageX - elem.offsetLeft,
    y: event.pageY - elem.offsetTop
  }
}
