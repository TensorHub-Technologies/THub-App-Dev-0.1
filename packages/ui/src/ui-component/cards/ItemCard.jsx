import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

// material-ui
import { styled } from '@mui/material/styles'
// project imports
import MainCard from '@/ui-component/cards/MainCard'
import SkeletonChatflowCard from '@/ui-component/cards/Skeleton/ChatflowCard'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FlowListMenu from '@/ui-component/button/FlowListMenu'
import IconButton from '@mui/material/IconButton'
import { Typography } from '@mui/material'
import Dark from '@/assets/images/Pink.png'
import Light from '@/assets/images/Light.png'

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

const ItemCard = ({ isLoading, data, images, onClick, chatflow, updateFlowsApi }) => {
    const customization = useCustomization()
    return (
        <>
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
                        // sx={{ background: customization.isDarkMode ? 'theme.palette.common.black': `url(${image1}) !important`,}}
                        border={false}
                        content={false}
                        onClick={onClick}
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
                                        fontSize: '1.1rem',
                                        fontWeight: 500,
                                        height: '40px',
                                        background: 'transparent',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {data.templateName || data.name}
                                </Typography>
                            </div>
                            {data.description && (
                                <span
                                    style={{
                                        padding: '0px 10px',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-line',
                                        overflow: 'auto',
                                        height: '40px',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollbarWidth: 'none'
                                        // '-ms-overflow-style': 'none'
                                    }}
                                >
                                    {data.description}
                                </span>
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
                    <IconButton
                        sx={{
                            position: 'absolute',
                            top: -5,
                            left: 30,
                            zIndex: 1
                        }}
                        onClick={onClick}
                    >
                        <ArrowForwardIcon
                            sx={{
                                p: 0.5,
                                color: `${customization.isDarkMode ? '#222' : '#fff'}`,
                                background: 'transparent',
                                transition: 'transform 0.3s'
                            }}
                        />
                    </IconButton>
                    {/* Options Menu Button */}
                    {!data.templateName && <FlowListMenu chatflow={chatflow || data} updateFlowsApi={updateFlowsApi} />}
                </div>
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
    updateFlowsApi: PropTypes.object
}

export default ItemCard
