import { serveDir } from '@std/http/file-server'

const HOSTNAME = 'localhost'
const PORT = 3000
const ROOT = './target'

// WebSocket client reload script.
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

const clients = new Set()

// Watch for changes in the root folder and broadcast reload to all clients.
// async function watch () {
//   const watcher = Deno.watchFs(ROOT, { recursive: true })
//   for await (const event of watcher) {
//     for (const client of clients) {
//       client.send('reload')
//     }
//   }
// }
// watch()

async function handler(req) {
  // Web socket server reload handling.
  if (req.headers.get('upgrade') === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req)

    socket.addEventListener('open', (event) => {
      clients.add(event.target)
    })

    socket.addEventListener('close', (event) => {
      clients.delete(event.target)
    })

    return response
  }

  // Static file serving.
  const res = await serveDir(req, { fsRoot: ROOT })

  // Inject client reload script to HTML files.
  if (res.headers.get('content-type').startsWith('text/html')) {
    const body = await res.text()
    return new Response(body.replace('</body>', `${SCRIPT}</body>`), { headers: res.headers })
  }

  return res
}

export function serve() {
  Deno.serve({ hostname: HOSTNAME, port: PORT }, handler)
}

export function reload() {
  for (const client of clients) {
    client.send('reload')
  }
}

// export default { fetch: handler }
