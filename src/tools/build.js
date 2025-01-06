import { context as esbuildContext } from 'esbuild'
import { reload, serve } from './serve.js'
import { denoPlugins } from '@luca/esbuild-deno-loader'

const IS_PROD = Deno.env.get('IS_PROD') ?? false
const contexts = []

function serverReloadPlugin(text) {
  return {
    name: 'server-reload-plugin',
    setup(buildHandler) {
      buildHandler.onEnd(() => {
        console.log(`[build] Build completed (${text}).`)
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
  contexts.push(
    await esbuildContext({
      entryPoints: ['./src/app/main.js'],
      outdir: './target',
      plugins: [...denoPlugins(), serverReloadPlugin('js'), svgPlugin()],
      format: 'esm',
      bundle: true,
      minify: IS_PROD,
      sourcemap: IS_PROD ? false : 'inline',
      define: {
        IS_PROD: JSON.stringify(IS_PROD),
      },
    }),
  )

  contexts.push(
    await esbuildContext({
      entryPoints: ['./src/app/index.html'],
      loader: { '.html': 'copy' },
      outdir: './target',
      plugins: [serverReloadPlugin('html')],
    }),
  )

  if (IS_PROD) {
    for (const ctx of contexts) {
      await ctx.rebuild()
      await ctx.dispose()
    }
  } else {
    serve()

    for (const ctx of contexts) {
      ctx.watch()
    }

    console.log('[build] Watching for changes...')
  }
}

main()
