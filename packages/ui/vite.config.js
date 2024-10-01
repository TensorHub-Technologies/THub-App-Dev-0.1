import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dotenv from 'dotenv'

export default defineConfig(async ({ mode }) => {
    const env = loadEnv(mode, process.cwd())

    let proxy = undefined

    if (mode === 'development') {
        const serverEnv = dotenv.config({ processEnv: {}, path: '../server/.env' }).parsed
        const serverHost = serverEnv?.['HOST'] ?? 'localhost'
        const serverPort = parseInt(serverEnv?.['PORT'] ?? 3000)
        if (!Number.isNaN(serverPort) && serverPort > 0 && serverPort < 65535) {
            proxy = {
                '/api': {
                    target: `http://${serverHost}:${serverPort}`,
                    changeOrigin: true
                },
                '/socket.io': {
                    target: `http://${serverHost}:${serverPort}`,
                    changeOrigin: true
                }
            }
        }
    }

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        root: resolve(__dirname),
        build: {
            outDir: './build',
            rollupOptions: {
                external: []
            }
        },
        server: {
            open: true,
            proxy,
            port: env.VITE_PORT ?? 8080,
            host: env.VITE_HOST ?? 'localhost'
        }
    }
})
