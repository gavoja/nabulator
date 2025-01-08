import { useLayoutEffect, useState } from 'preact/hooks'
import data from '../shared/data.js'
import h from '../shared/h.js'
import { Box } from './box.js'
import { Grid } from './grid.js'
import { Select } from './select.js'

export function Calc() {
  const [hash, setHash] = useState(location.hash)

  useLayoutEffect(() => {
    window.addEventListener('hashchange', () => setHash(location.hash.substring(1)))
  }, [])

  const { tuning, notes, gauges, scale } = resolveHash(hash)

  return h('div', { tw: 'lg:mr-96 overflow-x-hidden overflow-y-auto' },
    h(Box,
      h(Grid,
        h('div', { tw: 'flex items-center' }, 'Tuning'),
        h('div', { tw: 'col-span-4' },
          h(Select, {
            options: data.tunings,
            selectedValue: tuning,
            onChange(event) {
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
            onChange(event) {
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
        h('div', { tw: 'text-right' }, 'Newtons'),
        h('div', { tw: 'ml-8' }, 'Chart'),
        [...Array(8).keys()].map(index => {
          const { tension, newtons, chart } = getTension(index)

          return [
            h(Select, {
              options: data.notes,
              selectedValue: notes?.[index],
              onChange(event) {
                notes[index] = event.target.value
                location.hash = `/${notes}/${gauges}/${scale}`
              }
            }),
            h(Select, {
              options: data.gauges,
              selectedValue: gauges?.[index],
              onChange(event) {
                gauges[index] = event.target.value
                location.hash = `/${tuning}/${gauges}/${scale}`
              }
            }),
            h('div', { tw: 'flex items-center justify-end' }, tension),
            h('div', { tw: 'flex items-center justify-end' }, newtons),
            h('div', { tw: 'flex items-center' },
              h('div', { tw: `ml-8 bg-gray-800 h-4 rounded-sm w-[${chart}%]` })
            )
          ]
        })
      )
    )
  )
}

function resolveHash (hash) {
  const [, tuning, gauges = [], scale] = hash.split('/')
  return { tuning, notes: tuning.split(','), gauges: gauges?.split?.(','), scale }
}

function getTension (index) {
  const { notes, gauges, scale } = resolveHash(location.hash)

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
  const tension = (weight * ((2 * currentScale * freq) ** 2)) / 386.4 // * 4.45
  const newtons = tension * 4.45
  const chart = Math.min(100, newtons / 2)

  return { tension: tension.toFixed(2), newtons: newtons.toFixed(2), chart }
}
