import { useSelector } from 'react-redux'
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

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
            sx={{ marginTop: '20px', padding: '16px', maxHeight: '500px' }}
        >
            <Typography
                variant='h4'
                sx={{
                    fontFamily: 'Cambria, serif',
                    fontWeight: 'bold',
                    color: customization.isDarkMode ? '#E22A90' : '#3c5ba4',
                    marginBottom: '5px'
                }}
            >
                User Details
            </Typography>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontFamily: 'Cambria, serif',
                                backgroundColor: customization.isDarkMode ? '#23262C' : 'white'
                            }}
                        >
                            Field
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontFamily: 'Cambria, serif',
                                backgroundColor: customization.isDarkMode ? '#23262C' : 'white'
                            }}
                        >
                            Details
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {userFields.map((field, index) => (
                        <TableRow key={index}>
                            <TableCell sx={{ fontFamily: 'Cambria, serif' }}>{field.label}</TableCell>
                            <TableCell sx={{ fontFamily: 'Cambria, serif' }}>{field.value || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default UserDetailsTable
