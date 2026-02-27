import { useEffect, useRef, useState } from 'react'
import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

// material-ui
import { Checkbox, Skeleton, Box, Button, Stack, Typography, Tooltip } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditDatasetRowDialog from './AddEditDatasetRowDialog'
import UploadCSVFileDialog from '@/views/datasets/UploadCSVFileDialog'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import AddEditDatasetDialog from '@/views/datasets/AddEditDatasetDialog'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'

// API
import datasetsApi from '@/api/dataset'

// Hooks
import useApi from '@/hooks/useApi'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import useNotifier from '@/utils/useNotifier'
import useConfirm from '@/hooks/useConfirm'

// icons
import empty_datasetSVG from '@/assets/images/empty_datasets.svg'
import { IconTrash, IconPlus, IconX, IconUpload, IconArrowsDownUp } from '@tabler/icons-react'
import { StyledButton } from '@/ui-component/button/StyledButton'

// ─── Column layout ─────────────────────────────────────────────────────────────
// Checkbox | Input | Expected Output | Drag
const GRID_COLS = '48px 1fr 1fr 40px'

// ─── Shared style helpers ──────────────────────────────────────────────────────

const glassCard = (isDark, extra = {}) => ({
    position: 'relative',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    borderRadius: '12px',
    backdropFilter: 'blur(16px)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
    boxShadow: isDark ? '0 4px 24px -4px rgba(0,0,0,0.5)' : '0 4px 24px -4px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    ...extra
})

const headerCard = (isDark) => ({
    ...glassCard(isDark),
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(248,250,252,0.95)',
    borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
})

const colHeader = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontFamily: 'Cambria Math'
})

const bodyText = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
    fontSize: '0.875rem',
    fontWeight: 400,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
})

const checkboxSx = (isDark) => ({
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
    '&.Mui-checked': { color: isDark ? '#90CAF9' : '#1976D2' },
    padding: '4px'
})

// ─── Skeleton row ──────────────────────────────────────────────────────────────

const SkeletonRow = ({ isDark }) => (
    <Box sx={{ ...glassCard(isDark), minHeight: '64px', display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 2, alignItems: 'center', width: '100%' }}>
            <Skeleton variant='rectangular' width={18} height={18} sx={{ borderRadius: '4px' }} />
            <Skeleton variant='text' width='80%' height={20} />
            <Skeleton variant='text' width='70%' height={20} />
            <Skeleton variant='circular' width={20} height={20} />
        </Box>
    </Box>
)

SkeletonRow.propTypes = {
    isDark: PropTypes.bool
}

// ─── EvalDatasetRows ───────────────────────────────────────────────────────────

