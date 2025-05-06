import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    ListItem,
    TextField,
    ListItemAvatar,
    Typography,
    Checkbox,
    ListItemText,
    OutlinedInput
} from '@mui/material'

import { useState, useEffect } from 'react'
import { TooltipWithParser } from '@/ui-component/tooltip/TooltipWithParser'
import CredentialInputHandler from '@/views/canvas/CredentialInputHandler'
import { Input } from '@/ui-component/input/Input'
import { AsyncDropdown } from '@/ui-component/dropdown/AsyncDropdown'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction, SET_CHATFLOW } from '@/store/actions'

// Icons
import { IconX } from '@tabler/icons-react'
import { Dropdown } from '@/ui-component/dropdown/Dropdown'
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

// update when adding new providers
const FollowUpPromptProviders = {
    ANTHROPIC: 'chatAnthropic',
    AZURE_OPENAI: 'azureChatOpenAI',
    GOOGLE_GENAI: 'chatGoogleGenerativeAI',
    GROQ: 'groqChat',
    MISTRALAI: 'chatMistralAI',
    OPENAI: 'chatOpenAI',
    OLLAMA: 'ollama'
}

const followUpPromptsOptions = {
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

const ScheduleSettings = ({ dialogProps }) => {
    // Separate state for schedule and provider
    const [selectedSchedule, setSelectedSchedule] = useState('Immediately')
    const [selectedProvider, setSelectedProvider] = useState(Object.keys(followUpPromptsOptions)[0])
    const [followUpPromptsConfig, setFollowUpPromptsConfig] = useState({})
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    const [chatbotConfig, setChatbotConfig] = useState({})

    const handleChange = (key, value) => {
        setFollowUpPromptsConfig({
            ...followUpPromptsConfig,
            [key]: value
        })
    }

    // Update schedule selection
    const handleScheduleChange = (event) => {
        const schedule = event.target.value
        setSelectedSchedule(schedule)
        handleChange('selectedSchedule', schedule)
    }

    // Update provider selection
    const handleSelectedProviderChange = (event) => {
        const provider = event.target.value
        setSelectedProvider(provider)
        handleChange('selectedProvider', provider)
    }

    const setValue = (value, providerName, inputParamName) => {
        let newVal = {}
        if (!Object.prototype.hasOwnProperty.call(followUpPromptsConfig, providerName)) {
            newVal = { ...followUpPromptsConfig, [providerName]: {} }
        } else {
            newVal = { ...followUpPromptsConfig }
        }

        newVal[providerName][inputParamName] = value
        if (inputParamName === 'status' && value === true) {
            // ensure that the others are turned off
            Object.keys(followUpPromptsOptions).forEach((key) => {
                const provider = followUpPromptsOptions[key]
                if (provider.name !== providerName) {
                    newVal[provider.name] = { ...followUpPromptsConfig[provider.name], status: false }
                }
            })
        }
        setFollowUpPromptsConfig(newVal)
        return newVal
    }

    const onSave = async () => {
        // TODO: saving without changing the prompt will not save the prompt
        try {
            let value = {
                followUpPrompts: { status: followUpPromptsConfig.status }
            }
            chatbotConfig.followUpPrompts = value.followUpPrompts

            // if the prompt is not set, save the default prompt
            const selectedProvider = followUpPromptsConfig.selectedProvider

            console.log('followUpPromptsConfig', followUpPromptsConfig)

            if (selectedProvider && followUpPromptsConfig[selectedProvider] && followUpPromptsOptions[selectedProvider]) {
                if (!followUpPromptsConfig[selectedProvider].prompt) {
                    followUpPromptsConfig[selectedProvider].prompt = followUpPromptsOptions[selectedProvider].inputs.find(
                        (input) => input.name === 'prompt'
                    )?.default
                }

                if (!followUpPromptsConfig[selectedProvider].temperature) {
                    followUpPromptsConfig[selectedProvider].temperature = followUpPromptsOptions[selectedProvider].inputs.find(
                        (input) => input.name === 'temperature'
                    )?.default
                }
            }

            const saveResp = await chatflowsApi.updateChatflow(dialogProps.chatflow.id, {
                chatbotConfig: JSON.stringify(chatbotConfig),
                followUpPrompts: JSON.stringify(followUpPromptsConfig)
            })
            if (saveResp.data) {
                enqueueSnackbar({
                    message: 'Follow-up Prompts configuration saved',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                console.log(saveResp.data, 'data')
                dispatch({ type: SET_CHATFLOW, chatflow: saveResp.data })
            }
        } catch (error) {
            const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`
            enqueueSnackbar({
                message: `Failed to save follow-up prompts configuration: ${errorData}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
    }

    useEffect(() => {
        if (dialogProps.chatflow && dialogProps.chatflow.followUpPrompts) {
            let chatbotConfig = JSON.parse(dialogProps.chatflow.chatbotConfig)
            let followUpPromptsConfig = JSON.parse(dialogProps.chatflow.followUpPrompts)
            setChatbotConfig(chatbotConfig || {})
            if (followUpPromptsConfig) {
                setFollowUpPromptsConfig(followUpPromptsConfig)
                setSelectedSchedule(followUpPromptsConfig.selectedSchedule || 'Immediately')
                setSelectedProvider(followUpPromptsConfig.selectedProvider || Object.keys(followUpPromptsOptions)[0])
            }
        }

        return () => {}
    }, [dialogProps])

    const checkDisabled = () => {
        if (followUpPromptsConfig && followUpPromptsConfig.status) {
            if (selectedProvider === 'none') {
                return true
            }
            const provider = followUpPromptsOptions[selectedProvider]
            for (let inputParam of provider.inputs) {
                if (!inputParam.optional) {
                    const param = inputParam.name === 'credential' ? 'credentialId' : inputParam.name
                    if (
                        !followUpPromptsConfig[selectedProvider] ||
                        !followUpPromptsConfig[selectedProvider][param] ||
                        followUpPromptsConfig[selectedProvider][param] === ''
                    ) {
                        return true
                    }
                }
            }
        }
        return false
    }

    const schedulesEmail = [
        { id: 1, name: 'Immediately' },
        { id: 2, name: 'At Regular Intervals' },
        { id: 3, name: 'Once' },
        { id: 4, name: 'Every day' },
        { id: 5, name: 'Days of the week' },
        { id: 6, name: 'Days of the month' },
        { id: 7, name: 'Specified dates' }
    ]

    const daysOfWeekOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => i + 1)

    const monthOptions = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]

    return (
        <Box>
            <Typography variant='h5' sx={{ mb: 5 }} gutterBottom>
                Run Scenario
            </Typography>
            {/* Schedule selection */}
            <FormControl fullWidth size='medium' sx={{ mb: 2 }}>
                <Select value={selectedSchedule} onChange={handleScheduleChange}>
                    {schedulesEmail.map((opt) => (
                        <MenuItem
                            key={opt.id}
                            value={opt.name}
                            sx={{
                                backgroundColor: 'transparent',
                                '&.Mui-selected': { backgroundColor: 'transparent !important' }
                            }}
                        >
                            {opt.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {/* Conditionally render based on schedule choice */}
            {selectedSchedule === 'At Regular Intervals' && (
                <>
                    <TextField
                        label='Enter minutes'
                        type='number'
                        fullWidth
                        size='medium'
                        value={followUpPromptsConfig.intervalMinutes || ''}
                        onChange={(e) => handleChange('intervalMinutes', e.target.value)}
                    />
                    <Typography variant='caption' sx={{ mt: 0.5, color: 'text.secondary' }}>
                        The time interval in which the scenario should be repeated (in minutes).
                    </Typography>
                </>
            )}

            {selectedSchedule === 'Once' && (
                <>
                    <TextField
                        label='Select date & time'
                        type='datetime-local'
                        fullWidth
                        size='medium'
                        InputLabelProps={{ shrink: true }}
                        value={followUpPromptsConfig.OnceAt || ''}
                        onChange={(e) => handleChange('OnceAt', e.target.value)}
                    />
                    <Typography variant='caption' sx={{ mt: 0.5, color: 'text.secondary' }}>
                        Choose the exact date and time the scenario should run once.
                    </Typography>
                </>
            )}

            {selectedSchedule === 'Every day' && (
                <>
                    <TextField
                        label='Time of day'
                        type='time'
                        fullWidth
                        size='medium'
                        InputLabelProps={{ shrink: true }}
                        value={followUpPromptsConfig.dailyTime || ''}
                        onChange={(e) => handleChange('dailyTime', e.target.value)}
                    />
                    <Typography variant='caption' sx={{ mt: 0.5, color: 'text.secondary' }}>
                        Select the time of day this scenario should run daily.
                    </Typography>
                </>
            )}

            {selectedSchedule === 'Days of the week' && (
                <>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <FormControl size='medium'>
                            <InputLabel>Weekdays</InputLabel>
                            <Select
                                multiple
                                value={followUpPromptsConfig.weekDays || []}
                                onChange={(e) => handleChange('weekDays', e.target.value)}
                                input={<OutlinedInput label='Weekdays' />}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {daysOfWeekOptions.map((day) => (
                                    <MenuItem key={day} value={day}>
                                        <Checkbox checked={(followUpPromptsConfig.weekDays || []).includes(day)} />
                                        <ListItemText primary={day} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label='Time'
                            type='time'
                            fullWidth
                            size='medium'
                            InputLabelProps={{ shrink: true }}
                            value={followUpPromptsConfig.weeklyTime || ''}
                            onChange={(e) => handleChange('weeklyTime', e.target.value)}
                        />
                    </Box>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        Select one or more weekdays and a time of day to run the scenario on those specific days every week.
                    </Typography>
                </>
            )}

            {selectedSchedule === 'Days of the month' && (
                <>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <FormControl size='medium'>
                            <InputLabel>Dates</InputLabel>
                            <Select
                                multiple
                                value={followUpPromptsConfig.monthDays || []}
                                onChange={(e) => handleChange('monthDays', e.target.value)}
                                input={<OutlinedInput label='Dates' />}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {dayOfMonthOptions.map((day) => (
                                    <MenuItem key={day} value={day}>
                                        <Checkbox checked={(followUpPromptsConfig.monthDays || []).includes(day)} />
                                        <ListItemText primary={day} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label='Time'
                            type='time'
                            fullWidth
                            size='medium'
                            InputLabelProps={{ shrink: true }}
                            value={followUpPromptsConfig.monthlyTime || ''}
                            onChange={(e) => handleChange('monthlyTime', e.target.value)}
                        />
                    </Box>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        Choose one or more calendar dates and the time of day to run the scenario on those dates every month.
                    </Typography>
                </>
            )}

            {selectedSchedule === 'Specified dates' && (
                <>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl fullWidth size='medium'>
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={followUpPromptsConfig.specMonth || ''}
                                label='Month'
                                onChange={(e) => handleChange('specMonth', e.target.value)}
                            >
                                {monthOptions.map((m) => (
                                    <MenuItem key={m} value={m}>
                                        {m}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size='medium'>
                            <InputLabel>Date</InputLabel>
                            <Select
                                value={followUpPromptsConfig.specDate || ''}
                                label='Date'
                                onChange={(e) => handleChange('specDate', e.target.value)}
                            >
                                {dayOfMonthOptions.map((d) => (
                                    <MenuItem key={d} value={d}>
                                        {d}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        Choose a specific month and date to run the scenario once annually on that selected date.
                    </Typography>
                </>
            )}

            {/* Provider selection */}
            <>
                <Typography variant='h5'>Providers</Typography>
                <FormControl fullWidth>
                    <Select size='small' value={selectedProvider} onChange={handleSelectedProviderChange}>
                        {Object.values(followUpPromptsOptions).map((provider) => (
                            <MenuItem key={provider.name} value={provider.name}>
                                {provider.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Only show icon if it exists */}
                {followUpPromptsOptions[selectedProvider]?.icon && (
                    <ListItem sx={{ p: 0 }} alignItems='center'>
                        <ListItemAvatar>
                            <div
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    backgroundColor: 'white'
                                }}
                            >
                                <img
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: 10,
                                        objectFit: 'contain'
                                    }}
                                    alt={followUpPromptsOptions[selectedProvider]?.label || ''}
                                    src={followUpPromptsOptions[selectedProvider]?.icon}
                                />
                            </div>
                        </ListItemAvatar>
                        <ListItemText
                            primary={followUpPromptsOptions[selectedProvider]?.label}
                            secondary={
                                <a target='_blank' rel='noreferrer' href={followUpPromptsOptions[selectedProvider]?.url}>
                                    {followUpPromptsOptions[selectedProvider]?.url}
                                </a>
                            }
                        />
                    </ListItem>
                )}
                {selectedProvider !== 'none' && (
                    <>
                        {followUpPromptsOptions[selectedProvider]?.inputs.map((inputParam, index) => (
                            <Box key={index} sx={{ px: 2, width: '100%' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', marginTop: '20px' }}>
                                    <Typography>
                                        {inputParam.label}
                                        {!inputParam.optional && <span style={{ color: 'red' }}>&nbsp;*</span>}
                                        {inputParam.description && (
                                            <TooltipWithParser style={{ marginLeft: 10 }} title={inputParam.description} />
                                        )}
                                    </Typography>
                                </div>
                                {inputParam.type === 'credential' && (
                                    <CredentialInputHandler
                                        key={`${selectedProvider}-${inputParam.name}`}
                                        data={
                                            followUpPromptsConfig[selectedProvider]?.credentialId
                                                ? { credential: followUpPromptsConfig[selectedProvider].credentialId }
                                                : {}
                                        }
                                        inputParam={inputParam}
                                        onSelect={(newValue) => setValue(newValue, selectedProvider, 'credentialId')}
                                    />
                                )}

                                {(inputParam.type === 'string' || inputParam.type === 'password' || inputParam.type === 'number') && (
                                    <Input
                                        key={`${selectedProvider}-${inputParam.name}`}
                                        inputParam={inputParam}
                                        onChange={(newValue) => setValue(newValue, selectedProvider, inputParam.name)}
                                        value={
                                            followUpPromptsConfig[selectedProvider] &&
                                            followUpPromptsConfig[selectedProvider][inputParam.name]
                                                ? followUpPromptsConfig[selectedProvider][inputParam.name]
                                                : inputParam.default ?? ''
                                        }
                                    />
                                )}

                                {inputParam.type === 'asyncOptions' && (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <AsyncDropdown
                                                key={`${selectedProvider}-${inputParam.name}`}
                                                name={inputParam.name}
                                                nodeData={{
                                                    name: followUpPromptsOptions[selectedProvider].name,
                                                    inputParams: followUpPromptsOptions[selectedProvider]?.inputs
                                                }}
                                                value={
                                                    followUpPromptsConfig[selectedProvider] &&
                                                    followUpPromptsConfig[selectedProvider][inputParam.name]
                                                        ? followUpPromptsConfig[selectedProvider][inputParam.name]
                                                        : inputParam.default ?? 'choose an option'
                                                }
                                                onSelect={(newValue) => setValue(newValue, selectedProvider, inputParam.name)}
                                            />
                                        </div>
                                    </>
                                )}

                                {inputParam.type === 'options' && (
                                    <Dropdown
                                        name={inputParam.name}
                                        options={inputParam.options}
                                        onSelect={(newValue) => setValue(newValue, selectedProvider, inputParam.name)}
                                        value={
                                            followUpPromptsConfig[selectedProvider] &&
                                            followUpPromptsConfig[selectedProvider][inputParam.name]
                                                ? followUpPromptsConfig[selectedProvider][inputParam]
                                                : inputParam.default ?? 'choose an option'
                                        }
                                    />
                                )}
                            </Box>
                        ))}
                    </>
                )}
            </>
            <StyledButton variant='contained' onClick={onSave} sx={{ mt: 2, display: 'block' }}>
                Save
            </StyledButton>
        </Box>
    )
}

ScheduleSettings.propTypes = {
    dialogProps: PropTypes.object
}

export default ScheduleSettings
