import { createElement } from 'react'

// Makes props optional.
export default function h (...args) {
  let [, props] = args

  // Ensure props are present.
  if (!props || typeof props !== 'object' || Object.hasOwn(props, '$$typeof') || Array.isArray(props)) {
    props = {}
    args.splice(1, 0, props)
  }

  return createElement.apply(this, args)
}
