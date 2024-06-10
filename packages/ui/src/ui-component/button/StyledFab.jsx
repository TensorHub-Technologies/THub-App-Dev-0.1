import { useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'
import { Fab } from '@mui/material'

// StyledFab component definition
export const StyledFab = styled(Fab)(({ theme }) => {
    const customization = useSelector((state) => state.customization)
    return {
        color: 'white',
        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
        '&:hover': {
            background: 'transparent'
        },
        '&.Mui-disabled': {
            background: 'grey',
            color: '#fff',
            cursor: 'not-allowed'
        }
    }
})
