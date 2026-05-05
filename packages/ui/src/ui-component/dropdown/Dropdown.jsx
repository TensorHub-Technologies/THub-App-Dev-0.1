import { useState } from 'react'
import { useSelector } from 'react-redux'

import { Popper, FormControl, TextField, Box, Typography } from '@mui/material'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'

const StyledPopper = styled(Popper)(({ theme, isDarkMode }) => ({
    boxShadow: '0px 8px 10px -5px rgb(0 0 0 / 20%), 0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%)',
    borderRadius: '10px',
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 10,
            margin: 10
        }
    }
}))

export const Dropdown = ({ name, value, loading, options, onSelect, disabled = false, freeSolo = false, disableClearable = false }) => {
    const customization = useSelector((state) => state.customization)
    const findMatchingOptions = (options = [], value) => options.find((option) => option.name === value)
    const getDefaultOptionValue = () => ''
    let [internalValue, setInternalValue] = useState(value ?? 'choose an option')

    return (
        <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
            <Autocomplete
                id={name}
                disabled={disabled}
                freeSolo={freeSolo}
                disableClearable={disableClearable}
                size='small'
                loading={loading}
                options={options || []}
                value={findMatchingOptions(options, internalValue) || getDefaultOptionValue()}
                onChange={(e, selection) => {
                    const value = selection ? selection.name : ''
                    setInternalValue(value)
                    onSelect(value)
                }}
                PopperComponent={(props) => <StyledPopper {...props} isDarkMode={customization.isDarkMode} />}
                renderInput={(params) => {
                    const matchingOption = findMatchingOptions(options, internalValue)
                    return (
                        <TextField
                            id='standard-basic'
                            variant='standard'
                            {...params}
                            value={internalValue}
                            sx={{
                                height: '100%',
                                '& .MuiInputBase-root': {
                                    height: '100%',
                                    color: customization.isDarkMode ? '#fff' : '#000'
                                },
                                '& .MuiInput-underline:before': {
                                    borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                    borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& label.Mui-focused': {
                                    color: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                },
                                '& .MuiSvgIcon-root': {
                                    color: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                                }
                            }}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: matchingOption?.imageSrc ? (
                                    <Box
                                        component='img'
                                        src={matchingOption.imageSrc}
                                        alt={matchingOption.label || 'Selected Option'}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%'
                                        }}
                                    />
                                ) : null
                            }}
                        />
                    )
                }}
                renderOption={(props, option) => (
                    <Box
                        component='li'
                        {...props}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            '&:hover': {
                                backgroundColor: customization.isDarkMode ? 'rgba(226, 42, 144, 0.08)' : 'rgba(60, 91, 164, 0.08)'
                            },
                            '&.Mui-focused': {
                                backgroundColor: customization.isDarkMode ? 'rgba(226, 42, 144, 0.12)' : 'rgba(60, 91, 164, 0.12)'
                            }
                        }}
                    >
                        {option.imageSrc && (
                            <img
                                src={option.imageSrc}
                                alt={option.description}
                                style={{
                                    width: 30,
                                    height: 30,
                                    padding: 1,
                                    borderRadius: '50%'
                                }}
                            />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='h5' sx={{ color: customization.isDarkMode ? '#fff' : '#000' }}>
                                {option.label}
                            </Typography>
                            {option.description && (
                                <Typography sx={{ color: customization.isDarkMode ? '#9e9e9e' : '#666' }}>{option.description}</Typography>
                            )}
                        </div>
                    </Box>
                )}
                sx={{
                    height: '100%',
                    '& .MuiAutocomplete-popupIndicator': {
                        color: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                    },
                    '& .MuiAutocomplete-clearIndicator': {
                        color: customization.isDarkMode ? '#E22A90' : '#3C5BA4'
                    }
                }}
            />
        </FormControl>
    )
}

Dropdown.propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    loading: PropTypes.bool,
    options: PropTypes.array,
    freeSolo: PropTypes.bool,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
    disableClearable: PropTypes.bool
}
