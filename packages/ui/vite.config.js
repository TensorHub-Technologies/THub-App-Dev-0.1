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
                }
            }
        }
    }

    dotenv.config()
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@codemirror/state': resolve(__dirname, '../../node_modules/@codemirror/state'),
                '@codemirror/view': resolve(__dirname, '../../node_modules/@codemirror/view'),
                '@codemirror/language': resolve(__dirname, '../../node_modules/@codemirror/language'),
                '@codemirror/lang-javascript': resolve(__dirname, '../../node_modules/@codemirror/lang-javascript'),
                '@codemirror/lang-json': resolve(__dirname, '../../node_modules/@codemirror/lang-json'),
                '@uiw/react-codemirror': resolve(__dirname, '../../node_modules/@uiw/react-codemirror'),
                '@uiw/codemirror-theme-vscode': resolve(__dirname, '../../node_modules/@uiw/codemirror-theme-vscode'),
                '@uiw/codemirror-theme-sublime': resolve(__dirname, '../../node_modules/@uiw/codemirror-theme-sublime'),
                '@lezer/common': resolve(__dirname, '../../node_modules/@lezer/common'),
                '@lezer/highlight': resolve(__dirname, '../../node_modules/@lezer/highlight'),
                // Add ReactFlow aliases
                'reactflow': resolve(__dirname, '../../node_modules/reactflow'),
                '@reactflow/core': resolve(__dirname, '../../node_modules/@reactflow/core'),
                '@reactflow/background': resolve(__dirname, '../../node_modules/@reactflow/background'),
                '@reactflow/controls': resolve(__dirname, '../../node_modules/@reactflow/controls'),
                '@reactflow/minimap': resolve(__dirname, '../../node_modules/@reactflow/minimap'),
                '@reactflow/node-toolbar': resolve(__dirname, '../../node_modules/@reactflow/node-toolbar')
            }
        },
        // Add these optimizations
        optimizeDeps: {
            include: [
                'reactflow',
                '@reactflow/core',
                '@reactflow/background',
                '@reactflow/controls',
                '@reactflow/minimap',
                '@reactflow/node-toolbar'
            ],
            exclude: []
        },
        root: resolve(__dirname),
        build: {
            outDir: './build',
            // Add these build options
            commonjsOptions: {
                include: [/reactflow/, /node_modules/]
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        'reactflow-vendor': ['reactflow']
                    }
                }
            }
        },
        server: {
            open: true,
            proxy,
            port: process.env.VITE_PORT ?? 8080,
            host: process.env.VITE_HOST
        }
    }
})
