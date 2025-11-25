import { useEffect, useRef } from 'preact/hooks'
import focusTrap from '../shared/focus-trap.js'
import h from '../shared/h.js'
import { Box } from './box.js'
import { Link } from './link.js'

export function Dialog ({ text, onUpdate, onDelete, onCancel }) {
  const ref = useRef()

  // Focus the input and select the name.
  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [])

  return h('div', {
    tw: 'fixed top-0 left-0 right-0 bottom-0 text-center z-10 bg-black/50 animate-fade',
    onKeyDown (event) {
      focusTrap(event, ref?.current?.closest('.fixed'))
      if (event.key === 'Escape') {
        onCancel()
      }

      if (event.key === 'Enter') {
        onUpdate(ref.current.value)
      }
    },
    children: h('div', { tw: 'inline-block mt-22 bg-white animate-popup rounded-sm shrink grow-0' },
      h(Box,
        h('input', {
          tw: 'w-72 border-1 border-gray-300 p-1 pl-2 rounded-sm appearance-none',
          ref,
          value: text
        }),
        h('div', { tw: 'text-center space-x-8' },
          h(Link, {
            href: '#',
            children: 'Save',
            onMouseDown (event) {
              event.preventDefault()
              onUpdate(ref.current.value)
            }
          }),
          text && h(Link, {
            href: '#',
            children: 'Delete',
            onMouseDown (event) {
              event.preventDefault()
              onDelete()
            }
          }),
          h(Link, {
            href: '#',
            onMouseDown (event) {
              event.preventDefault()
              onCancel()
            },
            children: 'Cancel'
          })
        )
      )
    )
  })
}
