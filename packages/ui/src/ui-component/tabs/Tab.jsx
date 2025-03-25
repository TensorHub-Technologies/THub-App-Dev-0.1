import { styled } from '@mui/system'
import { buttonClasses } from '@mui/base/Button'
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab'
import { useSelector } from 'react-redux'

export const Tab = styled(BaseTab)(({ ...props }) => {
    const customization = useSelector((state) => state.customization)
    return `
  font-family: 'IBM Plex Sans', sans-serif;
  color: ${customization?.isDarkMode ? '#fff' : '000'};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: transparent;
  width: 100%;
  line-height: 1.5;
  padding: 8px 12px;
  margin: 6px;
  border: none;
  border-radius: 25px;
  display: flex;
  justify-content: center;

  

  &.${tabClasses.selected} {
    background-color:${customization?.isDarkMode ? '#23262c' : '#fff'};
    color: ${customization?.isDarkMode ? '#fff' : '000'};
  }

  &.${buttonClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
 `
})
