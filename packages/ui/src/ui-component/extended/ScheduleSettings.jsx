import { Box, FormControl, MenuItem, Select, TextField, Typography, Checkbox, ListItemText, OutlinedInput } from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'
import axios from 'axios'
import { StyledButton } from '@/ui-component/button/StyledButton'
import toast, { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import IconInfo from '@/assets/custom-svg/IconInfo'
import ActiveSchedulesPopup from './ActiveSchedulesPopup'

const ScheduleSettings = () => {
    // Separate state for schedule and provider
    const [selectedSchedule, setSelectedSchedule] = useState('Once')
    const [followUpPromptsConfig, setFollowUpPromptsConfig] = useState({})
    const [userPrompt, setUserPrompt] = useState('')
    const [popupOpen, setPopupOpen] = useState(false)
    const [activeSchedules, setActiveSchedules] = useState([])
    const customization = useSelector((state) => state.customization)

    const flowId = window.location.pathname.split('/').pop()
    const hostName = window.location.hostname
    console.log('Flow ID:', flowId, 'Host Name:', hostName)

    const thubWebServerDevUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_DEMO_URL || 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
    const thubWebServerQAUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_QA_URL || 'https://thub-server.lemonpond-e68ea8b7.westus2.azurecontainerapps.io'
    const thubWebServerProdUrl =
        import.meta.env.VITE_THUB_WEB_SERVER_PROD_URL || 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'
    const thubWebServerLocalUrl = import.meta.env.VITE_THUB_WEB_SERVER_LOCAL_URL || 'http://localhost:2000'

    let apiUrl

    if (window.location.hostname === 'localhost') {
        apiUrl = thubWebServerLocalUrl
    } else if (window.location.hostname === 'thub-app.calmisland-c4dd80be.westus2.azurecontainerapps.io') {
        apiUrl = thubWebServerDevUrl
    } else if (window.location.hostname === 'thub-app.lemonpond-e68ea8b7.westus2.azurecontainerapps.io') {
        apiUrl = thubWebServerQAUrl
    } else {
        apiUrl = thubWebServerProdUrl
    }

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
                hostName,
                scheduleType: selectedSchedule,
                config: followUpPromptsConfig,
                prompt: userPrompt
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

    const handleSchedule = async () => {
        if (!flowId) return console.log('Flow ID missing')

        try {
            const res = await toast.promise(axios.get(`${apiUrl}/api/schedules/${flowId}`), {
                loading: 'Fetching active schedules',
                success: 'Active schedules fetched',
                error: 'Failed to fetch schedule'
            })
            console.log(res, 'response from fetch schedules')
            if (Array.isArray(res.data)) {
                setActiveSchedules(res.data)
                setPopupOpen(true)
            }
        } catch (err) {
            console.error('Failed to fetch schedule:', err)
        }
    }

    const handleCancelSchedule = async (id) => {
        try {
            await toast.promise(axios.post(`${apiUrl}/api/schedules/cancel`, { id }), {
                loading: 'Cancelling...',
                success: 'Schedule cancelled',
                error: 'Failed to cancel'
            })
            handleSchedule()
        } catch (err) {
            console.error(err)
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
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant='h4'>Run Scenario</Typography>
                        <button
                            style={{ background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
                            onClick={handleSchedule}
                        >
                            <IconInfo color={customization.isDarkMode ? 'white' : 'black'} />
                        </button>
                    </Box>

                    <ActiveSchedulesPopup
                        open={popupOpen}
                        onClose={() => setPopupOpen(false)}
                        schedules={activeSchedules}
                        onCancel={handleCancelSchedule}
                    />
                </Box>
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
                {/* {selectedSchedule === 'At Regular Intervals' && (
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
                )} */}

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
