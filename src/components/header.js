import h from '../shared/h.js'
import { Menu } from './menu.js'

export function Header () {
  return h('div', { tw: 'border-b border-gray-300 bg-gray-100 h-14 flex items-center justify-center overflow-hidden' },
    h('div', { tw: 'flex items-center h-full' },
      h('div', { tw: 'text-center' },
        h('h1', { tw: 'text-2xl' }, 'nabulator'),
        h('p', 'String tension calculator')
      )
    ),
    h('div', { tw: 'absolute w-14 h-14 right-0 top-0 flex items-center' },
      h(Menu)
    )
  )
}
