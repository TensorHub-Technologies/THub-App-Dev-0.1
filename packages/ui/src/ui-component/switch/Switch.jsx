import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FormControl, Switch, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

export const SwitchInput = ({ label, value, onChange, disabled = false }) => {
    const [myValue, setMyValue] = useState(value !== undefined ? !!value : false)
    const customization = useSelector((state) => state.customization)

    useEffect(() => {
        setMyValue(value)
    }, [value])

    return (
        <>
            <FormControl
                sx={{ mt: 1, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                size='small'
            >
                {label && <Typography>{label}</Typography>}
                <Switch
                    disabled={disabled}
                    checked={myValue === 'true' || myValue === true}
                    onChange={(event) => {
                        setMyValue(event.target.checked)
                        onChange(event.target.checked)
                    }}
                    sx={{
                        '& .MuiSwitch-switchBase': {
                            color: customization.isDarkMode ? '#fff' : '#000'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                        },
                        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                            background: customization.isDarkMode ? '#fff' : '#000'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            background: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                        }
                    }}
                />
            </FormControl>
        </>
    )
}

SwitchInput.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    onChange: PropTypes.func,
    disabled: PropTypes.bool
}
