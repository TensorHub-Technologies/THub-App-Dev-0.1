import { NodeVM } from '@flowiseai/nodevm'
import { Genkit, z } from 'genkit'
//import { availableDependencies, defaultAllowBuiltInDep } from '../utils'
import { v4 as uuidv4 } from 'uuid'

export const workflowTool = (workflow_id: string, ai: Genkit) =>
    ai.defineTool(
        {
            name: 'workflow',
            description: 'use workflow as tool',
            inputSchema: z.object({
                query: z.string()
            })
        },
        async ({ query }) => {
            console.log('workflow query:', query)
            try {
                const baseURL = 'http://localhost:3000'
                const startNewSession = true
                const chatflowid = workflow_id
                let headers = {}

                const body = {
                    question: query,
                    chatId: startNewSession ? uuidv4() : chatflowid
                }

                console.log('chatflow tool body:', body)

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'flowise-tool': 'true',
                        ...headers
                    },
                    body: JSON.stringify(body)
                }

                let sandbox = {
                    $callOptions: options,
                    $callBody: body,
                    util: undefined,
                    Symbol: undefined,
                    child_process: undefined,
                    fs: undefined,
                    process: undefined
                }

                const code = `
          const fetch = require('node-fetch');
          const url = "${baseURL}/api/v1/prediction/${chatflowid}";

          const body = $callBody;

          const options = $callOptions;

          try {
            const response = await fetch(url, options);
            const resp = await response.json();
            return resp.text;
          } catch (error) {
            console.error(error);
            return '';
          }
          `

                const vmOptions = {
                    console: 'inherit',
                    sandbox,
                    require: {
                        external: { modules: ['node-fetch'] }, // explicitly allow node-fetch
                        builtin: ['*'] // allow built-ins if needed
                    },
                    eval: false,
                    wasm: false,
                    timeout: 10000
                } as any

                const vm = new NodeVM(vmOptions)
                const response = await vm.run(`module.exports = async function() {${code}}()`, __dirname)

                console.log('chatflow tool response:', response)

                return {
                    kind: 'text',
                    text: response || 'No response from chatflow.'
                }
            } catch (error) {
                console.error('Error searching workflow:', error)
                throw error
            }
        }
    )
