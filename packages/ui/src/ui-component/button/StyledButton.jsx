import { styled } from '@mui/material/styles'
import { Button } from '@mui/material'
import MuiToggleButton from '@mui/material/ToggleButton'
import { useSelector } from 'react-redux'

export const StyledButton = styled(Button)(({ theme }) => {
    const customization = useSelector((state) => state.customization)

    return {
        color: 'white',
        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
        '&:hover': {
            backgroundImage: 'linear-gradient(to right, #3C5BA4, #E22A90)'
        }
    }
})

export const StyledToggleButton = styled(MuiToggleButton)(({ theme }) => ({
    '&.Mui-selected, &.Mui-selected:hover': {
        color: 'white',
        backgroundColor: 'linear-gradient(to left, #E22A90, #3C5BA4)'
    }
}))
