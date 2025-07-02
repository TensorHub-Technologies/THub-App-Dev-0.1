// material-ui
import { Typography } from '@mui/material'
import { useSelector } from 'react-redux'

// project imports
import NavGroup from './NavGroup'
import menuItem from '@/menu-items'

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
    const userData = useSelector((state) => state.user.userData)
    const subscription = userData?.subscription_type

    const filteredItems = menuItem.items.map((item) => {
        if (item.children && Array.isArray(item.children)) {
            const filteredChildren = item.children.filter((child) => {
                if (subscription === 'free' && (child.id === 'agentflows' || child.id === 'executions')) {
                    return false
                }
                return true
            })

            return {
                ...item,
                children: filteredChildren
            }
        }

        return item
    })

    const navItems = filteredItems.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} />
            default:
                return (
                    <Typography key={item.id} variant='h6' color='error' align='center'>
                        Menu Items Error
                    </Typography>
                )
        }
    })

    return <>{navItems}</>
}

export default MenuList
