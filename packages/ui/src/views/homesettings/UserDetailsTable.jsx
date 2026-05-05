import { useDispatch, useSelector } from 'react-redux'
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Tooltip, Button } from '@mui/material'
import { IconEdit } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import MainCard from '@/ui-component/cards/MainCard'
import { updateUserField, SET_USER_DATA } from '@/store/actions'
import './UserDetailsTable.css'

const UserDetailsTable = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)

    const [editField, setEditField] = useState(null)
    const [editValue, setEditValue] = useState('')

    // -----------------------
    // API BASE
    // -----------------------
    const apiUrl =
        window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : window.location.hostname === 'dev.thub.tech'
            ? 'https://thub-server.calmisland-c4dd80be.westus2.azurecontainerapps.io'
            : window.location.hostname === 'qa.thub.tech'
            ? 'https://thub-server.lemonpond-e68ea8b7.westus2.azurecontainerapps.io'
            : 'https://thub-server.wittycoast-8619cdd6.westus2.azurecontainerapps.io'

    // -----------------------
    // 🔥 HYDRATE USER FROM /workspaceUsers
    // -----------------------
    useEffect(() => {
        if (!user?.uid || !user?.workspace) return

        const hydrateUser = async () => {
            try {
                const res = await axios.get(`${apiUrl}/workspaceUsers`, {
                    params: { workspace: user.workspace }
                })

                const fullUser = res.data.find((u) => u.uid === user.uid)

                if (fullUser) {
                    dispatch({
                        type: SET_USER_DATA,
                        payload: {
                            ...user,
                            ...fullUser
                        }
                    })
                }
            } catch (err) {
                console.error('Failed to hydrate user from workspaceUsers', err)
            }
        }

        hydrateUser()
    }, [user?.uid, user?.workspace])

    // -----------------------
    // FIELD CONFIG
    // -----------------------
    const userFields = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Company', key: 'company' },
        { label: 'Workspace', key: 'workspace' },
        { label: 'Department', key: 'department' }
    ]

    // -----------------------
    // EDIT
    // -----------------------
    const handleEditClick = (field) => {
        setEditField(field.key)
        setEditValue(user?.[field.key] || '')
    }

    // -----------------------
    // SAVE
    // -----------------------
    const handleSave = async () => {
        const payload = {
            field: editField,
            value: editValue,
            userId: user.uid
        }

        const request = axios.post(`${apiUrl}/api/users/update`, payload)

        toast.promise(request, {
            loading: 'Saving...',
            success: 'Saved successfully!',
            error: (err) => err.response?.data?.message || 'Failed to save'
        })

        try {
            await request

            dispatch(updateUserField({ field: editField, value: editValue }))

            setEditField(null)
            setEditValue('')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <MainCard>
            <Toaster position='top-right' />
            <TableContainer
                component={Paper}
                className={customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'}
                sx={{ mt: 2, p: 2, border: '1px solid gray' }}
            >
                <Table>
                    <TableBody>
                        {userFields.map((field) => {
                            const isEditable = field.key === 'name' || field.key === 'department'

                            return (
                                <TableRow key={field.key}>
                                    <TableCell sx={{ fontFamily: 'Cambria Math', fontSize: 18 }}>{field.label}</TableCell>

                                    <TableCell sx={{ fontFamily: 'Cambria Math', fontSize: 18 }}>
                                        {editField === field.key ? (
                                            <input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            user?.[field.key] ?? 'N/A'
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {isEditable && (
                                            <Tooltip title={editField === field.key ? 'Save' : 'Edit'}>
                                                {editField === field.key ? (
                                                    <Button
                                                        variant='contained'
                                                        size='small'
                                                        onClick={handleSave}
                                                        sx={{
                                                            textTransform: 'none',
                                                            backgroundColor: '#E22A90'
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <IconEdit
                                                        className={customization.isDarkMode ? 'edit-dark' : 'edit-light'}
                                                        onClick={() => handleEditClick(field)}
                                                    />
                                                )}
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainCard>
    )
}

export default UserDetailsTable
