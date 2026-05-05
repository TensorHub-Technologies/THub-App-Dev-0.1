import anthropicIcon from '@/assets/images/anthropic.svg'
import azureOpenAiIcon from '@/assets/images/azure_openai.svg'
import mistralAiIcon from '@/assets/images/mistralai.svg'
import openAiIcon from '@/assets/images/openai.svg'
import groqIcon from '@/assets/images/groq.png'
import ollamaIcon from '@/assets/images/ollama.svg'

const promptDescription =
    'Prompt to generate questions based on the conversation history. You can use variable {history} to refer to the conversation history.'
const defaultPrompt =
    'Given the following conversations: {history}. Please help me predict the three most likely questions that human would ask and keeping each question short and concise.'

const FollowUpPromptProviders = {
    ANTHROPIC: 'chatAnthropic',
    AZURE_OPENAI: 'azureChatOpenAI',
    GOOGLE_GENAI: 'chatGoogleGenerativeAI',
    GROQ: 'groqChat',
    MISTRALAI: 'chatMistralAI',
    OPENAI: 'chatOpenAI',
    OLLAMA: 'ollama'
}

export default followUpPromptsOptions = {
    [FollowUpPromptProviders.ANTHROPIC]: {
        label: 'Anthropic Claude',
        name: FollowUpPromptProviders.ANTHROPIC,
        icon: anthropicIcon,
        inputs: [
            {
                label: 'Connect Credential',
                name: 'credential',
                type: 'credential',
                credentialNames: ['anthropicApi']
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'asyncOptions',
                loadMethod: 'listModels'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.9
            }
        ]
    },
    [FollowUpPromptProviders.AZURE_OPENAI]: {
        label: 'Azure ChatOpenAI',
        name: FollowUpPromptProviders.AZURE_OPENAI,
        icon: azureOpenAiIcon,
        inputs: [
            {
                label: 'Connect Credential',
                name: 'credential',
                type: 'credential',
                credentialNames: ['azureOpenAIApi']
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'asyncOptions',
                loadMethod: 'listModels'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.9
            }
        ]
    },
    [FollowUpPromptProviders.GOOGLE_GENAI]: {
        label: 'Google Gemini',
        name: FollowUpPromptProviders.GOOGLE_GENAI,
        icon: azureOpenAiIcon,
        inputs: [
            {
                label: 'Connect Credential',
                name: 'credential',
                type: 'credential',
                credentialNames: ['googleGenerativeAI']
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'options',
                default: 'gemini-1.5-pro-latest',
                options: [
                    { label: 'gemini-1.5-flash-latest', name: 'gemini-1.5-flash-latest' },
                    { label: 'gemini-1.5-pro-latest', name: 'gemini-1.5-pro-latest' }
                ]
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.9
            }
        ]
    },
    [FollowUpPromptProviders.GROQ]: {
        label: 'Groq',
        name: FollowUpPromptProviders.GROQ,
        icon: groqIcon,
        inputs: [
            {
                label: 'Connect Credential',
                name: 'credential',
                type: 'credential',
                credentialNames: ['groqApi']
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'asyncOptions',
                loadMethod: 'listModels'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.9
            }
        ]
    },
    [FollowUpPromptProviders.MISTRALAI]: {
        label: 'Mistral AI',
        name: FollowUpPromptProviders.MISTRALAI,
        icon: mistralAiIcon,
        inputs: [
            {
                label: 'Connect Credential',
                name: 'credential',
                type: 'credential',
                credentialNames: ['mistralAIApi']
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'options',
                options: [
                    { label: 'mistral-large-latest', name: 'mistral-large-latest' },
                    { label: 'mistral-large-2402', name: 'mistral-large-2402' }
                ]
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.9
            }
        ]
    },
    [FollowUpPromptProviders.OPENAI]: {
        label: 'OpenAI',
        name: FollowUpPromptProviders.OPENAI,
        icon: openAiIcon,
        inputs: [
            {
                label: 'Connect Credential',
                name: 'credential',
                type: 'credential',
                credentialNames: ['openAIApi']
            },
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'asyncOptions',
                loadMethod: 'listModels'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.9
            }
        ]
    },
    [FollowUpPromptProviders.OLLAMA]: {
        label: 'Ollama',
        name: FollowUpPromptProviders.OLLAMA,
        icon: ollamaIcon,
        inputs: [
            {
                label: 'Model Name',
                name: 'modelName',
                type: 'string',
                placeholder: 'llama2',
                description: 'Name of the Ollama model to use',
                default: 'llama3.2-vision:latest'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: promptDescription,
                optional: true,
                default: defaultPrompt
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                optional: true,
                default: 0.7
            }
        ]
    }
}
