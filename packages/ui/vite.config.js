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
                '@lezer/highlight': resolve(__dirname, '../../node_modules/@lezer/highlight')
            }
        },
        root: resolve(__dirname),
        build: {
            outDir: './build',
            rollupOptions: {
                // Ensure proper chunking and bundling
                output: {
                    manualChunks: {
                        // Keep react-router-dom in its own chunk to prevent bundling issues
                        router: ['react-router-dom', 'react-router'],
                        codemirror: [
                            '@codemirror/state',
                            '@codemirror/view',
                            '@codemirror/language',
                            '@codemirror/lang-javascript',
                            '@codemirror/lang-json',
                            '@uiw/react-codemirror',
                            '@uiw/codemirror-theme-vscode',
                            '@uiw/codemirror-theme-sublime',
                            '@lezer/common',
                            '@lezer/highlight'
                        ]
                    }
                }
            },
            // Ensure consistent builds
            sourcemap: mode === 'development'
        },
        server: {
            open: true,
            proxy,
            port: process.env.VITE_PORT ?? 8080,
            host: process.env.VITE_HOST
        },
        optimizeDeps: {
            include: ['react-router-dom', 'react-router', '@codemirror/state', '@codemirror/view', '@codemirror/language']
        },
        // Add define to ensure consistent environment
        define: {
            __DEV__: mode === 'development'
        }
    }
})
