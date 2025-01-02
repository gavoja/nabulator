/* global m */
'use strict'

export class Select {
  view (vnode) {
    this.value = vnode.attrs.value
    const attrs = {
      onchange: event => {
        this.value = event.target.value
        vnode.attrs.onchange(event)
      }
    }

    return m('select', attrs, [
      m('option'),
      vnode.attrs.options.map(opt => {
        const value = opt.value ? opt.value : opt.name
        const selected = value === vnode.attrs.value
        return m('option', { value, disabled: opt.isDisabled, selected }, opt.name)
      })
    ])
  }
}
