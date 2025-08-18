import { useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'
import { Fab } from '@mui/material'

// StyledFab component definition
export const StyledFab = styled(Fab)(({ theme }) => {
    const customization = useSelector((state) => state.customization)
    return {
        color: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
        background: 'transparent',
        boxShadow: 'none',
        minHeight: '32px',
        height: '32px',
        width: '32px',
        transition: 'all 0.2s ease-in-out',

        position: 'relative',

        '&:hover': {
            background: 'transparent',
            boxShadow: 'none'
        },

        '&:hover::before': {
            content: '""',
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            right: '-4px',
            bottom: '-4px',
            background: 'rgba(0, 0, 0, 0.08)',
            borderRadius: '50%',
            zIndex: -1,
            transition: 'all 0.2s ease-in-out'
        },

        // Override active/focus/click states
        '&:active': {
            background: 'transparent',
            boxShadow: 'none'
        },

        '&:focus': {
            background: 'transparent',
            boxShadow: 'none'
        },

        '&:active::before': {
            background: 'rgba(0, 0, 0, 0.12)'
        },

        // Disable ripple effect colors
        '& .MuiTouchRipple-root': {
            color: 'rgba(0, 0, 0, 0.1)' // Light ripple color
        },

        '&.Mui-disabled': {
            background: 'transparent',
            color: 'gray',
            minHeight: '0px',
            height: '32px',
            width: '32px',
            cursor: 'not-allowed'
        }
    }
})
