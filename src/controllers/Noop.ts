import { createController } from './createController'

const Noop = createController(props => props())

export { Noop }
