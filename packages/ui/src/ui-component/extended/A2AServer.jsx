import { useState } from 'react'
import PropTypes from 'prop-types'
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton,
    Chip,
    Paper,
    Divider,
    FormControlLabel,
    Switch,
    useTheme
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { IconX } from '@tabler/icons-react'
import a2a from '@/api/a2a'
import { useLocation } from 'react-router-dom'
import { StyledButton } from '../button/StyledButton'

const AgentCardForm = ({ initialData = null, onSubmit }) => {
    const location = useLocation()
    const theme = useTheme()

    const getWorkflowId = () => {
        const path = window.location.pathname
        const pathSegments = path.split('/').filter(Boolean)
        return pathSegments[1] || 'default-workflow'
    }

    const [isAgentEnabled, setIsAgentEnabled] = useState(initialData?.isAgentEnabled || false)
    const [notification, setNotification] = useState(null)

    // ✅ Full form structure
    const [formValues, setFormValues] = useState(
        initialData || {
            workflow_id: getWorkflowId(),
            isAgentEnabled: false,
            protocolVersion: '1.0',
            version: '',
            name: '',
            description: '',
            provider: {
                organization: '',
                url: ''
            },
            capabilities: {
                streaming: false,
                pushNotifications: false,
                stateTransitionHistory: false
            },
            authentication: '',
            securitySchemes: [],
            security: [],
            defaultInputModes: ['text'],
            defaultOutputModes: ['text'],
            supportsAuthenticatedExtendedCard: false,
            prompt: '',
            skills: {
                name: '',
                description: '',
                tags: [],
                examples: [],
                inputModes: ['text'],
                outputModes: ['text']
            }
        }
    )

    const [tagInput, setTagInput] = useState('')
    const [exampleInput, setExampleInput] = useState('')

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }))
    }

    const handleNestedChange = (parent, field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }))
    }

    const handleArrayChange = (field, value) => {
        const items = value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item)
        handleChange(field, items)
    }

    const handleSkillChange = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            skills: { ...prev.skills, [field]: value }
        }))
    }

    const addTag = () => {
        if (tagInput.trim()) {
            setFormValues((prev) => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    tags: [...prev.skills.tags, tagInput.trim()]
                }
            }))
            setTagInput('')
        }
    }

    const removeTag = (index) => {
        setFormValues((prev) => ({
            ...prev,
            skills: {
                ...prev.skills,
                tags: prev.skills.tags.filter((_, i) => i !== index)
            }
        }))
    }

    const addExample = () => {
        if (exampleInput.trim()) {
            setFormValues((prev) => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    examples: [...prev.skills.examples, exampleInput.trim()]
                }
            }))
            setExampleInput('')
        }
    }

    const removeExample = (index) => {
        setFormValues((prev) => ({
            ...prev,
            skills: {
                ...prev.skills,
                examples: prev.skills.examples.filter((_, i) => i !== index)
            }
        }))
    }

    const checkDisabled = () => {
        if (!isAgentEnabled) return false
        return !formValues.name || !formValues.description || !formValues.provider.organization || !formValues.provider.url
    }

    const handleSubmit = async () => {
        try {
            const dataToSave = {
                ...formValues,
                isAgentEnabled
            }

            console.log('=== Agent Card Configuration Data ===')
            console.log(JSON.stringify(dataToSave, null, 2))

            await a2a.saveAgentCard(dataToSave)
            showNotification('Agent Card Configuration Saved', 'success')

            if (onSubmit) onSubmit(dataToSave)
        } catch (error) {
            showNotification(`Failed to save Agent Card Configuration: ${error?.response?.data?.message || error.message}`, 'error')
        }
    }

    const textField = (label, value, field, parent = null, props = {}) => (
        <Stack direction='column' spacing={1}>
            <Typography variant='body1'>{label}</Typography>
            <TextField
                fullWidth
                size='small'
                value={value}
                onChange={(e) => (parent ? handleNestedChange(parent, field, e.target.value) : handleChange(field, e.target.value))}
                {...props}
            />
        </Stack>
    )

    return (
        <Box sx={{ width: '100%', p: 0 }}>
            {notification && (
                <Paper
                    sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: notification.type === 'success' ? 'success.main' : 'error.main',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography>{notification.message}</Typography>
                    <IconButton size='small' onClick={() => setNotification(null)} sx={{ color: 'white' }}>
                        <IconX />
                    </IconButton>
                </Paper>
            )}

            <Stack direction='column' spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4'>Agent Card Configuration</Typography>
                    <FormControlLabel
                        control={<Switch checked={isAgentEnabled} onChange={(e) => setIsAgentEnabled(e.target.checked)} color='primary' />}
                        label='Enable Agent'
                    />
                </Box>

                {isAgentEnabled && (
                    <>
                        {/* Basic Info */}
                        <Stack direction='column' spacing={2}>
                            {textField('Agent Name', formValues.name, 'name', null, { placeholder: 'Movie Agent', required: true })}
                            {textField('Protocol Version', formValues.protocolVersion, 'protocolVersion')}
                            {textField('Description', formValues.description, 'description', null, {
                                placeholder: 'An agent that can answer questions about movies...',
                                multiline: true,
                                rows: 3,
                                required: true
                            })}
                        </Stack>

                        <Divider />

                        {/* Version & Security */}
                        <Stack direction='column' spacing={2}>
                            <Typography variant='h6'>Version & Security</Typography>

                            {textField('Version', formValues.version, 'version', null, { placeholder: '1.0.0' })}
                            {textField('Authentication', formValues.authentication, 'authentication', null, {
                                placeholder: 'API Key / OAuth2'
                            })}

                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Security Schemes</Typography>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='apiKey, bearerAuth'
                                    value={(formValues.securitySchemes || []).join(', ')}
                                    onChange={(e) => handleArrayChange('securitySchemes', e.target.value)}
                                    helperText='Comma-separated values'
                                />
                            </Stack>

                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Security</Typography>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='read, write'
                                    value={(formValues.security || []).join(', ')}
                                    onChange={(e) => handleArrayChange('security', e.target.value)}
                                    helperText='Comma-separated values'
                                />
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Provider */}
                        <Stack direction='column' spacing={2}>
                            <Typography variant='h6'>Provider Information</Typography>
                            {textField('Provider Organization', formValues.provider.organization, 'organization', 'provider', {
                                placeholder: 'A2A Samples',
                                required: true
                            })}
                            {textField('Provider URL', formValues.provider.url, 'url', 'provider', {
                                placeholder: 'https://example.com/provider',
                                required: true
                            })}
                        </Stack>

                        <Divider />

                        {/* Capabilities */}
                        <Stack direction='column' spacing={2}>
                            <Typography variant='h6'>Capabilities</Typography>
                            <Stack direction='row' spacing={2} flexWrap='wrap'>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formValues.capabilities.streaming}
                                            onChange={(e) => handleNestedChange('capabilities', 'streaming', e.target.checked)}
                                        />
                                    }
                                    label='Streaming'
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formValues.capabilities.pushNotifications}
                                            onChange={(e) => handleNestedChange('capabilities', 'pushNotifications', e.target.checked)}
                                        />
                                    }
                                    label='Push Notifications'
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formValues.capabilities.stateTransitionHistory}
                                            onChange={(e) => handleNestedChange('capabilities', 'stateTransitionHistory', e.target.checked)}
                                        />
                                    }
                                    label='State History'
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formValues.supportsAuthenticatedExtendedCard}
                                            onChange={(e) => handleChange('supportsAuthenticatedExtendedCard', e.target.checked)}
                                        />
                                    }
                                    label='Auth Extended Card'
                                />
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Default Modes */}
                        <Stack direction='column' spacing={2}>
                            <Typography variant='h6'>Default Modes</Typography>
                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Default Input Modes</Typography>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='text, voice'
                                    value={formValues.defaultInputModes.join(', ')}
                                    onChange={(e) => handleArrayChange('defaultInputModes', e.target.value)}
                                />
                            </Stack>
                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Default Output Modes</Typography>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='text, task-status'
                                    value={formValues.defaultOutputModes.join(', ')}
                                    onChange={(e) => handleArrayChange('defaultOutputModes', e.target.value)}
                                />
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Skills */}
                        <Stack direction='column' spacing={2}>
                            <Typography variant='h6'>Skill Configuration</Typography>

                            {textField('Skill Name', formValues.skills.name, 'name', 'skills', { placeholder: 'General Movie Chat' })}
                            {textField('Skill Description', formValues.skills.description, 'description', 'skills', {
                                placeholder: 'Answer questions about movies...',
                                multiline: true,
                                rows: 2
                            })}

                            {/* Tags */}
                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Tags</Typography>
                                <Stack direction='row' spacing={1}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder='Add a tag...'
                                    />
                                    <Button variant='outlined' onClick={addTag} startIcon={<AddIcon />}>
                                        Add
                                    </Button>
                                </Stack>
                                <Stack direction='row' spacing={1} flexWrap='wrap'>
                                    {formValues.skills.tags.map((tag, i) => (
                                        <Chip key={i} label={tag} size='small' onDelete={() => removeTag(i)} color='primary' />
                                    ))}
                                </Stack>
                            </Stack>

                            {/* Examples */}
                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Examples</Typography>
                                <Stack direction='row' spacing={1}>
                                    <TextField
                                        size='small'
                                        fullWidth
                                        value={exampleInput}
                                        onChange={(e) => setExampleInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
                                        placeholder='Add an example...'
                                    />
                                    <Button variant='outlined' onClick={addExample} startIcon={<AddIcon />}>
                                        Add
                                    </Button>
                                </Stack>
                                {formValues.skills.examples.length > 0 && (
                                    <Stack spacing={1}>
                                        {formValues.skills.examples.map((example, i) => (
                                            <Paper
                                                key={i}
                                                variant='outlined'
                                                sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                <Typography variant='body2'>{example}</Typography>
                                                <IconButton size='small' onClick={() => removeExample(i)}>
                                                    <DeleteIcon fontSize='small' />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>

                            {/* Skill Input/Output Modes */}
                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Skill Input Modes</Typography>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='text, voice'
                                    value={formValues.skills.inputModes.join(', ')}
                                    onChange={(e) => {
                                        const modes = e.target.value
                                            .split(',')
                                            .map((m) => m.trim())
                                            .filter(Boolean)
                                        handleSkillChange('inputModes', modes)
                                    }}
                                />
                            </Stack>

                            <Stack direction='column' spacing={1}>
                                <Typography variant='body1'>Skill Output Modes</Typography>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='text, task-status'
                                    value={formValues.skills.outputModes.join(', ')}
                                    onChange={(e) => {
                                        const modes = e.target.value
                                            .split(',')
                                            .map((m) => m.trim())
                                            .filter(Boolean)
                                        handleSkillChange('outputModes', modes)
                                    }}
                                />
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Prompt */}
                        <Stack direction='column' spacing={2}>
                            <Typography variant='h6'>Prompt Configuration</Typography>
                            {textField('Prompt', formValues.prompt, 'prompt', null, {
                                placeholder: 'Enter prompt here...',
                                multiline: true,
                                rows: 6
                            })}
                        </Stack>
                    </>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                    <StyledButton variant='contained' disabled={checkDisabled()} onClick={handleSubmit} sx={{ minWidth: 120 }}>
                        Save
                    </StyledButton>
                </Box>
            </Stack>
        </Box>
    )
}

AgentCardForm.propTypes = {
    initialData: PropTypes.object,
    onSubmit: PropTypes.func
}

export default AgentCardForm
