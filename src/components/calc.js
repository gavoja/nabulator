/* global location */
import { useLayoutEffect } from 'react'
import data from '../shared/data.js'
import h from '../shared/h.js'
import usePersistentState from '../shared/use-persistent-state.js'
import { Box } from './box.js'
import { Grid } from './grid.js'
import { Link } from './link.js'
import { Select } from './select.js'
import { Fragment } from 'react'

const NABU_LINK = 'https://nabuchodonosor.bandcamp.com/album/nabuchodonosor'
const DEFAULT_HASH = '#/E2,A2,D3,G3,B3,E4,,/42,30,21,14p,11p,8p,,/25.5'

export function Calc () {
  const [freedomUnits, setFreedomUnits] = usePersistentState('units', false)
  const [hash, setHash] = usePersistentState('hash', null)

  useLayoutEffect(() => {
    const handler = () => {
      validateHash(hash)
      setHash(location.hash)
    }

    handler()
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (!hash) {
    return null
  }

  // Make sure hash reflects saved state.
  location.hash = hash

  const { tuning, notes, gauges, scale } = resolveHash(hash)

  return h('div', { tw: 'lg:mr-96 overflow-x-hidden overflow-y-auto h-full' },
    h(Box,
      h(Grid,
        h('div', { tw: 'flex items-center' }, 'Tuning'),
        h('div', { tw: 'col-span-4' },
          h(Select, {
            options: data.tunings,
            selectedValue: tuning,
            onChange (event) {
              const tuning = event.target.value
              location.hash = `/${tuning}/${gauges}/${scale}`
            }
          })
        ),
        h('div', { tw: 'flex items-center' }, 'Scale'),
        h('div', { tw: 'col-span-4' },
          h(Select, {
            options: data.scales,
            selectedValue: scale,
            onChange (event) {
              const scale = event.target.value
              location.hash = `/${tuning}/${gauges}/${scale}`
            }
          })
        )
      )
    ),
    h(Box,
      h(Grid,
        h('div', 'Note'),
        h('div', 'String'),
        h('div', { tw: 'text-right' }, 'Tension'),
        h('div', { tw: 'ml-8' }, 'Chart'),
        [...Array(8).keys()].map(index => {
          const { tension, chart } = getTension(hash, index, freedomUnits)
          return h(Fragment, { key: `string-${index}` },
            h(Select, {
              key: `note-${index}`,
              name: `note-${index}`,
              options: data.notes,
              selectedValue: notes?.[index],
              onChange (event) {
                notes[index] = event.target.value
                location.hash = `/${notes}/${gauges}/${scale}`
              }
            }),
            h(Select, {
              key: `gauge-${index}`,
              name: `gauge-${index}`,
              options: data.gauges,
              selectedValue: gauges?.[index],
              onChange (event) {
                gauges[index] = event.target.value
                location.hash = `/${tuning}/${gauges}/${scale}`
              }
            }),
            h('div', { tw: 'flex items-center justify-end' }, tension),
            h('div', { tw: 'flex items-center' },
              h('div', { tw: `ml-8 bg-gray-800 h-4 rounded-sm w-[${chart}%]` })
            )
          )
        })
      )
    ),
    h(Box,
      // Add checkbox to toggle between newtons and freedom units.
      h('label', { tw: 'cursor-pointer flex gap-2 items-center' },
        h('div', { tw: 'flex items-center' },
          h('input', {
            tw: 'accent-blue-500',
            name: 'units',
            type: 'checkbox',
            checked: freedomUnits,
            onChange (event) {
              setFreedomUnits(event.target.checked)
            }
          })
        ),
        h('span', 'Use freedom units instead of Newtons')
      ),
      h('p', { tw: 'mt-8' },
        'String tension calculator by ',
        h(Link, { href: NABU_LINK }, 'Nabuchodonosor.'),
        h('br'),
        'Please ',
        h(Link, { href: NABU_LINK }, 'check our music'),
        ' if you like the app.'
      ),
      h('p',
        'The following types of strings are used: plan steel (p), nickel plated round wound (no marker) and nickel plated round wound bass (b). Tension may slightly differ if other types of strings are used.'
      )
    )
  )
}

function validateHash (hash) {
  if (location.hash.split('/').length < 4) {
    location.hash = hash || DEFAULT_HASH
  }
}

function resolveHash (hash) {
  const [, tuning, gauges = [], scale] = hash.split('/')
  return { tuning, notes: tuning.split(','), gauges: gauges?.split?.(','), scale }
}

function getTension (hash, index, useFreedomUnits = false) {
  const { notes, gauges, scale } = resolveHash(hash)

  if (notes?.length !== 8 || gauges?.length !== 8 || !scale) {
    return { tension: 0, newtons: 0, chart: 0 }
  }

  // Get scale.
  const notesCount = notes.join(' ').trim().split(' ').length
  const gaugesCount = gauges.join(' ').trim().split(' ').length
  const stringCount = Math.max(notesCount, gaugesCount)
  const [scaleEnd, scaleStart] = scale.split('-').map(scale => Number(scale))
  const scaleDelta = scaleStart ? (scaleEnd - scaleStart) / (stringCount - 1) : 0
  const currentScale = scaleEnd - index * scaleDelta

  // Get unit weight and frequency.
  const gauge = gauges[index]
  const note = notes[index]
  const weight = data.gauges.find(g => g.name === gauge).weight
  const freq = data.notes.find(n => n.name === note).freq

  // Calculate tension.
  const tension = (weight * ((2 * currentScale * freq) ** 2)) / 386.4
  const newtons = tension * 4.45
  const chart = Math.min(100, newtons / 2)

  return { tension: useFreedomUnits ? tension.toFixed(2) : newtons.toFixed(2), chart }
}
