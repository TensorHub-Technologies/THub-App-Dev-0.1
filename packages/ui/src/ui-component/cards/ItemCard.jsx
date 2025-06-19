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
import Dark from '@/assets/images/Pink.png'
import Light from '@/assets/images/Light.png'
import MoreItemsTooltip from '../tooltip/MoreItemsTooltip'

const useCustomization = () => {
    return useSelector((state) => state.customization)
}

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: theme.palette.card.main,
    color: theme.darkTextPrimary,
    // color: useCustomization().isDarkMode ? '#E22A90' : '#3C5BA4',
    overflow: 'auto',
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
        backgroundImage: 'linear-gradient(to left, "#3C5BA4", "#E22A90")',
        boxShadow: '0 0 20px rgba(60, 91, 164, 0.8), 0 0 30px rgba(226, 42, 144, 0.8)',
        '& + button': {
            '& svg': {
                transform: 'rotate(-45deg)'
            }
        }
    },
    maxHeight: '280px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-line'
}))

// ===========================|| CARD ||=========================== //

const ItemCard = ({ isLoading, data, images, onClick, chatflow, updateFlowsApi, icons }) => {
    const customization = useCustomization()

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
    const handleClick = () => {
        if (!isDragging) {
            onClick()
        }
    }

    return (
        <div
            style={{
                position: 'relative',
                background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                width: '280px',
                height: '280px',
                borderRadius: '12px',
                padding: 1
            }}
        >
            {isLoading ? (
                <SkeletonChatflowCard />
            ) : (
                <div
                    style={{
                        position: 'relative',
                        background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                        width: '280px',
                        height: '280px',
                        borderRadius: '12px',
                        padding: 1
                    }}
                >
                    <CardWrapper
                        // sx={{ background: customization.isDarkMode ? 'theme.palette.common.black': url(${image1}) !important,}}
                        border={false}
                        content={false}
                        onClick={() => {
                            if (!isDragging) {
                                onClick()
                            }
                        }}
                    >
                        <div
                            style={{
                                height: '270px',
                                overflow: 'auto',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'transparent',
                                position: 'relative'
                            }}
                        >
                            <div
                                style={{
                                    borderBottomRightRadius: '10px',
                                    borderTopLeftRadius: '12px',
                                    height: '30px',
                                    width: '170px',
                                    background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                    position: 'relative',
                                    transform: 'skew(-40deg)',
                                    boxShadow: '-10px -10px 0 0 #3C5BA4'
                                }}
                            ></div>
                            <div
                                style={{
                                    content: '""',
                                    position: 'absolute',
                                    top: '30px',
                                    left: '0',
                                    height: '15px',
                                    width: '15px',
                                    borderTopLeftRadius: '12px',
                                    boxShadow: '-5px -5px 0 2px #3C5BA4'
                                }}
                            ></div>
                            <div
                                style={{
                                    content: '""',
                                    position: 'absolute',
                                    top: '20px',
                                    left: '30px',
                                    height: '20px',
                                    width: '30px',
                                    borderTopLeftRadius: '12px',
                                    borderBottomRightRadius: '30px',
                                    boxShadow: '-30px -20px 0 0 #3C5BA4'
                                }}
                            ></div>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    width: '100%',
                                    height: '30px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        aspectRatio: '1',
                                        padding: '5px 0 0 15px'
                                    }}
                                >
                                    <img
                                        style={{ objectFit: 'contain', height: 'auto', width: 15 }}
                                        src={customization.isDarkMode ? Dark : Light}
                                        alt='THub Logo Icon'
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    marginTop: 10,
                                    padding: '10px 10px'
                                }}
                            >
                                {data.iconSrc && (
                                    <div
                                        style={{
                                            width: 35,
                                            height: 35,
                                            marginRight: 10,
                                            borderRadius: '20%',
                                            background: `url(${data.iconSrc})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center'
                                        }}
                                    ></div>
                                )}
                                {!data.iconSrc && data.color && (
                                    <div
                                        style={{
                                            width: 35,
                                            height: 35,
                                            marginRight: 10,
                                            borderRadius: '50%',
                                            background: data.color
                                        }}
                                    ></div>
                                )}
                                <Typography
                                    sx={{
                                        display: '-webkit-box',
                                        fontSize: '1.25rem',
                                        fontWeight: 500,
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {data.templateName || data.name}
                                </Typography>
                            </div>
                            {data.description && (
                                <Tooltip title={data?.description || ''}>
                                    <span
                                        style={{
                                            display: 'block',
                                            padding: '0px 20px',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'pre-line', // Allows multi-line text wrapping
                                            overflow: 'hidden', // Ensures overflow content is hidden
                                            height: '40px', // Limits to two lines based on line height
                                            lineHeight: '20px', // Adjust to control the height for two lines
                                            width: '250px',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}
                                    >
                                        {data.description}
                                    </span>
                                </Tooltip>
                            )}

                            <div
                                style={{
                                    padding: '10px '
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginTop: '0px'
                                    }}
                                >
                                    {images && (
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: '15px',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    letterSpacing: '2px'
                                                }}
                                            >
                                                Nodes
                                            </div>
                                            {(images?.length > 0 || icons?.length > 0) && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'start',
                                                        gap: 1
                                                    }}
                                                >
                                                    {[
                                                        ...(icons || []).map((ic) => ({
                                                            type:
                                                                (ic.icon || ic.icon) && typeof (ic.icon || ic.icon) === 'string'
                                                                    ? 'image'
                                                                    : 'icon',
                                                            icon: ic.icon,
                                                            src: ic.icon || ic.icon,
                                                            color: ic.color,
                                                            label: ic.name
                                                        }))
                                                    ]
                                                        .slice(0, 3)
                                                        .map((item, index) => (
                                                            <Tooltip key={item.icon || index} title={item.label} placement='top'>
                                                                <div
                                                                    style={{
                                                                        width: 30,
                                                                        height: 30,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        borderRadius: '20%',
                                                                        backgroundColor: item.type === 'image' ? '#fff' : 'transparent',
                                                                        boxShadow:
                                                                            item.type === 'image'
                                                                                ? '2px 2px 14px 2px rgb(32 40 45 / 8%)'
                                                                                : 'none'
                                                                    }}
                                                                >
                                                                    {item.type === 'image' ? (
                                                                        <img
                                                                            src={item.icon}
                                                                            alt={item.label}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'contain',
                                                                                padding: 3
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <item.icon size={25} color={item.color} />
                                                                    )}
                                                                </div>
                                                            </Tooltip>
                                                        ))}

                                                    {(images?.length || 0) + (icons?.length || 0) > 3 && (
                                                        <MoreItemsTooltip
                                                            images={[
                                                                ...(images?.slice(3) || []),
                                                                ...(icons?.slice(Math.max(0, 3 - (images?.length || 0))) || []).map(
                                                                    (ic) => ({ label: ic.name })
                                                                )
                                                            ]}
                                                        ></MoreItemsTooltip>
                                                    )}
                                                </Box>
                                            )}

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    overflow: 'auto',
                                                    height: '80px',
                                                    WebkitOverflowScrolling: 'touch',
                                                    scrollbarWidth: 'none'
                                                    // '-ms-overflow-style': 'none'
                                                }}
                                            >
                                                {images.map((img) => (
                                                    <div
                                                        key={img}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            marginRight: 5,
                                                            borderRadius: '20%',
                                                            boxShadow: '2px 2px 14px 2px rgb(32 40 45 / 8%)',
                                                            background: `${customization.isDarkMode ? '#fff' : '#fff'}`,
                                                            marginTop: 5
                                                        }}
                                                    >
                                                        <img
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                padding: 5,
                                                                objectFit: 'contain'
                                                            }}
                                                            alt=''
                                                            src={img}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardWrapper>

                    {!data.templateName && <FlowListMenu chatflow={chatflow || data} updateFlowsApi={updateFlowsApi} />}
                </div>
            )}
        </div>
    )
}

ItemCard.propTypes = {
    isLoading: PropTypes.bool,
    data: PropTypes.object,
    images: PropTypes.array,
    onClick: PropTypes.func,
    chatflow: PropTypes.object,
    icons: PropTypes.array,
    updateFlowsApi: PropTypes.object
}

export default ItemCard
