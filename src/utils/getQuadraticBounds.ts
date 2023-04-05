import { Vector } from 'src/types'

function solveB2(a: number, b: number, c: number) {
  var ba = b - a
  return ba / (ba - (c - b)) // the position on the curve of the maxima
}

function findPoint(
  u: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) {
  // returns array with x, and y at u
  var xx1 = x1 + (x2 - x1) * u
  var yy1 = y1 + (y2 - y1) * u
  var xx2 = x2 + (x3 - x2) * u
  var yy2 = y2 + (y3 - y2) * u
  return {
    x: xx1 + (xx2 - xx1) * u,
    y: yy1 + (yy2 - yy1) * u,
  }
}

const getQuadraticBounds = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) => {
  // solve for bounds
  var ux = solveB2(x1, x2, x3)
  var uy = solveB2(y1, y2, y3)
  let px, py: Vector
  if (ux >= 0 && ux <= 1) {
    px = findPoint(ux, x1, y1, x2, y2, x3, y3)
  } else {
    px = { x: x1, y: y1 } // a bit of a cheat but saves having to put in extra conditions
  }
  if (uy >= 0 && uy <= 1) {
    py = findPoint(uy, x1, y1, x2, y2, x3, y3)
  } else {
    py = { x: x3, y: y3 } // a bit of a cheat but saves having to put in extra conditions
  }

  return [
    { x: Math.min(x1, x3, px.x, py.x), y: Math.min(y1, y3, px.y, py.y) },
    { x: Math.max(x1, x3, px.x, py.x), y: Math.max(y1, y3, px.y, py.y) },
  ]
}

export default getQuadraticBounds
