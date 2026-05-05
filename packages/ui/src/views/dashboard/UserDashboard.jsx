import {
    Card,
    CardContent,
    Box,
    Typography,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    Skeleton
} from '@mui/material'
import { IconPlus, IconTrash, IconCrown, IconX } from '@tabler/icons-react'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import authApi from '@/api/auth'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import useNotifier from '@/utils/useNotifier'

const UserDashboard = () => {
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)
    const userData = useSelector((state) => state.user.userData)
    const isDark = customization.isDarkMode

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const hasWorkspace = Boolean(userData?.workspace)
    const isAdmin = userData?.role === 'admin' && hasWorkspace

    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(true)

    const [inviteOpen, setInviteOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    const [transferOpen, setTransferOpen] = useState(false)
    const [transferUser, setTransferUser] = useState(null)

    // -------------------------------
    // Fetch users (safe for deleted workspace)
    // -------------------------------
    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            if (!hasWorkspace) {
                setUsers([userData])
                return
            }

            const res = await authApi.getWorkspaceUsers(userData.workspace)

            setUsers(res.data)
        } catch {
            setUsers([userData])
        } finally {
            setLoadingUsers(false)
        }
    }

    useEffect(() => {
        if (userData?.uid) fetchUsers()
    }, [userData?.workspace])

    // -------------------------------
    // Invite
    // -------------------------------
    const handleInvite = async () => {
        setLoading(true)
        try {
            await authApi.inviteUser({
                email,
                workspace: userData.workspace,
                invitedBy: userData.uid,
                role: 'member'
            })
            setInviteOpen(false)
            setEmail('')
            enqueueSnackbar({
                message: `Invitation sent successfully to ${email}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            fetchUsers()
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send invitation'
            enqueueSnackbar({
                message: errorMessage,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        } finally {
            setLoading(false)
        }
    }

    // -------------------------------
    // Delete
    // -------------------------------
    const handleConfirmDelete = async () => {
        try {
            await authApi.deleteWorkspaceUser({ userId: selectedUser.uid, workspace: userData.workspace })
            setConfirmOpen(false)
            enqueueSnackbar({
                message: `${selectedUser.name} has been removed successfully`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            fetchUsers()
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to remove user'
            enqueueSnackbar({
                message: errorMessage,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            setConfirmOpen(false)
        }
    }

    // -------------------------------
    // Transfer admin
    // -------------------------------
    const handleTransferAdmin = async () => {
        try {
            await authApi.transferWorkspaceAdmin({
                fromUserId: userData.uid,
                toUserId: transferUser.uid,
                workspace: userData.workspace
            })
            setTransferOpen(false)
            enqueueSnackbar({
                message: `Admin role transferred to ${transferUser.name} successfully`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'success',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            fetchUsers()
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to transfer admin role'
            enqueueSnackbar({
                message: errorMessage,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
            setTransferOpen(false)
        }
    }

    // -------------------------------
    // Skeleton card (same layout)
    // -------------------------------
    const SkeletonCard = () => (
        <Box
            sx={{
                borderRadius: 3,
                px: 4,
                py: 3,
                backdropFilter: 'blur(18px)',
                backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr',
                    mb: 1
                }}
            >
                {[...Array(6)].map((_, i) => (
                    <Skeleton
                        key={i}
                        variant='text'
                        width={80}
                        height={14}
                        sx={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                        }}
                    />
                ))}
            </Box>

            {/* Values */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr',
                    alignItems: 'center'
                }}
            >
                {[...Array(4)].map((_, i) => (
                    <Skeleton
                        key={i}
                        variant='text'
                        width='70%'
                        height={22}
                        sx={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                        }}
                    />
                ))}

                <Skeleton
                    variant='rounded'
                    width={90}
                    height={28}
                    sx={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                    }}
                />

                <Box display='flex' gap={2}>
                    <Skeleton
                        variant='circular'
                        width={32}
                        height={32}
                        sx={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                        }}
                    />
                    <Skeleton
                        variant='circular'
                        width={32}
                        height={32}
                        sx={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )

    return (
        <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <CardContent>
                {/* HEADER */}
                <Box display='flex' justifyContent='space-between' mb={4}>
                    <Typography
                        style={{
                            background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontSize: '24px',
                            lineHeight: '1.3'
                        }}
                    >
                        Organization: {userData.workspace || '—'}
                    </Typography>

                    {isAdmin && (
                        <StyledButton
                            variant='contained'
                            startIcon={<IconPlus />}
                            sx={{ color: 'white', height: 37 }}
                            onClick={() => setInviteOpen(true)}
                        >
                            Invite User
                        </StyledButton>
                    )}
                </Box>

                {/* USER LIST */}
                <Box display='flex' flexDirection='column' gap={3}>
                    {loadingUsers
                        ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                        : users.map((u, index) => {
                              const isSelf = u.uid === userData.uid
                              const canDelete = isAdmin && u.role === 'member' && !isSelf
                              const canTransfer = isAdmin && u.role === 'member'

                              return (
                                  <Box
                                      key={u.uid}
                                      sx={{
                                          animation: 'float 6s ease-in-out infinite',
                                          animationDelay: `${index * 0.1}s`,
                                          '@keyframes float': {
                                              '0%,100%': { transform: 'translateY(0px)' },
                                              '50%': { transform: 'translateY(-6px)' }
                                          },
                                          '&:hover': { transform: 'translateY(-4px)' }
                                      }}
                                  >
                                      {/* CARD */}
                                      <Box
                                          sx={{
                                              px: 4,
                                              py: 3,
                                              border: '1px solid',
                                              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                              borderRadius: '12px',
                                              backdropFilter: 'blur(16px)',
                                              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                              position: 'relative',
                                              overflow: 'hidden',
                                              '&:hover .glow': { opacity: 1 }
                                          }}
                                      >
                                          {/* HEADER */}
                                          <Box
                                              sx={{
                                                  display: 'grid',
                                                  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr',
                                                  mb: 1
                                              }}
                                          >
                                              {['NAME', 'COMPANY', 'DEPARTMENT', 'DESIGNATION', 'ROLE', 'ACTIONS'].map((h) => (
                                                  <Typography
                                                      key={h}
                                                      sx={{
                                                          fontFamily: 'Cambria Math',
                                                          fontSize: 11,
                                                          letterSpacing: 1,
                                                          fontWeight: 600,
                                                          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'
                                                      }}
                                                  >
                                                      {h}
                                                  </Typography>
                                              ))}
                                          </Box>

                                          {/* VALUES */}
                                          <Box
                                              sx={{
                                                  display: 'grid',
                                                  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr',
                                                  alignItems: 'center'
                                              }}
                                          >
                                              <Typography
                                                  sx={{ fontFamily: 'Cambria Math', fontWeight: 600, color: isDark ? '#fff' : '#000' }}
                                              >
                                                  {u.name}
                                              </Typography>
                                              <Typography sx={{ fontFamily: 'Cambria Math', color: isDark ? '#ffff' : '#000' }}>
                                                  {u.company}
                                              </Typography>
                                              <Typography sx={{ fontFamily: 'Cambria Math', color: isDark ? '#ffff' : '#000' }}>
                                                  {u.department}
                                              </Typography>
                                              <Typography sx={{ fontFamily: 'Cambria Math', color: isDark ? '#ffff' : '#000' }}>
                                                  {u.designation}
                                              </Typography>

                                              <Chip
                                                  label={u.role === 'admin' ? 'Admin' : 'Member'}
                                                  sx={{
                                                      width: 90,
                                                      marginLeft: -3,
                                                      fontFamily: 'Cambria Math',
                                                      background:
                                                          u.role === 'admin'
                                                              ? 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)'
                                                              : isDark
                                                              ? 'rgba(255,255,255,0.15)'
                                                              : '#e0e0e0',
                                                      color: u.role === 'admin' ? '#fff' : isDark ? '#fff' : '#555'
                                                  }}
                                              />

                                              <Box display='flex' gap={2}>
                                                  {canTransfer && (
                                                      <Tooltip title='Make Admin'>
                                                          <IconButton
                                                              onClick={() => {
                                                                  setTransferUser(u)
                                                                  setTransferOpen(true)
                                                              }}
                                                              sx={{
                                                                  color: isDark ? '#FFD700' : '#3C5BA4', // gold in dark, blue in light
                                                                  '&:hover': {
                                                                      color: isDark ? '#FFC107' : '#2F4FA0'
                                                                  }
                                                              }}
                                                          >
                                                              <IconCrown size={18} />
                                                          </IconButton>
                                                      </Tooltip>
                                                  )}
                                                  {canDelete && (
                                                      <Tooltip title='Remove User'>
                                                          <IconButton
                                                              color='error'
                                                              onClick={() => {
                                                                  setSelectedUser(u)
                                                                  setConfirmOpen(true)
                                                              }}
                                                          >
                                                              <IconTrash size={18} />
                                                          </IconButton>
                                                      </Tooltip>
                                                  )}
                                              </Box>
                                          </Box>

                                          {/* GLOW */}
                                          <Box
                                              className='glow'
                                              sx={{
                                                  position: 'absolute',
                                                  inset: 0,
                                                  background: 'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
                                                  opacity: 0,
                                                  transition: 'opacity 0.3s ease-in-out',
                                                  filter: 'blur(12px)',
                                                  zIndex: -1
                                              }}
                                          />
                                      </Box>
                                  </Box>
                              )
                          })}
                </Box>

                {/* INVITE */}
                <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth='sm' fullWidth>
                    {/* ===== Header with X Close ===== */}
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pr: 1.5,
                            background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                            WebkitBackgroundClip: 'text',
                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                            fontSize: '24px',
                            lineHeight: '1.3'
                        }}
                    >
                        Invite User
                        <IconButton
                            onClick={() => setInviteOpen(false)}
                            size='small'
                            sx={{
                                color: '#999',
                                '&:hover': {
                                    color: '#E22A90',
                                    background: 'rgba(226,42,144,0.08)'
                                }
                            }}
                        >
                            <IconX />
                        </IconButton>
                    </DialogTitle>

                    {/* ===== Content ===== */}
                    <DialogContent sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            variant='standard'
                            label='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                mt: 1,

                                /* Input text */
                                '& .MuiInputBase-root': {
                                    fontSize: 15,
                                    paddingY: '6px',
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },

                                /* Label default */
                                '& .MuiInputLabel-root': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                    fontSize: 14
                                },

                                /* Label when focused */
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                },

                                '& .MuiInput-underline:before': {
                                    borderBottom: customization.isDarkMode ? '1px solid #666' : '1px solid #3c5ba4'
                                },

                                '& .MuiInput-underline:hover:before': {
                                    borderBottom: '2px solid #3c5ba4'
                                },

                                '& .MuiInput-underline:after': {
                                    borderBottom: `2px solid ${customization.isDarkMode ? '#e22a90' : '#3c5ba4'}`
                                }
                            }}
                        />
                    </DialogContent>

                    {/* ===== Actions ===== */}
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            variant='contained'
                            onClick={handleInvite}
                            disabled={loading}
                            sx={{
                                px: 3,
                                height: 40,
                                fontWeight: 500,
                                textTransform: 'none',
                                background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                color: '#fff',
                                boxShadow: 'none',
                                '&:hover': {
                                    background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                    opacity: 0.9,
                                    boxShadow: '0px 4px 12px rgba(0,0,0,0.2)'
                                },
                                '&:disabled': {
                                    opacity: 0.6,
                                    color: '#fff'
                                }
                            }}
                        >
                            Send Invite
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* DELETE */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Remove User</DialogTitle>
                    <DialogContent>
                        Remove <b>{selectedUser?.name}</b>?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button color='error' onClick={handleConfirmDelete}>
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* TRANSFER */}
                <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth='sm' fullWidth>
                    <DialogTitle
                        sx={{
                            background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                            WebkitBackgroundClip: 'text',
                            color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                            fontSize: '22px',
                            fontWeight: 600
                        }}
                    >
                        Transfer Admin
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Typography
                            sx={{
                                fontFamily: 'Cambria Math',
                                fontSize: '16px',
                                color: customization.isDarkMode ? '#fff' : '#000'
                            }}
                        >
                            Make <b>{transferUser?.name}</b> the new admin?
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => setTransferOpen(false)}
                            sx={{
                                textTransform: 'none',
                                color: customization.isDarkMode ? '#fff' : '#555'
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant='contained'
                            onClick={handleTransferAdmin}
                            sx={{
                                px: 3,
                                height: 40,
                                textTransform: 'none',
                                fontWeight: 500,
                                background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                color: '#fff',
                                boxShadow: 'none',
                                '&:hover': {
                                    background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                    opacity: 0.9,
                                    boxShadow: '0px 4px 12px rgba(0,0,0,0.25)'
                                }
                            }}
                        >
                            Transfer
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default UserDashboard
