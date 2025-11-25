import h from '../shared/h.js'

export function Link ({ href, onMouseDown, children }) {
  return h('a', {
    href,
    onMouseDown,
    tw: 'text-blue-500 cursor-pointer hover:underline inline decoration-1 underline-offset-4',
    children
  })
}
