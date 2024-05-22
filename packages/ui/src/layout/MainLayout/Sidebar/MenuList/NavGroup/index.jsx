import PropTypes from 'prop-types'

import { useTheme } from '@mui/material/styles'
import { Divider, List, Typography } from '@mui/material'

// project imports

import NavItem from '../NavItem'
import NavCollapse from '../NavCollapse'
import { useSelector, useDispatch } from 'react-redux'

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

const NavGroup = ({ item }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    console.log('customization', customization)

    // menu list collapse & items
    const items = item.children?.map((menu) => {
        switch (menu.type) {
            case 'collapse':
                return <NavCollapse key={menu.id} menu={menu} level={1} />
            case 'item':
                return <NavItem key={menu.id} item={menu} level={1} navType='MENU' />
            default:
                return (
                    <Typography key={menu.id} variant='h6' color='error' align='center'>
                        Menu Items Error
                    </Typography>
                )
        }
    })

    console.log(customization.menu_open, 'SHOW_MENU')

    return (
        <>
            <List
                subheader={
                    item.title && (
                        <Typography variant='caption' sx={{ ...theme.typography.menuCaption }} display='block' gutterBottom>
                            {item.title}
                            {item.caption && (
                                <Typography variant='caption' sx={{ ...theme.typography.subMenuCaption }} display='block' gutterBottom>
                                    {item.caption}
                                </Typography>
                            )}
                        </Typography>
                    )
                }
            >
                {items}
            </List>

            {/* <ButtonBase title='Toggle' sx={{ marginLeft: customization.menu_open ? "195px" : "50px", marginTop: customization.menu_open ? "-700px" : "-700px" }}
                                    onClick={() => dispatch({ type: SHOW_MENU })}>
                                    <Avatar className='sideAvatar1'
                                        variant='rounded'
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            // background: theme.palette.canvasHeader.settingsLight,
                                            background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                            // color: theme.palette.canvasHeader.settingsDark,
                                            color: '#fff',
                                            '&:hover': {
                                                // background: theme.palette.canvasHeader.settingsDark,
                                                // background: 'linear-gradient(to left, #E22A90, #3C5BA4)',
                                                // color: theme.palette.canvasHeader.settingsLight
                                                // color: '#fff'
                                            }
                                        }}
                                      
                                    >
                                        
                                        <KeyboardArrowRightIcon stroke={1.5} size='1.3rem' sx={{ background: customization.isDarkMode ? '#E22A90' : '#3C5BA4' }} />
                                    </Avatar>
                                </ButtonBase> */}
            {/* group divider */}
            <Divider sx={{ mt: 0.25, mb: 1.25 }} />
        </>
    )
}

NavGroup.propTypes = {
    item: PropTypes.object
}

export default NavGroup
