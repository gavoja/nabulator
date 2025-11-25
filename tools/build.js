import 'dotenv/config'
import { context as esbuildContext } from 'esbuild'
import fs from 'fs-extra'
import path from 'node:path'
import { reload, serve } from './serve.js'

const IS_PROD = !process.argv.includes('--dev')

function serverReloadPlugin () {
  return {
    name: 'server-reload-plugin',
    setup (buildHandler) {
      buildHandler.onEnd(() => {
        console.log('[build] Build completed.')
        reload()
      })
    }
  }
}

function svgPlugin () {
  return {
    name: 'svg-plugin',
    setup (build) {
      build.onResolve({ filter: /\.svg/ }, args => ({
        path: path.join(args.resolveDir, args.path),
        namespace: 'svg'
      }))
      build.onLoad({ filter: /.*/, namespace: 'svg' }, async args => {
        const buf = await fs.readFile(args.path)
        return {
          contents: buf.toString('utf8'),
          loader: 'text'
        }
      })
    }
  }
}

function copyStaticPlugin () {
  return {
    name: 'copy-static-plugin',
    setup (build) {
      build.onEnd(async () => {
        await fs.copy('./static', './target')
        console.log('[build] Static files copied.')
      })
    }
  }
}

async function main () {
  await fs.emptyDir('./target')
  const ctx = await esbuildContext({
    entryPoints: ['./src/main.js'],
    outdir: './target',
    plugins: [svgPlugin(), serverReloadPlugin(), copyStaticPlugin()],
    format: 'esm',
    bundle: true,
    minify: IS_PROD,
    sourcemap: IS_PROD ? false : 'inline',
    define: {
      IS_PROD: JSON.stringify(IS_PROD)
    }
  })

  if (IS_PROD) {
    await ctx.rebuild()
    await ctx.dispose()
  } else {
    serve()
    ctx.watch()

    console.log('[build] Watching for changes...')
  }
}

main()
