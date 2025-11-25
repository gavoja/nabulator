import { extend } from 'twcss'

extend({
  classes: {
    'animate-menu': '{ animation: menu 200ms ease-in-out }',
    'animate-popup': '{ animation: popup 200ms ease-in-out }'
  },
  keyframes: {
    menu: `
      0% { opacity: 0; transform: translateX(24px) }
      100% { opacity: 1 }
    `,
    popup: `
      0% { opacity: 0; transform: translateY(-12px) }
      100% { opacity: 1 }
    `
  }
})
