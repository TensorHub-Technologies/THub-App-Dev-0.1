import { useDispatch, useSelector } from 'react-redux'
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Tooltip, Button } from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import './UserDetailsTable.css'
import { useState } from 'react'
import axios from 'axios'
import { updateUserField } from '@/store/actions'

import toast, { Toaster } from 'react-hot-toast'

const UserDetailsTable = () => {
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)
    const [editField, setEditField] = useState(null)
    const [editValue, setEditValue] = useState('')
    const dispatch = useDispatch()

    const userFields = [
        { label: 'Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Company', value: user.company },
        { label: 'Workspace', value: user.workspace },
        { label: 'Department', value: user.department }
    ]

    const handleEditClick = (field) => {
        setEditField(field)
        setEditValue(user[field.toLowerCase()])
    }

    const handleSave = async () => {
        const url =
            window.location.hostname === 'localhost'
                ? 'http://localhost:2000'
                : 'https://thub-web-server-2-0-378678297066.us-central1.run.app'

        const payload = {
            field: editField.toLowerCase(),
            value: editValue,
            userId: user.uid
        }

        const updateRequest = axios.put(`${url}/api/users/update`, payload)

        toast.promise(
            updateRequest
                .then((response) => {
                    if (response.status === 200) {
                        dispatch(updateUserField({ field: editField.toLowerCase(), value: editValue }))
                        return 'Saved successfully!'
                    } else {
                        throw new Error('Error saving.')
                    }
                })
                .catch((error) => {
                    throw new Error(error.response?.data?.message || 'Unknown error')
                }),
            {
                loading: 'Saving...',
                success: (message) => message,
                error: (err) => `Error saving: ${err.message || 'Unknown error'}`
            }
        )

        try {
            await updateRequest
            setEditField(null)
            setEditValue('')
        } catch (error) {
            console.error('Error updating field:', error)
        }
    }

    return (
        <>
            <Toaster position='top-right' reverseOrder={false} />
            <TableContainer
                component={Paper}
                className={customization.isDarkMode ? 'table-dark-mode' : 'table-light-mode'}
                sx={{ marginTop: '16px', padding: '16px', maxHeight: '600px', border: '1px solid gray' }}
            >
                <Table stickyHeader>
                    <TableBody>
                        {userFields.map((field, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ fontFamily: 'Cambria Math', padding: '16px 16px 0px 16px', fontSize: '18px' }}>
                                    {field.label}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'Cambria Math', padding: '16px 16px 0px 16px', fontSize: '18px' }}>
                                    {editField === field.label ? (
                                        <input
                                            type='text'
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    ) : (
                                        field.value || 'N/A'
                                    )}
                                </TableCell>
                                <TableCell sx={{ padding: '16px 16px 0px 16px', fontSize: '18px' }}>
                                    <Tooltip title={editField === field.label ? 'Save' : 'Edit'}>
                                        {(field.label === 'Name' || field.label === 'Department') &&
                                            (editField === field.label ? (
                                                <Button
                                                    variant='contained'
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontFamily: 'Cambria, serif',
                                                        backgroundColor: '#E22A90',
                                                        padding: '0px',
                                                        marginBottom: '4px'
                                                    }}
                                                    className={customization.isDarkMode ? 'button-upgrade-dark' : 'button-upgrade-light'}
                                                    onClick={handleSave}
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <CreateIcon
                                                    onClick={() => handleEditClick(field.label)}
                                                    className={customization.isDarkMode ? 'edit-dark' : 'edit-light'}
                                                />
                                            ))}
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default UserDetailsTable
