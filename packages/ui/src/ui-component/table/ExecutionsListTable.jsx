import { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { Box, Skeleton, Typography, Chip, Checkbox, useTheme, Tooltip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { IconLoader, IconCircleXFilled } from '@tabler/icons-react'

const getIconFromStatus = (state, theme) => {
    const transparentStyle = { background: 'transparent' }

    switch (state) {
        case 'FINISHED':
            return function FinishedIcon() {
                return <CheckCircleIcon style={transparentStyle} />
            }
        case 'ERROR':
        case 'TIMEOUT':
            return function ErrorStatusIcon() {
                return <ErrorIcon style={transparentStyle} />
            }
        case 'TERMINATED':
            return function TerminatedIcon() {
                return <IconCircleXFilled color={theme.palette.error.main} style={transparentStyle} />
            }
        case 'STOPPED':
            return function StoppedIcon() {
                return <StopCircleIcon style={transparentStyle} />
            }
        case 'INPROGRESS':
            return function InProgressIcon() {
                return (
                    <IconLoader
                        color={theme.palette.warning.dark}
                        className='spin-animation'
                        style={{
                            ...transparentStyle,
                            animation: 'spin 1s linear infinite'
                        }}
                    />
                )
            }
        default:
            return function DefaultIcon() {
                return <CheckCircleIcon style={transparentStyle} />
            }
    }
}

const getStatusChipColor = (state, isDark) => {
    switch (state) {
        case 'FINISHED':
            return {
                backgroundColor: isDark ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.2)',
                color: isDark ? '#C8E6C9' : '#2E7D32',
                border: `1px solid ${isDark ? 'rgba(76, 175, 80, 0.6)' : 'rgba(76, 175, 80, 0.4)'}`
            }
        case 'ERROR':
        case 'TIMEOUT':
        case 'TERMINATED':
        case 'STOPPED':
            return {
                backgroundColor: isDark ? 'rgba(211, 47, 47, 0.4)' : 'rgba(211, 47, 47, 0.2)',
                color: isDark ? '#FFCDD2' : '#C62828',
                border: `1px solid ${isDark ? 'rgba(211, 47, 47, 0.6)' : 'rgba(211, 47, 47, 0.4)'}`
            }
        case 'INPROGRESS':
            return {
                backgroundColor: isDark ? 'rgba(255, 152, 0, 0.4)' : 'rgba(255, 152, 0, 0.2)',
                color: isDark ? '#FFE0B2' : '#E65100',
                border: `1px solid ${isDark ? 'rgba(255, 152, 0, 0.6)' : 'rgba(255, 152, 0, 0.4)'}`
            }
        default:
            return {
                backgroundColor: isDark ? 'rgba(158, 158, 158, 0.4)' : 'rgba(158, 158, 158, 0.2)',
                color: isDark ? '#E0E0E0' : '#424242',
                border: `1px solid ${isDark ? 'rgba(158, 158, 158, 0.6)' : 'rgba(158, 158, 158, 0.4)'}`
            }
    }
}

export const ExecutionsListTable = ({ data, isLoading, onExecutionRowClick, onSelectionChange }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode

    const [selected, setSelected] = useState([])

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = data.map((n) => n.id)
            setSelected(newSelected)
            onSelectionChange && onSelectionChange(newSelected)
        } else {
            setSelected([])
            onSelectionChange && onSelectionChange([])
        }
    }

    const formatTime = (ms) => {
        if (!ms) return '0m 0s'
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }

    const handleClick = (event, id) => {
        event.stopPropagation()
        const selectedIndex = selected.indexOf(id)
        let newSelected = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
        }

        setSelected(newSelected)
        onSelectionChange && onSelectionChange(newSelected)
    }

    const isSelected = (id) => selected.indexOf(id) !== -1

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header Card */}
            <Box
                sx={{
                    position: 'relative',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ px: 3, py: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            // display: 'grid',
                            // gridTemplateColumns: '60px 120px 180px 1.2fr 180px 40px 160px',
                            gap: 3,
                            alignItems: 'center'
                        }}
                    >
                        {/* Select All Checkbox */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Checkbox
                                color='primary'
                                indeterminate={selected.length > 0 && selected.length < (data?.length || 0)}
                                checked={(data?.length || 0) > 0 && selected.length === (data?.length || 0)}
                                onChange={handleSelectAllClick}
                                sx={{
                                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                    '&.Mui-checked': {
                                        color: isDark ? '#90CAF9' : '#1976D2'
                                    }
                                }}
                            />
                        </Box>

                        {/* Headers */}
                        <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math'
                            }}
                        >
                            Status
                        </Typography>

                        <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math'
                            }}
                        >
                            Last Updated
                        </Typography>

                        <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math'
                            }}
                        >
                            Agentflow
                        </Typography>
                        <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math'
                            }}
                        >
                            Total Tokens
                        </Typography>
                        <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math'
                            }}
                        >
                            Total Time
                        </Typography>

                        {/* <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math',
                                textAlign: 'left'
                            }}
                        >
                            Session
                        </Typography> */}

                        {/* Empty spacer column */}
                        <Box></Box>

                        <Typography
                            variant='h6'
                            sx={{
                                color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'Cambria Math',
                                textAlign: 'left'
                            }}
                        >
                            Created
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {isLoading ? (
                // Loading skeletons
                <>
                    {[...Array(6)].map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                position: 'relative',
                                transform: 'translateY(0)',
                                transition: 'all 0.5s ease-in-out'
                            }}
                        >
                            {/* Main Glass Card - matching the actual card structure */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(16px)',
                                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    minHeight: '4rem',
                                    width: '100%',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Content */}
                                <Box sx={{ px: 3, py: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '60px 120px 180px 1.2fr 180px 40px 160px',
                                            gap: 3,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Skeleton variant='rectangular' width={20} height={20} />
                                        <Skeleton variant='rectangular' width={80} height={24} sx={{ borderRadius: '12px' }} />
                                        <Skeleton variant='text' width={140} />
                                        <Skeleton variant='text' width={180} />
                                        <Skeleton variant='text' width={120} />
                                        {/* Empty spacer */}
                                        <Box></Box>
                                        <Skeleton variant='text' width={140} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </>
            ) : (
                // Actual data
                <>
                    {(data || []).map((row, index) => {
                        console.log(data, 'data')
                        const isItemSelected = isSelected(row.id)
                        const StatusIcon = getIconFromStatus(row.state, theme)
                        const statusChipColors = getStatusChipColor(row.state, isDark)

                        return (
                            <Box
                                key={index}
                                sx={{
                                    position: 'relative',
                                    transform: 'translateY(0)',
                                    transition: 'all 0.5s ease-in-out',
                                    animation: 'float 6s ease-in-out infinite',
                                    animationDelay: `${index * 0.1}s`,
                                    '@keyframes float': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-5px)' }
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-3px)'
                                    }
                                }}
                            >
                                {/* Main Glass Card */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        border: '1px solid',
                                        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(16px)',
                                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        minHeight: '4rem',
                                        width: '100%',
                                        transition: 'all 0.3s ease-in-out',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            '& .glow-effect': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                    onClick={() => onExecutionRowClick(row)}
                                >
                                    {/* Content */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            zIndex: 10,
                                            px: 3,
                                            py: 2,
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        {/* Grid Layout */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: 3,
                                                alignItems: 'center'
                                            }}
                                        >
                                            {/* Checkbox */}
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Checkbox
                                                    color='primary'
                                                    checked={isItemSelected}
                                                    onClick={(event) => handleClick(event, row.id)}
                                                    sx={{
                                                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                                        '&.Mui-checked': {
                                                            color: isDark ? '#90CAF9' : '#1976D2'
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Status */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    icon={<StatusIcon size={16} />}
                                                    label={row.state}
                                                    size='small'
                                                    sx={{
                                                        ...statusChipColors,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        height: '28px',
                                                        '& .MuiChip-icon': {
                                                            fontSize: '16px'
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Last Updated */}
                                            <Box>
                                                <Tooltip
                                                    title={moment(row.updatedDate).format('MMMM D, YYYY h:mm:ss A')}
                                                    placement='top'
                                                    arrow
                                                >
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {moment(row.updatedDate).format('MMM D, YYYY')}
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        {moment(row.updatedDate).format('h:mm A')}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>

                                            {/* Agentflow */}
                                            <Box>
                                                <Tooltip title={row.agentflow?.name || 'No agentflow specified'} placement='top' arrow>
                                                    <Typography
                                                        variant='h6'
                                                        sx={{
                                                            fontFamily: 'Cambria Math',
                                                            fontWeight: 'bold',
                                                            color: isDark ? 'white' : 'black',
                                                            fontSize: '1rem',
                                                            lineHeight: 1.2,
                                                            maxWidth: '100%',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {row.agentflow?.name || 'Unknown'}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                            {/* Total Tokens */}
                                            <Box>
                                                <Tooltip title={row?.total_tokens || 'no tokens consumed'} placement='top' arrow>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {row?.total_tokens}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                            {/* Total time */}
                                            <Box>
                                                <Tooltip title={row?.total_time || 'no tokens consumed'} placement='top' arrow>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {formatTime(row.total_time)}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                            {/* Session */}
                                            {/*<Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                <Tooltip title={row.sessionId} placement='top' arrow>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                            fontSize: '0.85rem',
                                                            fontFamily: 'monospace',
                                                            maxWidth: '100%',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {row.sessionId}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>*/}

                                            {/* Empty spacer column */}
                                            <Box></Box>

                                            {/* Created */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Tooltip
                                                    title={moment(row.createdDate).format('MMMM D, YYYY h:mm:ss A')}
                                                    placement='top'
                                                    arrow
                                                >
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500,
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {moment(row.createdDate).format('MMM D, YYYY')}
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                                                            fontSize: '0.75rem',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {moment(row.createdDate).format('h:mm A')}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Soft Glow Effect */}
                                    <Box
                                        className='glow-effect'
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease-in-out',
                                            filter: 'blur(8px)',
                                            zIndex: -1
                                        }}
                                    />
                                </Box>
                            </Box>
                        )
                    })}
                </>
            )}

            {/* CSS for spin animation */}
            <style>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Box>
    )
}

ExecutionsListTable.propTypes = {
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    onExecutionRowClick: PropTypes.func,
    onSelectionChange: PropTypes.func
}

ExecutionsListTable.displayName = 'ExecutionsListTable'
