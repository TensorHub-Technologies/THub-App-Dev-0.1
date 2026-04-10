import {
    Card,
    CardContent,
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    Skeleton
} from '@mui/material'
import { IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import authApi from '@/api/auth'

const WorkspacesDashboard = () => {
    const customization = useSelector((state) => state.customization)
    const user = useSelector((state) => state.user.userData)
    const isDark = customization.isDarkMode

    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(true)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [selected, setSelected] = useState(null)

    // ---------------------------------
    // Fetch workspaces
    // ---------------------------------
    const fetchWorkspaces = async () => {
        setLoading(true)
        try {
            const res = await authApi.getSuperadminWorkspaces(user.uid)
            setWorkspaces(res.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.role === 'superadmin') fetchWorkspaces()
    }, [user?.role])

    // ---------------------------------
    // Delete workspace
    // ---------------------------------
    const handleDelete = async () => {
        await authApi.deleteSuperadminWorkspace({
            uid: user.uid,
            workspaceId: selected.workspaceId
        })
        setConfirmOpen(false)
        fetchWorkspaces()
    }

    // ---------------------------------
    // Skeleton card
    // ---------------------------------
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
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', mb: 1 }}>
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} width={90} height={14} />
                ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', alignItems: 'center' }}>
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} width='70%' height={22} />
                ))}
                <Skeleton width={40} height={32} />
            </Box>
        </Box>
    )

    return (
        <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <CardContent>
                {/* HEADER */}
                <Typography
                    sx={{
                        background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        fontSize: '24px',
                        mb: 4
                    }}
                >
                    All Organizations
                </Typography>

                {/* LIST */}
                <Box display='flex' flexDirection='column' gap={3}>
                    {loading
                        ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                        : workspaces.map((w, index) => (
                              <Box
                                  key={w.workspaceId}
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
                                          '&:hover .glow': { opacity: 1 }
                                      }}
                                  >
                                      {/* HEADER */}
                                      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', mb: 1 }}>
                                          {['ORGANIZATION NAME', 'ADMIN NAME', ' ADMIN EMAIL', 'ACTIONS'].map((h) => (
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
                                      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', alignItems: 'center' }}>
                                          <Typography
                                              sx={{ fontFamily: 'Cambria Math', fontWeight: 600, color: isDark ? '#ffff' : '#000' }}
                                          >
                                              {w.workspace}
                                          </Typography>
                                          <Typography sx={{ fontFamily: 'Cambria Math', color: isDark ? '#ffff' : '#000' }}>
                                              {w.adminName}
                                          </Typography>
                                          <Typography sx={{ fontFamily: 'Cambria Math', color: isDark ? '#ffff' : '#000' }}>
                                              {w.adminEmail}
                                          </Typography>

                                          <Tooltip title='Delete Workspace'>
                                              <IconButton
                                                  color='error'
                                                  onClick={() => {
                                                      setSelected(w)
                                                      setConfirmOpen(true)
                                                  }}
                                                  sx={{
                                                      marginLeft: '-110px'
                                                  }}
                                              >
                                                  <IconTrash size={18} />
                                              </IconButton>
                                          </Tooltip>
                                      </Box>

                                      {/* GLOW */}
                                      <Box
                                          className='glow'
                                          sx={{
                                              position: 'absolute',
                                              inset: 0,
                                              background: 'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
                                              opacity: 0,
                                              transition: 'opacity 0.3s',
                                              filter: 'blur(12px)',
                                              zIndex: -1
                                          }}
                                      />
                                  </Box>
                              </Box>
                          ))}
                </Box>

                {/* DELETE CONFIRM */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Delete Workspace</DialogTitle>
                    <DialogContent>
                        Delete <b>{selected?.workspace}</b>? All users will be removed.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button color='error' onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default WorkspacesDashboard
