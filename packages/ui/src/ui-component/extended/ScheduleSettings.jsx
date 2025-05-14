import { Box, FormControl, MenuItem, Select, TextField, Typography, Checkbox, ListItemText, OutlinedInput } from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'
import axios from 'axios'
import { StyledButton } from '@/ui-component/button/StyledButton'
import toast, { Toaster } from 'react-hot-toast'

const ScheduleSettings = () => {
    // Separate state for schedule and provider
    const [selectedSchedule, setSelectedSchedule] = useState('Once')
    const [followUpPromptsConfig, setFollowUpPromptsConfig] = useState({})
    const [userPrompt, setUserPrompt] = useState('')

    const flowId = window.location.pathname.split('/').pop()

    const handleScheduleChange = (e) => {
        setSelectedSchedule(e.target.value)
        setFollowUpPromptsConfig({})
    }

    const handleChange = (field, value) => {
        setFollowUpPromptsConfig((prev) => ({ ...prev, [field]: value }))
    }

    const handlePrompt = (e) => {
        setUserPrompt(e.target.value)
    }

    const onSave = async () => {
        if (!flowId) {
            console.error('flowId missing from URL')
            return
        }

        try {
            const payload = {
                flowId,
                scheduleType: selectedSchedule,
                config: followUpPromptsConfig,
                prompt: userPrompt
            }

            let apiUrl
            if (window.location.hostname === 'demo.thub.tech') {
                apiUrl = 'https://thub-web-server-demo-378678297066.us-central1.run.app'
            } else if (window.location.hostname === 'localhost') {
                apiUrl = 'http://localhost:2000'
            } else {
                apiUrl = 'https://thub-web-server-2-0-378678297066.us-central1.run.app'
            }

            await toast.promise(axios.post(`${apiUrl}/api/schedules`, payload), {
                loading: 'Saving schedule...',
                success: 'Schedule saved successfully!',
                error: 'Failed to save schedule.'
            })
        } catch (err) {
            console.error('Error saving schedule:', err)
        }
    }

    const schedulesEmail = [
        // { id: 1, name: 'At Regular Intervals' },
        { id: 1, name: 'Once' },
        { id: 2, name: 'Every day' },
        { id: 3, name: 'Days of the week' },
        { id: 4, name: 'Days of the month' },
        { id: 5, name: 'Specified dates' }
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
        <>
            <Toaster position='top-right' reverseOrder={false} />
            <Box>
                <Typography variant='h5' sx={{ mb: 5 }} gutterBottom>
                    Run Scenario
                </Typography>

                {/* Schedule selection */}
                <FormControl fullWidth size='medium' sx={{ mb: 2 }}>
                    <Select value={selectedSchedule} onChange={handleScheduleChange} displayEmpty>
                        <MenuItem value='' disabled>
                            Select schedule
                        </MenuItem>
                        {schedulesEmail.map((opt) => (
                            <MenuItem
                                key={opt.id}
                                value={opt.name}
                                sx={{ backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: 'transparent !important' } }}
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

                {/* Prompt input */}
                <Box component='form' noValidate autoComplete='off' sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
                    <TextField label='User prompt' variant='standard' fullWidth value={userPrompt} onChange={handlePrompt} />
                </Box>
                <StyledButton variant='contained' onClick={onSave} sx={{ mt: 2, display: 'block' }}>
                    Save
                </StyledButton>
            </Box>
        </>
    )
}

ScheduleSettings.propTypes = {
    dialogProps: PropTypes.object
}

export default ScheduleSettings
