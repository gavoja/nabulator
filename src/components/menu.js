import h from '../shared/h.js'
import { useState, useLayoutEffect, useRef } from 'preact/hooks'
import { Icon } from './icon.js'
import { Box } from './box.js'
import { Link } from './link.js'
import { signIn, signOut, load, getEmail } from '../shared/google.js'
import usePersistentState from '../shared/use-persistent-state.js'
import focusTrap from '../shared/focus-trap.js'

import ICON_MENU from '../assets/menu.svg'
import ICON_CLOSE from '../assets/close.svg'

export function Menu () {
  const [email, setEmail] = useState(null)
  const [saves, setSaves] = useState([])
  const [selected, setSelected] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = usePersistentState('menu-open', false)
  const ref = useRef()
  const popupRef = useRef()

  useLayoutEffect(() => {
    (async () => {
      const email = await getEmail()
      const saves = await load()
      setSaves(saves)
      setEmail(email)
      setReady(true)
    })()


    setSelected(location.hash.substring(1))
    window.addEventListener('hashchange', () => {
      setSelected(location.hash.substring(1))
      setEditMode(false)
    })
  }, [])

  useLayoutEffect(() => popupRef?.current?.querySelector?.('input')?.focus?.())

  // const selectedSave = saves.find(save => save.value === selected)
  const selectedSave = saves.find(save => save.value === selected)
  return h('div',
    h('button', {
      tw: 'w-11 h-11 rounded-sm items-center justify-center flex transition-all duration-200 lg:hidden',
      onClick: () => setOpen(!open),
      children: h(Icon, { svg: open ? ICON_CLOSE : ICON_MENU })
    }),
    h('div', {
      tw: `overflow-x-hidden overflow-y-auto fixed top-14 right-0 w-96 h-screen max-w-[90%] bg-white border-l border-gray-300 animate-rflow lg:animate-none lg:block ${open ? '' : 'hidden'}`,
      style: 'height: calc(100% - 56px)', // For scroll to work.
      children: [
        h(Box,
          !ready ? 'Loading...' : [
            // Not signed in.
            !email && h('div',
              h(Link, {
                onClick() {
                  signIn()
                },
                children: 'Sign in with Google'
              }),
              h('span', ' to save')
            ),
            // Signed in.
            email && h('div',
              h(Link, {
                onClick() {
                  signOut()
                  setEmail(null)
                  setSelected(null)
                  setSaves([])
                },
                children: `Sign Out (${email})`
              }),
              h('span', ' | '),
              h(Link, {
                onClick: () => setEditMode(true),
                children: selectedSave ? 'Edit' : 'Save'
              })
            )
          ]
        ),
        // Saved tensions.
        h('ul', { tw: 'space-y-2 mt-4' }, saves.map(save =>
          h('li', { tw: save.value === selected ? 'border-l-4 border-blue-500 pl-1 transition-colors' : 'pl-2 transition-colors' },
            h(Link, {
              href: `#${save.value}`,
              selected: true,
              // onClick: () => setState({ ...state, selected: save.value }),
              children: save?.name
            })
          )
        )),
        // Popup.
        editMode && h('div', {
          tw: 'fixed top-0 left-0 right-0 bottom-0 z-10 bg-black bg-opacity-50 flex items-center justify-center animate-fade',
          ref: popupRef,
          onKeyDown (event) {
            focusTrap(event, popupRef?.current)
            if (event.key === 'Escape') {
              setEditMode(false)
            }

            if (event.key === 'Enter') {
              // TODO: Save.
              setEditMode(false)
            }
          },
          children: h('div', { tw: 'bg-white animate-tflow'},
            h(Box,
              h('input', {
                tw: 'w-96 border-1 border-gray-300 p-1 pl-2 rounded-sm appearance-none',
                ref,
                value: selectedSave?.name,
              }),
              h('div', { tw: 'text-center space-x-4' },
                h(Link, {
                  href: '#',
                  children: 'Save'
                }),
                selectedSave && h(Link, {
                  href: '#',
                  children: 'Delete'
                }),
                h(Link, {
                  href: '#',
                  onClick(event) {
                    event.preventDefault()
                    setEditMode(false)
                  },
                  children: 'Cancel'
                })
              )
            )
          )
        })
      ]
    })
  )
}

function Popup({ hidden }) {
  return
}