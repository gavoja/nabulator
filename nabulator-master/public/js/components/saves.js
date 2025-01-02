/* global m */
'use strict'

import { state } from '../state.js'

export class Saves {
  async signIn (event) {
    event.preventDefault()
    state.signIn() // Will reload the page.
  }

  signOut (event) {
    event.preventDefault()
    state.signOut()
    m.redraw()
  }

  addOrEdit (event) {
    event.preventDefault()
    state.isDialogShown = true
  }

  view (vnode) {
    return [
      m('.box', state.email
        ? m('p', [
            m('a', { href: '#', onclick: event => this.signOut(event) }, `Sign out (${state.email})`),
            ' | ',
            m('a', { href: '#', onclick: event => this.addOrEdit(event) }, state.currentSaveName ? 'Edit' : 'Save')
          ])
        : m('p', [
          m('a', { href: '#', onclick: event => this.signIn(event) }, 'Sign in with Google'),
          ' to save.'
        ])
      ),
      state.saves.length > 0 && m('.box',
        m('ul', state.saves.map((save, ii) =>
          m('li',
            m('a.button', {
              href: '#' + save.value,
              class: ii === state.currentSave ? 'selected' : '',
              onclick () { state.currentSave = ii }
            }, save.name)
          )
        ))
      )
    ]
  }
}
