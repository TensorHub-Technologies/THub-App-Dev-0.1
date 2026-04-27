import PropTypes from 'prop-types'
import { Alert, Collapse } from '@mui/material'
import { IconAlertTriangle } from '@tabler/icons-react'

// Shown when session status transitions to 'partial' due to budget exceeded
const BudgetBanner = ({ show }) => (
    <Collapse in={show}>
        <Alert severity='warning' icon={<IconAlertTriangle />} sx={{ mb: 1 }}>
            Token budget exceeded — session halted. Completed tasks are shown below.
        </Alert>
    </Collapse>
)

BudgetBanner.propTypes = {
    show: PropTypes.bool
}

export default BudgetBanner
