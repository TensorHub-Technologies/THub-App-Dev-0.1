import { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography, TextField, Button } from '@mui/material'

const A2ASerever = () => {
    // Initial form state
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        org: '',
        url: ''
    })

    // Handle field changes
    const handleChange = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = () => {
        console.log('Form submitted:', formValues)
        // TODO: send formValues to API or parent
    }

    return (
        <Box>
            <Typography variant='h4' sx={{ mb: 2 }}>
                Agent Card
            </Typography>

            <TextField
                label='Name'
                fullWidth
                size='medium'
                value={formValues.name}
                onChange={(e) => handleChange('name', e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                label='Description'
                fullWidth
                size='medium'
                value={formValues.description}
                onChange={(e) => handleChange('description', e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                label='Provider Organization'
                fullWidth
                size='medium'
                value={formValues.providerOrg}
                onChange={(e) => handleChange('url', e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                label='Provider URL'
                fullWidth
                size='medium'
                value={formValues.providerUrl}
                onChange={(e) => handleChange('providerUrl', e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button variant='contained' onClick={handleSubmit} sx={{ mt: 3 }}>
                Save Agent Card
            </Button>
        </Box>
    )
}

A2ASerever.propTypes = {
    dialogProps: PropTypes.object
}

export default A2ASerever
