import 'dotenv/config'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { URL } from 'node:url'
import WebSocket, { WebSocketServer } from 'ws'

// =============================================================================
// CONSTANTS
// =============================================================================

const ROOT = 'target'
const HOSTNAME = process.env.HOSTNAME || 'localhost'
const PORT = Number(process.env.PORT || 8080)
const ORIGIN = `http://${HOSTNAME}:${PORT}`
const RESPONSE_CODES = {
	NOT_FOUND: 404,
	INTERNAL_ERROR: 500,
	PARTIAL_CONTENT: 206,
}

const SCRIPT = `<script>
function connect (reload) {
  const ws = new WebSocket('ws://' + location.host)
  ws.onmessage = () => location.reload()
  ws.onopen = () => {
    console.log('WebSocket is open.')
    reload && location.reload()
  }

  const loop = setInterval(() => {
    if (ws.readyState > 1) {
      ws.close()
      clearInterval(loop)
      setTimeout(() => connect(true), 1000)
    }
  }, 1000)

  ws.destroy = () => {
    clearInterval(loop)
    ws.close()
  }

  window.ws = ws
}

connect()
</script>
`

const MIME_TYPES = {
	'.css': 'text/css',
	'.eot': 'application/vnd.ms-fontobject',
	'.gif': 'image/gif',
	'.html': 'text/html',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.mp4': 'video/mp4',
	'.otf': 'application/font-otf',
	'.pdf': 'application/pdf',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ttf': 'application/font-ttf',
	'.txt': 'text/plain',
	'.wav': 'audio/wav',
	'.wasm': 'application/wasm',
	'.webp': 'image/webp',
	'.woff': 'application/font-woff',
	'.woff2': 'application/font-woff2',
	'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

// =============================================================================
// HELPERS
// =============================================================================

function fixSlashes(string) {
	return string.replace(/\\/g, '/')
}

// =============================================================================
// WEB SERVER
// =============================================================================

function writeError({ response, error }) {
	response.writeHead(error.code === 'ENOENT' ? RESPONSE_CODES.NOT_FOUND : RESPONSE_CODES.INTERNAL_ERROR)
	console.log('[serve]', error.message)
	response.end(error.message)
}

function writeResponse({ request, response, content, isHtml, contentType }) {
	// Inject WebSocket client code.
	if (isHtml) {
		content = content.replace('</body>', `${SCRIPT}</body>`)
	}

	let responseCode = 200
	const fullLength = content.length
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': contentType,
		'Content-Length': fullLength,
		'Accept-Ranges': 'bytes',
	}

	// Handle ranges.
	const range = request.headers.range
	if (range) {
		const [, rangeMin, rangeMax] = range.match(/^bytes=(\d+)-(\d+)/) || []
		if (!Number.isNaN(rangeMin) && !Number.isNaN(rangeMax) && rangeMin <= rangeMax) {
			content = content.slice(rangeMin, rangeMax + 1)
			responseCode = RESPONSE_CODES.PARTIAL_CONTENT
			headers['Content-Length'] = `${rangeMax - rangeMin + 1}`
			headers['Content-Range'] = `bytes ${rangeMin}-${rangeMax}/${fullLength}`
		}
	}

	response.writeHead(responseCode, headers)
	response.end(content, 'utf8')
}

export const webserver = http.createServer((request, response) => {
	const { pathname } = new URL(decodeURIComponent(request.url), ORIGIN)

	const pathnameWithoutSuffix = pathname.replace(/\.html.*/, '.html')
	let filePath = `.${pathnameWithoutSuffix}`
	if (filePath === './') {
		filePath = './index.html'
	}

	filePath = fixSlashes(path.join(ROOT, filePath))
	const extname = String(path.extname(filePath)).toLowerCase()
	const contentType = MIME_TYPES[extname] || 'application/octet-stream'
	const isHtml = extname === '.html'

	fs.readFile(filePath, isHtml ? 'utf8' : null, (error, content) => {
		if (error) {
			writeError({ response, error })
		} else {
			writeResponse({ request, response, content, isHtml, contentType })
		}
	})
})

// =============================================================================
// WEBSOCKET SERVER
// =============================================================================

export const wsserver = new WebSocketServer({ server: webserver })

function broadcast(message) {
	for (const client of wsserver.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message)
		}
	}
}

export function reload() {
	broadcast('reload')
}

// =============================================================================
// MAIN
// =============================================================================

function errorHandler(err) {
	if (err.code !== 'EADDRINUSE') {
		console.error(err)
	}

	webserver.close()
	wsserver.close()
}

export function serve() {
	wsserver.on('error', errorHandler)
	webserver.on('error', errorHandler)

	webserver.listen(PORT)
	if (webserver.listening) {
		console.log(`[serve] Server running at ${ORIGIN}.`)
	} else {
		console.log('[serve] Unable to start server. Is it already running?')
	}
}
