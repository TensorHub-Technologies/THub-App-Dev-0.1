import { Box, Typography, Modal, Button } from '@mui/material'
import PropTypes from 'prop-types'

const ActiveSchedulesPopup = ({ open, onClose, schedules, onCancel }) => {
    const scheduleKeyMap = {
        Once: 'OnceAt',
        'Every day': 'EveryDayAt',
        'Days of the week': 'DaysOfWeekAt',
        'Days of the month': 'DaysOfMonthAt',
        'Specified dates': 'SpecificDatesAt'
    }
    const getScheduleDateTime = (schedules) => {
        const key = scheduleKeyMap[schedules.schedule_type]
        const datetime = key && schedules.config[key]
        return datetime ? new Date(datetime).toLocaleString() : 'N/A'
    }

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

                {schedules.length === 0 ? (
                    <Typography>No active schedules</Typography>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Created At</th>
                                <th style={thStyle}>Prompt</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr key={schedule.id}>
                                    <td style={tdStyle}>{schedule.schedule_type}</td>
                                    <td style={tdStyle}>{getScheduleDateTime(schedule)}</td>

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
    schedules: PropTypes.shape({
        schedule_type: PropTypes.string,
        config: PropTypes.object,
        length: PropTypes.number,
        map: PropTypes.func
    }).isRequired
}

export default ActiveSchedulesPopup
