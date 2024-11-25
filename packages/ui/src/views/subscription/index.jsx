import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

// project-imports
import MainCard from '@/ui-component/cards/MainCard'
import subStyle from './subscription.module.css'
import { pricingData } from './PricingData'
import PriceDropdown from './PriceDropdown'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Grid, Box, Stack, Button, Modal, Typography, Card, CardContent, Tooltip } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import EnterpriceForm from './Enterprice_Form'

// toastify
import { ToastContainer, toast } from 'react-toastify'

// project import
const Subscription = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const user = useSelector((state) => state.user.userData)
    const [selectedPlan, setSelectedPlan] = useState('monthly')
    const [sdkLoaded, setSdkLoaded] = useState(false)
    const [currency, setCurrency] = useState('INR')
    const [showForm, setShowForm] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [subscriptionDetails, setSubscriptionDetails] = useState({
        subscriptionType: user.subscription_type || '',
        subscriptionDuration: user.subscription_duration || '',
        startDate: '',
        expiryDate: '',
        isActive: true
    })

    console.log(subscriptionDetails)
    // user.subscriptionDuration=null;
    // console.log(user.subscriptionDuration,"subscribtion duration")

    // const amount = 100;
    function generateReceiptId() {
        const timestamp = Date.now()
        const randomNum = Math.floor(Math.random() * 10000)
        return `R-${timestamp}-${randomNum}`
    }
    const getPrice = (plan) => {
        return plan.prices[currency] || plan.prices['INR']
    }

    const handleCurrencyChange = (selectedCurrency) => setCurrency(selectedCurrency)

    const receiptId = generateReceiptId()

    useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => setSdkLoaded(true)
            script.onerror = () => console.error('Failed to load Razorpay SDK')
            document.body.appendChild(script)
        }
        loadRazorpayScript()
    }, [])

    const handleMonthly = () => {
        setSelectedPlan('monthly')
    }
    const handleYearly = () => {
        setSelectedPlan('yearly')
    }

    const handleLoading = (message) => {
        toast.success(message, {
            theme: 'colored',
            style: {
                background: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                color: 'white'
            }
        })
    }

    const handleError = (message) => {
        toast.error(message, {
            theme: 'colored',
            style: {
                background: 'red',
                color: 'white'
            }
        })
    }

    const handleDetails = () => {
        console.log('handle details')
        setModalOpen(true)
    }

    const handleCloseModal = () => setModalOpen(false)

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('en-US', options)
    }

    useEffect(() => {
        setSubscriptionDetails({
            subscriptionType: user.subscription_type || '',
            subscriptionDuration: user.subscription_duration,
            startDate: formatDate(user.subscription_date) || user.subscription_date,
            expiryDate: formatDate(user.expiry_date) || null,
            isActive: user.subscription_status === 'active'
        })
    }, [user])

    const paymentHandler = async (e, planTitle, planId, duration) => {
        if (e) e.preventDefault()
        console.log(planTitle, planId, duration, 'paymentHandler')
        if (planTitle === 'Enterprise') {
            console.log(planTitle === 'Enterprise')
            setShowForm(true)
        }
        let plan_Id = planId
        const uid = user.uid
        const url =
            window.location.hostname === 'localhost'
                ? 'http://localhost:2000/create-subscription'
                : 'https://thub-web-server-2-0-378678297066.us-central1.run.app/create-subscription'

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    planId: plan_Id,
                    duration: duration,
                    customerEmail: user.email,
                    user_id: uid
                })
            })

            if (!response.ok) {
                console.error('Failed to create subscription:', response.statusText)
                return
            }

            const subscription = await response.json()
            const userId = localStorage.getItem('userId') || user.uid

            if (!window.Razorpay) {
                alert('Razorpay SDK not loaded.')
                return
            }

            var options = {
                key: 'rzp_test_pMR0oNtQh7JOlN',
                subscription_id: subscription.id,
                name: 'THub',
                description: `${planTitle} Subscription`,
                image: user.picture,
                handler: async function (response) {
                    const validateUrl =
                        window.location.hostname === 'localhost'
                            ? 'http://localhost:2000/validate-subscription'
                            : 'https://thub-web-server-2-0-378678297066.us-central1.run.app/validate-subscription'

                    const validateResponse = await fetch(validateUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan_Id,
                            user_id: userId
                        })
                    })

                    const validateStatus = await validateResponse.json()
                    if (validateResponse.ok && validateStatus.msg === 'success') {
                        location.reload()
                        console.log(`Plan upgraded to ${validateStatus.subscriptionType}`)
                        setSubscriptionDetails({
                            subscriptionType: validateStatus.subscriptionType,
                            subscriptionDuration: validateStatus.subscriptionDuration,
                            startDate: validateStatus.startDate,
                            expiryDate: validateStatus.expiryDate,
                            isActive: true
                        })
                    } else {
                        alert('Payment validation failed. Please contact support.')
                    }
                },
                prefill: {
                    name: 'THub',
                    email: user.email,
                    contact: user.phone ? user.phone : '9000090000'
                },
                theme: {
                    color: '#3399ff'
                }
            }

            var rzp1 = new window.Razorpay(options)
            rzp1.on('payment.failed', function (response) {
                console.error('Payment Failed:', response)
                alert(`Payment failed: ${response.error.description}`)
            })

            rzp1.open()
        } catch (error) {
            console.error('Error in payment process:', error)
        }
    }

    return (
        <div>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '#f5faff' }}>
                <ToastContainer />
                <Stack flexDirection='row'>
                    <Grid sx={{ mb: 1.25 }} container direction='row'>
                        <h1
                            style={{
                                background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontSize: '24px',
                                lineHeight: '1.3'
                            }}
                        >
                            Pricing Plan
                        </h1>
                        <Box sx={{ flexGrow: 1 }} />
                        <Grid container>
                            <Box sx={{ flexGrow: 1 }} />
                            <div className={subStyle.switch_parent}>
                                <div className={subStyle.switch_wrapper}>
                                    <button className={subStyle.switch_button} onClick={handleMonthly}>
                                        <input
                                            type='radio'
                                            id='monthly'
                                            name='subscription'
                                            className={subStyle.radio}
                                            checked={selectedPlan === 'monthly'}
                                        />
                                        <label
                                            htmlFor='monthly'
                                            style={{
                                                color: customization.isDarkMode
                                                    ? selectedPlan === 'monthly'
                                                        ? 'black'
                                                        : 'white'
                                                    : selectedPlan === 'monthly'
                                                    ? 'white'
                                                    : 'black'
                                            }}
                                        >
                                            Monthly
                                        </label>
                                    </button>
                                    <button className={subStyle.switch_button} onClick={handleYearly}>
                                        <input
                                            type='radio'
                                            id='yearly'
                                            name='subscription'
                                            className={subStyle.radio}
                                            checked={selectedPlan === 'yearly'}
                                        />
                                        <label
                                            htmlFor='yearly'
                                            className={subStyle.switch_item}
                                            style={{
                                                color: customization.isDarkMode
                                                    ? selectedPlan === 'yearly'
                                                        ? 'black'
                                                        : 'white'
                                                    : selectedPlan === 'yearly'
                                                    ? 'white'
                                                    : 'black'
                                            }}
                                        >
                                            Yearly
                                        </label>
                                    </button>
                                    <div
                                        className={customization.isDarkMode ? subStyle.highlighter_dark : subStyle.highlighter_light}
                                        style={{ transform: selectedPlan === 'yearly' ? 'translateX(100%)' : 'none' }}
                                    ></div>
                                </div>
                                {!showForm && <PriceDropdown onCurrencyChange={handleCurrencyChange} />}
                            </div>
                        </Grid>
                    </Grid>
                </Stack>

                <Grid container spacing={4} className={subStyle.grid_container}>
                    {pricingData[selectedPlan].map((plan, index) => (
                        <Grid
                            item
                            xs={12}
                            md={4}
                            key={index}
                            className={customization.isDarkMode ? subStyle.card_selection_dark : subStyle.card_selection_light}
                        >
                            <Card
                                sx={{ maxWidth: 345 }}
                                className={customization.isDarkMode ? subStyle.card_content_dark : subStyle.card_content_light}
                            >
                                {plan.title === 'Free' && user.subscription_type === 'free' ? (
                                    <div className={customization.isDarkMode ? subStyle.activeBadge_dark : subStyle.activeBadge_light}>
                                        <div style={{ fontSize: '16px' }}>Active</div>
                                        {user.subscription_type !== 'free' && (
                                            <Tooltip title='subscription details' arrow>
                                                <div>
                                                    <InfoOutlinedIcon
                                                        sx={{
                                                            fontSize: 22,
                                                            paddingTop: '4px',
                                                            cursor: 'pointer',
                                                            backgroundColor: 'transparent'
                                                        }}
                                                        onClick={handleDetails}
                                                    />
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>
                                ) : plan.title === 'Pro' &&
                                  user.subscription_type === 'pro' &&
                                  user.subscription_duration === selectedPlan ? (
                                    <div className={customization.isDarkMode ? subStyle.activeBadge_dark : subStyle.activeBadge_light}>
                                        <div style={{ fontSize: '16px' }}>Active</div>
                                        <Tooltip title='subscription details' arrow>
                                            <div>
                                                <InfoOutlinedIcon
                                                    sx={{
                                                        fontSize: 22,
                                                        paddingTop: '4px',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    onClick={handleDetails}
                                                />
                                            </div>
                                        </Tooltip>
                                    </div>
                                ) : null}

                                <CardContent>
                                    <Typography
                                        gutterBottom
                                        variant='h5'
                                        component='div'
                                        className={customization.isDarkMode ? subStyle.price_title_dark : subStyle.price_title_light}
                                    >
                                        {plan.title}
                                    </Typography>
                                    <Typography
                                        variant='body2'
                                        className={customization.isDarkMode ? subStyle.price_amount_dark : subStyle.price_amount_light}
                                    >
                                        {getPrice(plan)}
                                    </Typography>
                                    <Typography
                                        variant='body2'
                                        className={
                                            customization.isDarkMode ? subStyle.price_description_dark : subStyle.price_description_light
                                        }
                                    >
                                        {plan.description}
                                    </Typography>
                                    <div>
                                        <Button
                                            onClick={(e) => paymentHandler(e, plan.title, plan.planId, plan.duration)}
                                            variant='contained'
                                            size='large'
                                            sx={{ width: '100%' }}
                                            className={customization.isDarkMode ? subStyle.button_click_dark : subStyle.button_click_light}
                                            disabled={
                                                (user.subscription_type === 'free' && plan.title === 'Free') ||
                                                (user.subscription_type === 'pro' &&
                                                    ((user.subscription_duration === 'monthly' &&
                                                        plan.title === 'Pro' &&
                                                        selectedPlan === 'monthly') ||
                                                        (user.subscription_duration === 'yearly' &&
                                                            plan.title === 'Pro' &&
                                                            selectedPlan === 'yearly'))) ||
                                                (user.subscription_type === 'pro' &&
                                                    plan.title === 'Pro' &&
                                                    user.subscription_duration === selectedPlan)
                                            }
                                        >
                                            {plan.buttonInfo}
                                        </Button>
                                    </div>
                                    <div>
                                        <ul>
                                            {plan.list.map((feature, index) => (
                                                <li
                                                    className={
                                                        customization.isDarkMode
                                                            ? subStyle.list_features_dark
                                                            : subStyle.list_features_light
                                                    }
                                                    key={index}
                                                >
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </MainCard>
            <div>{showForm && <EnterpriceForm setShowForm={setShowForm} handleError={handleError} handleLoading={handleLoading} />}</div>
            <Modal open={modalOpen} onClose={handleCloseModal}>
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
                        width: 400
                    }}
                >
                    {subscriptionDetails.isActive && (
                        <div className={subStyle.subscriptionDetails}>
                            <Typography
                                variant='h2'
                                component='div'
                                style={{
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                    marginBottom: '20px'
                                }}
                            >
                                Active Subscription Details
                            </Typography>
                            <TableContainer component={Paper} style={{ marginTop: '10px' }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Plan</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails.subscriptionType.toUpperCase()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Duration</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails.subscriptionDuration.toUpperCase()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Start Date</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails.startDate}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Next Payment On</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails.expiryDate}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                </Box>
            </Modal>
        </div>
    )
}
export default Subscription
