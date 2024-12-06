import { useRef, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import { useSelector } from 'react-redux'
import { Typography, Box, Button } from '@mui/material'
import './ImageUpload.css'

function ImageUpload() {
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)
    const inputRef = useRef(null)
    const [showImage, setShowImage] = useState(user.picture || '')
    const splitted = user.name.split(' ')
    const profileName = splitted
        .filter((_, id, arr) => id === 0 || id === arr.length - 1)
        .map((ele) => ele[0])
        .join('')
        .toUpperCase()

    const handleImageClick = () => {
        inputRef.current.click()
    }

    const handleImageChange = (event) => {
        const file = event.target.files
        console.log(file)
        setShowImage(file)
    }

    return (
        <div className='image-parent'>
            {showImage ? (
                <Avatar
                    alt='G'
                    src={user.picture || ''}
                    sx={{ width: 86, height: 86, border: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4' }}
                />
            ) : (
                <Box onClick={handleImageClick}>
                    <Avatar
                        sx={{
                            width: 86,
                            height: 86,
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            border: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4',
                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                            fontSize: '38px',
                            fontFamily: 'cambria math',
                            fontWeight: 'bolder'
                        }}
                    >
                        {profileName}
                    </Avatar>
                    <Button
                        variant='contained'
                        sx={{ textTransform: 'none', fontFamily: 'Cambria, serif', backgroundColor: '#E22A90' }}
                        className={customization.isDarkMode ? 'button-upgrade-dark' : 'button-upgrade-light'}
                    >
                        edit
                    </Button>
                    <input
                        type='file'
                        style={{ width: '90px', marginTop: '4px', display: 'none' }}
                        ref={inputRef}
                        onChange={handleImageChange}
                    />
                </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <h3 style={{ fontFamily: 'cambria math' }}>{user.name}</h3>
                <Typography
                    variant='h5'
                    gutterBottom
                    sx={{ fontFamily: 'Cambria math', fontWeight: 'bold' }}
                    className={customization.isDarkMode ? 'typography-plan-dark' : 'typography-plan-light'}
                >
                    {user.subscription_type.toUpperCase()}
                </Typography>
            </Box>
        </div>
    )
}

export default ImageUpload
