/* global m */
'use strict'

import { state } from '../state.js'
import { Saves } from './saves.js'

export class Drawer {
  view (vnode) {
    return m('.drawer', { class: state.isDrawerOpen ? '' : 'hidden' }, [
      m(Saves)
    ])
  }
}
