import { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { styled } from '@mui/material/styles'
import {
    Box,
    Chip,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Tooltip,
    Typography,
    CircularProgress,
    useTheme
} from '@mui/material'
import { tableCellClasses } from '@mui/material/TableCell'
import FlowListMenu from '../button/FlowListMenu'
import { Link } from 'react-router-dom'

const StyledTableRow = styled(TableRow)(() => ({
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0
    }
}))

const getLocalStorageKeyName = (name, isAgentCanvas) => {
    return (isAgentCanvas ? 'agentcanvas' : 'chatflowcanvas') + '_' + name
}

// Helper function to check if icon is an image path or React component
const isImagePath = (icon) => {
    return (
        typeof icon === 'string' &&
        (icon.includes('.png') || icon.includes('.jpg') || icon.includes('.jpeg') || icon.includes('.svg') || icon.includes('.gif'))
    )
}

export const FlowListTable = ({
    data,
    images = {},
    icons = {},
    isLoading,
    filterFunction,
    updateFlowsApi,
    setError,
    isAgentCanvas,
    isAgentflowV2,
    lastElementRef,
    isLoadingMore,
    hasMore
}) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const localStorageKeyOrder = getLocalStorageKeyName('order', isAgentCanvas)
    const localStorageKeyOrderBy = getLocalStorageKeyName('orderBy', isAgentCanvas)

    const [order, setOrder] = useState(localStorage.getItem(localStorageKeyOrder) || 'desc')
    const [orderBy, setOrderBy] = useState(localStorage.getItem(localStorageKeyOrderBy) || 'updatedDate')

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        borderColor: theme.palette.grey[900] + 25,
        fontFamily: 'cambria math',
        [`&.${tableCellClasses.head}`]: {
            color: customization.isDarkMode ? 'white' : 'black',
            fontWeight: 'bold'
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
            height: 64
        }
    }))

    const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
        color: customization.isDarkMode ? 'white !important' : 'black !important',
        '&.Mui-active': {
            color: customization.isDarkMode ? 'white !important' : 'black !important',
            fontSize: '0.875rem'
        },
        '& .MuiTableSortLabel-icon': {
            color: customization.isDarkMode ? 'white !important' : 'black !important'
        }
    }))

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc'
        const newOrder = isAsc ? 'desc' : 'asc'
        setOrder(newOrder)
        setOrderBy(property)
        localStorage.setItem(localStorageKeyOrder, newOrder)
        localStorage.setItem(localStorageKeyOrderBy, property)
    }

    const onFlowClick = (row) => {
        if (!isAgentCanvas) {
            return `/canvas/${row.id}`
        } else {
            return isAgentflowV2 ? `/v2/agentcanvas/${row.id}` : `/agentcanvas/${row.id}`
        }
    }

    const sortedData =
        data && Array.isArray(data)
            ? [...data].sort((a, b) => {
                  if (orderBy === 'name') {
                      return order === 'asc' ? (a.name || '').localeCompare(b.name || '') : (b.name || '').localeCompare(a.name || '')
                  } else if (orderBy === 'updatedDate') {
                      return order === 'asc'
                          ? new Date(a.updatedDate) - new Date(b.updatedDate)
                          : new Date(b.updatedDate) - new Date(a.updatedDate)
                  }
                  return 0
              })
            : []

    const filteredData = sortedData.filter(filterFunction || (() => true))

    // // Render load more indicator
    const renderLoadMoreIndicator = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2, gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant='body2' color='textSecondary'>
                Loading more...
            </Typography>
        </Box>
    )

    console.log(isAgentCanvas, isAgentflowV2, 'isAgentCanvas in flowlisttable, isAgentflowV2')

    return (
        <>
            <TableContainer sx={{ border: 1, borderColor: theme.palette.grey[900] + 25, borderRadius: 2 }} component={Paper}>
                <Table sx={{ minWidth: 650, overflowX: 'hidden' }} size='small' aria-label='a dense table'>
                    <TableHead
                        sx={{
                            backgroundColor: customization.isDarkMode ? theme.palette.common.black : theme.palette.grey[100],
                            height: 56
                        }}
                    >
                        <TableRow>
                            <StyledTableCell component='th' scope='row' style={{ width: '20%' }} key='0'>
                                <StyledTableSortLabel
                                    active={orderBy === 'name'}
                                    direction={order}
                                    onClick={() => handleRequestSort('name')}
                                >
                                    Name
                                </StyledTableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '25%' }} key='1'>
                                Description
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '25%' }} key='2'>
                                Category
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '30%' }} key='3'>
                                Nodes
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '15%' }} key='4'>
                                <StyledTableSortLabel
                                    active={orderBy === 'updatedDate'}
                                    direction={order}
                                    onClick={() => handleRequestSort('updatedDate')}
                                >
                                    Last Modified Date
                                </StyledTableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '10%' }} key='5'>
                                Actions
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <>
                                {[...Array(12)].map((_, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </>
                        ) : (
                            <>
                                {filteredData.map((row, index) => (
                                    <StyledTableRow key={row.id} ref={index === filteredData.length - 1 ? lastElementRef : null}>
                                        <StyledTableCell key='0'>
                                            <Tooltip title={row.templateName || row.name}>
                                                <Typography
                                                    sx={{
                                                        display: '-webkit-box',
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <Link to={onFlowClick(row)} style={{ color: '#2196f3', textDecoration: 'none' }}>
                                                        {row.templateName || row.name}
                                                    </Link>
                                                </Typography>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell key='1'>
                                            <Tooltip title={row.description || ''} placement='top' arrow enterDelay={300}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        flexWrap: 'wrap',
                                                        marginTop: 5,
                                                        maxWidth: '250px', // Adjust as needed
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        cursor: row.description ? 'pointer' : 'default'
                                                    }}
                                                >
                                                    <Typography
                                                        variant='body2'
                                                        noWrap
                                                        sx={{
                                                            width: '100%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {row.description || '—'}
                                                    </Typography>
                                                </div>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell key='2'>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    marginTop: 5
                                                }}
                                            >
                                                &nbsp;
                                                {row.category
                                                    ? row.category
                                                          .split(';')
                                                          .map((tag, index) => (
                                                              <Chip key={index} label={tag} style={{ marginRight: 5, marginBottom: 5 }} />
                                                          ))
                                                    : '—'}
                                            </div>
                                        </StyledTableCell>

                                        <StyledTableCell key='3'>
                                            {(images[row.id] || icons[row.id]) && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'start',
                                                        gap: 1
                                                    }}
                                                >
                                                    {[
                                                        ...(images[row.id] || []).map((img) => ({ type: 'image', src: img })),
                                                        ...(icons[row.id] || []).map((ic) => ({
                                                            type: 'icon',
                                                            icon: ic.icon,
                                                            color: ic.color
                                                        }))
                                                    ]
                                                        .slice(0, 5)
                                                        .map((item, index) =>
                                                            item.type === 'image' ? (
                                                                <Box
                                                                    key={item.src}
                                                                    sx={{
                                                                        width: 30,
                                                                        height: 30,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: customization.isDarkMode
                                                                            ? theme.palette.common.white
                                                                            : theme.palette.grey[300] + 75
                                                                    }}
                                                                >
                                                                    <img
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            padding: 5,
                                                                            objectFit: 'contain'
                                                                        }}
                                                                        alt=''
                                                                        src={item.src}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <div
                                                                    key={index}
                                                                    style={{
                                                                        width: 30,
                                                                        height: 30,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        borderRadius: '50%'
                                                                    }}
                                                                >
                                                                    {isImagePath(item.icon) ? (
                                                                        <img
                                                                            style={{
                                                                                width: 25,
                                                                                height: 25,
                                                                                objectFit: 'contain'
                                                                            }}
                                                                            alt=''
                                                                            src={item.icon}
                                                                        />
                                                                    ) : (
                                                                        <item.icon size={25} color={item.color} />
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    {(images[row.id]?.length || 0) + (icons[row.id]?.length || 0) > 5 && (
                                                        <Typography
                                                            sx={{
                                                                alignItems: 'center',
                                                                display: 'flex',
                                                                fontSize: '.9rem',
                                                                fontWeight: 200
                                                            }}
                                                        >
                                                            + {(images[row.id]?.length || 0) + (icons[row.id]?.length || 0) - 5} More
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </StyledTableCell>
                                        <StyledTableCell key='4'>
                                            {moment(row.updatedDate).format('MMMM Do, YYYY HH:mm:ss')}
                                        </StyledTableCell>
                                        <StyledTableCell key='5'>
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                spacing={1}
                                                justifyContent='center'
                                                alignItems='center'
                                            >
                                                <FlowListMenu
                                                    isAgentCanvas={isAgentCanvas}
                                                    isAgentflowV2={isAgentflowV2}
                                                    chatflow={row}
                                                    setError={setError}
                                                    updateFlowsApi={updateFlowsApi}
                                                />
                                            </Stack>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Load more indicator for infinite scroll */}
            {isLoadingMore && renderLoadMoreIndicator()}
        </>
    )
}

FlowListTable.propTypes = {
    data: PropTypes.array,
    images: PropTypes.object,
    icons: PropTypes.object,
    isLoading: PropTypes.bool,
    filterFunction: PropTypes.func,
    updateFlowsApi: PropTypes.object,
    setError: PropTypes.func,
    isAgentCanvas: PropTypes.bool,
    isAgentflowV2: PropTypes.bool,
    lastElementRef: PropTypes.func,
    isLoadingMore: PropTypes.bool,
    hasMore: PropTypes.bool
}
