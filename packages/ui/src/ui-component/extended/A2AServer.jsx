import { useState } from 'react'
import PropTypes from 'prop-types'
import {
    Box,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    IconButton,
    Chip,
    Grid,
    Paper,
    Divider,
    Card,
    CardContent
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import a2a from '@/api/a2a'
import toast, { Toaster } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

const AgentCardForm = ({ initialData = null, onSubmit }) => {
    const location = useLocation()
    const path = location.pathname
    const pathSegments = path.split('/').filter(Boolean)
    const [isAgentEnabled, setIsAgentEnabled] = useState(false)

    const [formValues, setFormValues] = useState(
        initialData || {
            workflow_id: pathSegments[1],
            protocolVersion: '1.0',
            name: '',
            description: '',
            url: '',
            provider: {
                organization: '',
                url: ''
            },
            version: '0.0.1',
            capabilities: {
                streaming: false,
                pushNotifications: false,
                stateTransitionHistory: false
            },
            defaultInputModes: ['text'],
            defaultOutputModes: ['text'],
            skills: [],
            supportsAuthenticatedExtendedCard: false,
            prompt: ''
        }
    )

    const [currentSkill, setCurrentSkill] = useState({
        id: '',
        name: '',
        description: '',
        tags: [],
        examples: [],
        inputModes: ['text'],
        outputModes: ['text']
    })

    const [tagInput, setTagInput] = useState('')
    const [exampleInput, setExampleInput] = useState('')

    const handleChange = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleToggle = (event) => {
        setIsAgentEnabled(event.target.checked)
        console.log('Agent Enabled:', event.target.checked)
    }

    const handleNestedChange = (parent, field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
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
        setCurrentSkill((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const addTag = () => {
        if (tagInput.trim()) {
            setCurrentSkill((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const removeTag = (index) => {
        setCurrentSkill((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }))
    }

    const addExample = () => {
        if (exampleInput.trim()) {
            setCurrentSkill((prev) => ({
                ...prev,
                examples: [...prev.examples, exampleInput.trim()]
            }))
            setExampleInput('')
        }
    }

    const removeExample = (index) => {
        setCurrentSkill((prev) => ({
            ...prev,
            examples: prev.examples.filter((_, i) => i !== index)
        }))
    }

    const addSkill = () => {
        if (currentSkill.id && currentSkill.name) {
            setFormValues((prev) => ({
                ...prev,
                skills: [...prev.skills, { ...currentSkill }]
            }))
            setCurrentSkill({
                id: '',
                name: '',
                description: '',
                tags: [],
                examples: [],
                inputModes: ['text'],
                outputModes: ['text']
            })
        }
    }

    const removeSkill = (index) => {
        setFormValues((prev) => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            console.log('form submitted', formValues)
            //TODO create a toast to say form is saved
            const saveResp = await a2a.saveAgentCard(formValues)
            toast.success('Agent Card saved successfully!')
            if (onSubmit) {
                onSubmit(formValues)
            }
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Toaster position='top-right' reverseOrder={false} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <div>
                    <Typography variant='h4' sx={{ mb: 3, fontWeight: 'bold' }}>
                        Agent Card Configuration
                    </Typography>
                </div>
                <div>
                    <FormControlLabel
                        control={<Switch checked={isAgentEnabled} onChange={handleToggle} color='primary' />}
                        label='Agent Enabled'
                    />
                </div>
            </Box>

            {/* Basic Information */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Basic Information
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Agent Name'
                            fullWidth
                            required
                            value={formValues.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder='Movie Agent'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Protocol Version'
                            fullWidth
                            value={formValues.protocolVersion}
                            onChange={(e) => handleChange('protocolVersion', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label='Description'
                            fullWidth
                            multiline
                            rows={3}
                            required
                            value={formValues.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder='An agent that can answer questions about movies...'
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Provider Information */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Provider Information
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Provider Organization'
                            fullWidth
                            required
                            value={formValues.provider.organization}
                            onChange={(e) => handleNestedChange('provider', 'organization', e.target.value)}
                            placeholder='A2A Samples'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Provider URL'
                            fullWidth
                            required
                            value={formValues.provider.url}
                            onChange={(e) => handleNestedChange('provider', 'url', e.target.value)}
                            placeholder='https://example.com/provider'
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Capabilities */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Capabilities
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formValues.capabilities.streaming}
                                    onChange={(e) => handleNestedChange('capabilities', 'streaming', e.target.checked)}
                                />
                            }
                            label='Streaming'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formValues.capabilities.pushNotifications}
                                    onChange={(e) => handleNestedChange('capabilities', 'pushNotifications', e.target.checked)}
                                />
                            }
                            label='Push Notifications'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formValues.capabilities.stateTransitionHistory}
                                    onChange={(e) => handleNestedChange('capabilities', 'stateTransitionHistory', e.target.checked)}
                                />
                            }
                            label='State History'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formValues.supportsAuthenticatedExtendedCard}
                                    onChange={(e) => handleChange('supportsAuthenticatedExtendedCard', e.target.checked)}
                                />
                            }
                            label='Auth Extended Card'
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Default Modes */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Default Modes
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Default Input Modes'
                            fullWidth
                            placeholder='text, voice (comma-separated)'
                            value={formValues.defaultInputModes.join(', ')}
                            onChange={(e) => handleArrayChange('defaultInputModes', e.target.value)}
                            helperText='Comma-separated values'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Default Output Modes'
                            fullWidth
                            placeholder='text, task-status (comma-separated)'
                            value={formValues.defaultOutputModes.join(', ')}
                            onChange={(e) => handleArrayChange('defaultOutputModes', e.target.value)}
                            helperText='Comma-separated values'
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Skills */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Skills
                </Typography>

                {/* Existing Skills */}
                {formValues.skills.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 'medium' }}>
                            Configured Skills
                        </Typography>
                        {formValues.skills.map((skill, index) => (
                            <Card key={index} variant='outlined' sx={{ mb: 2, bgcolor: '#fafafa' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant='subtitle1' fontWeight='bold'>
                                                {skill.name}
                                            </Typography>
                                            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                                ID: {skill.id}
                                            </Typography>
                                            <Typography variant='body2' sx={{ mb: 1 }}>
                                                {skill.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                                {skill.tags.map((tag, i) => (
                                                    <Chip key={i} label={tag} size='small' color='primary' variant='outlined' />
                                                ))}
                                            </Box>
                                            <Typography variant='caption' color='text.secondary'>
                                                {skill.examples.length} example(s)
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={() => removeSkill(index)} color='error'>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Add New Skill */}
                <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 'medium' }}>
                    Add New Skill
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Skill ID'
                            fullWidth
                            value={currentSkill.id}
                            onChange={(e) => handleSkillChange('id', e.target.value)}
                            placeholder='general_movie_chat'
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Skill Name'
                            fullWidth
                            value={currentSkill.name}
                            onChange={(e) => handleSkillChange('name', e.target.value)}
                            placeholder='General Movie Chat'
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label='Skill Description'
                            fullWidth
                            multiline
                            rows={2}
                            value={currentSkill.description}
                            onChange={(e) => handleSkillChange('description', e.target.value)}
                            placeholder='Answer general questions or chat about movies...'
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                            Tags
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
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
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {currentSkill.tags.map((tag, i) => (
                                <Chip key={i} label={tag} size='small' onDelete={() => removeTag(i)} color='primary' />
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant='body2' sx={{ mb: 1, fontWeight: 'medium' }}>
                            Examples
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
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
                        </Box>
                        {currentSkill.examples.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                {currentSkill.examples.map((example, i) => (
                                    <Paper
                                        key={i}
                                        variant='outlined'
                                        sx={{ p: 1.5, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <Typography variant='body2'>{example}</Typography>
                                        <IconButton size='small' onClick={() => removeExample(i)}>
                                            <DeleteIcon fontSize='small' />
                                        </IconButton>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Input Modes'
                            fullWidth
                            size='small'
                            placeholder='text, voice'
                            value={currentSkill.inputModes.join(', ')}
                            onChange={(e) => {
                                const modes = e.target.value
                                    .split(',')
                                    .map((m) => m.trim())
                                    .filter((m) => m)
                                handleSkillChange('inputModes', modes)
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Output Modes'
                            fullWidth
                            size='small'
                            placeholder='text, task-status'
                            value={currentSkill.outputModes.join(', ')}
                            onChange={(e) => {
                                const modes = e.target.value
                                    .split(',')
                                    .map((m) => m.trim())
                                    .filter((m) => m)
                                handleSkillChange('outputModes', modes)
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant='outlined' onClick={addSkill} startIcon={<AddIcon />} fullWidth color='success'>
                            Add Skill
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Paper>
                <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 'medium' }}>
                    Prompt
                </Typography>
                <Grid item xs={12}>
                    <TextField
                        label='Prompt'
                        fullWidth
                        multiline
                        rows={3}
                        required
                        value={formValues.prompt}
                        onChange={(e) => handleChange('prompt', e.target.value)}
                        placeholder={`{{role "system"}}
                        You are a movie expert. Answer the user's question about movies and film industry personalities, using the searchMovies and searchPeople tools to find out more information as needed. Feel free to call them multiple times in parallel if necessary.{{#if goal}}

                        Your goal in this task is: {{goal}}{{/if}}

                        The current date and time is: {{now}}

                        If the user asks you for specific information about a movie or person (such as the plot or a specific role an actor played), do a search for that movie/actor using the available functions before responding.

                        ## Output Instructions

                        ALWAYS end your response with either "COMPLETED". If you have answered the user's question, use COMPLETED.
                        </question>
                        <output>
                        [some_movie] was released on October 3, 1992.
                        COMPLETED
                        </output>
                        </example>`}
                    />
                </Grid>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' size='large'>
                    Cancel
                </Button>
                <Button variant='contained' size='large' onClick={handleSubmit}>
                    Save Agent Card
                </Button>
            </Box>
        </Box>
    )
}

AgentCardForm.propTypes = {
    initialData: PropTypes.object,
    onSubmit: PropTypes.func
}

export default AgentCardForm
