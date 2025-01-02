/* global m */
'use strict'

import { state } from '../state.js'

export class Dialog {
  cancel () {
    state.dialogValue = null
    state.isDialogShown = false
    m.redraw()
  }

  delete () {
    state.delSave()
    this.cancel()
  }

  save () {
    if (state.dialogValue) {
      state.setSave(state.dialogValue)
      this.cancel()
    }
  }

  storeValue (event) {
    state.dialogValue = event.target.value.trim()
  }

  saveOnEnter (event) {
    if (event.code === 'Enter') {
      console.log('Enter!')
      this.save()
      this.cancel()
    }
  }

  onupdate (vnode) {
    // TODO: Find if mithril allows for a better focus handling.
    state.isDialogShown && vnode.dom.querySelector('input').focus()
  }

  submit (event) {
    event.preventDefault()
  }

  view (vnode) {
    const value = state.dialogValue !== null ? state.dialogValue : state.currentSaveName
    state.dialogValue = value

    return m('form.dialog', { class: state.isDialogShown ? '' : 'hidden', onsubmit: event => this.submit(event) }, [
      m('.box.apart.center', [
        m('input[name=value]', { onchange: event => this.storeValue(event), value }),
        m('hr'),
        m('button', { onclick: event => this.save(event) }, 'Save'),
        ' ',
        state.currentSaveName && [m('button', { onclick: event => this.delete(event) }, 'Delete'), ' '],
        m('button', { onclick: event => this.cancel(event) }, 'Cancel')
      ])
    ])
  }
}
