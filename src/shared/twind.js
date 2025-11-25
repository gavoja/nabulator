import { setup } from '@twind/preact'

setup({
  props: { className: true },
  theme: {
    screens: {
      sm: '0px',
      md: '0px',
      lg: '900px'
    },
    fontFamily: {
      mono: ['"Roboto Mono"', 'monospace']
    },
    fontSize: {
      sm: '13px',
      xl: '24px'
    },
    extend: {
      animation: {
        fade: 'fade 200ms ease-in-out',
        rflow: 'rflow 200ms ease-in-out',
        tflow: 'tflow 200ms ease-in-out'
      },
      keyframes: {
        fade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        rflow: {
          '0%': { opacity: 0, transform: 'translateX(24px)' },
          '100%': { opacity: 1 }
        },
        tflow: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1 }
        }
      }
    }
  }
})