const EvalDatasetRows = () => {
    const customization = useSelector((state) => state.customization)
    const isDark = customization.isDarkMode
    const dispatch = useDispatch()
    useNotifier()

    const [showRowDialog, setShowRowDialog] = useState(false)
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [rowDialogProps, setRowDialogProps] = useState({})
    const [showDatasetDialog, setShowDatasetDialog] = useState(false)
    const [datasetDialogProps, setDatasetDialogProps] = useState({})

    const [dataset, setDataset] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [selected, setSelected] = useState([])

    // drag state
    const draggingItem = useRef()
    const dragOverItem = useRef()
    const [Draggable, setDraggable] = useState(false)
    const [startDragPos, setStartDragPos] = useState(-1)
    const [endDragPos, setEndDragPos] = useState(-1)
    const [dragOverIndex, setDragOverIndex] = useState(-1)

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    const { confirm } = useConfirm()

    const getDatasetRows = useApi(datasetsApi.getDataset)
    const reorderDatasetRowApi = useApi(datasetsApi.reorderDatasetRow)

    const URLpath = document.location.pathname.toString().split('/')
    const datasetId = URLpath[URLpath.length - 1] === 'dataset_rows' ? '' : URLpath[URLpath.length - 1]

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [total, setTotal] = useState(0)

    const onChange = (page, pageLimit) => {
        setCurrentPage(page)
        setPageLimit(pageLimit)
        refresh(page, pageLimit)
    }

    const refresh = (page, limit) => {
        setLoading(true)
        getDatasetRows.request(datasetId, { page: page || currentPage, limit: limit || pageLimit })
    }

    // ── Drag handlers ────────────────────────────────────────────────────────

    const handleDragStart = (e, position) => {
        draggingItem.current = position
        setStartDragPos(position)
        setEndDragPos(-1)
    }

    const handleDragEnter = (e, position) => {
        setEndDragPos(position)
        setDragOverIndex(position)
        dragOverItem.current = position
    }

    const handleDragEnd = (e, position) => {
        dragOverItem.current = position
        const updatedDataset = { ...dataset }
        updatedDataset.rows.splice(endDragPos, 0, dataset.rows.splice(startDragPos, 1)[0])
        setDataset({ ...updatedDataset })
        setDragOverIndex(-1)
        e.preventDefault()
        const updatedRows = dataset.rows.map((item, index) => ({ id: item.id, sequenceNo: index }))
        reorderDatasetRowApi.request({ datasetId, rows: updatedRows })
    }

    // ── Selection ────────────────────────────────────────────────────────────

    const onSelectAllClick = (event) => {
        setSelected(event.target.checked ? (dataset?.rows || []).map((n) => n.id) : [])
    }

    const handleSelect = (event, id) => {
        const idx = selected.indexOf(id)
        let next = []
        if (idx === -1) next = [...selected, id]
        else if (idx === 0) next = selected.slice(1)
        else if (idx === selected.length - 1) next = selected.slice(0, -1)
        else next = [...selected.slice(0, idx), ...selected.slice(idx + 1)]
        setSelected(next)
    }

    // ── Dialog triggers ──────────────────────────────────────────────────────

    const addNew = () => {
        setRowDialogProps({
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            data: { datasetId, datasetName: dataset.name }
        })
        setShowRowDialog(true)
    }

    const uploadCSV = () => {
        setRowDialogProps({
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Upload',
            data: { datasetId, datasetName: dataset.name }
        })
        setShowUploadDialog(true)
    }

    const editDs = () => {
        setDatasetDialogProps({ type: 'EDIT', cancelButtonName: 'Cancel', confirmButtonName: 'Save', data: dataset })
        setShowDatasetDialog(true)
    }

    const edit = (item) => {
        setRowDialogProps({
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            data: { datasetName: dataset.name, ...item }
        })
        setShowRowDialog(true)
    }

    const deleteDatasetItems = async () => {
        const isConfirmed = await confirm({
            title: 'Delete',
            description: `Delete ${selected.length} dataset items?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        })
        if (!isConfirmed) return
        try {
            const deleteResp = await datasetsApi.deleteDatasetItems(selected)
            if (deleteResp.data) {
                enqueueSnackbar({
                    message: 'Dataset Items deleted',
                    options: {
                        key: Date.now() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                onConfirm()
            }
        } catch (error) {
            enqueueSnackbar({
                message: `Failed to delete dataset items: ${
                    typeof error.response.data === 'object' ? error.response.data.message : error.response.data
                }`,
                options: {
                    key: Date.now() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
        setSelected([])
    }

    const onConfirm = () => {
        setShowRowDialog(false)
        setShowUploadDialog(false)
        setShowDatasetDialog(false)
        refresh(currentPage, pageLimit)
    }

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getDatasetRows.data) {
            setDataset(getDatasetRows.data)
            setTotal(getDatasetRows.data.total)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getDatasetRows.data])

    useEffect(() => {
        setLoading(getDatasetRows.loading)
    }, [getDatasetRows.loading])

    const rows = dataset?.rows || []

    return (
        <>
            <MainCard>
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        isBackButton={true}
                        isEditButton={true}
                        onEdit={editDs}
                        onBack={() => window.history.back()}
                        search={false}
                        title={`Dataset : ${dataset?.name || ''}`}
                        description={dataset?.description}
                    >
                        <StyledButton
                            variant='outlined'
                            color='secondary'
                            sx={{ borderRadius: 2, height: '100%' }}
                            onClick={uploadCSV}
                            startIcon={<IconUpload />}
                        >
                            Upload CSV
                        </StyledButton>
                        <StyledButton
                            variant='contained'
                            sx={{ borderRadius: 2, height: '100%' }}
                            onClick={addNew}
                            startIcon={<IconPlus />}
                        >
                            New Item
                        </StyledButton>
                    </ViewHeader>

                    {selected.length > 0 && (
                        <StyledButton
                            permissionId='datasets:delete'
                            sx={{ mt: 1, mb: 1, width: 'max-content' }}
                            variant='outlined'
                            onClick={deleteDatasetItems}
                            color='error'
                            startIcon={<IconTrash />}
                        >
                            Delete {selected.length} {selected.length === 1 ? 'item' : 'items'}
                        </StyledButton>
                    )}

                    {!isLoading && rows.length === 0 ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 6 }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                <img
                                    style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                    src={empty_datasetSVG}
                                    alt='empty_datasetSVG'
                                />
                            </Box>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>
                                No Dataset Items Yet
                            </Typography>
                            <StyledButton
                                variant='contained'
                                sx={{ borderRadius: 2, height: '100%', mt: 2, color: 'white' }}
                                startIcon={<IconPlus />}
                                onClick={addNew}
                            >
                                New Item
                            </StyledButton>
                        </Stack>
                    ) : (
                        <React.Fragment>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* ── Header row ─────────────────────────────── */}
                                <Box sx={{ ...headerCard(isDark), px: 3, py: 2 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 2, alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Checkbox
                                                color='primary'
                                                indeterminate={selected.length > 0 && selected.length < rows.length}
                                                checked={rows.length > 0 && selected.length === rows.length}
                                                onChange={onSelectAllClick}
                                                sx={checkboxSx(isDark)}
                                            />
                                        </Box>
                                        <Typography sx={colHeader(isDark)}>Input</Typography>
                                        <Typography sx={colHeader(isDark)}>Expected Output</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Tooltip title='Drag to reorder' placement='top' arrow>
                                                <IconArrowsDownUp
                                                    size={16}
                                                    style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* ── Data rows ──────────────────────────────── */}
                                {isLoading
                                    ? [...Array(4)].map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
                                    : rows.map((item, index) => (
                                          <Box
                                              key={index}
                                              draggable={Draggable}
                                              onDragStart={(e) => handleDragStart(e, index)}
                                              onDragOver={(e) => e.preventDefault()}
                                              onDragEnter={(e) => handleDragEnter(e, index)}
                                              onDragEnd={(e) => handleDragEnd(e, index)}
                                              sx={{
                                                  ...glassCard(isDark),
                                                  minHeight: '56px',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  transition: 'all 0.25s ease',
                                                  animation: 'dsFloat 7s ease-in-out infinite',
                                                  animationDelay: `${index * 0.08}s`,
                                                  cursor: 'pointer',
                                                  outline:
                                                      dragOverIndex === index && Draggable
                                                          ? `2px dashed ${isDark ? 'rgba(144,202,249,0.6)' : 'rgba(25,118,210,0.5)'}`
                                                          : '2px solid transparent',
                                                  '&:hover': {
                                                      transform: 'translateY(-2px)',
                                                      boxShadow: isDark
                                                          ? '0 12px 36px -8px rgba(0,0,0,0.7)'
                                                          : '0 12px 36px -8px rgba(0,0,0,0.15)',
                                                      borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.15)',
                                                      '& .row-glow': { opacity: 1 }
                                                  }
                                              }}
                                          >
                                              {/* Hover glow */}
                                              <Box
                                                  className='row-glow'
                                                  sx={{
                                                      position: 'absolute',
                                                      inset: 0,
                                                      borderRadius: '12px',
                                                      zIndex: 0,
                                                      background: 'linear-gradient(135deg, rgba(60,91,164,0.12), rgba(226,42,144,0.12))',
                                                      opacity: 0,
                                                      transition: 'opacity 0.3s ease',
                                                      pointerEvents: 'none'
                                                  }}
                                              />

                                              <Box sx={{ position: 'relative', zIndex: 1, px: 3, py: 2, width: '100%' }}>
                                                  <Box
                                                      sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: 2, alignItems: 'center' }}
                                                  >
                                                      {/* Checkbox */}
                                                      <Box
                                                          sx={{ display: 'flex', justifyContent: 'center' }}
                                                          onMouseDown={() => setDraggable(false)}
                                                          onMouseUp={() => setDraggable(true)}
                                                      >
                                                          <Checkbox
                                                              color='primary'
                                                              checked={selected.indexOf(item.id) !== -1}
                                                              onChange={(e) => {
                                                                  e.stopPropagation()
                                                                  handleSelect(e, item.id)
                                                              }}
                                                              onClick={(e) => e.stopPropagation()}
                                                              sx={checkboxSx(isDark)}
                                                          />
                                                      </Box>

                                                      {/* Input */}
                                                      <Typography
                                                          sx={{ ...bodyText(isDark) }}
                                                          onClick={() => edit(item)}
                                                          onMouseDown={() => setDraggable(false)}
                                                          onMouseUp={() => setDraggable(true)}
                                                      >
                                                          {item.input}
                                                      </Typography>

                                                      {/* Expected Output */}
                                                      <Typography
                                                          sx={{ ...bodyText(isDark) }}
                                                          onClick={() => edit(item)}
                                                          onMouseDown={() => setDraggable(false)}
                                                          onMouseUp={() => setDraggable(true)}
                                                      >
                                                          {item.output}
                                                      </Typography>

                                                      {/* Drag handle */}
                                                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                          <Tooltip title='Drag to reorder' placement='top' arrow>
                                                              <Box
                                                                  onMouseDown={() => setDraggable(true)}
                                                                  onMouseUp={() => setDraggable(false)}
                                                                  sx={{
                                                                      display: 'flex',
                                                                      alignItems: 'center',
                                                                      cursor: 'grab',
                                                                      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
                                                                      '&:active': { cursor: 'grabbing' },
                                                                      '&:hover': {
                                                                          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                                                                      },
                                                                      transition: 'color 0.2s'
                                                                  }}
                                                              >
                                                                  <DragIndicatorIcon fontSize='small' />
                                                              </Box>
                                                          </Tooltip>
                                                      </Box>
                                                  </Box>
                                              </Box>
                                          </Box>
                                      ))}
                            </Box>

                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', mt: -1 }} variant='subtitle2'>
                                <i>Use the drag icon at the right to reorder dataset items</i>
                            </Typography>

                            <TablePagination currentPage={currentPage} limit={pageLimit} total={total} onChange={onChange} />
                        </React.Fragment>
                    )}
                </Stack>
            </MainCard>

            <AddEditDatasetRowDialog
                show={showRowDialog}
                dialogProps={rowDialogProps}
                onCancel={() => setShowRowDialog(false)}
                onConfirm={onConfirm}
            />
            {showUploadDialog && (
                <UploadCSVFileDialog
                    show={showUploadDialog}
                    dialogProps={rowDialogProps}
                    onCancel={() => setShowUploadDialog(false)}
                    onConfirm={onConfirm}
                />
            )}
            {showDatasetDialog && (
                <AddEditDatasetDialog
                    show={showDatasetDialog}
                    dialogProps={datasetDialogProps}
                    onCancel={() => setShowDatasetDialog(false)}
                    onConfirm={onConfirm}
                />
            )}
            <ConfirmDialog />

            <style>{`
                @keyframes dsFloat {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-3px); }
                }
            `}</style>
        </>
    )
}

export default EvalDatasetRows
