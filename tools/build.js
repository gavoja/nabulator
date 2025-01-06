import 'dotenv/config'
import { context as esbuildContext } from 'esbuild'
import { reload, serve } from './serve.js'
import path from 'node:path'
import fs from 'node:fs/promises'
const IS_PROD = process.env.IS_PROD === 'true'

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

async function main() {
	const ctx = await esbuildContext({
		entryPoints: ['./src/main.js', './src/index.html'],
		outdir: './target',
		loader: { '.html': 'copy' },
		plugins: [svgPlugin(), serverReloadPlugin()],
		format: 'esm',
		bundle: true,
		minify: IS_PROD,
		sourcemap: IS_PROD ? false : 'inline',
		define: {
			IS_PROD: JSON.stringify(IS_PROD),
		},
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
