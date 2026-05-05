import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Button, Chip, Skeleton, Typography, useTheme, IconButton, Box, Tooltip } from '@mui/material'
import { IconTrash } from '@tabler/icons-react'

export const MarketplaceTable = ({
    data,
    filterFunction,
    filterByBadge,
    filterByType,
    filterByFramework,
    filterByUsecases,
    goToCanvas,
    goToTool,
    isLoading,
    onDelete
}) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode

    const openTemplate = (selectedTemplate) => {
        if (selectedTemplate.flowData) {
            goToCanvas(selectedTemplate)
        } else {
            goToTool(selectedTemplate)
        }
    }

    const filteredData =
        data?.filter(filterByBadge).filter(filterByType).filter(filterFunction).filter(filterByFramework).filter(filterByUsecases) || []

    return (
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
                                    minHeight: '8rem',
                                    width: '100%',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
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
                                        flexDirection: 'column',
                                        gap: 2
                                    }}
                                >
                                    {/* Header Row */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                            <Skeleton
                                                variant='text'
                                                width={200}
                                                height={32}
                                                sx={{
                                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Skeleton
                                                variant='rectangular'
                                                width={60}
                                                height={24}
                                                sx={{
                                                    borderRadius: '12px',
                                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
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

                                    {/* Description */}
                                    <Skeleton
                                        variant='text'
                                        width='80%'
                                        height={20}
                                        sx={{
                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                        }}
                                    />

                                    {/* Tags Row */}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {[...Array(3)].map((_, tagIndex) => (
                                                <Skeleton
                                                    key={tagIndex}
                                                    variant='rectangular'
                                                    width={60}
                                                    height={24}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                            ))}
                                        </Box>
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
                                    minHeight: '8rem',
                                    width: '100%',
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
                                {/* Content */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        zIndex: 10,
                                        px: 3,
                                        py: 2,
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0
                                    }}
                                >
                                    {/* All Sections in Grid */}
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                                            gap: 3,
                                            mt: 1,
                                            alignItems: 'start' // This ensures all columns start from the same top position
                                        }}
                                    >
                                        {/* Header Section - Name, Type, and Actions */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                minHeight: '80px'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                                                {/* Name with Type */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Tooltip title={row.templateName || row.name} placement='top' arrow>
                                                        <Button
                                                            onClick={() => openTemplate(row)}
                                                            sx={{
                                                                textAlign: 'left',
                                                                p: 0,
                                                                minWidth: 'auto',
                                                                '&:hover': {
                                                                    background: 'transparent'
                                                                }
                                                            }}
                                                        >
                                                            <Typography
                                                                variant='h6'
                                                                sx={{
                                                                    fontFamily: 'Cambria Math',
                                                                    fontWeight: 'bold',
                                                                    color: isDark ? 'white' : 'black',
                                                                    fontSize: '1.2rem',
                                                                    lineHeight: 1.2,
                                                                    textDecoration: 'none',
                                                                    maxWidth: '200px',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
                                                                    }
                                                                }}
                                                            >
                                                                {row.templateName || row.name}
                                                            </Typography>
                                                        </Button>
                                                    </Tooltip>

                                                    {/* Type */}
                                                    <Chip
                                                        label={row.type}
                                                        variant='filled'
                                                        size='small'
                                                        sx={{
                                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                                                            color: isDark ? 'white' : 'black',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            height: '28px'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Description */}
                                                {row.description && (
                                                    <Tooltip title={row.description} placement='top' arrow>
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                                fontSize: '0.75rem',
                                                                lineHeight: 1.4,
                                                                overflowWrap: 'break-word',
                                                                mt: 0.5,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                maxWidth: '250px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {row.description}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </Box>

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, ml: 2 }}>
                                                {onDelete && (
                                                    <Tooltip title='Delete' placement='top'>
                                                        <IconButton
                                                            color='error'
                                                            onClick={() => onDelete(row)}
                                                            sx={{
                                                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(211, 47, 47, 0.2)'
                                                                }
                                                            }}
                                                        >
                                                            <IconTrash size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Framework Column */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                height: '100%',
                                                minHeight: '80px'
                                            }}
                                        >
                                            <Typography
                                                variant='h6'
                                                sx={{
                                                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    fontFamily: 'Cambria Math',
                                                    alignSelf: 'flex-start'
                                                }}
                                            >
                                                Framework:
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.5,
                                                    alignItems: 'flex-start',
                                                    width: '100%'
                                                }}
                                            >
                                                {row.framework && row.framework.length > 0 ? (
                                                    row.framework.map((framework, frameworkIndex) => (
                                                        <Chip
                                                            key={frameworkIndex}
                                                            size='small'
                                                            label={framework}
                                                            sx={{
                                                                backgroundColor: isDark
                                                                    ? 'rgba(60, 91, 164, 0.4)'
                                                                    : 'rgba(60, 91, 164, 0.2)',
                                                                color: isDark ? '#E3F2FD' : '#1565C0',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                border: `1px solid ${
                                                                    isDark ? 'rgba(60, 91, 164, 0.6)' : 'rgba(60, 91, 164, 0.4)'
                                                                }`,
                                                                height: '24px',
                                                                alignSelf: 'flex-start'
                                                            }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                                            fontSize: '0.75rem',
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        No framework specified
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Use Cases Column */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                height: '100%',
                                                minHeight: '80px'
                                            }}
                                        >
                                            <Typography
                                                variant='h6'
                                                sx={{
                                                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    fontFamily: 'Cambria Math',
                                                    alignSelf: 'flex-start'
                                                }}
                                            >
                                                Use Cases:
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 0.5,
                                                    alignItems: 'flex-start',
                                                    width: '100%',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                {row.usecases && row.usecases.length > 0 ? (
                                                    <>
                                                        {/* Show first 2 chips */}
                                                        {row.usecases.slice(0, 2).map((usecase, usecaseIndex) => (
                                                            <Chip
                                                                key={usecaseIndex}
                                                                size='small'
                                                                label={usecase}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(76, 175, 80, 0.4)'
                                                                        : 'rgba(76, 175, 80, 0.2)',
                                                                    color: isDark ? '#C8E6C9' : '#2E7D32',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 500,
                                                                    border: `1px solid ${
                                                                        isDark ? 'rgba(76, 175, 80, 0.6)' : 'rgba(76, 175, 80, 0.4)'
                                                                    }`,
                                                                    height: '22px',
                                                                    maxWidth: '80px',
                                                                    '& .MuiChip-label': {
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                        {/* Show +X more if there are more than 2 chips */}
                                                        {row.usecases.length > 2 && (
                                                            <Tooltip
                                                                title={
                                                                    <Box>
                                                                        {row.usecases.slice(2).map((usecase, index) => (
                                                                            <Typography
                                                                                key={index}
                                                                                variant='body2'
                                                                                sx={{ fontSize: '0.75rem' }}
                                                                            >
                                                                                • {usecase}
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                }
                                                                placement='top'
                                                                arrow
                                                            >
                                                                <Chip
                                                                    size='small'
                                                                    label={`+${row.usecases.length - 2}`}
                                                                    sx={{
                                                                        backgroundColor: isDark
                                                                            ? 'rgba(128, 128, 128, 0.4)'
                                                                            : 'rgba(128, 128, 128, 0.2)',
                                                                        color: isDark ? '#E0E0E0' : '#424242',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 500,
                                                                        border: `1px solid ${
                                                                            isDark ? 'rgba(128, 128, 128, 0.6)' : 'rgba(128, 128, 128, 0.4)'
                                                                        }`,
                                                                        height: '22px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                                            fontSize: '0.7rem',
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        No use cases specified
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Nodes Column */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                height: '100%',
                                                minHeight: '80px'
                                            }}
                                        >
                                            <Typography
                                                variant='h6'
                                                sx={{
                                                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    fontFamily: 'Cambria Math',
                                                    alignSelf: 'flex-start'
                                                }}
                                            >
                                                Nodes:
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 0.5,
                                                    alignItems: 'flex-start',
                                                    width: '100%',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                {row.categories && row.categories.length > 0 ? (
                                                    <>
                                                        {/* Show first 3 chips horizontally */}
                                                        {row.categories.slice(0, 3).map((tag, tagIndex) => (
                                                            <Chip
                                                                key={tagIndex}
                                                                size='small'
                                                                label={tag}
                                                                sx={{
                                                                    backgroundColor: isDark
                                                                        ? 'rgba(226, 42, 144, 0.4)'
                                                                        : 'rgba(226, 42, 144, 0.2)',
                                                                    color: isDark ? '#FCE4EC' : '#AD1457',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 500,
                                                                    border: `1px solid ${
                                                                        isDark ? 'rgba(226, 42, 144, 0.6)' : 'rgba(226, 42, 144, 0.4)'
                                                                    }`,
                                                                    height: '22px',
                                                                    maxWidth: '70px',
                                                                    '& .MuiChip-label': {
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                        {/* Show +X more if there are more than 3 chips */}
                                                        {row.categories.length > 3 && (
                                                            <Tooltip
                                                                title={
                                                                    <Box>
                                                                        {row.categories.slice(3).map((tag, index) => (
                                                                            <Typography
                                                                                key={index}
                                                                                variant='body2'
                                                                                sx={{ fontSize: '0.75rem' }}
                                                                            >
                                                                                • {tag}
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                }
                                                                placement='top'
                                                                arrow
                                                            >
                                                                <Chip
                                                                    size='small'
                                                                    label={`+${row.categories.length - 3}`}
                                                                    sx={{
                                                                        backgroundColor: isDark
                                                                            ? 'rgba(128, 128, 128, 0.4)'
                                                                            : 'rgba(128, 128, 128, 0.2)',
                                                                        color: isDark ? '#E0E0E0' : '#424242',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 500,
                                                                        border: `1px solid ${
                                                                            isDark ? 'rgba(128, 128, 128, 0.6)' : 'rgba(128, 128, 128, 0.4)'
                                                                        }`,
                                                                        height: '22px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                                            fontSize: '0.7rem',
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        No nodes specified
                                                    </Typography>
                                                )}
                                            </Box>
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
                    ))}
                </>
            )}
        </Box>
    )
}

MarketplaceTable.propTypes = {
    data: PropTypes.array,
    filterFunction: PropTypes.func,
    filterByBadge: PropTypes.func,
    filterByType: PropTypes.func,
    filterByFramework: PropTypes.func,
    filterByUsecases: PropTypes.func,
    goToTool: PropTypes.func,
    goToCanvas: PropTypes.func,
    isLoading: PropTypes.bool,
    onDelete: PropTypes.func
}
