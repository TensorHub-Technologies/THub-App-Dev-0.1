import { styled } from '@mui/material/styles'
import { Fab } from '@mui/material'
import { useSelector } from 'react-redux'

// export const StyledFab = styled(Fab)(({ theme, color = 'primary' }) => ({
//     color: 'white',
//     backgroundColor: theme.palette[color].main,
//     '&:hover': {
//         backgroundColor: theme.palette[color].main,
//         backgroundImage: `linear-gradient(rgb(0 0 0/10%) 0 0)`
//     }
// }))

export const StyledFab = styled(Fab)(({ theme }) => {
    const customization = useSelector((state) => state.customization)
    return {
        color: 'white',
        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
        '&:hover': {
            backgroundImage: 'linear-gradient(to right, #3C5BA4, #E22A90)'
        }
    }
})
