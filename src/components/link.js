import h from '../shared/h.js'

export function Link({ href, onClick, children, selected }) {
  return h('a', {
    href,
    onClick,
    tw: 'text-blue-500 cursor-pointer hover:text-underline inline',
    style: 'text-decoration-thickness: 1px; text-underline-offset: 4px',
    children })
}
