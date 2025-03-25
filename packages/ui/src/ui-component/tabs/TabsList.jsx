import { styled } from '@mui/system'
import { TabsList as BaseTabsList } from '@mui/base/TabsList'
import { useSelector } from 'react-redux'

export const TabsList = styled(BaseTabsList)(({ theme, ...props }) => {
    const customization = useSelector((state) => state.customization)

    return `
    min-width: 400px;
    background-color: ${customization?.isDarkMode ? '#e22a90' : '#3c5ba4'};
    border-radius: 20px;
    margin-top: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-content: space-between;
    box-shadow: 0px 4px 6px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.4)' : 'rgba(0,0,0, 0.2)'};
    `
})
