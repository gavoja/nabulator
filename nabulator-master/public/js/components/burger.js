/* global m */
'use strict'

import { state } from '../state.js'

export class Burger {
  view () {
    return m('a.burger', { onclick () { state.isDrawerOpen = !state.isDrawerOpen } },
      m('i.material-icons', state.isDrawerOpen ? 'close' : 'menu')
    )
  }
}
