import forEachReversed from 'src/utils/forEachReversed'
import { createObject2D } from './createObject2D'

const Group = createObject2D({
  id: 'Group',
  render: (canvas, props, tokens) => {
    forEachReversed(tokens, ({ data }) => {
      if ('render' in data) data.render(canvas.ctx)
    })
  },
})

export { Group }
