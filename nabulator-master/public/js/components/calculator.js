/* global m */
'use strict'

import { state } from '../state.js'
import { Select } from './select.js'

export class Calculator {
  updateHash (notes) {
    const scale = (this.selects.scale.state.value || '').replace(/ /g, '')
    const gauges = this.selects.gauges.map(node => node.state.value).join(',')
    window.location.hash = `/${notes}/${gauges}/${scale}`
  }

  changeTuning () {
    const notes = this.selects.tuning.state.value
    this.updateHash(notes)
  }

  change () {
    const notes = this.selects.notes.map(node => node.state.value).join(',')
    this.updateHash(notes)
  }

  view (vnode) {
    this.selects = {
      tuning: m(Select, { options: state.data.tunings, value: state.notes.join(','), onchange: this.changeTuning.bind(this) }),
      scale: m(Select, { options: state.data.scales, value: state.scale, onchange: this.change.bind(this) }),
      notes: [...Array(state.numberOfStrings).keys()].map(order =>
        m(Select, { options: state.data.notes, value: state.notes[order], onchange: this.change.bind(this) })
      ),
      gauges: [...Array(state.numberOfStrings).keys()].map(order =>
        m(Select, { options: state.data.gauges, value: state.gauges[order], onchange: this.change.bind(this) })
      )
    }

    return [
      m('.box',
        m('.grid', [
          m('.grid__cell', 'Tuning'),
          m('.grid__cell[data-col-span=3]', this.selects.tuning),
          m('.grid__cell', 'Scale'),
          m('.grid__cell[data-col-span=3]', this.selects.scale)
        ])
      ),
      m('.box',
        m('.grid', [
          m('.grid__cell', 'Note'),
          m('.grid__cell', 'String'),
          m('.grid__cell', 'Tension'),
          m('.grid__cell', 'Chart'),
          [...Array(8).keys()].map(order => [
            m('.grid__cell', this.selects.notes[order]),
            m('.grid__cell', this.selects.gauges[order]),
            m('.grid__cell', state.calculated.tensions[order]),
            m('.grid__cell',
              m('.bar', { style: `width: ${state.calculated.widths[order]}%` }, m.trust('&nbsp;'))
            )
          ])
        ])
      )
    ]
  }
}
