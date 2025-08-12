import PropTypes from 'prop-types'
import { forwardRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Chip, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material'

// project imports
import { MENU_OPEN, SET_MENU } from '@/store/actions'
import config from '@/config'

// assets
import { IconCircleFilled } from '@tabler/icons-react'

const NavItem = ({ item, level, navType, onClick, onUploadFile }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)
    const matchesSM = useMediaQuery(theme.breakpoints.down('lg'))
    const [hovered, setHovered] = useState(false)
    const baseColor = customization?.isDarkMode ? '#fff' : '#000'
    const hoverColor = customization?.isDarkMode ? '#E22A90' : '#3C5BA4'
    const Icon = item.icon
    const itemIcon = item?.icon ? (
        <Icon
            className='icon-hover'
            stroke={1.5}
            size='1.3rem'
            color={hovered ? hoverColor : baseColor}
            style={{
                width: '30px',
                height: '36px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '8px',
                background: 'transparent',
                borderRadius: '20%',
                padding: '1px'
            }}
        />
    ) : (
        <IconCircleFilled
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

    const listItemProps = useMemo(() => {
        let props = {
            component: forwardRef(function ListItemPropsComponent(props, ref) {
                return <Link ref={ref} {...props} to={`${config.basename}${item.url}`} target={itemTarget} />
            })
        }

        if (item?.external) {
            props = { component: 'a', href: item.url, target: itemTarget }
        }
        if (item?.id === 'loadChatflow') {
            props.component = 'label'
        }

        return props
    }, [item, itemTarget])

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
    }, [navType, item.id, dispatch])

    return (
        <Box
            sx={{
                transition: 'width .4s, box-shadow .4s',
                borderRadius: `${customization.borderRadius}px`,
                p: 0.1,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // border:"2px solid red",
                backgroundColor: 'transparent !important',
                // backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
                '&:hover': {
                    background: `linear-gradient(to right, #3C5BA4, #E22A90) !important`,
                    '& .MuiListItemButton-root': {
                        backgroundColor: theme.palette.background.default,
                        color: customization?.isDarkMode ? '#fff' : '#000',
                        '& .icon-hover': {
                            color: customization?.isDarkMode ? '#e22a90' : '#3c5ba4'
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
                sx={{
                    borderRadius: `${customization.borderRadius}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    // backgroundColor: theme.palette.background.default,
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
                                color: customization?.isDarkMode ? '#e22a90' : '#3c5ba4'
                            }
                        }
                    }
                }}
                selected={customization.isOpen.findIndex((id) => id === item.id) > -1}
                onClick={() => itemHandler(item.id)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {item.id === 'loadChatflow' && <input type='file' hidden accept='.json' onChange={(e) => handleFileUpload(e)} />}

                <Box
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                    justify-content='space-between'
                    width='100%'
                    color={customization?.isDarkMode ? '#fff' : '#000'}
                >
                    <ListItemIcon sx={{ my: 'auto', minWidth: !item?.icon ? 10 : 36, marginRight: '8px', marginLeft: '3px' }}>
                        {itemIcon}
                    </ListItemIcon>
                    {customization.menu_open && (
                        <ListItemText
                            primary={
                                <Typography
                                    sx={{
                                        fontWeight: 'semibold !important',
                                        flex: '1',
                                        textAlign: 'left'
                                    }}
                                    variant={customization.isOpen.findIndex((id) => id === item.id) > -1 ? 'h5' : 'body1'}
                                    color={hovered ? hoverColor : baseColor}
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
                            // sx={{
                            //     '&:hover': {
                            //         color: customization?.isDarkMode ? '#e22a90' : '#3c5ba4'
                            //     }
                            // }}
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
