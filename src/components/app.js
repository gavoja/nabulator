import { Fragment } from 'react'
import h from '../shared/h.js'
import { Calc } from './calc.js'
import { Header } from './header.js'

const CUSTOM_SCROLLBAR = `
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
    tw: 'fixed w-screen h-full font-[JetBrains_Mono] relative text-sm text-gray-800 grid grid-cols-1',
    style: { gridTemplateRows: 'auto 1fr' },
    children: h(Fragment,
      h('style', { key: 'app-style' }, CUSTOM_SCROLLBAR),
      h(Header, { key: 'app-header' }),
      h(Calc, { key: 'app-calc' })
    )
  })
}
