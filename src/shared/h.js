import { h as ph } from 'preact'

// Makes props optional.
export default function h (...args) {
  let [, props] = args

  // Ensure props are present.
  if (!props || typeof props !== 'object' || Object.hasOwn(props, '__k') || Array.isArray(props)) {
    props = {}
    args.splice(1, 0, props)
  }

  return ph.apply(this, args)
}
