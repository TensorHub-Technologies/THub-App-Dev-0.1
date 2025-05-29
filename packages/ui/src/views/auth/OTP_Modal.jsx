import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { Box, Typography, TextField, Button, Modal, IconButton, Stack } from '@mui/material'
import { useSelector } from 'react-redux'

function OTP_Modal({ length = 6, onOtpSubmit = () => {}, setShowModal, resendOtp = () => {} }) {
    const [otp, setOtp] = useState(new Array(length).fill(''))
    const inputRefs = useRef([])
    const customization = useSelector((state) => state.customization)

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (index, e) => {
        const value = e.target.value
        if (isNaN(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && index > 0 && !otp[index]) {
            inputRefs.current[index - 1].focus()
        } else if (e.key === 'Enter') {
            e.preventDefault()
            handleOtpSubmit()
        }
    }

    const handleOtpSubmit = () => {
        const finalOtp = otp.join('')
        onOtpSubmit(finalOtp)
    }

    const handleResendOtp = () => {
        setOtp(new Array(length).fill(''))
        resendOtp()
    }

    const handleClose = () => setShowModal(false)

    return (
        <Modal open={true} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 4,
                    outline: 'none'
                }}
            >
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    X
                </IconButton>

                <Typography variant='h6' textAlign='center' mb={3}>
                    Enter OTP
                </Typography>

                <Stack direction='row' spacing={2} justifyContent='center' mb={3}>
                    {otp.map((digit, index) => (
                        <TextField
                            key={index}
                            inputRef={(el) => (inputRefs.current[index] = el)}
                            value={digit}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            inputProps={{
                                maxLength: 1,
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.2rem',
                                    width: '40px',
                                    border: '1px solid #E22A90'
                                }
                            }}
                            variant='outlined'
                            size='small'
                        />
                    ))}
                </Stack>

                <Stack direction='row' spacing={2} justifyContent='center'>
                    <Button
                        variant='outlined'
                        sx={{ color: customization?.isDarkMode ? 'white' : 'black', border: '1px solid #E22A90' }}
                        onClick={handleResendOtp}
                    >
                        Resend
                    </Button>
                    <Button
                        variant='contained'
                        sx={{
                            color: 'white',
                            backgroundColor: '#E22A90',
                            '&:hover': {
                                backgroundColor: '#E22A90',
                                color: 'white'
                            }
                        }}
                        onClick={handleOtpSubmit}
                    >
                        Continue
                    </Button>
                </Stack>
            </Box>
        </Modal>
    )
}

OTP_Modal.propTypes = {
    length: PropTypes.number,
    onOtpSubmit: PropTypes.func,
    setShowModal: PropTypes.func.isRequired,
    resendOtp: PropTypes.func
}

export default OTP_Modal
