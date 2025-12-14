import h from '../shared/h.js'

export function Link ({ href, onMouseDown, children }) {
  return h('a', {
    href,
    tabIndex: '0', // In case href is not set.
    onMouseDown,
    tw: 'text-blue-500 cursor-pointer hover:underline inline decoration-1 underline-offset-4 focus:outline-offset-2 px-px',
    children
  })
}
