import PropTypes from 'prop-types'
import { forwardRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Chip, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material'

// project imports
import { MENU_OPEN, SET_MENU } from '@/store/actions'
import config from '@/config'

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

// ==============================|| SIDEBAR MENU LIST ITEMS ||============================== //

const NavItem = ({ item, level, navType, onClick, onUploadFile }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)
    const matchesSM = useMediaQuery(theme.breakpoints.down('lg'))

    const Icon = item.icon
    const itemIcon = item?.icon ? (
        <Icon
            className='icon-hover'
            stroke={1.5}
            size='1.3rem'
            sx={{
                width: '36px',
                height: '36px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '8px',
                background: 'transparent !important',
                color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                borderRadius: '20%',
                padding: '1px'
            }}
        />
    ) : (
        <FiberManualRecordIcon
            sx={{
                width: customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6,
                height: customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6
            }}
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    )

    let itemTarget = '_self'
    if (item.target) {
        itemTarget = '_blank'
    }

    let listItemProps = {
        component: forwardRef(function ListItemPropsComponent(props, ref) {
            return <Link ref={ref} {...props} to={`${config.basename}${item.url}`} target={itemTarget} />
        })
    }
    if (item?.external) {
        listItemProps = { component: 'a', href: item.url, target: itemTarget }
    }
    if (item?.id === 'loadChatflow') {
        listItemProps.component = 'label'
    }

    const handleFileUpload = (e) => {
        if (!e.target.files) return

        const file = e.target.files[0]

        const reader = new FileReader()
        reader.onload = (evt) => {
            if (!evt?.target?.result) {
                return
            }
            const { result } = evt.target
            onUploadFile(result)
        }
        reader.readAsText(file)
    }

    const itemHandler = (id) => {
        if (navType === 'SETTINGS' && id !== 'loadChatflow') {
            onClick(id)
        } else {
            dispatch({ type: MENU_OPEN, id })
            if (matchesSM) dispatch({ type: SET_MENU, opened: false })
        }
    }

    // active menu item on page load
    useEffect(() => {
        if (navType === 'MENU') {
            const currentIndex = document.location.pathname
                .toString()
                .split('/')
                .findIndex((id) => id === item.id)
            if (currentIndex > -1) {
                dispatch({ type: MENU_OPEN, id: item.id })
            }
            if (!document.location.pathname.toString().split('/')[1]) {
                itemHandler('chatflows')
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navType])

    return (
        <Box
            sx={{
                borderRadius: `${customization.borderRadius}px`,
                p: 0.1,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
                '&:hover': {
                    background: `linear-gradient(to right, #3C5BA4, #E22A90) !important`,
                    '& .MuiListItemButton-root': {
                        backgroundColor: theme.palette.background.default,
                        color: customization?.isDarkMode ? '#fff' : '#000',
                        '& .icon-hover': {
                            color: customization?.isDarkMode ? '#fff' : '#000'
                        }
                    }
                },
                ...(customization.isOpen.findIndex((id) => id === item.id) > -1 &&
                    {
                        // background: `linear-gradient(to right, #3C5BA4, #E22A90) !important`
                    })
            }}
        >
            <ListItemButton
                {...listItemProps}
                disabled={item.disabled}
                // sx={{
                //     borderRadius: `${customization.borderRadius}px`,
                //     mb: 0.5,
                //     alignItems: 'flex-start',
                //     backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
                //     py: level > 1 ? 1 : 1.25,
                //     pl: `${level * 24}px`
                // }}
                sx={{
                    borderRadius: `${customization.borderRadius}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.background.default,
                    color: customization?.isDarkMode ? '#fff' : '#000',
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.background.default,
                        color: customization?.isDarkMode ? '#fff' : '#000',
                        '& .icon-hover': {
                            color: customization?.isDarkMode ? '#fff' : '#000'
                        },
                        '&:hover': {
                            backgroundColor: theme.palette.background.default,
                            '& .icon-hover': {
                                color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
                            }
                        }
                    }
                }}
                selected={customization.isOpen.findIndex((id) => id === item.id) > -1}
                onClick={() => itemHandler(item.id)}
            >
                {item.id === 'loadChatflow' && <input type='file' hidden accept='.json' onChange={(e) => handleFileUpload(e)} />}

                <Box display='flex' flexDirection='row' alignItems='center'>
                    <ListItemIcon sx={{ my: 'auto', minWidth: !item?.icon ? 18 : 36 }}>{itemIcon}</ListItemIcon>
                    {customization.menu_open && (
                        <ListItemText
                            primary={
                                <Typography
                                    sx={{ fontWeight: 'semibold !important' }}
                                    variant={customization.isOpen.findIndex((id) => id === item.id) > -1 ? 'h5' : 'body1'}
                                    color='inherit'
                                >
                                    {item.title}
                                </Typography>
                            }
                            secondary={
                                item.caption && (
                                    <Typography variant='caption' sx={{ ...theme.typography.subMenuCaption }} display='block' gutterBottom>
                                        {item.caption}
                                    </Typography>
                                )
                            }
                        />
                    )}
                </Box>
                {item.chip && (
                    <Chip
                        color={item.chip.color}
                        variant={item.chip.variant}
                        size={item.chip.size}
                        label={item.chip.label}
                        avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
                    />
                )}
            </ListItemButton>
        </Box>
    )
}

NavItem.propTypes = {
    item: PropTypes.object,
    level: PropTypes.number,
    navType: PropTypes.string,
    onClick: PropTypes.func,
    onUploadFile: PropTypes.func
}

export default NavItem
