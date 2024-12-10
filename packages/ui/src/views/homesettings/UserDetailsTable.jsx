import { useSelector } from 'react-redux'
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Tooltip } from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import './UserDetailsTable.css'

const UserDetailsTable = () => {
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)

    const userFields = [
        { label: 'Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Company', value: user.company },
        { label: 'Workspace', value: user.workspace },
        { label: 'Department', value: user.department }
    ]

    return (
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
                                {field.value || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ padding: '16px 16px 0px 16px', fontSize: '18px' }}>
                                <Tooltip title='edit'>
                                    {(field.label === 'Name' || field.label === 'Department') && (
                                        <CreateIcon className={customization.isDarkMode ? 'edit-dark' : 'edit-light'} />
                                    )}
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default UserDetailsTable
