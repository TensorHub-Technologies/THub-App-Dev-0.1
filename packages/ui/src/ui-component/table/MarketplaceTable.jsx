import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'
import { tableCellClasses } from '@mui/material/TableCell'
import {
    Box,
    Button,
    Chip,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Stack,
    useTheme,
    IconButton
} from '@mui/material'
import { IconTrash } from '@tabler/icons-react'

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
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0
    }
}))

export const MarketplaceTable = ({
    data,
    images,
    filterFunction,
    filterByBadge,
    filterByType,
    filterByFramework,
    filterByUsecases,
    goToCanvas,
    goToTool,
    isLoading,
    onDelete
}) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const openTemplate = (selectedTemplate) => {
        if (selectedTemplate.flowData) {
            goToCanvas(selectedTemplate)
        } else {
            goToTool(selectedTemplate)
        }
    }

    return (
        <>
            <TableContainer sx={{ border: 1, borderColor: theme.palette.grey[900] + 25, borderRadius: 2 }} component={Paper}>
                <Table sx={{ minWidth: 650 }} size='small' aria-label='a dense table'>
                    <TableHead
                        sx={{
                            backgroundColor: customization.isDarkMode ? theme.palette.common.black : theme.palette.grey[100],
                            height: 56
                        }}
                    >
                        <TableRow>
                            <StyledTableCell sx={{ minWidth: '150px' }} component='th' scope='row' key='0'>
                                Name
                            </StyledTableCell>
                            <StyledTableCell sx={{ minWidth: '100px' }} component='th' scope='row' key='1'>
                                Type
                            </StyledTableCell>
                            <StyledTableCell key='2'>Description</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: '100px' }} key='3'>
                                Framework
                            </StyledTableCell>
                            <StyledTableCell sx={{ minWidth: '100px' }} key='4'>
                                Use cases
                            </StyledTableCell>
                            <StyledTableCell style={{ width: '15%' }} key='5'>
                                Nodes
                            </StyledTableCell>
                            <StyledTableCell component='th' scope='row' key='6'>
                                &nbsp;
                            </StyledTableCell>
                            {onDelete && (
                                <StyledTableCell component='th' scope='row' key='7'>
                                    Delete
                                </StyledTableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <>
                                <StyledTableRow>
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
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                    {onDelete && (
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                    )}
                                </StyledTableRow>
                                <StyledTableRow>
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
                                    <StyledTableCell>
                                        <Skeleton variant='text' />
                                    </StyledTableCell>
                                    {onDelete && (
                                        <StyledTableCell>
                                            <Skeleton variant='text' />
                                        </StyledTableCell>
                                    )}
                                </StyledTableRow>
                            </>
                        ) : (
                            <>
                                {data
                                    ?.filter(filterFunction)
                                    .filter(filterByFramework)
                                    .filter(filterByUsecases)
                                    .map((row, index) => (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell key='0'>
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
                                                    <Button
                                                        onClick={() => openTemplate(row)}
                                                        sx={{
                                                            textAlign: 'left',
                                                            color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        {row.templateName || row.name}
                                                    </Button>
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell key='1'>
                                                <Typography>{row.type}</Typography>
                                            </StyledTableCell>
                                            <StyledTableCell key='2'>
                                                <Typography sx={{ overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                                                    {row.description || ''}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell key='3'>
                                                <Stack flexDirection='row' sx={{ gap: 1, flexWrap: 'wrap' }}>
                                                    {row.framework &&
                                                        row.framework.length > 0 &&
                                                        row.framework.map((framework, index) => (
                                                            <Chip
                                                                variant='outlined'
                                                                key={index}
                                                                size='small'
                                                                label={framework}
                                                                style={{ marginRight: 3, marginBottom: 3 }}
                                                            />
                                                        ))}
                                                </Stack>
                                            </StyledTableCell>
                                            <StyledTableCell key='4'>
                                                <Stack flexDirection='row' sx={{ gap: 1, flexWrap: 'wrap' }}>
                                                    {row.usecases &&
                                                        row.usecases.length > 0 &&
                                                        row.usecases.map((usecase, index) => (
                                                            <Chip
                                                                variant='outlined'
                                                                key={index}
                                                                size='small'
                                                                label={usecase}
                                                                style={{ marginRight: 3, marginBottom: 3 }}
                                                            />
                                                        ))}
                                                </Stack>
                                            </StyledTableCell>
                                            <StyledTableCell key='5'>
                                                {images[row.id] && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'start',
                                                            gap: 1
                                                        }}
                                                    >
                                                        {images[row.id]
                                                            .slice(0, images[row.id].length > 5 ? 5 : images[row.id].length)
                                                            .map((img) => (
                                                                <Box
                                                                    key={img}
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
                                                                        src={img}
                                                                    />
                                                                </Box>
                                                            ))}
                                                        {images[row.id].length > 5 && (
                                                            <Typography
                                                                sx={{
                                                                    alignItems: 'center',
                                                                    display: 'flex',
                                                                    fontSize: '.9rem',
                                                                    fontWeight: 200
                                                                }}
                                                            >
                                                                + {images[row.id].length - 5} More
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </StyledTableCell>
                                            {/* <StyledTableCell key='6'>
                                                <Typography>
                                                    {row.badge &&
                                                        row.badge
                                                            .split(';')
                                                            .map((tag, index) => (
                                                                <Chip
                                                                    color={tag === 'POPULAR' ? 'primary' : 'error'}
                                                                    key={index}
                                                                    size='small'
                                                                    label={tag.toUpperCase()}
                                                                    style={{ marginRight: 5, marginBottom: 5 }}
                                                                />
                                                            ))}
                                                </Typography>
                                            </StyledTableCell> */}
                                            {onDelete && (
                                                <StyledTableCell key='7'>
                                                    <IconButton title='Delete' color='error' onClick={() => onDelete(row)}>
                                                        <IconTrash />
                                                    </IconButton>
                                                </StyledTableCell>
                                            )}
                                        </StyledTableRow>
                                    ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

MarketplaceTable.propTypes = {
    data: PropTypes.array,
    images: PropTypes.object,
    filterFunction: PropTypes.func,
    filterByBadge: PropTypes.func,
    filterByType: PropTypes.func,
    filterByFramework: PropTypes.func,
    filterByUsecases: PropTypes.func,
    goToTool: PropTypes.func,
    goToCanvas: PropTypes.func,
    isLoading: PropTypes.bool,
    onDelete: PropTypes.func
}
