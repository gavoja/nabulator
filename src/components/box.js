import h from '../shared/h.js'

export function Box(props) {
  return h('div', { tw: 'p-2 space-y-2' }, props.children)
}
