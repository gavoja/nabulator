import { useRef, useEffect } from 'react'
import h from '../shared/h.js'
import { Box } from './box.js'
import { Link } from './link.js'

const FOCUS_DELAY = 10

export function Dialog ({ text, show, onUpdate, onDelete, onCancel }) {
  const dialogRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    if (!dialogRef.current) {
      return
    }

    if (!show) {
      dialogRef.current?.close()
      return
    }

    dialogRef.current?.showModal()

    // Focus on input.
    setTimeout(() => inputRef?.current?.focus?.(), FOCUS_DELAY)
  }, [show, text, onUpdate, onDelete, onCancel])

  return h('dialog', {
    ref: dialogRef,
    tw: 'backdrop:bg-black/50 backdrop:backdrop-blur-xs z-10 m-auto rounded-md w-80 h-fit animate-popup',
    onKeyDown (event) {
      if (event.key === 'Escape') {
        dialogRef.current?.close()
        onCancel()
      }

      if (event.key === 'Enter') {
        dialogRef.current?.close()
        onUpdate(inputRef.current.value)
      }
    },
    children: h(Box,
      h('input', {
        ref: inputRef,
        tw: 'w-full border-1 border-gray-300 p-1 pl-2 rounded-sm appearance-none',
        defaultValue: text
      }),
      h('div', { tw: 'text-center space-x-8' },
        h(Link, {
          href: '#',
          children: 'Save',
          onMouseDown (event) {
            event.preventDefault()
            onUpdate(inputRef.current.value)
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
  })
}
