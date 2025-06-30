import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dotenv from 'dotenv'

export default defineConfig(async ({ mode }) => {
    let proxy = undefined
    if (mode === 'development') {
        const serverEnv = dotenv.config({ processEnv: {}, path: '../server/.env' }).parsed
        const serverHost = serverEnv?.['HOST'] ?? 'localhost'
        const serverPort = parseInt(serverEnv?.['PORT'] ?? 3000)
        if (!Number.isNaN(serverPort) && serverPort > 0 && serverPort < 65535) {
            proxy = {
                '^/api(/|$).*': {
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
    dotenv.config()
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        root: resolve(__dirname),
        build: {
            outDir: './build'
        },
        define: {
            'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
            'import.meta.env.VITE_GITHUB_CLIENT_ID': JSON.stringify(process.env.VITE_GITHUB_CLIENT_ID),
            'import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL': JSON.stringify(process.env.VITE_THUB_WEB_SERVER_PROD_URL),
            'import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL': JSON.stringify(process.env.VITE_THUB_WEB_SERVER_DEMO_URL),
            'import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL': JSON.stringify(process.env.VITE_THUB_WEB_SERVER_LOCAL_URL),
            'import.meta.env.VITE_TEST_ENV': JSON.stringify(process.env.VITE_TEST_ENV)
        },
        server: {
            open: true,
            proxy,
            port: process.env.VITE_PORT ?? 8080,
            host: process.env.VITE_HOST
        }
    }
})
