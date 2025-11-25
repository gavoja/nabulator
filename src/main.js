import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/app.js'
import './shared/twcss.js'

const root = createRoot(document.body)
root.render(createElement(App))
