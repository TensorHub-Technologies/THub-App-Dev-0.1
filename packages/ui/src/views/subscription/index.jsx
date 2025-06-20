import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'

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
import { IconInfoCircle } from '@tabler/icons-react'
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

    let apiUrl

    if (window.location.hostname === 'demo.thub.tech') {
        apiUrl = 'https://thub-web-server-demo-378678297066.us-central1.run.app'
    } else if (window.location.hostname === 'localhost') {
        apiUrl = 'http://localhost:2000'
    } else {
        apiUrl = 'https://thub-web-server-2-0-378678297066.us-central1.run.app'
    }

    function generateReceiptId() {
        const timestamp = Date.now()
        const randomNum = Math.floor(Math.random() * 10000)
        return `R-${timestamp}-${randomNum}`
    }
    const getPrice = (plan) => {
        return plan.prices[currency] || plan.prices['INR']
    }

    const getIncreasePrice = (plan) => {
        if (plan.extraPrice) {
            return plan.extraPrice[currency] || plan.extraPrice['INR']
        }
        return null
    }

    const handleCurrencyChange = (selectedCurrency) => setCurrency(selectedCurrency)

    const receiptId = generateReceiptId()

    const handleMonthly = () => {
        setSelectedPlan('monthly')
    }
    const handleYearly = () => {
        setSelectedPlan('yearly')
    }

    const handleLoading = (message) => {
        toast.success(message, {
            theme: 'colored',
            autoClose: 2000,
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

    const paymentHandler = async (e, planTitle, planId, duration, message) => {
        if (e) e.preventDefault()
        handleLoading(message)
        if (planTitle === 'Enterprise') {
            setShowForm(true)
        }
        let plan_Id = planId
        const uid = user.uid

        const handleSubscribe = async (plan) => {
            const requestData = {
                txnid: 'TXN' + new Date().getTime(),
                amount: plan.prices.INR.replace(/[^0-9.]/g, ''),
                firstname: user.name,
                user_id: user.uid,
                email: user.email,
                phone: user.phone || '',
                productinfo: plan.title,
                planId: plan.planId,
                duration: plan.duration
            }

            try {
                const response = await axios.post(`${apiUrl}/api/payments/create-subscription`, requestData)
                console.log(response, 'response from create-subscription')
                const paymentData = response.data
                // Create a form dynamically to post the paymentData to PayU's payment gateway
                const form = document.createElement('form')
                form.method = 'POST'
                form.action = paymentData.action
                Object.keys(paymentData).forEach((key) => {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = key
                    input.value = paymentData[key]
                    form.appendChild(input)
                })

                document.body.appendChild(form)
                form.submit()
            } catch (error) {
                console.error('Error initiating subscription:', error)
            }
        }

        // Call handleSubscribe with the appropriate plan details
        const selectedPlanDetails = pricingData[selectedPlan].find((plan) => plan.planId === planId)
        if (selectedPlanDetails) {
            await handleSubscribe(selectedPlanDetails)
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
                                            onChange={() => {}}
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
                                            onChange={() => {}}
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

                                        {user.subscription_type && (
                                            <Tooltip title='subscription details' arrow>
                                                <div>
                                                    <IconInfoCircle
                                                        style={{
                                                            fontSize: '22px',
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
                                                <IconInfoCircle
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
                                    {plan.title === 'Pro' ? (
                                        <Typography
                                            variant='body2'
                                            className={customization.isDarkMode ? subStyle.price_amount_dark : subStyle.price_amount_light}
                                        >
                                            {getPrice(plan)}
                                            <span
                                                style={{
                                                    fontSize: '16px',
                                                    verticalAlign: 'super',
                                                    marginLeft: '4px',
                                                    fontWeight: 'bolder',
                                                    color: customization.isDarkMode ? 'white' : 'black'
                                                }}
                                            >
                                                /agent
                                            </span>
                                        </Typography>
                                    ) : (
                                        <Typography
                                            variant='body2'
                                            className={customization.isDarkMode ? subStyle.price_amount_dark : subStyle.price_amount_light}
                                        >
                                            {getPrice(plan)}
                                        </Typography>
                                    )}
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
                                            onClick={(e) => paymentHandler(e, plan.title, plan.planId, plan.duration, plan.messagePopup)}
                                            variant='contained'
                                            size='large'
                                            sx={{ width: '100%' }}
                                            className={customization.isDarkMode ? subStyle.button_click_dark : subStyle.button_click_light}
                                            disabled={
                                                (user.subscription_type === 'free' && plan.title === 'Free') ||
                                                (user.subscription_type === 'pro' &&
                                                    user.subscription_duration === 'yearly' &&
                                                    plan.title === 'Pro' &&
                                                    selectedPlan === 'monthly') || // Disable Pro-Monthly if user is on Pro-Yearly
                                                (user.subscription_type === 'pro' &&
                                                    user.subscription_duration === 'yearly' &&
                                                    plan.title === 'Free') || // Disable Free button if user is on Pro-Yearly
                                                (user.subscription_type === 'pro' &&
                                                    user.subscription_duration === 'monthly' &&
                                                    plan.title === 'Free') ||
                                                (user.subscription_type === 'pro' &&
                                                    ((user.subscription_duration === 'monthly' &&
                                                        plan.title === 'Pro' &&
                                                        selectedPlan === 'monthly') || // Disable Pro-Monthly if already on Pro-Monthly
                                                        (user.subscription_duration === 'yearly' &&
                                                            plan.title === 'Pro' &&
                                                            selectedPlan === 'yearly'))) || // Disable Pro-Yearly if already on Pro-Yearly
                                                (user.subscription_type === 'pro' &&
                                                    plan.title === 'Pro' &&
                                                    user.subscription_duration === selectedPlan) // Disable Pro if Pro is already selected
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
                                                    {feature.includes('₹ 17,999/per Additional Agents') && plan.title === 'Pro'
                                                        ? `${getIncreasePrice(plan)}/Per Additional Agents`
                                                        : feature}
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
                                            <TableCell>{subscriptionDetails.subscriptionType?.toUpperCase()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Duration</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails.subscriptionDuration?.toUpperCase() || '3 months'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Start Date</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails?.startDate}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Next Payment On</strong>
                                            </TableCell>
                                            <TableCell>{subscriptionDetails?.expiryDate}</TableCell>
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
