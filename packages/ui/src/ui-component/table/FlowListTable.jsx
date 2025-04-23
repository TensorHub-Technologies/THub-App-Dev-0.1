import { useEffect, useRef, useState } from 'react'
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
    useTheme
} from '@mui/material'
import { tableCellClasses } from '@mui/material/TableCell'
import FlowListMenu from '../button/FlowListMenu'
import { Link } from 'react-router-dom'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderColor: theme.palette.grey[900] + 25,

    [`&.${tableCellClasses.head}`]: {
        color: theme.palette.grey[900]
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        height: 64
    }
}))

const StyledTableRow = styled(TableRow)(() => ({
    '&:last-child td, &:last-child th': {
        border: 0
    }
}))

const getLocalStorageKeyName = (name, isAgentCanvas) => {
    return (isAgentCanvas ? 'agentcanvas' : 'chatflowcanvas') + '_' + name
}

export const FlowListTable = ({ data, images, isLoading, filterFunction, updateFlowsApi, setError, isAgentCanvas }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const localStorageKeyOrder = getLocalStorageKeyName('order', isAgentCanvas)
    const localStorageKeyOrderBy = getLocalStorageKeyName('orderBy', isAgentCanvas)

    const [order, setOrder] = useState(localStorage.getItem(localStorageKeyOrder) || 'desc')
    const [orderBy, setOrderBy] = useState(localStorage.getItem(localStorageKeyOrderBy) || 'updatedDate')
    const [visibleRows, setVisibleRows] = useState(8)
    const observerRef = useRef(null)

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc'
        const newOrder = isAsc ? 'desc' : 'asc'
        setOrder(newOrder)
        setOrderBy(property)
        localStorage.setItem(localStorageKeyOrder, newOrder)
        localStorage.setItem(localStorageKeyOrderBy, property)
    }

    const sortedData = data
        ? [...data].filter(filterFunction).sort((a, b) => {
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

    // Handle infinite scroll
    useEffect(() => {
        if (!observerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry.isIntersecting && visibleRows < sortedData.length) {
                    setVisibleRows((prev) => Math.min(prev + 8, sortedData.length))
                }
            },
            { threshold: 1.0 }
        )

        observer.observe(observerRef.current)
        return () => observer.disconnect()
    }, [sortedData.length, visibleRows])

    return (
        <TableContainer sx={{ border: 1, borderColor: theme.palette.grey[900] + 25, borderRadius: 2 }} component={Paper}>
            <Table sx={{ minWidth: 650 }} size='small'>
                <TableHead
                    sx={{
                        backgroundColor: customization.isDarkMode ? theme.palette.common.black : theme.palette.grey[100],
                        height: 56
                    }}
                >
                    <TableRow>
                        <StyledTableCell style={{ width: '16%' }}>
                            <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleRequestSort('name')}>
                                Name
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell style={{ width: '10%' }}>Description</StyledTableCell>
                        <StyledTableCell style={{ width: '10%' }}>Category</StyledTableCell>
                        <StyledTableCell style={{ width: '25%' }}>Nodes</StyledTableCell>
                        <StyledTableCell style={{ width: '15%' }}>
                            <TableSortLabel
                                active={orderBy === 'updatedDate'}
                                direction={order}
                                onClick={() => handleRequestSort('updatedDate')}
                            >
                                Last Modified Date
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell style={{ width: '5%' }}>Actions</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        [...Array(2)].map((_, i) => (
                            <StyledTableRow key={i}>
                                {[...Array(5)].map((_, j) => (
                                    <StyledTableCell key={j}>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                ))}
                            </StyledTableRow>
                        ))
                    ) : (
                        <>
                            {sortedData.slice(0, visibleRows).map((row, index) => (
                                <StyledTableRow key={index}>
                                    <StyledTableCell>
                                        <Typography
                                            sx={{
                                                display: '-webkit-box',
                                                fontSize: 14,
                                                fontWeight: 500,
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontFamily: 'Roboto, sans-serif'
                                            }}
                                        >
                                            <Link
                                                to={`/${isAgentCanvas ? 'agentcanvas' : 'canvas'}/${row.id}`}
                                                style={{
                                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                {row.templateName || row.name}
                                            </Link>
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Tooltip title={row?.description}>
                                            <Typography
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'block',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    textOverflow: 'ellipsis',
                                                    overflowWrap: 'break-word',
                                                    whiteSpace: 'pre-line',
                                                    overflow: 'hidden',
                                                    height: '40px',
                                                    lineHeight: '20px',
                                                    width: '200px',
                                                    fontFamily: 'Roboto, sans-serif'
                                                }}
                                            >
                                                {row?.description}
                                            </Typography>
                                        </Tooltip>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                                            {row.category &&
                                                row.category
                                                    .split(';')
                                                    .map((tag, i) => <Chip key={i} label={tag} sx={{ mr: 0.5, mb: 0.5 }} />)}
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {images[row.id] && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {images[row.id].slice(0, 5).map((img, i) => (
                                                    <Box
                                                        key={i}
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
                                                            alt=''
                                                            src={img}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                padding: 5,
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    </Box>
                                                ))}
                                                {images[row.id].length > 5 && (
                                                    <Typography sx={{ fontSize: '.9rem', fontWeight: 200 }}>
                                                        + {images[row.id].length - 5} More
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>{moment(row.updatedDate).format('MMMM Do, YYYY')}</StyledTableCell>
                                    <StyledTableCell>
                                        <Stack direction='row' spacing={1} justifyContent='center' alignItems='center'>
                                            <FlowListMenu
                                                isAgentCanvas={isAgentCanvas}
                                                chatflow={row}
                                                setError={setError}
                                                updateFlowsApi={updateFlowsApi}
                                            />
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                            <tr>
                                <td colSpan={6}>
                                    <div ref={observerRef} style={{ height: '1px' }} />
                                </td>
                            </tr>
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

FlowListTable.propTypes = {
    data: PropTypes.array,
    images: PropTypes.object,
    isLoading: PropTypes.bool,
    filterFunction: PropTypes.func,
    updateFlowsApi: PropTypes.object,
    setError: PropTypes.func,
    isAgentCanvas: PropTypes.bool
}
