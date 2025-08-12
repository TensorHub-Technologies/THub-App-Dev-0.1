import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

// material-ui
import { Box, Typography, Tooltip } from '@mui/material'
// project imports
import SkeletonChatflowCard from '@/ui-component/cards/Skeleton/ChatflowCard'
import FlowListMenu from '@/ui-component/button/FlowListMenu'
import thuicon from '@/assets/images/THub_icon_colorful_logo.png'

const useCustomization = () => {
    return useSelector((state) => state.customization)
}

// ===========================|| ITEM CARD ||=========================== //

const ItemCard = ({ isLoading, data, images, onClick, chatflow, updateFlowsApi, icons, isAgentCanvas, isAgentflowV2 }) => {
    const customization = useCustomization()
    const isDark = customization.isDarkMode

    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'relative',
                // maxWidth: '26rem',
                mx: 'auto',
                cursor: 'pointer'
            }}
        >
            {isLoading ? (
                <SkeletonChatflowCard />
            ) : (
                <Box
                    sx={{
                        position: 'relative',
                        transform: 'translateY(0)',
                        transition: 'all 0.5s ease-in-out',
                        animation: 'float 6s ease-in-out infinite',
                        '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' }
                        },
                        '&:hover': {
                            transform: 'translateY(-5px)'
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
                            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            height: '18rem',
                            width: '25rem',
                            transition: 'all 0.3s ease-in-out',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                '& .glow-effect': {
                                    opacity: 1
                                }
                            }
                        }}
                    >
                        {/* Flow Menu (moved inside the card container and repositioned) */}
                        {!data.templateName && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    zIndex: 20,
                                    // Ensure it stays within card boundaries
                                    maxWidth: 'calc(100% - 24px)', // Leave 12px margin on both sides
                                    '& button': {
                                        // Override any absolute positioning from FlowListMenu
                                        position: 'relative !important',
                                        top: 'auto !important',
                                        right: 'auto !important'
                                    }
                                }}
                            >
                                <FlowListMenu
                                    chatflow={chatflow || data}
                                    updateFlowsApi={updateFlowsApi}
                                    isAgentCanvas={isAgentCanvas}
                                    isAgentflowV2={isAgentflowV2}
                                />
                            </Box>
                        )}

                        {/* Content */}
                        <Box sx={{ position: 'relative', zIndex: 10, px: 3, pt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Header with Icon and Title */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    mb: 2,
                                    minHeight: '3rem', // Reserve space for up to 2 lines of title
                                    // Add padding to the right to avoid overlap with menu button
                                    pr: !data.templateName ? 6 : 0
                                }}
                            >
                                {/* Icon */}
                                {data.iconSrc && (
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 2,
                                            borderRadius: '20%',
                                            backgroundImage: `url(${data.iconSrc})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center',
                                            flexShrink: 0
                                        }}
                                    />
                                )}

                                {/* Title with THub Icon */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1 }}>
                                    <img
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            marginTop: '1px',
                                            flexShrink: 0
                                        }}
                                        src={thuicon}
                                        alt='THub Icon'
                                    />
                                    <Typography
                                        variant='h6'
                                        sx={{
                                            fontFamily: 'Cambria Math',
                                            fontWeight: 'bold',
                                            color: isDark ? 'white' : 'black',
                                            fontSize: '1.1rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.5rem',
                                            flex: 1
                                        }}
                                    >
                                        {data.templateName || data.name}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Description - Fixed height section */}
                            <Box sx={{ minHeight: '3rem', mb: 2 }}>
                                {data.description && (
                                    <Tooltip title={data.description} placement='top' arrow>
                                        <Typography
                                            sx={{
                                                fontFamily: 'Cambria Math',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                fontWeight: 'normal',
                                                color: isDark ? 'white' : 'black',
                                                cursor: 'pointer',
                                                lineHeight: '1.5rem'
                                            }}
                                        >
                                            {data.description}
                                        </Typography>
                                    </Tooltip>
                                )}
                            </Box>

                            {/* Tools Section */}
                            <Box sx={{ mt: 1, minHeight: '4rem' }}>
                                <Typography
                                    variant='subtitle2'
                                    sx={{
                                        fontFamily: 'Cambria Math',
                                        fontWeight: 'bold',
                                        color: isDark ? 'white' : 'black',
                                        fontSize: '0.875rem',

                                        letterSpacing: '1px'
                                    }}
                                >
                                    Tools
                                </Typography>

                                {/* Tools Icons */}
                                {(images?.length > 0 || icons?.length > 0) && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            gap: 1,
                                            marginTop: 1,
                                            flexWrap: 'wrap',
                                            minHeight: '2.5rem' // Reserve space for up to 2 lines of tools
                                        }}
                                    >
                                        {/* Show all tools */}
                                        {[
                                            ...(images || []).map((img) => ({
                                                type: 'image',
                                                src: img,
                                                label: 'Tool'
                                            })),
                                            ...(icons || []).map((ic) => ({
                                                type: typeof ic.icon === 'string' ? 'image' : 'icon',
                                                icon: ic.icon,
                                                src: ic.icon,
                                                color: ic.color,
                                                label: ic.name
                                            }))
                                        ].map((item, index) => (
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
                                                    ) : (
                                                        <Box component={item.icon} sx={{ fontSize: 16, color: item.color }} />
                                                    )}
                                                </Box>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                )}
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
            )}
        </Box>
    )
}

ItemCard.propTypes = {
    isLoading: PropTypes.bool,
    data: PropTypes.object,
    images: PropTypes.array,
    onClick: PropTypes.func,
    chatflow: PropTypes.object,
    icons: PropTypes.array,
    updateFlowsApi: PropTypes.object,
    isAgentCanvas: PropTypes.bool,
    isAgentflowV2: PropTypes.bool
}

export default ItemCard
