import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Checkbox, ListItemText, OutlinedInput } from '@mui/material'
import { useState } from 'react'
import { StyledButton } from '@/ui-component/button/StyledButton'

const ScheduleSettings = () => {
    const [selectedProvider, setSelectedProvider] = useState('Immediately') //Tracks which schedule option the user has selected (like “Once”, “Every day”, etc.).
    const [followUpPromptsConfig, setFollowUpPromptsConfig] = useState({}) //Stores additional config values (e.g., time, dates) related to that selected schedule.

    const onSave = () => {
        console.log('saved successfully')
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

    const handleChange = (key, value) => {
        setFollowUpPromptsConfig((prev) => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSelectedProviderChange = (event) => {
        const value = event.target.value
        setSelectedProvider(value)
        handleChange('selectedProvider', value)
    }

    return (
        <Box>
            <Typography variant='h5' sx={{ mb: 5 }} gutterBottom>
                Run Scenario
            </Typography>
            <FormControl fullWidth size='medium' sx={{ mb: 2 }}>
                <InputLabel>Schedule</InputLabel>
                <Select value={selectedProvider} label='Schedule' onChange={handleSelectedProviderChange}>
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

            {/* Conditionally render based on choice */}
            {selectedProvider === 'At Regular Intervals' && (
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

            {selectedProvider === 'Once' && (
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

            {selectedProvider === 'Every day' && (
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

            {selectedProvider === 'Days of the week' && (
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

            {selectedProvider === 'Days of the month' && (
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

            {selectedProvider === 'Specified dates' && (
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
            <StyledButton variant='contained' onClick={onSave} sx={{ mt: 2, display: 'block' }}>
                Save
            </StyledButton>
        </Box>
    )
}

export default ScheduleSettings
