import { useRef, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import { useSelector } from 'react-redux'
import { Typography, Box } from '@mui/material'
import './ImageUpload.css'
import axios from 'axios'
import CreateIcon from '@mui/icons-material/Create'

function ImageUpload() {
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)
    const inputRef = useRef(null)
    const pic = user.picture
    const [showImage, setShowImage] = useState(pic || '')
    const userName = user.name || ''
    const splitted = userName.split(' ')
    const profileName = splitted
        .filter((_, id, arr) => id === 0 || id === arr.length - 1)
        .map((ele) => ele?.[0])
        .join('')
        ?.toUpperCase()

    const handleImageClick = () => {
        inputRef.current.click()
    }
    const handleImageChange = async (event) => {
        const file = event.target.files[0]
        const apiUrl =
            window.location.hostname === 'localhost'
                ? 'http://localhost:2000'
                : 'https://thub-web-server-2-0-378678297066.us-central1.run.app'
        if (file) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', user.uid)
            console.log(user.uid)
            for (let [key, value] of formData.entries()) {
                console.log(`${key}=>${value}`)
            }
            try {
                const response = await axios.post(`${apiUrl}/api/image-upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                console.log(response, 'response')
                if (response.data.success) {
                    setShowImage(response.data.imageUrl)
                } else {
                    console.error('Failed to upload image')
                }
            } catch (error) {
                console.error('Error uploading image:', error)
            }
        }
    }
    console.log(showImage, 'image link')

    return (
        <div className='image-parent'>
            {showImage ? (
                <Box onClick={handleImageClick}>
                    <Avatar
                        alt='G'
                        src={showImage || ''}
                        sx={{
                            width: 86,
                            height: 86,
                            border: customization.isDarkMode ? '2px solid #e22a90' : '2px solid #3c5ba4',
                            cursor: 'pointer'
                        }}
                    />
                    <input
                        type='file'
                        style={{ width: '90px', marginTop: '4px', display: 'none' }}
                        ref={inputRef}
                        onChange={handleImageChange}
                    />
                </Box>
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
                    <CreateIcon className='edit_image_icon' />
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
                    {user.subscription_type?.toUpperCase()}
                </Typography>
            </Box>
        </div>
    )
}

export default ImageUpload
