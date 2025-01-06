import h from '../shared/h.js'

export function Icon ({ svg }) {
  return h('div', {
    dangerouslySetInnerHTML: { __html: svg }
  })
}
