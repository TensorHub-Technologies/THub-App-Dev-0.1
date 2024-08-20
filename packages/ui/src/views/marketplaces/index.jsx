import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

// material-ui
import {
    Grid,
    Box,
    Stack,
    Badge,
    Toolbar,
    TextField,
    InputAdornment,
    ButtonGroup,
    ToggleButton,
    FormControl,
    Checkbox,
    Button,
    FormControlLabel,
    InputLabel,
    Select,
    Skeleton
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconLayoutGrid, IconList } from '@tabler/icons'
// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import { gridSpacing } from '@/store/constant'
import ToolDialog from '@/views/tools/ToolDialog'

// API
import marketplacesApi from '@/api/marketplaces'

// Hooks
import useApi from '@/hooks/useApi'

// const
import { baseURL } from '@/store/constant'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { MarketplaceTable } from '@/ui-component/table/MarketplaceTable'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import emptyImage from '../../assets/images/glass.svg'
import emptyImagelite from '../../assets/images/glass-lite.svg'
import { IconX } from '@tabler/icons-react'

function TabPanel(props) {
    const { children, value, index, ...other } = props
    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`attachment-tabpanel-${index}`}
            aria-labelledby={`attachment-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
}

const types = ['Chatflow', 'Tool', 'Agentflow']
const framework = ['Langchain', 'LlamaIndex']

// ==============================|| Marketplace ||============================== //

const Marketplace = () => {
    const navigate = useNavigate()

    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const [isLoading, setLoading] = useState(true)
    const [images, setImages] = useState({})
    const [error, setError] = useState(null)
    const [usecases, setUsecases] = useState([])
    const [eligibleUsecases, setEligibleUsecases] = useState([])
    const [selectedUsecases, setSelectedUsecases] = useState([])

    const [showToolDialog, setShowToolDialog] = useState(false)
    const [toolDialogProps, setToolDialogProps] = useState({})

    const getAllTemplatesMarketplacesApi = useApi(marketplacesApi.getAllTemplatesFromMarketplaces)

    const [view, setView] = React.useState(localStorage.getItem('mpDisplayStyle') || 'card')
    const [search, setSearch] = useState('')

    // const [badgeFilter, setBadgeFilter] = useState([])
    const [badgeFilter] = useState([])
    const [typeFilter, setTypeFilter] = useState([])
    const [frameworkFilter, setFrameworkFilter] = useState([])

    const clearAllUsecases = () => {
        setSelectedUsecases([])
    }

    const [isInputFocused, setInputFocused] = useState(false)

    console.log(usecases, 'usecases')

    const handleTypeFilterChange = (event) => {
        const {
            target: { value, checked }
        } = event

        const updatedTypeFilter = checked ? [...typeFilter, value] : typeFilter.filter((item) => item !== value)

        setTypeFilter(updatedTypeFilter)
        getEligibleUsecases({ typeFilter: typeof value === 'string' ? value.split(',') : value, badgeFilter, frameworkFilter, search })
    }

    const handleFrameworkFilterChange = (event) => {
        const {
            target: { value, checked }
        } = event

        const updatedFilter = checked ? [...frameworkFilter, value] : frameworkFilter.filter((item) => item !== value)

        setFrameworkFilter(updatedFilter)
        getEligibleUsecases({ typeFilter, badgeFilter, frameworkFilter: typeof value === 'string' ? value.split(',') : value, search })
    }

    const handleViewChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('mpDisplayStyle', nextView)
        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
        getEligibleUsecases({ typeFilter, badgeFilter, frameworkFilter, search: event.target.value })
    }

    function filterFlows(data) {
        return (
            (data.categories ? data.categories.join(',') : '').toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            data.templateName.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            (data.description && data.description.toLowerCase().indexOf(search.toLowerCase()) > -1)
        )
    }

    function filterByType(data) {
        return typeFilter.length > 0 ? typeFilter.includes(data.type) : true
    }

    function filterByFramework(data) {
        return frameworkFilter.length > 0 ? (data.framework || []).some((item) => frameworkFilter.includes(item)) : true
    }
    function filterByUsecases(data) {
        return selectedUsecases.length > 0 ? (data.usecases || []).some((item) => selectedUsecases.includes(item)) : true
    }

    const getEligibleUsecases = (filter) => {
        if (!getAllTemplatesMarketplacesApi.data) return

        let filteredData = getAllTemplatesMarketplacesApi.data
        if (filter.badgeFilter.length > 0) filteredData = filteredData.filter((data) => filter.badgeFilter.includes(data.badge))
        if (filter.typeFilter.length > 0) filteredData = filteredData.filter((data) => filter.typeFilter.includes(data.type))
        if (filter.frameworkFilter.length > 0)
            filteredData = filteredData.filter((data) => (data.framework || []).some((item) => filter.frameworkFilter.includes(item)))
        if (filter.search) {
            filteredData = filteredData.filter(
                (data) =>
                    (data.categories ? data.categories.join(',') : '').toLowerCase().indexOf(filter.search.toLowerCase()) > -1 ||
                    data.templateName.toLowerCase().indexOf(filter.search.toLowerCase()) > -1 ||
                    (data.description && data.description.toLowerCase().indexOf(filter.search.toLowerCase()) > -1)
            )
        }

        const usecases = []
        for (let i = 0; i < filteredData.length; i += 1) {
            if (filteredData[i].flowData) {
                usecases.push(...filteredData[i].usecases)
            }
        }
        setEligibleUsecases(Array.from(new Set(usecases)).sort())
    }

    const onUseTemplate = (selectedTool) => {
        const dialogProp = {
            title: 'Add New Tool',
            type: 'IMPORT',
            cancelButtonName: 'Cancel',
            confirmButtonName: 'Add',
            data: selectedTool
        }
        setToolDialogProps(dialogProp)
        setShowToolDialog(true)
    }

    const goToTool = (selectedTool) => {
        const dialogProp = {
            title: selectedTool.templateName,
            type: 'TEMPLATE',
            data: selectedTool
        }
        setToolDialogProps(dialogProp)
        setShowToolDialog(true)
    }

    const goToCanvas = (selectedChatflow) => {
        navigate(`/templates/${selectedChatflow.id}`, { state: selectedChatflow })
    }

    useEffect(() => {
        getAllTemplatesMarketplacesApi.request()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLoading(getAllTemplatesMarketplacesApi.loading)
    }, [getAllTemplatesMarketplacesApi.loading])

    useEffect(() => {
        if (getAllTemplatesMarketplacesApi.data) {
            try {
                const flows = getAllTemplatesMarketplacesApi.data
                const usecases = []
                const images = {}
                for (let i = 0; i < flows.length; i += 1) {
                    if (flows[i].flowData) {
                        const flowDataStr = flows[i].flowData
                        const flowData = JSON.parse(flowDataStr)
                        usecases.push(...flows[i].usecases)
                        const nodes = flowData.nodes || []
                        images[flows[i].id] = []
                        for (let j = 0; j < nodes.length; j += 1) {
                            const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`
                            if (!images[flows[i].id].includes(imageSrc)) {
                                images[flows[i].id].push(imageSrc)
                            }
                        }
                    }
                }
                setImages(images)
                setUsecases(Array.from(new Set(usecases)).sort())
                setEligibleUsecases(Array.from(new Set(usecases)).sort())
            } catch (e) {
                console.error(e)
            }
        }
    }, [getAllTemplatesMarketplacesApi.data])

    useEffect(() => {
        if (getAllTemplatesMarketplacesApi.error) {
            setError(getAllTemplatesMarketplacesApi.error)
        }
    }, [getAllTemplatesMarketplacesApi.error])

    console.log(eligibleUsecases, 'eligibleUsecases')

    return (
        <>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : `#f5faff` }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Toolbar
                        disableGutters={true}
                        style={{
                            margin: 1,
                            padding: 1,
                            paddingBottom: 10,
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                    >
                        <h1
                            style={{
                                background: 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontSize: '24px',
                                lineHeight: '1.3'
                            }}
                        >
                            Templates
                        </h1>
                        <TextField
                            size='small'
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                                ml: 3,
                                width: '100%',
                                transition: 'all .2s ease-in-out',
                                '& input': { color: customization.isDarkMode ? '#fff' : '#000' },
                                '& label.Mui-focused': { color: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                '& .MuiInput-underline:after': { borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                '& .MuiInput-underline:before': { borderBottomColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4' },
                                '&:hover': {
                                    '& .MuiInput-underline:before': {
                                        borderBottomColor: customization.isDarkMode ? '#3C5BA4 !important' : '#E22A90 !important'
                                    }
                                }
                            }}
                            variant='standard'
                            placeholder='Search name or category'
                            onChange={onSearchChange}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        {/*<IconSearch/>*/}
                                        <SearchOutlinedIcon
                                            sx={{
                                                cursor: 'default',
                                                color: customization?.isDarkMode ? '#fff' : '#fff',
                                                background: isInputFocused
                                                    ? 'linear-gradient(to right, #3C5BA4, #E22A90)'
                                                    : customization?.isDarkMode
                                                    ? '#E22A90'
                                                    : '#3C5BA4',
                                                borderRadius: '20%',
                                                padding: '2px',
                                                mb: 1
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box sx={{ flexGrow: 1, mb: 2 }}>
                            <Toolbar
                                disableGutters={true}
                                style={{
                                    margin: 1,
                                    padding: 1,
                                    paddingBottom: 10,
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    width: '100%'
                                }}
                            >
                                <Stack direction={{ base: 'column', md: 'row' }} mr={8} spacing={8}>
                                    <FormControl variant='standard' style={{ width: '130px' }}>
                                        <InputLabel
                                            id='demo-simple-select-standard-label'
                                            sx={{
                                                color: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                                '&.Mui-focused': {
                                                    color: customization?.isDarkMode ? '#e22a90' : '#3C5BA4'
                                                }
                                            }}
                                        >
                                            AI Workspace
                                        </InputLabel>
                                        <Select
                                            labelId='ai-workspace-label'
                                            id='ai-workspace'
                                            multiple
                                            value={typeFilter}
                                            onChange={handleTypeFilterChange}
                                            renderValue={(selected) => selected.join(', ')}
                                            sx={{
                                                '&::before': {
                                                    borderBottom: customization?.isDarkMode ? '1px solid #e22a90' : '1px solid #3C5BA4'
                                                },
                                                '&::after': {
                                                    borderBottom: customization?.isDarkMode ? '2px solid #e22a90' : '2px solid #3C5BA4'
                                                },
                                                '& .MuiSelect-icon': {
                                                    background: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                                    color: '#ffff'
                                                }
                                            }}
                                        >
                                            {types.map((name) => (
                                                <FormControlLabel
                                                    key={name}
                                                    sx={{ display: 'flex', ml: 1, gap: 1 }}
                                                    control={
                                                        <Checkbox
                                                            checked={typeFilter.indexOf(name) > -1}
                                                            onChange={handleTypeFilterChange}
                                                            value={name}
                                                        />
                                                    }
                                                    label={name}
                                                />
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl variant='standard' style={{ width: '130px' }}>
                                        <InputLabel
                                            id='framework-label'
                                            sx={{
                                                color: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                                '&.Mui-focused': {
                                                    color: customization?.isDarkMode ? '#e22a90' : '#3C5BA4'
                                                }
                                            }}
                                        >
                                            Framework
                                        </InputLabel>
                                        <Select
                                            labelId='framework-label'
                                            id='framework'
                                            multiple
                                            value={frameworkFilter}
                                            onChange={handleFrameworkFilterChange}
                                            renderValue={(selected) => selected.join(', ')}
                                            sx={{
                                                '&::before': {
                                                    borderBottom: customization?.isDarkMode ? '1px solid #e22a90' : '1px solid #3C5BA4'
                                                },
                                                '&::after': {
                                                    borderBottom: customization?.isDarkMode ? '2px solid #e22a90' : '2px solid #3C5BA4'
                                                },
                                                '& .MuiSelect-icon': {
                                                    background: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                                    color: '#ffff'
                                                }
                                            }}
                                        >
                                            {framework.map((name) => (
                                                <FormControlLabel
                                                    key={name}
                                                    sx={{ display: 'flex', ml: 2, gap: 2, p: 1 }}
                                                    control={
                                                        <Checkbox
                                                            checked={frameworkFilter.indexOf(name) > -1}
                                                            sx={{ p: 0 }}
                                                            onChange={handleFrameworkFilterChange}
                                                            value={name}
                                                        />
                                                    }
                                                    label={name}
                                                />
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl variant='standard' style={{ width: '130px' }}>
                                        <InputLabel
                                            id='Select-label'
                                            sx={{
                                                color: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                                '&.Mui-focused': {
                                                    color: customization?.isDarkMode ? '#e22a90' : '#3C5BA4'
                                                }
                                            }}
                                        >
                                            Select Usecases
                                        </InputLabel>
                                        <Select
                                            labelId='usecases-label'
                                            id='usecases'
                                            multiple
                                            value={selectedUsecases}
                                            onChange={handleFrameworkFilterChange}
                                            renderValue={(selected) => selected.join(', ')}
                                            sx={{
                                                '&::before': {
                                                    borderBottom: customization?.isDarkMode ? '1px solid #e22a90' : '1px solid #3C5BA4'
                                                },
                                                '&::after': {
                                                    borderBottom: customization?.isDarkMode ? '2px solid #e22a90' : '2px solid #3C5BA4'
                                                },
                                                '& .MuiSelect-icon': {
                                                    background: customization?.isDarkMode ? '#e22a90' : '#3C5BA4',
                                                    color: '#ffff'
                                                }
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        top: '170px !important',
                                                        height: '320px !important',
                                                        width: '250px !important'
                                                    }
                                                }
                                            }}
                                        >
                                            {usecases.map((usecase, index) => (
                                                <FormControlLabel
                                                    sx={{ display: 'flex', ml: 2, gap: 2, p: 1 }}
                                                    key={index}
                                                    size='small'
                                                    control={
                                                        <Checkbox
                                                            checked={selectedUsecases.includes(usecase)}
                                                            onChange={(event) => {
                                                                setSelectedUsecases(
                                                                    event.target.checked
                                                                        ? [...selectedUsecases, usecase]
                                                                        : selectedUsecases.filter((item) => item !== usecase)
                                                                )
                                                            }}
                                                        />
                                                    }
                                                    label={usecase}
                                                />
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Toolbar>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />
                        <ButtonGroup sx={{ maxHeight: 40 }} disableElevation variant='contained' aria-label='outlined primary button group'>
                            <ButtonGroup disableElevation variant='contained' aria-label='outlined primary button group'>
                                <ToggleButtonGroup
                                    sx={{ maxHeight: 40, borderRadius: 20 }}
                                    value={view}
                                    color='primary'
                                    exclusive
                                    onChange={handleViewChange}
                                >
                                    <ToggleButton
                                        sx={{
                                            color: theme?.customization?.isDarkMode ? '#E22A90' : '#E22A90',
                                            borderRadius: '20px 0 0 20px',
                                            '&.Mui-selected': {
                                                color: customization?.isDarkMode ? '#3C5BA4' : '#3C5BA4'
                                            }
                                        }}
                                        variant='contained'
                                        value='card'
                                        title='Card View'
                                    >
                                        <IconLayoutGrid />
                                    </ToggleButton>
                                    <ToggleButton
                                        sx={{
                                            color: customization.isDarkMode ? '#E22A90' : '#E22A90',
                                            borderRadius: '0 20px 20px 0',
                                            '&.Mui-selected': {
                                                color: customization?.isDarkMode ? '#3C5BA4' : '#3C5BA4'
                                            }
                                        }}
                                        variant='contained'
                                        value='list'
                                        title='List View'
                                    >
                                        <IconList />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </ButtonGroup>
                        </ButtonGroup>
                    </Toolbar>
                </Box>

                {selectedUsecases.length > 0 && (
                    <Button
                        sx={{ width: 'max-content', borderRadius: '20px' }}
                        variant='outlined'
                        onClick={() => clearAllUsecases()}
                        startIcon={<IconX />}
                    >
                        Clear All
                    </Button>
                )}
                {!view || view === 'card' ? (
                    <>
                        {isLoading ? (
                            <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                                <Skeleton variant='rounded' width='100%' height={280} />
                            </Box>
                        ) : (
                            <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
                                {getAllTemplatesMarketplacesApi?.data
                                    ?.filter(filterByType)
                                    .filter(filterFlows)
                                    .filter(filterByFramework)
                                    .filter(filterByUsecases)
                                    .map((data, index) => (
                                        <Grid key={index} item lg={3} md={4} sm={6} xs={12}>
                                            {data.badge && (
                                                <Badge
                                                    sx={{
                                                        '& .MuiBadge-badge': {
                                                            right: 20
                                                        }
                                                    }}
                                                    // badgeContent={data.badge}
                                                    color={data.badge === 'POPULAR' ? 'primary' : 'error'}
                                                >
                                                    {(data.type === 'Chatflow' || data.type === 'Agentflow') && (
                                                        <ItemCard onClick={() => goToCanvas(data)} data={data} images={images[data.id]} />
                                                    )}
                                                    {data.type === 'Tool' && <ItemCard data={data} onClick={() => goToTool(data)} />}
                                                </Badge>
                                            )}
                                            {!data.badge && (data.type === 'Chatflow' || data.type === 'Agentflow') && (
                                                <ItemCard onClick={() => goToCanvas(data)} data={data} images={images[data.id]} />
                                            )}
                                            {!data.badge && data.type === 'Tool' && <ItemCard data={data} onClick={() => goToTool(data)} />}
                                        </Grid>
                                    ))}
                            </Box>
                        )}
                    </>
                ) : (
                    <MarketplaceTable
                        sx={{ mt: 20 }}
                        data={getAllTemplatesMarketplacesApi.data}
                        filterFunction={filterFlows}
                        filterByType={filterByType}
                        filterByFramework={filterByFramework}
                        filterByUsecases={filterByUsecases}
                        goToTool={goToTool}
                        goToCanvas={goToCanvas}
                        isLoading={isLoading}
                        setError={setError}
                    />
                )}

                {!isLoading && (!getAllTemplatesMarketplacesApi.data || getAllTemplatesMarketplacesApi.data.length === 0) && (
                    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                        <Box sx={{ p: 2, height: 'auto' }}>
                            <img
                                style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                src={customization.isDarkMode ? emptyImage : emptyImagelite}
                                alt='WorkflowEmptySVG'
                            />
                        </Box>
                        <div>No Templates Yet</div>
                    </Stack>
                )}
            </MainCard>
            <ToolDialog
                show={showToolDialog}
                dialogProps={toolDialogProps}
                onCancel={() => setShowToolDialog(false)}
                onConfirm={() => setShowToolDialog(false)}
                onUseTemplate={(tool) => onUseTemplate(tool)}
            ></ToolDialog>
        </>
    )
}

export default Marketplace
