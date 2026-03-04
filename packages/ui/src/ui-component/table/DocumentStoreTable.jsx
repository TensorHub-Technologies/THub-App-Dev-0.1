import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Box, Typography, Skeleton, useTheme } from '@mui/material'
import DocumentStoreStatus from '@/views/docstore/DocumentStoreStatus'

export const DocumentStoreTable = ({ data, isLoading, onRowClick, images }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* HEADER CARD */}
            <Box
                sx={{
                    border: '1px solid',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }}
            >
                <Box sx={{ px: 3, py: 2 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1.5fr 1.5fr 120px 150px 120px 160px',
                            gap: 3,
                            alignItems: 'center'
                        }}
                    >
                        <Typography fontWeight={600}>Status</Typography>
                        <Typography fontWeight={600}>Name</Typography>
                        <Typography fontWeight={600}>Description</Typography>
                        <Typography fontWeight={600} textAlign='center'>
                            Flows
                        </Typography>
                        <Typography fontWeight={600} textAlign='center'>
                            Characters
                        </Typography>
                        <Typography fontWeight={600} textAlign='center'>
                            Chunks
                        </Typography>
                        <Typography fontWeight={600} textAlign='center'>
                            Loader Types
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* LOADING */}
            {isLoading
                ? [...Array(6)].map((_, index) => (
                      <Skeleton
                          key={index}
                          variant='rounded'
                          height={96}
                          sx={{
                              borderRadius: 3,
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                          }}
                      />
                  ))
                : data.map((store, index) => (
                      <Box
                          key={store.id}
                          sx={{
                              position: 'relative',
                              animation: 'float 6s ease-in-out infinite',
                              animationDelay: `${index * 0.1}s`,
                              '@keyframes float': {
                                  '0%,100%': {
                                      transform: 'translateY(0px)'
                                  },
                                  '50%': {
                                      transform: 'translateY(-5px)'
                                  }
                              }
                          }}
                      >
                          {/* GLASS ROW */}
                          <Box
                              onClick={() => onRowClick(store)}
                              sx={{
                                  position: 'relative',
                                  border: '1px solid',
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  borderRadius: '12px',
                                  backdropFilter: 'blur(16px)',
                                  backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.1)',
                                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                  height: '6rem',
                                  px: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.3s ease-in-out',
                                  cursor: 'pointer',
                                  '&:hover': {
                                      transform: 'translateY(-3px)'
                                  },
                                  '&:hover .glow-effect': {
                                      opacity: 1
                                  }
                              }}
                          >
                              <Box
                                  sx={{
                                      display: 'grid',
                                      gridTemplateColumns: '80px 1.5fr 1.5fr 120px 150px 120px 160px',
                                      gap: 3,
                                      alignItems: 'center',
                                      width: '100%'
                                  }}
                              >
                                  {/* STATUS */}
                                  <DocumentStoreStatus isTableView status={store.status} />

                                  {/* NAME */}
                                  <Typography
                                      sx={{
                                          fontWeight: 600,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                      }}
                                  >
                                      {store.name}
                                  </Typography>

                                  {/* DESCRIPTION */}
                                  <Typography
                                      variant='body2'
                                      sx={{
                                          opacity: 0.8,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                      }}
                                  >
                                      {store.description}
                                  </Typography>

                                  {/* FLOWS */}
                                  <Typography textAlign='center'>{store.whereUsed?.length ?? 0}</Typography>

                                  {/* CHARACTERS */}
                                  <Typography textAlign='center'>{store.totalChars}</Typography>

                                  {/* CHUNKS */}
                                  <Typography textAlign='center'>{store.totalChunks}</Typography>

                                  {/* LOADER TYPES */}
                                  <Box
                                      sx={{
                                          display: 'flex',
                                          justifyContent: 'center',
                                          gap: 1
                                      }}
                                  >
                                      {images?.[store.id]?.slice(0, 3).map((img) => (
                                          <Box
                                              key={img}
                                              sx={{
                                                  width: 30,
                                                  height: 30,
                                                  borderRadius: '50%',
                                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center'
                                              }}
                                          >
                                              <img
                                                  src={img}
                                                  alt=''
                                                  style={{
                                                      width: '70%',
                                                      height: '70%',
                                                      objectFit: 'contain'
                                                  }}
                                              />
                                          </Box>
                                      ))}
                                  </Box>
                              </Box>

                              {/* GLOW EFFECT */}
                              <Box
                                  className='glow-effect'
                                  sx={{
                                      position: 'absolute',
                                      inset: 0,
                                      borderRadius: '12px',
                                      background: 'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
                                      opacity: 0,
                                      transition: 'opacity 0.3s ease-in-out',
                                      filter: 'blur(8px)',
                                      zIndex: -1
                                  }}
                              />
                          </Box>
                      </Box>
                  ))}
        </Box>
    )
}

DocumentStoreTable.propTypes = {
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    images: PropTypes.object,
    onRowClick: PropTypes.func
}

DocumentStoreTable.displayName = 'DocumentStoreTable'
