/* global m */
'use strict'

import { state } from './state.js'

export function route () {
  // Hash change handling.
  if (!window.onhashchange) {
    window.onhashchange = route
  }

  state.setHash()
  m.redraw()
}
