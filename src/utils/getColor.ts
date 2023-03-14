import { Color } from "src";

const getColor = (color: Color) => {
  if (typeof color === 'object') {
    if ('r' in color) {
      return `rgb(${color.r}, ${color.g}, ${color.b})`
    }
    if ('h' in color) {
      return `hsl(${color.h}, ${color.s}, ${color.l})`
    }
  }
  return color
}

export default getColor;