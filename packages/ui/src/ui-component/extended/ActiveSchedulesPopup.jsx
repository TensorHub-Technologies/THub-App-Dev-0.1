import { Box, Typography, Modal, Button } from '@mui/material'
import PropTypes from 'prop-types'

/** Map each schedule_type to its config key */
const scheduleKeyMap = {
    Once: 'OnceAt',
    'Every day': 'dailyTime',
    'Days of the week': 'DaysOfWeekAt',
    'Days of the month': 'DaysOfMonthAt',
    'Specified dates': 'SpecificDatesAt'
}

/** Turn a single schedule object into a formatted date/time string */
const getScheduleDateTimeForSingle = (schedule) => {
    const key = scheduleKeyMap[schedule.schedule_type]
    const time = key && schedule.config?.[key]
    if (!time) return 'N/A'

    // If it's just "HH:mm", attach to today’s date
    if (/^\d{2}:\d{2}$/.test(time)) {
        const [hours, minutes] = time.split(':').map(Number)
        const d = new Date()
        d.setHours(hours, minutes, 0, 0)
        return d.toLocaleString()
    }

    // Otherwise assume it's an ISO datetime
    const parsed = new Date(time)
    return isNaN(parsed) ? 'Invalid Date' : parsed.toLocaleString()
}

const ActiveSchedulesPopup = ({ open, onClose, schedules, onCancel }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    width: '80%',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}
            >
                <Typography variant='h6' gutterBottom>
                    Active Schedules
                </Typography>

                {!Array.isArray(schedules) || schedules.length === 0 ? (
                    <Typography>No active schedules</Typography>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Scheduled At</th>
                                <th style={thStyle}>Prompt</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr key={schedule.id}>
                                    <td style={tdStyle}>{schedule.schedule_type}</td>
                                    <td style={tdStyle}>{getScheduleDateTimeForSingle(schedule)}</td>
                                    <td style={tdStyle}>{schedule.prompt}</td>
                                    <td style={tdStyle}>
                                        <Button onClick={() => onCancel(schedule.id)} color='error' variant='contained' size='small'>
                                            Cancel
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Box>
        </Modal>
    )
}

const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    textAlign: 'left'
}
const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    verticalAlign: 'top'
}

ActiveSchedulesPopup.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    schedules: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            schedule_type: PropTypes.string.isRequired,
            config: PropTypes.object.isRequired,
            prompt: PropTypes.string
        })
    ).isRequired
}

export default ActiveSchedulesPopup
