import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FormControl, Popover, TextField } from '@mui/material'
import SelectVariable from '@/ui-component/json/SelectVariable'
import { getAvailableNodesForVariable } from '@/utils/genericHelper'
import { useSelector } from 'react-redux'

export const Input = ({ inputParam, value, nodes, edges, nodeId, onChange, disabled = false }) => {
    const [myValue, setMyValue] = useState(value ?? '')
    const [anchorEl, setAnchorEl] = useState(null)
    const [availableNodesForVariable, setAvailableNodesForVariable] = useState([])
    const ref = useRef(null)
    const customization = useSelector((state) => state.customization)

    const openPopOver = Boolean(anchorEl)

    const handleClosePopOver = () => {
        setAnchorEl(null)
    }

    const setNewVal = (val) => {
        const newVal = myValue + val.substring(2)
        onChange(newVal)
        setMyValue(newVal)
    }

    const getInputType = (type) => {
        switch (type) {
            case 'string':
                return 'text'
            case 'password':
                return 'password'
            case 'number':
                return 'number'
            default:
                return 'text'
        }
    }

    useEffect(() => {
        if (!disabled && nodes && edges && nodeId && inputParam) {
            const nodesForVariable = inputParam?.acceptVariable ? getAvailableNodesForVariable(nodes, edges, nodeId, inputParam.id) : []
            setAvailableNodesForVariable(nodesForVariable)
        }
    }, [disabled, inputParam, nodes, edges, nodeId])

    useEffect(() => {
        if (typeof myValue === 'string' && myValue && myValue.endsWith('{{')) {
            setAnchorEl(ref.current)
        }
    }, [myValue])

    return (
        <>
            {inputParam.name === 'note' ? (
                <FormControl sx={{ width: '100%', height: 'auto' }} size='small'>
                    <TextField
                        id='standard-basic'
                        size='small'
                        variant='standard'
                        type={getInputType(inputParam.type)}
                        placeholder={inputParam.placeholder}
                        multiline={!!inputParam.rows}
                        minRows={inputParam.rows ?? 1}
                        value={myValue}
                        name={inputParam.name}
                        onChange={(e) => {
                            setMyValue(e.target.value)
                            onChange(e.target.value)
                        }}
                        inputProps={{
                            step: inputParam.step ?? 1,
                            style: {
                                border: 'none',
                                background: 'none',
                                color: '#FFFF',
                                fontWeight: 'bolder',
                                fontSize: '24px',
                                fontFamily: 'cambria Math'
                            }
                        }}
                        sx={{
                            border: 'none',
                            background: 'none',
                            padding: '10px 14px',
                            textarea: {
                                '&::placeholder': {
                                    color: '#616161'
                                }
                            }
                        }}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                borderBottom: customization.isDarkMode ? '2px solid #fff' : '2px solid #000',
                                '&:hover': {
                                    borderBottom: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4'
                                }
                            }
                        }}
                    />
                </FormControl>
            ) : inputParam.name === 'temperature' ? (
                <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                    <TextField
                        id='standard-basic'
                        size='small'
                        variant='standard'
                        disabled={disabled}
                        type={getInputType(inputParam.type)}
                        placeholder={inputParam.placeholder}
                        multiline={!!inputParam.rows}
                        rows={inputParam.rows ?? 1}
                        value={myValue}
                        name={inputParam.name}
                        onChange={(e) => {
                            const inputValue = e.target.value
                            if (/^(0(\.[0-9]+)?|1(\.[0-9]+)?|2(\.0)?)$/.test(inputValue) && parseFloat(inputValue) <= 2) {
                                setMyValue(inputValue)
                                onChange(inputValue)
                            }
                        }}
                        inputProps={{
                            step: inputParam.step ?? 0.1,
                            style: {
                                height: inputParam.rows ? '90px' : 'inherit'
                            }
                        }}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                borderBottom: customization.isDarkMode ? '2px solid #fff' : '2px solid #000',
                                '&:hover': {
                                    borderBottom: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4'
                                }
                            }
                        }}
                    />
                </FormControl>
            ) : (
                <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                    <TextField
                        id='standard-basic'
                        size='small'
                        variant='standard'
                        type={getInputType(inputParam.type)}
                        placeholder={inputParam.placeholder}
                        multiline={!!inputParam.rows}
                        rows={inputParam.rows ?? 1}
                        value={myValue}
                        name={inputParam.name}
                        onChange={(e) => {
                            setMyValue(e.target.value)
                            onChange(e.target.value)
                        }}
                        inputProps={{
                            step: inputParam.step ?? 0.1,
                            style: {
                                height: inputParam.rows ? '90px' : 'inherit'
                            }
                        }}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                borderBottom: customization.isDarkMode ? '2px solid #fff' : '2px solid #000',
                                '&:hover': {
                                    borderBottom: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4'
                                }
                            }
                        }}
                    />
                </FormControl>
            )}
            <div ref={ref}></div>
            {inputParam?.acceptVariable && (
                <Popover
                    open={openPopOver}
                    anchorEl={anchorEl}
                    onClose={handleClosePopOver}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                    }}
                >
                    <SelectVariable
                        disabled={disabled}
                        availableNodesForVariable={availableNodesForVariable}
                        onSelectAndReturnVal={(val) => {
                            setNewVal(val)
                            handleClosePopOver()
                        }}
                    />
                </Popover>
            )}
        </>
    )
}

Input.propTypes = {
    inputParam: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    nodes: PropTypes.array,
    edges: PropTypes.array,
    nodeId: PropTypes.string
}
