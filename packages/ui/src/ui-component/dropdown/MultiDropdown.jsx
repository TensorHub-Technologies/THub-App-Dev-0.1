import { useState } from 'react'
import { useSelector } from 'react-redux'

import { Popper, FormControl, TextField, Box, Typography } from '@mui/material'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { useTheme, styled } from '@mui/material/styles'
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

export const MultiDropdown = ({ name, value, options, onSelect, formControlSx = {}, disabled = false, disableClearable = false }) => {
    const customization = useSelector((state) => state.customization)
    const findMatchingOptions = (options = [], internalValue) => {
        let values = []
        if ('choose an option' !== internalValue && internalValue && typeof internalValue === 'string') values = JSON.parse(internalValue)
        else values = internalValue
        return options.filter((option) => values.includes(option.name))
    }
    const getDefaultOptionValue = () => []
    let [internalValue, setInternalValue] = useState(value ?? [])
    const theme = useTheme()

    return (
        <FormControl sx={{ mt: 1, width: '100%', ...formControlSx }} size='small'>
            <Autocomplete
                id={name}
                disabled={disabled}
                disableClearable={disableClearable}
                size='small'
                multiple
                filterSelectedOptions
                options={options || []}
                value={findMatchingOptions(options, internalValue) || getDefaultOptionValue()}
                onChange={(e, selections) => {
                    let value = ''
                    if (selections.length) {
                        const selectionNames = []
                        for (let i = 0; i < selections.length; i += 1) {
                            selectionNames.push(selections[i].name)
                        }
                        value = JSON.stringify(selectionNames)
                    }
                    setInternalValue(value)
                    onSelect(value)
                }}
                PopperComponent={(props) => <StyledPopper {...props} isDarkMode={customization.isDarkMode} />}
                renderInput={(params) => (
                    <TextField
                        id='standard-basic'
                        variant='standard'
                        {...params}
                        value={internalValue}
                        sx={{
                            height: '100%',
                            '& .MuiInputBase-root': {
                                height: '100%',
                                color: customization.isDarkMode ? '#fff' : '#000',
                                '& fieldset': {
                                    borderColor: theme.palette.grey[900] + 25
                                }
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
                            // '& .MuiChip-root': {
                            //     backgroundColor: customization.isDarkMode ? 'rgba(226, 42, 144, 0.15)' : 'rgba(60, 91, 164, 0.15)',
                            //     color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                            //     '& .MuiChip-deleteIcon': {
                            //         color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                            //         '&:hover': {
                            //             color: customization.isDarkMode ? '#ff4db8' : '#4a6dc9'
                            //         }
                            //     }
                            // }
                        }}
                    />
                )}
                renderOption={(props, option) => (
                    <Box
                        component='li'
                        {...props}
                        sx={{
                            '&:hover': {
                                backgroundColor: customization.isDarkMode ? 'rgba(226, 42, 144, 0.08)' : 'rgba(60, 91, 164, 0.08)'
                            },
                            '&.Mui-focused': {
                                backgroundColor: customization.isDarkMode ? 'rgba(226, 42, 144, 0.12)' : 'rgba(60, 91, 164, 0.12)'
                            }
                        }}
                    >
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

MultiDropdown.propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    options: PropTypes.array,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
    formControlSx: PropTypes.object,
    disableClearable: PropTypes.bool
}
