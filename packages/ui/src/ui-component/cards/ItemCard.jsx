import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useState } from 'react'

// material-ui
import { styled } from '@mui/material/styles'
// project imports
import MainCard from '@/ui-component/cards/MainCard'
import SkeletonChatflowCard from '@/ui-component/cards/Skeleton/ChatflowCard'
import FlowListMenu from '@/ui-component/button/FlowListMenu'
import { Typography, Tooltip, Box } from '@mui/material'
import Dark from '@/assets/images/THub_icon_colorful_logo.png'
import Light from '@/assets/images/THub_icon_colorful_logo.png'

const useCustomization = () => {
    return useSelector((state) => state.customization)
}

const CardWrapper = styled(MainCard)(({ theme, customization }) => ({
    position: 'relative',
    borderRadius: '12px',
    backdropFilter: 'blur(16px)',
    background: 'transparent',
    border: '1px solid',
    borderColor: customization?.isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    height: '300px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '80rem',
    '&:hover': {
        background: 'linear-gradient(to right, rgba(60, 91, 164, 0.3), rgba(226, 42, 144, 0.3))',
        backdropFilter: 'blur(16px)',
        transform: 'translateY(-2px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        borderColor: customization?.isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)'
    }
}))

// ===========================|| REDESIGNED CARD ||=========================== //

const ItemCard = ({ isLoading, data, images, onClick, chatflow, updateFlowsApi, icons, isAgentCanvas, isAgentflowV2 }) => {
    const customization = useCustomization()
    const [isHovered, setIsHovered] = useState(false)

    const [isDragging, setIsDragging] = useState(false)
    const handleStart = () => {
        setIsDragging(false)
    }
    const handleDrag = () => {
        setIsDragging(true)
    }
    const handleStop = () => {
        setTimeout(() => setIsDragging(false), 0)
    }

    return (
        <>
            {isLoading ? (
                <SkeletonChatflowCard />
            ) : (
                <CardWrapper
                    border={false}
                    content={false}
                    customization={customization}
                    onClick={() => {
                        if (!isDragging) {
                            onClick()
                        }
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '24px',
                            position: 'relative'
                        }}
                    >
                        {/* Header Section with Icon and Title - Fixed Height */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                gap: '12px',
                                height: '60px',
                                minHeight: '60px'
                            }}
                        >
                            {/* Icon */}
                            <div
                            // style={{
                            //     width: '26px',
                            //     height: '26px',
                            //     borderRadius: '6px',
                            //     background: data.iconSrc
                            //         ? 'transparent'
                            //         : (data.color || 'linear-gradient(135deg, #3C5BA4 0%, #E22A90 100%)'),
                            //     flexShrink: 0,
                            //     display: 'flex',
                            //     alignItems: 'center',
                            //     justifyContent: 'center'
                            // }}
                            >
                                {data.iconSrc ? (
                                    <img
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '8px',
                                            objectFit: 'contain'
                                        }}
                                        src={data.iconSrc}
                                        alt='Icon'
                                    />
                                ) : (
                                    <img
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            marginTop: '1px'
                                        }}
                                        src={customization.isDarkMode ? Dark : Light}
                                        alt='Default Icon'
                                    />
                                )}
                            </div>

                            {/* Title - Fixed Height Container */}
                            <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'flex-start' }}>
                                <Typography
                                    variant='h6'
                                    sx={{
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        lineHeight: '1.4',
                                        color: customization.isDarkMode ? '#ffffff' : 'black',
                                        fontFamily: '"Cambria Math", "Cambria", serif',
                                        wordBreak: 'break-word',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        height: 'fit-content',
                                        maxHeight: '56px' // Allow for 2 lines
                                    }}
                                >
                                    {data.templateName || data.name}
                                </Typography>
                            </div>
                        </div>

                        {/* Description - Fixed Height */}
                        <div
                            style={{
                                marginBottom: '20px',
                                height: '60px', // Fixed height for description
                                minHeight: '60px'
                            }}
                        >
                            {data.description && (
                                <Tooltip title={data.description} placement='bottom'>
                                    <Typography
                                        sx={{
                                            fontSize: '1rem',
                                            fontWeight: 400,
                                            color: customization.isDarkMode ? 'white' : 'black',
                                            fontFamily: '"Cambria Math", "Cambria", serif',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            height: '60px',
                                            lineHeight: '1.7',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {data.description}
                                    </Typography>
                                </Tooltip>
                            )}
                        </div>

                        {/* Tools Used Section - Fixed Height */}
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '96px' // Fixed minimum height for tools section
                            }}
                        >
                            {(images?.length > 0 || icons?.length > 0) && (
                                <>
                                    <Typography
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            lineHeight: '1.25rem',
                                            color: customization.isDarkMode ? 'white' : 'black',
                                            fontFamily: 'Cambria Math',
                                            marginBottom: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            height: '20px' // Fixed height for tools label
                                        }}
                                    >
                                        TOOLS
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            alignItems: 'flex-start',
                                            height: '64px', // Fixed height for tools container
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Display tools in pills */}
                                        {[
                                            ...(images?.slice(0, 8) || []).map((img) => ({
                                                type: 'image',
                                                src: img,
                                                label: 'Tool'
                                            })),
                                            ...(icons?.slice(0, Math.max(0, 8 - (images?.length || 0))) || []).map((ic) => ({
                                                type: ic.icon && typeof ic.icon === 'string' ? 'image' : 'icon',
                                                icon: ic.icon,
                                                src: ic.icon,
                                                color: ic.color,
                                                label: ic.name || 'Tool'
                                            }))
                                        ].map((item, index) => (
                                            <Tooltip key={index} title={item.label} placement='top'>
                                                <div
                                                    style={{
                                                        padding: '4px 10px',
                                                        backgroundColor: customization.isDarkMode
                                                            ? 'rgba(255, 255, 255, 0.1)'
                                                            : 'rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${
                                                            customization.isDarkMode
                                                                ? 'rgba(255, 255, 255, 0.2)'
                                                                : 'rgba(255, 255, 255, 0.3)'
                                                        }`,
                                                        backdropFilter: 'blur(8px)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        height: '28px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {item.type === 'image' ? (
                                                        <img
                                                            src={item.src}
                                                            alt={item.label}
                                                            style={{
                                                                width: '14px',
                                                                height: '14px',
                                                                objectFit: 'contain',
                                                                borderRadius: '2px'
                                                            }}
                                                        />
                                                    ) : item.icon ? (
                                                        <item.icon
                                                            size={14}
                                                            color={item.color || (customization.isDarkMode ? '#ffffff' : '#1e293b')}
                                                        />
                                                    ) : null}
                                                    <Typography
                                                        sx={{
                                                            fontSize: '11px',
                                                            fontWeight: 500,
                                                            color: customization.isDarkMode
                                                                ? 'rgba(255, 255, 255, 0.9)'
                                                                : 'rgba(30, 41, 59, 0.8)',
                                                            fontFamily: '"Cambria Math", "Cambria", serif',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Tool
                                                    </Typography>
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Menu for non-template items */}
                    {!data.templateName && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                            <FlowListMenu
                                chatflow={chatflow || data}
                                updateFlowsApi={updateFlowsApi}
                                isAgentCanvas={isAgentCanvas}
                                isAgentflowV2={isAgentflowV2}
                            />
                        </div>
                    )}
                </CardWrapper>
            )}
        </>
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
