/* global location */
import { useLayoutEffect, useState } from 'preact/hooks'
import { getEmail, load, save, signIn, signOut } from '../shared/google.js'
import h from '../shared/h.js'
import usePersistentState from '../shared/use-persistent-state.js'
import { Box } from './box.js'
import { Dialog } from './dialog.js'
import { Icon } from './icon.js'
import { Link } from './link.js'

import ICON_CLOSE from '../assets/close.svg'
import ICON_MENU from '../assets/menu.svg'

export function Menu () {
  const [email, setEmail] = useState(null)
  const [saves, setSaves] = useState([])
  const [selected, setSelected] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = usePersistentState('menu-open', false)

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

  const deleteSave = (doSave = true) => {
    const index = saves.findIndex(save => save.value === getCurrentValue())
    if (index > -1) {
      saves.splice(index, 1)
      setSaves(saves)
      doSave && save(saves)
    }
  }

  const updateSave = (name) => {
    deleteSave(false)
    saves.push({ name, value: getCurrentValue() })
    saves.sort((a, b) => a.name.localeCompare(b.name))
    setSaves(saves)
    save(saves)
  }

  const selectedSave = saves.find(save => save.value === selected)
  return h('div',
    h('button', {
      tw: 'w-11 h-11 rounded-sm items-center justify-center flex transition-all duration-200 lg:hidden',
      onMouseDown: () => setOpen(!open),
      children: h(Icon, { svg: open ? ICON_CLOSE : ICON_MENU })
    }),
    h('div', {
      tw: `overflow-x-hidden overflow-y-auto fixed top-14 right-0 w-96 h-screen max-w-[90%] bg-white border-l border-gray-300 animate-menu lg:animate-none lg:block ${open ? '' : 'hidden'}`,
      style: 'height: calc(100% - 56px)', // For scroll to work.
      children: [
        h(Box, !ready
          ? 'Loading...'
          : [
              // Not signed in.
              !email && h('div',
                h(Link, {
                  onMouseDown () {
                    signIn()
                  },
                  href: '#',
                  children: 'Sign in with Google'
                }),
                h('span', ' to save')
              ),
              // Signed in.
              email && h('div',
                h(Link, {
                  href: '#',
                  onMouseDown () {
                    signOut()
                    setEmail(null)
                    setSelected(null)
                    setSaves([])
                  },
                  children: `Sign Out (${email})`
                }),
                h('span', ' | '),
                h(Link, {
                  onMouseDown: () => setEditMode(true),
                  children: selectedSave ? 'Edit' : 'Save'
                })
              )
            ]
        ),
        // Saved tensions.
        h('ul', { tw: 'space-y-2 mt-4' }, saves.map(save =>
          h('li', { tw: `border-l-4 pl-1 transition-colors ${save.value === selected ? 'border-blue-500' : 'border-white'}` },
            h(Link, {
              href: `#${save.value}`,
              selected: true,
              children: save?.name
            })
          )
        )),
        // Popup dialog.
        editMode && h(Dialog, {
          text: selectedSave?.name,
          onUpdate (name) {
            updateSave(name)
            setEditMode(false)
          },
          onDelete () {
            deleteSave()
            setEditMode(false)
          },
          onCancel () {
            setEditMode(false)
          }
        })
      ]
    })
  )
}

function getCurrentValue () {
  return location.hash.substring(1)
}