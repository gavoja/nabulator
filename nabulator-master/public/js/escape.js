/* global m */
'use strict'

import { state } from './state.js'

export function escape () {
  if (!window.onkeydown) {
    window.onkeydown = event => {
      if (event.code === 'Escape') {
        state.escape()
        m.redraw()
      }
    }
  }
}
