import PropTypes from 'prop-types'
import { useRef, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import { NodeToolbar } from 'reactflow'

// material-ui
import { styled, useTheme, alpha } from '@mui/material/styles'

// project imports
import { ButtonGroup, IconButton, Box, Card, Input } from '@mui/material'
import { IconCopy, IconTrash } from '@tabler/icons-react'

// const
import { flowContext } from '@/store/context/ReactFlowContext'

const CardWrapper = styled(Card)(({ theme }) => ({
    background: theme.palette.card.main,
    color: theme.darkTextPrimary,
    border: 'solid 0.5px black',
    width: 'max-content',
    minWidth: '150px',
    maxWidth: '250px',
    height: 'auto',
    padding: '10px',
    boxShadow: 'none',
    fontFamily: '"Cambria Math", Cambria, serif',
    fontSize: '12px'
}))

const StyledNodeToolbar = styled(NodeToolbar)(({ theme }) => ({
    backgroundColor: theme.palette.card.main,
    color: theme.darkTextPrimary,
    padding: '5px',
    borderRadius: '10px',
    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
}))

const StickyNote = ({ data }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const ref = useRef(null)

    const { reactFlowInstance, deleteNode, duplicateNode } = useContext(flowContext)
    const [inputParam] = data.inputParams
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false) // Add focus state

    const defaultColor = '#666666' // fallback color if data.color is not present
    const nodeColor = data.color || defaultColor

    // Custom background colors
    const lightModeColor = '#C4CEE3'
    const darkModeColor = '#1C2B4D'

    // Get border color - now always black as requested
    const getBorderColor = () => {
        return '#000000' // Black border
    }

    // Get different shades of the color based on state
    const getStateColor = () => {
        if (data.selected) return getBorderColor()
        if (isHovered) return alpha(getBorderColor(), 0.8)
        return getBorderColor()
    }

    const getBackgroundColor = () => {
        if (customization.isDarkMode) {
            return darkModeColor // Use #1C2B4D for dark mode
        }
        return lightModeColor // Use #C4CEE3 for light mode
    }

    const getTextColor = () => {
        if (customization.isDarkMode) {
            return '#ffffff' // White text for dark background
        }
        return '#000000' // Black text for light background
    }

    return (
        <div ref={ref} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <StyledNodeToolbar>
                <ButtonGroup sx={{ gap: 1 }} variant='outlined' aria-label='Basic button group'>
                    <IconButton
                        size={'small'}
                        title='Duplicate'
                        onClick={() => {
                            duplicateNode(data.id)
                        }}
                        sx={{
                            color: customization.isDarkMode ? 'white' : 'inherit',
                            '&:hover': {
                                color: theme.palette.primary.main
                            }
                        }}
                    >
                        <IconCopy size={20} />
                    </IconButton>
                    <IconButton
                        size={'small'}
                        title='Delete'
                        onClick={() => {
                            deleteNode(data.id)
                        }}
                        sx={{
                            color: customization.isDarkMode ? 'white' : 'inherit',
                            '&:hover': {
                                color: theme.palette.error.main
                            }
                        }}
                    >
                        <IconTrash size={20} />
                    </IconButton>
                </ButtonGroup>
            </StyledNodeToolbar>
            <CardWrapper
                content={false}
                sx={{
                    borderColor: getBorderColor(),
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    boxShadow: data.selected ? `0 0 0 2px ${getBorderColor()} !important` : 'none',
                    minHeight: 60,
                    height: 'auto',
                    backgroundColor: getBackgroundColor(),
                    color: getTextColor(),
                    display: 'flex',
                    alignItems: 'flex-start', // Changed from 'center' to allow text to start from top
                    fontFamily: '"Cambria Math", Cambria, serif',
                    fontSize: '12px',
                    '& *': {
                        fontFamily: '"Cambria Math", Cambria, serif !important',
                        fontSize: '12px !important',
                        color: `${getTextColor()} !important`,
                        visibility: 'visible !important',
                        opacity: '1 !important'
                    },
                    '& .MuiInput-root': {
                        color: `${getTextColor()} !important`,
                        width: '100%', // Make input take full width
                        // Hide underline by default, show on focus
                        '&:before': {
                            borderBottomColor: 'transparent !important', // Hide by default
                            borderBottomWidth: '1px'
                        },
                        '&:after': {
                            borderBottomColor: isFocused ? `${getTextColor()} !important` : 'transparent !important', // Show only when focused
                            borderBottomWidth: isFocused ? '2px' : '0px'
                        },
                        '&:hover:not(.Mui-disabled):before': {
                            borderBottomColor: 'transparent !important' // Keep hidden on hover
                        },
                        '&.Mui-focused:before': {
                            borderBottomColor: 'transparent !important' // Keep the default underline hidden even when focused
                        },
                        '&.Mui-focused:after': {
                            borderBottomColor: `${getTextColor()} !important` // Show the focus underline
                        }
                    },
                    '& .MuiInput-input': {
                        color: `${getTextColor()} !important`,
                        fontFamily: '"Cambria Math", Cambria, serif !important',
                        fontSize: '12px !important',
                        whiteSpace: 'pre-wrap', // Allow text to wrap to next line
                        wordWrap: 'break-word', // Break long words if needed
                        lineHeight: '1.4' // Better line spacing for multiline text
                    },
                    '&:hover': {
                        boxShadow: data.selected ? `0 0 0 2px ${getBorderColor()} !important` : 'none'
                    }
                }}
                border={false}
            >
                <Box
                    sx={{
                        width: '200px', // Make box take full width
                        '& input': {
                            fontFamily: '"Cambria Math", Cambria, serif !important',
                            fontSize: '12px !important',
                            color: `${getTextColor()} !important`,
                            visibility: 'visible !important',
                            opacity: '1 !important',
                            whiteSpace: 'pre-wrap !important', // Allow multiline input
                            wordWrap: 'break-word !important',
                            lineHeight: '1.4 !important'
                        },
                        '& input::placeholder': {
                            color: `${alpha(getTextColor(), 0.7)} !important`,
                            fontFamily: '"Cambria Math", Cambria, serif !important',
                            fontSize: '12px !important',
                            visibility: 'visible !important',
                            opacity: '1 !important'
                        },
                        '& .MuiInput-root': {
                            color: `${getTextColor()} !important`,
                            width: '100%'
                        }
                    }}
                >
                    <Input
                        key={data.id}
                        placeholder={inputParam.placeholder}
                        inputParam={inputParam}
                        onChange={(newValue) => (data.inputs[inputParam.name] = newValue)}
                        value={data.inputs[inputParam.name] ?? inputParam.default ?? ''}
                        nodes={reactFlowInstance ? reactFlowInstance.getNodes() : []}
                        edges={reactFlowInstance ? reactFlowInstance.getEdges() : []}
                        nodeId={data.id}
                        multiline={true} // Enable multiline input
                        onFocus={() => setIsFocused(true)} // Set focus state
                        onBlur={() => setIsFocused(false)} // Remove focus state
                        sx={{
                            fontFamily: '"Cambria Math", Cambria, serif',
                            fontSize: '12px',
                            color: getTextColor(),
                            width: '100%',
                            '& input': {
                                fontFamily: '"Cambria Math", Cambria, serif !important',
                                fontSize: '12px !important',
                                color: `${getTextColor()} !important`,
                                whiteSpace: 'pre-wrap !important',
                                wordWrap: 'break-word !important',
                                lineHeight: '1.4 !important'
                            },
                            '& textarea': {
                                fontFamily: '"Cambria Math", Cambria, serif !important',
                                fontSize: '12px !important',
                                color: `${getTextColor()} !important`,
                                whiteSpace: 'pre-wrap !important',
                                wordWrap: 'break-word !important',
                                lineHeight: '1.4 !important',
                                resize: 'none', // Remove resize option
                                overflow: 'hidden' // Hide scrollbars, auto-expand instead
                            }
                        }}
                    />
                </Box>
            </CardWrapper>
        </div>
    )
}

StickyNote.propTypes = {
    data: PropTypes.object
}

export default StickyNote
