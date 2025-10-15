import { googleAI } from '@genkit-ai/googleai'
import { genkit } from 'genkit'
import { join } from 'path'
import fs from 'fs'
import { Storage } from '@google-cloud/storage'

// 🔹 Download all prompt files from GCS into local directory
async function syncPromptsFromGCS(): Promise<string> {
    const localPromptDir = join(__dirname, 'prompt')
    if (!fs.existsSync(localPromptDir)) fs.mkdirSync(localPromptDir, { recursive: true })

    const bucketName = 'thub-files'
    const prefix = 'prompts/'

    const storage = new Storage({
        credentials: {
            type: process.env.GOOGLE_CLOUD_TYPE,
            project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
            private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLOUD_CLIENT_ID
        }
    })

    const [files] = await storage.bucket(bucketName).getFiles({ prefix })

    for (const file of files) {
        const localPath = join(localPromptDir, file.name.replace(prefix, ''))
        await file.download({ destination: localPath })
        console.log(`✅ Synced: ${file.name}`)
    }

    return localPromptDir
}

//@ts-ignore
const promptDir = await syncPromptsFromGCS()

export const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.0-flash'),
    promptDir,
    context: {}
})

export { z } from 'genkit'
