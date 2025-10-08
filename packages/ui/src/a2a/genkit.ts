import { googleAI } from '@genkit-ai/googleai'
import { genkit } from 'genkit'
import { join } from 'path'

export const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.0-flash'),
    promptDir: join(__dirname, 'prompts')
})

export { z } from 'genkit'
