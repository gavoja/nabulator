import h from '../shared/h.js'

export function Grid(props) {
  return h('div', {
    tw: 'grid gap-2', style: 'grid-template-columns: 80px 80px 80px 80px 1fr',
    children: props.children
  })
}
