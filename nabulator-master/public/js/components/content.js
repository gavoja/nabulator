/* global m */
'use strict'

import { Calculator } from './calculator.js'

export class Content {
  view (vnode) {
    return m('.content', [
      m(Calculator),
      m('.box', [
        m('p', [
          'String tension calculator by ',
          m('a', { href: 'https://nabusound.com', target: '_blank' }, 'Nabuchodonosor'),
          '.'
        ]),
        m('p', [
          'Please ',
          m('a', { href: 'https://open.spotify.com/artist/04RfpX3Phl19e1BRIrPjeG', target: '_blank' }, 'check our music'),
          ' to support us if you like the app.'
        ]),
        m('hr'),
        m('p', `
          Tension is shown in Newtons (kg * m/s²).
          To convert to imperial units divide by 4.45.
        `),
        m('hr'),
        m('p', `
          The following types of strings are used: plan steel (p), nickel plated round wound (no marker) and nickel plated round wound bass (b).
          Tension may slightly differ if other types of strings are used.
        `)
      ])
    ])
  }
}
