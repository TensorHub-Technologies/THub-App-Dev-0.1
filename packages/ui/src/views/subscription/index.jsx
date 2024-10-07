import { useState } from 'react'
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
    // color: customization.isDarkMode ? '#fff' : '#000'

    const [selectedPlan, setSelectedPlan] = useState('monthly')

    const handleMonthly = () => {
        setSelectedPlan('monthly')
    }
    const handleYearly = () => {
        setSelectedPlan('yearly')
    }

    const pricingData = {
        monthly: [
            {
                title: 'Free',
                price: '$0',
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
                price: '$199',
                description: 'For growing teams.',
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
                price: '$0',
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
                price: '$1999',
                description: 'For growing teams.',
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
