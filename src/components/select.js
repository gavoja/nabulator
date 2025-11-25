import h from '../shared/h.js'

export function Select ({ options, name, selectedValue, onChange }) {
  return h('select', {
    tw: 'w-full border-1 border-gray-300 p-1 pl-2 rounded-sm bg-white',
    name,
    onChange,
    value: selectedValue,
    children: options.map(o =>
      h('option', {
        key: `${name}_${o.value || o.name || ''}`,
        value: o.value || o.name,
        disabled: o.disabled,
        children: o.name
      })
    )
  })
}
