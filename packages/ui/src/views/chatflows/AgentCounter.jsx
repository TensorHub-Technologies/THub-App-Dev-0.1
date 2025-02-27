import { useState } from 'react'
import { Box, Modal, Button } from '@mui/material'
import PropTypes from 'prop-types'
import './Chatflow.css'
import { useSelector } from 'react-redux'
import addButton from '../../assets/icons/circle-plus-light.svg'
import addButton_dark from '../../assets/icons/circle-plus-dark.svg'
import minusButton from '../../assets/icons/circle-minus-light.svg'
import minusButton_dark from '../../assets/icons/circle-minus-dark.svg'
import { agentPlan } from './AgentPlan'
import chatFlowCss from './Chatflow.module.css'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 520,
    height: 350,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '20px',
    p: 4
}

const AgentCounter = ({ open, handleClose }) => {
    const [agentCount, setAgentCount] = useState(1)
    const [selectedPlan, setSelectedPlan] = useState('monthly')
    const isDarkMode = useSelector((state) => state.customization.isDarkMode)

    const handleIncreaseCount = () => setAgentCount(agentCount + 1)
    const handleDecreaseCount = () => agentCount > 1 && setAgentCount(agentCount - 1)

    const getBasePrice = () => {
        const selectedPlanData = agentPlan[selectedPlan][0]
        const priceString = selectedPlanData.price.INR.replace(/[^0-9]/g, '')
        return parseInt(priceString, 10)
    }

    const calculatePrice = () => {
        const basePrice = getBasePrice()
        return basePrice * agentCount
    }

    const handleMonthly = () => setSelectedPlan('monthly')
    const handleYearly = () => setSelectedPlan('yearly')

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby='child-modal-title' aria-describedby='child-modal-description'>
            <Box sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <div className={chatFlowCss.switch_parent}>
                        <div className={chatFlowCss.switch_wrapper}>
                            <button className={chatFlowCss.switch_button} onClick={handleMonthly}>
                                <input
                                    type='radio'
                                    id='monthly'
                                    name='subscription'
                                    className={chatFlowCss.radio}
                                    checked={selectedPlan === 'monthly'}
                                    readOnly
                                />
                                <label
                                    htmlFor='monthly'
                                    style={{
                                        color: isDarkMode
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
                            <button className={chatFlowCss.switch_button} onClick={handleYearly}>
                                <input
                                    type='radio'
                                    id='yearly'
                                    name='subscription'
                                    className={chatFlowCss.radio}
                                    checked={selectedPlan === 'yearly'}
                                    readOnly
                                />
                                <label
                                    htmlFor='yearly'
                                    className={chatFlowCss.switch_item}
                                    style={{
                                        color: isDarkMode
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
                                className={isDarkMode ? chatFlowCss.highlighter_dark : chatFlowCss.highlighter_light}
                                style={{ transform: selectedPlan === 'yearly' ? 'translateX(100%)' : 'none' }}
                            ></div>
                        </div>
                    </div>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '32px', color: isDarkMode ? 'white' : 'black', marginBottom: '38px' }}>Agents:</h3>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isDarkMode ? '2px solid white' : '2px solid black',
                            width: '30%',
                            gap: '10px',
                            borderRadius: '10px',
                            marginBottom: '10px',
                            padding: '8px'
                        }}
                    >
                        <button onClick={handleDecreaseCount} style={{ backgroundColor: 'transparent', border: 'none' }}>
                            <img src={isDarkMode ? minusButton_dark : minusButton} alt='' style={{ width: '28px', cursor: 'pointer' }} />
                        </button>
                        <div style={{ fontSize: '32px', color: isDarkMode ? 'white' : 'black' }}>{agentCount}</div>
                        <button onClick={handleIncreaseCount} style={{ backgroundColor: 'transparent', border: 'none' }}>
                            <img src={isDarkMode ? addButton_dark : addButton} alt='' style={{ width: '28px', cursor: 'pointer' }} />
                        </button>
                    </div>
                    <div style={{ fontSize: '32px', color: isDarkMode ? 'white' : 'black' }}>
                        = ₹ {calculatePrice().toLocaleString('en-IN')}
                    </div>
                </Box>
                <p
                    id='child-modal-description'
                    style={{
                        textAlign: 'left',
                        paddingLeft: '20px',
                        color: isDarkMode ? 'white' : 'black'
                    }}
                >
                    You’ve reached the maximum number of Agents. Upgrade to the Pro plan to add more Agents.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px' }}>
                    <Button
                        variant='contained'
                        onClick={handleClose}
                        sx={{
                            mt: 3,
                            width: '40%',
                            bgcolor: isDarkMode ? '#e22a90' : '#3c5ba4',
                            '&:hover': { bgcolor: isDarkMode ? '#c91d78' : '#2c4883' }
                        }}
                    >
                        Skip
                    </Button>
                    <Button
                        variant='contained'
                        sx={{
                            mt: 3,
                            width: '40%',
                            bgcolor: isDarkMode ? '#e22a90' : '#3c5ba4',
                            '&:hover': { bgcolor: isDarkMode ? '#c91d78' : '#2c4883' }
                        }}
                    >
                        Subscribe
                    </Button>
                </div>
            </Box>
        </Modal>
    )
}

AgentCounter.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired
}

export default AgentCounter
