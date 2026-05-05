import PropTypes from 'prop-types'
import { Stack, Typography, LinearProgress } from '@mui/material'

const BudgetBar = ({ used = 0, max = 0 }) => {
    if (!max) return null
    const pct = Math.min(100, Math.round((used / max) * 100))
    const color = pct >= 90 ? 'error' : pct >= 70 ? 'warning' : 'primary'

    return (
        <Stack gap={0.5}>
            <Stack direction='row' justifyContent='space-between'>
                <Typography variant='caption' color='textSecondary'>
                    Token budget
                </Typography>
                <Typography variant='caption' color={pct >= 90 ? 'error.main' : 'textSecondary'}>
                    {used.toLocaleString()} / {max.toLocaleString()} ({pct}%)
                </Typography>
            </Stack>
            <LinearProgress variant='determinate' value={pct} color={color} sx={{ borderRadius: 1 }} />
        </Stack>
    )
}

BudgetBar.propTypes = {
    used: PropTypes.number,
    max: PropTypes.number
}

export default BudgetBar
