import { useState } from 'react'
import { useSelector } from 'react-redux'

// project-imports
import MainCard from '@/ui-component/cards/MainCard'
import subStyle from './subscription.module.css'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Grid, Box, Stack, Button } from '@mui/material'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// project import
const Subscription = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const [billingCycle, setBillingCycle] = useState('monthly')

    const handleBillingCycleChange = (event, newCycle) => {
        if (newCycle !== null) {
            setBillingCycle(newCycle)
        }
    }

    const pricingData = {
        monthly: [
            { title: 'Free', price: '$0', description: 'For starters to explore and integrate', buttonInfo: 'Start for Free' },
            { title: 'Pro', price: '$39/month', description: 'For growing teams.', buttonInfo: 'Choose Plan' },
            { title: 'Enterprise', price: 'Contact for Price', description: 'For large teams and enterprises.', buttonInfo: 'Choose Plan' }
        ],
        yearly: [
            { title: 'Free', price: '$190/year', description: 'For small teams or individuals.', buttonInfo: 'Start for Free' },
            { title: 'Pro', price: '$390/year', description: 'For growing teams.', buttonInfo: 'Choose Plan' },
            { title: 'Enterprise', price: '$990/year', description: 'For large teams and enterprises.', buttonInfo: 'Choose Plan' }
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
                        <div style={{ width: '100%' }}>
                            <ToggleButtonGroup
                                value={billingCycle}
                                exclusive
                                onChange={handleBillingCycleChange}
                                aria-label='billing cycle'
                                className={subStyle.toggleGroup}
                            >
                                <ToggleButton
                                    value='monthly'
                                    aria-label='monthly'
                                    sx={{ background: customization.isDarkMode ? theme.palette.common.black : '#f5faff' }}
                                    className={`${subStyle.toggleButton} ${
                                        billingCycle === 'monthly' ? subStyle.toggleButtonSelected : ''
                                    }`}
                                >
                                    Monthly
                                </ToggleButton>

                                <ToggleButton
                                    value='yearly'
                                    aria-label='yearly'
                                    className={`${subStyle.toggleButton} ${billingCycle === 'yearly' ? subStyle.toggleButtonSelected : ''}`}
                                >
                                    Yearly (Save 15%)
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                    </Grid>
                </Stack>
                <Grid container spacing={4}>
                    {pricingData[billingCycle].map((plan, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ maxWidth: 345 }}>
                                {/* <CardMedia
                                        component="img"
                                        height="140"
                                        image={`/static/images/cards/plan-${index + 1}.jpg`}
                                        alt={plan.title}
                                    /> */}
                                <CardContent>
                                    <Typography gutterBottom variant='h2' component='div' color='text.primary'>
                                        {plan.title}
                                    </Typography>
                                    <Typography variant='h1' sx={{ color: 'text.secondary', mb: '20px' }}>
                                        {plan.price}
                                    </Typography>
                                    <Typography variant='h4' color='text.secondary' sx={{ mb: '20px' }}>
                                        {plan.description}
                                    </Typography>
                                    <div>
                                        <Button variant='contained' size='large' sx={{ width: '100%' }} className={subStyle.button_click}>
                                            {plan.buttonInfo}
                                        </Button>
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
