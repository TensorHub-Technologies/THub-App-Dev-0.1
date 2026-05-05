import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Box, Skeleton, Tooltip, Typography, CircularProgress, useTheme } from '@mui/material'
import FlowListMenu from '../button/FlowListMenu'
import { Link } from 'react-router-dom'
import thuicon from '@/assets/images/THub_icon_colorful_logo.png'

const useCustomization = () => {
    return useSelector((state) => state.customization)
}

// Helper function to check if icon is an image path or React component
const isImagePath = (icon) => {
    return (
        typeof icon === 'string' &&
        (icon.includes('.png') || icon.includes('.jpg') || icon.includes('.jpeg') || icon.includes('.svg') || icon.includes('.gif'))
    )
}

export const FlowListTable = ({
    data,
    images = {},
    icons = {},
    isLoading,
    filterFunction,
    updateFlowsApi,
    setError,
    isAgentCanvas,
    isAgentflowV2,
    lastElementRef,
    isLoadingMore,
    hasMore
}) => {
    const theme = useTheme()
    const customization = useCustomization()
    const isDark = customization.isDarkMode

    const onFlowClick = (row) => {
        if (!isAgentCanvas) {
            return `/canvas/${row.id}`
        } else {
            return isAgentflowV2 ? `/v2/agentcanvas/${row.id}` : `/agentcanvas/${row.id}`
        }
    }

    const filteredData = data ? data.filter(filterFunction || (() => true)) : []

    // Render load more indicator
    const renderLoadMoreIndicator = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2, gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant='body2' color='textSecondary'>
                Loading more...
            </Typography>
        </Box>
    )

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                        height: '6rem',
                                        width: '100%',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Content - matching the actual content structure */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            zIndex: 10,
                                            px: 3,
                                            py: 2,
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        {/* Left Section - Title and Description */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mr: 3 }}>
                                                {/* Icon and Title Row */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {/* THub Icon Skeleton */}
                                                    <Skeleton
                                                        variant='circular'
                                                        width={18}
                                                        height={18}
                                                        sx={{
                                                            flexShrink: 0,
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    {/* Title Skeleton */}
                                                    <Skeleton
                                                        variant='text'
                                                        width={200}
                                                        height={26}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                </Box>
                                                {/* Description Skeleton */}
                                                <Box sx={{ maxWidth: '360px' }}>
                                                    <Skeleton
                                                        variant='text'
                                                        width={300}
                                                        height={18}
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Skeleton
                                                        variant='text'
                                                        width={250}
                                                        height={18}
                                                        sx={{
                                                            mt: 0.5,
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Center Section - Tools Icons */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-start' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {[...Array(3)].map((_, iconIndex) => (
                                                    <Skeleton
                                                        key={iconIndex}
                                                        variant='rounded'
                                                        width={32}
                                                        height={32}
                                                        sx={{
                                                            borderRadius: '20%',
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>

                                        {/* Right Section - Menu Button */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Skeleton
                                                variant='circular'
                                                width={24}
                                                height={24}
                                                sx={{
                                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </>
                ) : (
                    // Actual data
                    <>
                        {filteredData.map((row, index) => (
                            <Box
                                key={row.id}
                                ref={index === filteredData.length - 1 ? lastElementRef : null}
                                sx={{
                                    position: 'relative',
                                    transform: 'translateY(0)',
                                    transition: 'all 0.5s ease-in-out',
                                    animation: 'float 6s ease-in-out infinite',
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
                                        height: '6rem',
                                        width: '100%',
                                        transition: 'all 0.3s ease-in-out',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            '& .glow-effect': {
                                                opacity: 1
                                            }
                                        }
                                    }}
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
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        {/* Left Section - Title with THub Icon and Description */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                            {/* THub Icon and Title/Description */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mr: 3 }}>
                                                {/* Icon and Title Row */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {/* Add your THub Icon here */}
                                                    <img
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            flexShrink: 0,
                                                            marginTop: '1px',
                                                            marginLeft: '-2px'
                                                        }}
                                                        src={thuicon}
                                                        alt='THub Icon'
                                                    />

                                                    {/* Title */}
                                                    <Link to={onFlowClick(row)} style={{ textDecoration: 'none' }}>
                                                        <Typography
                                                            variant='h6'
                                                            sx={{
                                                                fontFamily: 'Cambria Math',
                                                                fontWeight: 'bold',
                                                                color: isDark ? 'white' : 'black',
                                                                fontSize: '1.1rem',
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            {row.templateName || row.name}
                                                        </Typography>
                                                    </Link>
                                                </Box>

                                                {/* Description - aligned with icon's left edge */}
                                                <Tooltip title={row.description || ''} placement='bottom' arrow enterDelay={300}>
                                                    <Box
                                                        sx={{
                                                            maxWidth: '360px',
                                                            cursor: row.description ? 'pointer' : 'default'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                color: isDark ? 'white' : 'rgba(0, 0, 0, 0.6)',
                                                                fontSize: '0.875rem',
                                                                lineHeight: 1.3,
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                wordBreak: 'break-word',
                                                                fontFamily: 'Cambria Math'
                                                            }}
                                                        >
                                                            {row.description || '—'}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* Center Section - Tools */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'flex-start' }}>
                                            {/* Tools Icons */}
                                            {(images[row.id]?.length > 0 || icons[row.id]?.length > 0) && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        gap: 1
                                                    }}
                                                >
                                                    {/* Show all tools */}
                                                    {[
                                                        ...(images[row.id] || []).map((img) => ({
                                                            type: 'image',
                                                            src: img,
                                                            label: 'Tool'
                                                        })),
                                                        ...(icons[row.id] || []).map((ic) => ({
                                                            type: typeof ic.icon === 'string' ? 'image' : 'icon',
                                                            icon: ic.icon,
                                                            src: ic.icon,
                                                            color: ic.color,
                                                            label: ic.name
                                                        }))
                                                    ]
                                                        .slice(0, 5)
                                                        .map((item, index) => (
                                                            <Tooltip key={index} title={item.label} placement='top'>
                                                                <Box
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        borderRadius: '20%',
                                                                        backgroundColor: 'transparent'
                                                                    }}
                                                                >
                                                                    {item.type === 'image' ? (
                                                                        <Box
                                                                            component='img'
                                                                            src={item.src}
                                                                            alt={item.label}
                                                                            sx={{
                                                                                width: '80%',
                                                                                height: '80%',
                                                                                objectFit: 'contain'
                                                                            }}
                                                                        />
                                                                    ) : isImagePath(item.icon) ? (
                                                                        <Box
                                                                            component='img'
                                                                            src={item.icon}
                                                                            alt={item.label}
                                                                            sx={{
                                                                                width: '80%',
                                                                                height: '80%',
                                                                                objectFit: 'contain'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Box
                                                                            component={item.icon}
                                                                            sx={{ fontSize: 16, color: item.color }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </Tooltip>
                                                        ))}
                                                    {(images[row.id]?.length || 0) + (icons[row.id]?.length || 0) > 5 && (
                                                        <Typography
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                                fontSize: '.9rem',
                                                                fontWeight: 200,
                                                                color: isDark ? 'white' : 'black',
                                                                ml: 1
                                                            }}
                                                        >
                                                            + {(images[row.id]?.length || 0) + (icons[row.id]?.length || 0) - 5} More
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Right Section - Actions */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <FlowListMenu
                                                isAgentCanvas={isAgentCanvas}
                                                isAgentflowV2={isAgentflowV2}
                                                chatflow={row}
                                                setError={setError}
                                                updateFlowsApi={updateFlowsApi}
                                            />
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
                        ))}
                    </>
                )}
            </Box>

            {/* Load more indicator for infinite scroll */}
            {isLoadingMore && renderLoadMoreIndicator()}
        </>
    )
}

FlowListTable.propTypes = {
    data: PropTypes.array,
    images: PropTypes.object,
    icons: PropTypes.object,
    isLoading: PropTypes.bool,
    filterFunction: PropTypes.func,
    updateFlowsApi: PropTypes.object,
    setError: PropTypes.func,
    isAgentCanvas: PropTypes.bool,
    isAgentflowV2: PropTypes.bool,
    lastElementRef: PropTypes.func,
    isLoadingMore: PropTypes.bool,
    hasMore: PropTypes.bool
}
