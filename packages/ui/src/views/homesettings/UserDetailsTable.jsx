import { useSelector } from 'react-redux'
import { Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Button } from '@mui/material'

const UserDetailsTable = () => {
    const user = useSelector((state) => state.user.userData)
    const customization = useSelector((state) => state.customization)

    // Extracting required fields from the user object
    const userFields = [
        { label: 'Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Company', value: user.company },
        { label: 'Workspace', value: user.workspace }
    ]

    return (
        <TableContainer
            component={Paper}
            className={customization.isDarkMode ? 'table-dark-mode' : 'table-light-mode'}
            sx={{ marginTop: '20px', padding: '16px', maxHeight: '500px', border: '1px solid gray' }}
        >
            <Typography
                variant='h3'
                sx={{
                    fontFamily: 'Cambria Math',
                    fontWeight: 'bold',
                    color: customization.isDarkMode ? '#E22A90' : '#3c5ba4',
                    marginBottom: '5px'
                }}
            >
                User Details
            </Typography>
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
                                {(field.label === 'Name' || field.label === 'Email') && (
                                    <Button
                                        variant='contained'
                                        className={customization.isDarkMode ? 'button-edit-dark' : 'button-edit-light'}
                                        // sx={{backgroundColor:customization.isDarkMode?"#e22a90":"#3c5ba4"}}
                                        onClick={() => handleUpdate(field)}
                                    >
                                        edit
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default UserDetailsTable
