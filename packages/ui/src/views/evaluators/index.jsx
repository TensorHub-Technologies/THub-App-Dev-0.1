import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// material-ui
import { Chip, Skeleton, Box, Stack, Button, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import AddEditEvaluatorDialog from '@/views/evaluators/AddEditEvaluatorDialog'
import TablePagination, { DEFAULT_ITEMS_PER_PAGE } from '@/ui-component/pagination/TablePagination'
import { truncateString } from '@/utils/genericHelper'

// API
import evaluatorsApi from '@/api/evaluators'
import moment from 'moment/moment'

// Hooks
import useNotifier from '@/utils/useNotifier'
import useConfirm from '@/hooks/useConfirm'
import useApi from '@/hooks/useApi'

// icons
import { IconTrash, IconPlus, IconJson, IconX, IconNumber123, IconAbc, IconAugmentedReality } from '@tabler/icons-react'

// const
import { StyledButton } from '@/ui-component/button/StyledButton'

// ==============================|| Evaluators ||============================== //

const Evaluators = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const { confirm } = useConfirm()
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [search, setSearch] = useState('')
    const [isLoading, setLoading] = useState(true)
    const [showEvaluatorDialog, setShowEvaluatorDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [evaluators, setEvaluators] = useState([])

    const getAllEvaluators = useApi(evaluatorsApi.getAllEvaluators)

    /* Table Pagination */
    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(DEFAULT_ITEMS_PER_PAGE)
    const [total, setTotal] = useState(0)
    const onChange = (page, pageLimit) => {
        setCurrentPage(page)
        setPageLimit(pageLimit)
        refresh(page, pageLimit)
    }

    const refresh = (page, limit) => {
        const params = {
            page: page || currentPage,
            limit: limit || pageLimit
        }
        getAllEvaluators.request(params)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const newEvaluator = () => {
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            data: {}
        }
        setDialogProps(dialogProp)
        setShowEvaluatorDialog(true)
    }

    const edit = (item) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Save',
            data: item
        }
        setDialogProps(dialogProp)
        setShowEvaluatorDialog(true)
    }

    const deleteEvaluator = async (item) => {
        const confirmPayload = {
            title: `Delete`,
            description: `Delete Evaluator ${item.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await evaluatorsApi.deleteEvaluator(item.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'Evaluator deleted',
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
                    onConfirm()
                }
            } catch (error) {
                enqueueSnackbar({
                    message: `Failed to delete Evaluator: ${
                        typeof error.response.data === 'object' ? error.response.data.message : error.response.data
                    }`,
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
            }
        }
    }

    const onConfirm = () => {
        setShowEvaluatorDialog(false)
        refresh(currentPage, pageLimit)
    }

    function filterDatasets(data) {
        return data.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    useEffect(() => {
        refresh(currentPage, pageLimit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllEvaluators.data) {
            setEvaluators(getAllEvaluators.data.data)
            setTotal(getAllEvaluators.data.total)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAllEvaluators.data])

    useEffect(() => {
        setLoading(getAllEvaluators.loading)
    }, [getAllEvaluators.loading])

    return (
        <>
            <MainCard>
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        isBackButton={false}
                        isEditButton={false}
                        onSearchChange={onSearchChange}
                        search={true}
                        title='Evaluators'
                        description=''
                    >
                        <StyledButton
                            permissionId={'evaluators:create'}
                            sx={{ borderRadius: 2, height: '100%' }}
                            variant='contained'
                            onClick={newEvaluator}
                            startIcon={<IconPlus />}
                        >
                            New Evaluator
                        </StyledButton>
                    </ViewHeader>
                    {!isLoading && evaluators?.length <= 0 ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                {/* <img
                                    style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                    src={empty_evaluatorSVG}
                                    alt='empty_evaluatorSVG'
                                /> */}
                            </Box>
                            <div>No Evaluators Yet</div>
                        </Stack>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {/* HEADER */}
                                <Box
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(16px)',
                                        backgroundColor: customization.isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                                    }}
                                >
                                    <Box sx={{ px: 3, py: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '150px 1fr 2fr 180px 100px',
                                                gap: 3,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Typography fontWeight={600}>Type</Typography>
                                            <Typography fontWeight={600}>Name</Typography>
                                            <Typography fontWeight={600}>Details</Typography>
                                            <Typography fontWeight={600}>Last Updated</Typography>
                                            <Typography fontWeight={600} textAlign='center'>
                                                Action
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
                                                  backgroundColor: customization.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                              }}
                                          />
                                      ))
                                    : evaluators.filter(filterDatasets).map((ds, index) => (
                                          <Box
                                              key={ds.id}
                                              sx={{
                                                  position: 'relative',
                                                  animation: 'float 6s ease-in-out infinite',
                                                  animationDelay: `${index * 0.1}s`,
                                                  '@keyframes float': {
                                                      '0%,100%': { transform: 'translateY(0px)' },
                                                      '50%': { transform: 'translateY(-5px)' }
                                                  }
                                              }}
                                          >
                                              <Box
                                                  sx={{
                                                      position: 'relative',
                                                      border: '1px solid',
                                                      borderColor: 'rgba(255,255,255,0.3)',
                                                      borderRadius: '12px',
                                                      backdropFilter: 'blur(16px)',
                                                      backgroundColor: customization.isDarkMode
                                                          ? 'rgba(0,0,0,0.5)'
                                                          : 'rgba(255,255,255,0.1)',
                                                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                                      px: 3,
                                                      py: 2,
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
                                                          gridTemplateColumns: '150px 1fr 2fr 180px 100px',
                                                          gap: 3,
                                                          alignItems: 'center',
                                                          width: '100%'
                                                      }}
                                                  >
                                                      {/* TYPE */}
                                                      <Box>
                                                          {ds.type === 'numeric' && <Chip icon={<IconNumber123 />} label='Numeric' />}
                                                          {ds.type === 'text' && <Chip icon={<IconAbc />} label='Text' />}
                                                          {ds.type === 'json' && <Chip icon={<IconJson />} label='JSON' />}
                                                          {ds.type === 'llm' && <Chip icon={<IconAugmentedReality />} label='LLM' />}
                                                      </Box>

                                                      {/* NAME */}
                                                      <Typography
                                                          fontWeight={600}
                                                          sx={{
                                                              overflow: 'hidden',
                                                              textOverflow: 'ellipsis',
                                                              whiteSpace: 'nowrap'
                                                          }}
                                                          onClick={() => edit(ds)}
                                                      >
                                                          {ds.name}
                                                      </Typography>

                                                      {/* DETAILS */}
                                                      <Typography
                                                          variant='body2'
                                                          sx={{
                                                              opacity: 0.8,
                                                              overflow: 'hidden',
                                                              textOverflow: 'ellipsis',
                                                              whiteSpace: 'nowrap'
                                                          }}
                                                          onClick={() => edit(ds)}
                                                      >
                                                          {ds.type === 'numeric' &&
                                                              `Measure: ${ds.measure} | Operator: ${ds.operator} | Value: ${ds.value}`}
                                                          {ds.type === 'text' && `Operator: ${ds.operator} | Value: ${ds.value}`}
                                                          {ds.type === 'json' && `Operator: ${ds.operator}`}
                                                          {ds.type === 'llm' && truncateString(ds.prompt, 80)}
                                                      </Typography>

                                                      {/* UPDATED */}
                                                      <Typography>{moment(ds.updatedDate).format('MMM Do YYYY')}</Typography>

                                                      {/* DELETE */}
                                                      <Box textAlign='center'>
                                                          <StyledButton
                                                              permissionId={'evaluators:delete'}
                                                              color='error'
                                                              onClick={() => deleteEvaluator(ds)}
                                                          >
                                                              <IconTrash size={18} />
                                                          </StyledButton>
                                                      </Box>
                                                  </Box>

                                                  {/* GLOW */}
                                                  <Box
                                                      className='glow-effect'
                                                      sx={{
                                                          position: 'absolute',
                                                          inset: 0,
                                                          borderRadius: '12px',
                                                          background:
                                                              'linear-gradient(to right, rgba(60,91,164,0.3), rgba(226,42,144,0.3))',
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
                            {/* Pagination and Page Size Controls */}
                            <TablePagination currentPage={currentPage} limit={pageLimit} total={total} onChange={onChange} />
                        </>
                    )}
                </Stack>
            </MainCard>
            {showEvaluatorDialog && (
                <AddEditEvaluatorDialog
                    show={showEvaluatorDialog}
                    dialogProps={dialogProps}
                    onCancel={() => setShowEvaluatorDialog(false)}
                    onConfirm={onConfirm}
                ></AddEditEvaluatorDialog>
            )}
            <ConfirmDialog />
        </>
    )
}

export default Evaluators
