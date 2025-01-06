import h from '../shared/h.js'
import { useEffect } from 'preact/hooks'
import { Header } from './header.js'
import { Calc } from './calc.js'

const SCROLL_STYLE = `
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(31, 41, 55);
  }
`

export function App() {
  // Set hash to local storage upon change.
  useEffect(() => {
    window.addEventListener('hashchange', () => {
      location.hash.startsWith('#/') && localStorage.setItem('hash', location.hash.substring(1))
    })
  }, [])

  // Restore hash from local storage.
  if (!location.hash && localStorage.getItem('hash')) {
    location.hash = localStorage.getItem('hash')
  }

  return h('div', {
    tw: 'fixed w-screen h-screen font-mono relative text-sm text-gray-800 grid grid-cols-1 ',
    style: 'grid-template-rows: auto 1fr',
    children: [
      h('style', SCROLL_STYLE),
      h(Header),
      h(Calc)
    ]
  })
}
