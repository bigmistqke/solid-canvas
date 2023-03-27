import { createLazyMemo } from '@solid-primitives/memo'
import { mapArray, createSignal, Accessor } from 'solid-js'
import { BezierPoint, Position } from 'src/types'
import addPositions from './addPositions'
import invertPosition from './invertPosition'

const useProcessedPoints = (
  inputs: Accessor<BezierPoint[]>,
  type: 'quadratic' | 'cubic',
) => {
  // NOTE:  we use createLazyMemo because `oppositeControl` refers to points
  //        which causes a circular dependency and the error 'Cannot access 'points' before initialization'

  const points = createLazyMemo(
    mapArray(inputs, (value, index) => {
      const [offsetPoint, setOffsetPoint] = createSignal<Position>({
        x: 0,
        y: 0,
      })
      const [offsetControl, setOffsetControl] = createSignal<
        Position | undefined
      >({
        x: 0,
        y: 0,
      })
      const [offsetOppositeControl, setOffsetOppositeControl] = createSignal<
        Position | undefined
      >({
        x: 0,
        y: 0,
      })

      /*
       *
       *   `control` - `oppositeControl` and `automatic` have a different meaning between cubic and quadratic beziers:
       *     - cubic bezier has 2 control points (`control` - `oppositeControl`) per path-point, 1 on each side, both tangentially to the path.
       *         ->  when a cubic bezier-point is `automatic`
       *             `oppositeControl` is the continuation of `control`.
       *     - quadratic bezier's also has 2 control points, on both side each.
       *         but 1 point's `control` position is being shared with the next point's `oppositeControl`
       *         users can not set `oppositeControl` for a quadratic bezier, it's only for visual purposes.
       *         ->  when a series of quadratic bezier-point are `automatic`
       *             their positions are being calculated by the first non-automatic point (through an iterative series of reflections)
       *             (that's why the first point needs to have a `control`)
       *
       */

      const control: Accessor<Position | undefined> = createLazyMemo(() => {
        if (type === 'cubic')
          return addPositions(value.control, offsetControl())
        if (index() === inputs().length - 1) return undefined
        return !('control' in value)
          ? invertPosition(oppositeControl())
          : addPositions(value.control, offsetControl())
      })

      const oppositeControl: Accessor<Position | undefined> = createLazyMemo(
        () => {
          if (type === 'cubic') {
            if (index() === 0 || index() === inputs().length - 1)
              return undefined
            return addPositions(
              value.oppositeControl ?? { x: 0, y: 0 },
              'oppositeControl' in value
                ? offsetOppositeControl()
                : invertPosition(control()),
            )
          }
          if (index() === 0) return undefined
          return addPositions(
            points()?.[index() - 1]?.control,
            points()?.[index() - 1]?.point,
            invertPosition(addPositions(value.point, offsetPoint())),
          )
        },
      )

      // NOTE:  "What You Set Is Not What You Get" is a bit awkward.
      return {
        get control() {
          return control()
        },
        set control(v) {
          setOffsetControl(v)
        },
        get oppositeControl() {
          return oppositeControl()
        },
        set oppositeControl(v) {
          setOffsetOppositeControl(v)
        },
        get point() {
          return addPositions(value.point, offsetPoint())
        },
        set point(v) {
          setOffsetPoint(v)
        },
        automatic:
          type === 'cubic'
            ? !('oppositeControl' in value)
            : !('control' in value),
      }
    }),
  )
  return points
}

export default useProcessedPoints
