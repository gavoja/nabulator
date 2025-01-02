import { context as esbuildContext } from 'esbuild'
import { reload, serve } from './serve.js'

const IS_PROD = false // TODO: .env

function serverReloadPlugin() {
  return {
    name: 'server-reload-plugin',
    setup(buildHandler) {
      buildHandler.onEnd(() => {
        console.log('[build] Build completed.')
        reload()
      })
    },
  }
}

function svgPlugin() {
  return {
    name: 'svg-plugin',
    setup(build) {
      build.onResolve({ filter: /\.svg/ }, (args) => ({
        path: path.join(args.resolveDir, args.path),
        namespace: 'svg',
      }))
      build.onLoad({ filter: /.*/, namespace: 'svg' }, async (args) => {
        const buf = await fs.readFile(args.path)
        return {
          contents: buf.toString('utf8'),
          loader: 'text',
        }
      })
    },
  }
}

async function main() {
  const ctx = await esbuildContext({
    entryPoints: ['./src/app/main.js', './src/app/index.html'],
    loader: { '.html': 'copy' },
    plugins: [serverReloadPlugin(), svgPlugin()],
    outdir: './target',
    format: 'esm',
    bundle: true,
    minify: IS_PROD,
    sourcemap: IS_PROD ? false : 'inline',
  })

  if (IS_PROD) {
    await ctx.rebuild()
    await ctx.dispose()
  } else {
    serve()
    await ctx.watch()
    console.log('[build] Watching for changes ...')
  }
}

main()
