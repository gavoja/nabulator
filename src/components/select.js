import h from '../shared/h.js'

export function Select({ options, selectedValue, onChange }) {
  return h('select', {
    tw: 'w-full border-1 border-gray-300 p-1 pl-2 rounded-sm appearance-none',
    onChange,
    children: options.map(o =>
      h('option', {
        value: o.value || o.name,
        disabled: o.disabled,
        selected: (o.value || o.name) === selectedValue,
        children: o.name
      })
    )
  })
}
