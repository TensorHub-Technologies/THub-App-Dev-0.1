import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

// project-imports
import MainCard from '@/ui-component/cards/MainCard'
import subStyle from './subscription.module.css'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Grid, Box, Stack, Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// project import
const Subscription = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const user = useSelector((state) => state.user)
    console.log(user, 'redux@@@@')
    const [selectedPlan, setSelectedPlan] = useState('monthly')
    const [sdkLoaded, setSdkLoaded] = useState(false)

    // const amount = 100;
    const currency = 'INR'
    function generateReceiptId() {
        const timestamp = Date.now()
        const randomNum = Math.floor(Math.random() * 10000)
        return `R-${timestamp}-${randomNum}`
    }

    const receiptId = generateReceiptId()
    // console.log(receiptId,"receiptId");

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

    const paymentHandler = async (e, price) => {
        if (e) e.preventDefault()
        let amount = parseFloat(price.replace(/₹|,/g, '').trim())
        // amount=String(amount*100);
        amount = '100'
        console.log(amount)
        console.log(typeof amount)
        const url =
            window.location.hostname === 'localhost' ? 'http://localhost:4000/order' : 'https://thub-dev-420204.uc.r.appspot.com/order'
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    receipt: receiptId
                })
            })

            if (!response.ok) {
                console.error('Failed to create order:', response.statusText)
                return
            }

            const order = await response.json()
            console.log(order)

            if (!window.Razorpay) {
                alert('Razorpay SDK not loaded.')
                return
            }

            var options = {
                key: 'rzp_live_L6Fy6yBDycyCzw',
                amount: amount,
                currency,
                name: 'THub',
                description: 'Test Transaction',
                image: user.picture,
                method: ['upi'],
                order_id: order.id,
                handler: async function (response) {
                    const body = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        order_id: order.id
                    }

                    const validateResponse = await fetch('http://localhost:4000/validate', {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    const validateStatus = await validateResponse.json()
                    console.log(validateStatus)
                },
                prefill: {
                    name: 'THub',
                    email: user.email,
                    contact: '9000090000'
                },
                notes: {
                    address: 'Razorpay Corporate Office'
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

    const pricingData = {
        monthly: [
            {
                title: 'Free',
                price: '₹0',
                description: 'For starters to explore and integrate',
                buttonInfo: 'Start for Free',
                list: [
                    'Single Seat',
                    '5 GenAI Apps',
                    'API based access to LLM',
                    'Embedding Model',
                    ' Vector Database etc',
                    'Shared or your own API keys',
                    'Basic Analytics',
                    'Standard Support'
                ]
            },
            {
                title: 'Pro',
                price: '₹ 1',
                description: 'For small & medium businesses',
                buttonInfo: 'Choose Plan',
                list: [
                    'All Free Features',
                    '5 Seats',
                    '25 GenAI Apps',
                    'Team collaboration',
                    'Train your own local LLM',
                    'Fine Tune open source LLM',
                    'Advanced Analytics',
                    'Priority support'
                ]
            },
            {
                title: 'Enterprise',
                price: 'Contact for Price',
                description: 'For large teams and enterprises.',
                buttonInfo: 'Choose Plan',
                list: ['All Pro Features', 'Unlimited Seats', 'Unlimited GenAI Apps']
            }
        ],
        yearly: [
            {
                title: 'Free',
                price: '₹0',
                description: 'For starters to explore and integrate',
                buttonInfo: 'Start for Free',
                list: [
                    'Single Seat',
                    '5 GenAI Apps',
                    'API based access to LLM',
                    'Embedding Model',
                    ' Vector Database etc',
                    'Shared or your own API keys',
                    'Basic Analytics',
                    'Standard Support'
                ]
            },
            {
                title: 'Pro',
                price: '₹ 2,19,000',
                description: 'For small & medium businesses',
                buttonInfo: 'Choose Plan',
                list: [
                    'All Free Features',
                    '5 Seats',
                    '25 GenAI Apps',
                    'Team collaboration',
                    'Train your own local LLM',
                    'Fine Tune open source LLM',
                    'Advanced Analytics',
                    'Priority support'
                ]
            },
            {
                title: 'Enterprise',
                price: 'Contact for Price',
                description: 'For large teams and enterprises.',
                buttonInfo: 'Choose Plan',
                list: ['All Pro Features', 'Unlimited Seats', 'Unlimited GenAI Apps']
            }
        ]
    }

    return (
        <>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '#f5faff' }}>
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
                                <CardContent>
                                    <Typography
                                        gutterBottom
                                        variant='h5'
                                        component='div'
                                        className={customization.isDarkMode ? subStyle.price_title_dark : subStyle.price_title_light}
                                    >
                                        {plan.title}
                                    </Typography>
                                    <Typography variant='body2' className={subStyle.price_amount}>
                                        {plan.price}
                                    </Typography>
                                    <Typography variant='body2' className={subStyle.price_description}>
                                        {plan.description}
                                    </Typography>
                                    <div>
                                        <Button
                                            onClick={(e) => {
                                                paymentHandler(e, plan.price)
                                            }}
                                            variant='contained'
                                            size='large'
                                            sx={{ width: '100%' }}
                                            className={customization.isDarkMode ? subStyle.button_click_dark : subStyle.button_click_light}
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
        </>
    )
}
export default Subscription
