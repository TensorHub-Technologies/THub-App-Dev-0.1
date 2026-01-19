import { useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Chip,
    Grid
} from '@mui/material'
import { IconKey, IconEdit, IconTrash, IconPlus, IconAlertTriangle } from '@tabler/icons-react'
import MainCard from '@/ui-component/cards/MainCard'
// API
import useApi from '@/hooks/useApi'
import executionsApi from '@/api/executions'
import { useSelector } from 'react-redux'
import TokenConsumptionCard from './TokenConsumptionCard'
import UserDashboard from './UserDashboard'
import WorkspacesDashboard from './WorkspacesDashboard'

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState(0)
    const [deleteUserDialog, setDeleteUserDialog] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [reassignWorkspace, setReassignWorkspace] = useState('')
    const customization = useSelector((state) => state.customization)

    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData?.uid || localStorage.getItem('userId')

    const latencyData = {
        avg: 245,
        p95: 450,
        p99: 680,
        topAgents: [
            { name: 'DataProcessor', latency: 180 },
            { name: 'ContentGen', latency: 320 },
            { name: 'Analyzer', latency: 290 }
        ]
    }

    const workspaces = [
        { id: 1, name: 'Production', active: true, important: true },
        { id: 2, name: 'Staging', active: true, important: false },
        { id: 3, name: 'Development', active: false, important: false }
    ]

    const executions1 = [
        {
            id: 1,
            agent: 'DataProcessor',
            workspace: 'Production',
            user: 'john@example.com',
            timestamp: '2024-12-18 14:23',
            duration: '2.3s',
            tokens: 1250,
            status: 'success'
        },
        {
            id: 2,
            agent: 'ContentGen',
            workspace: 'Staging',
            user: 'sarah@example.com',
            timestamp: '2024-12-18 14:20',
            duration: '3.8s',
            tokens: 2100,
            status: 'success'
        },
        {
            id: 3,
            agent: 'Analyzer',
            workspace: 'Production',
            user: 'mike@example.com',
            timestamp: '2024-12-18 14:18',
            duration: '1.9s',
            tokens: 890,
            status: 'failed'
        },
        {
            id: 4,
            agent: 'DataProcessor',
            workspace: 'Development',
            user: 'john@example.com',
            timestamp: '2024-12-18 14:15',
            duration: '2.1s',
            tokens: 1100,
            status: 'success'
        }
    ]

    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', workspaces: 3, role: 'Admin' },
        { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', workspaces: 2, role: 'User' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', workspaces: 1, role: 'User' }
    ]

    const credentials = [
        { id: 1, name: 'OpenAI API Key', type: 'API Key', value: '••••••••••••3a2b', lastUsed: '2024-12-18' },
        { id: 2, name: 'AWS Credentials', type: 'Access Key', value: '••••••••••••7x9z', lastUsed: '2024-12-17' },
        { id: 3, name: 'Database Password', type: 'Password', value: '••••••••••••4k1m', lastUsed: '2024-12-16' }
    ]

    const handleDeleteUser = (user) => {
        setSelectedUser(user)
        setDeleteUserDialog(true)
    }

    const confirmDeleteUser = () => {
        console.log('Deleting user:', selectedUser, 'Reassigning to:', reassignWorkspace)
        setDeleteUserDialog(false)
        setSelectedUser(null)
        setReassignWorkspace('')
    }

    // Overview Tab
    const OverviewTab = () => (
        <Grid container spacing={3}>
            <TokenConsumptionCard tenantId={tenantId} executionsApi={executionsApi} useApi={useApi} />
        </Grid>
    )
    // Users Tab
    const UsersTab = () => (
        <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <CardContent>
                <UserDashboard />
            </CardContent>
        </Card>
    )

    // Workspaces Tab
    const WorkspacesTab = () => (
        <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <CardContent>
                <WorkspacesDashboard />
            </CardContent>
        </Card>
    )

    // Credentials Tab
    const CredentialsTab = () => (
        <Box>
            <Alert severity='warning' icon={<IconAlertTriangle />} sx={{ mb: 3, backgroundColor: 'transparent' }}>
                Organization-level credentials are shared across all workspaces. Handle with care.
            </Alert>
            <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <CardContent>
                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                        <Typography variant='h6'>Credentials</Typography>
                        <Button variant='contained' startIcon={<IconPlus size={18} />}>
                            Add Credential
                        </Button>
                    </Box>
                    <TableContainer sx={{ backgroundColor: 'transparent' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Last Used</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {credentials.map((cred) => (
                                    <TableRow key={cred.id}>
                                        <TableCell>{cred.name}</TableCell>
                                        <TableCell>
                                            <Chip label={cred.type} size='small' />
                                        </TableCell>
                                        <TableCell>
                                            <Box display='flex' alignItems='center'>
                                                <IconKey size={16} style={{ marginRight: 4 }} />
                                                <Typography variant='body2' fontFamily='monospace'>
                                                    {cred.value}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{cred.lastUsed}</TableCell>
                                        <TableCell>
                                            <IconButton size='small'>
                                                <IconEdit size={18} />
                                            </IconButton>
                                            <IconButton size='small' color='error'>
                                                <IconTrash size={18} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    )

    return (
        <>
            <MainCard>
                <h1
                    style={{
                        background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                        WebkitBackgroundClip: 'text',
                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                        fontSize: '24px',
                        lineHeight: '1.3',
                        fontFamily: 'cambria math',
                        marginLeft: '15px'
                    }}
                >
                    Dashboard
                </h1>

                <Paper sx={{ mb: 3, backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                padding: '0px'
                            }
                        }}
                    >
                        <Tab
                            label='Overview'
                            sx={{
                                minHeight: '50px',
                                height: '50px',
                                color: customization.isDarkMode ? '#fff' : '#000',
                                '&.Mui-selected': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },
                                '&:hover': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },
                                padding: '0px',
                                marginRight: 2
                            }}
                        />

                        <Tab
                            label='Users'
                            sx={{
                                minHeight: '50px',
                                height: '50px',
                                color: customization.isDarkMode ? '#fff' : '#000',
                                '&.Mui-selected': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },
                                '&:hover': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },
                                padding: '0px',
                                marginRight: 2
                            }}
                        />

                        {/* 🔐 Only Superadmin sees Organization */}
                        {userData?.role === 'superadmin' && (
                            <Tab
                                label='Organizations'
                                sx={{
                                    minHeight: '50px',
                                    height: '50px',
                                    color: customization.isDarkMode ? '#fff' : '#000',
                                    '&.Mui-selected': {
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    },
                                    '&:hover': {
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    },
                                    padding: '0px',
                                    marginRight: 2
                                }}
                            />
                        )}

                        <Tab
                            label='Credentials'
                            sx={{
                                minHeight: '50px',
                                height: '50px',
                                color: customization.isDarkMode ? '#fff' : '#000',
                                '&.Mui-selected': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },
                                '&:hover': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },
                                padding: '0px',
                                marginRight: 2
                            }}
                        />
                    </Tabs>
                </Paper>

                {activeTab === 0 && <OverviewTab />}
                {activeTab === 1 && <UsersTab />}

                {/* If superadmin, tab index 2 is Organization */}
                {userData?.role === 'superadmin' && activeTab === 2 && <WorkspacesTab />}

                {/* Credentials index depends on role */}
                {((userData?.role === 'superadmin' && activeTab === 3) || (userData?.role !== 'superadmin' && activeTab === 2)) && (
                    <CredentialsTab />
                )}

                {/* Delete User Dialog */}
                {/* Delete User Dialog */}
                <Dialog open={deleteUserDialog} onClose={() => setDeleteUserDialog(false)}>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogContent>
                        <Typography variant='body2' mb={2}>
                            User &quot;{selectedUser?.name}&quot; has {selectedUser?.workspaces} workspace(s). Please reassign them before
                            deletion.
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Reassign Workspaces To</InputLabel>
                            <Select
                                value={reassignWorkspace}
                                onChange={(e) => setReassignWorkspace(e.target.value)}
                                label='Reassign Workspaces To'
                            >
                                {users
                                    .filter((u) => u.id !== selectedUser?.id)
                                    .map((u) => (
                                        <MenuItem key={u.id} value={u.email}>
                                            {u.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteUserDialog(false)}>Cancel</Button>
                        <Button onClick={confirmDeleteUser} color='error' variant='contained'>
                            Delete User
                        </Button>
                    </DialogActions>
                </Dialog>
            </MainCard>
        </>
    )
}

export default Dashboard
