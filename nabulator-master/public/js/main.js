/* global m */
'use strict'

import { route } from './route.js'
import { escape } from './escape.js'
import { Drawer } from './components/drawer.js'
import { Content } from './components/content.js'
import { Burger } from './components/burger.js'
import { Overlay } from './components/overlay.js'
import { Dialog } from './components/dialog.js'

m.mount(document.body, class {
  view () {
    return [
      m('header',
        m(Burger),
        m('div', [
          m('h1', 'nabulator'),
          m('p', 'string tension calculator')
        ])
      ),
      m('main', [
        m(Drawer),
        m(Content),
        m(Overlay),
        m(Dialog)
      ])
    ]
  }
})

route()
escape()
