/* global m */
'use strict'

import { state } from '../state.js'

export class Overlay {
  view (vnode) {
    return m('.overlay', { class: state.isDialogShown ? '' : 'hidden' })
  }
}
