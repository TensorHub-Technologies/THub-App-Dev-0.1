import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import PropTypes from 'prop-types'

const PayPalButton = ({ clientId, createSubscription, onApprove }) => {
    const initialOptions = {
        clientId,
        vault: true,
        intent: 'subscription'
    }

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons createSubscription={createSubscription} onApprove={onApprove} />
        </PayPalScriptProvider>
    )
}

PayPalButton.propTypes = {
    clientId: PropTypes.string.isRequired,
    createSubscription: PropTypes.func.isRequired,
    onApprove: PropTypes.func.isRequired
}

export default PayPalButton
