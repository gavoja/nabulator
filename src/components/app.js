/* global location, localStorage */
import { Fragment } from 'preact'
import h from '../shared/h.js'
import { Calc } from './calc.js'
import { Header } from './header.js'

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

export function App () {
  return h('div', {
    tw: 'fixed w-screen h-full font-mono relative text-sm text-gray-800 grid grid-cols-1',
    style: 'grid-template-rows: auto 1fr',
    children: h(Fragment,
      h('style', SCROLL_STYLE),
      h(Header),h(Calc)
    )
  })
}
