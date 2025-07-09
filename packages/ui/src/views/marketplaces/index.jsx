import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// material-ui
import {
    Box,
    Stack,
    Badge,
    ToggleButton,
    InputLabel,
    FormControl,
    Select,
    Checkbox,
    ListItemText,
    Skeleton,
    FormControlLabel,
    ToggleButtonGroup,
    MenuItem,
    Button
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconLayoutGrid, IconList, IconX } from '@tabler/icons-react'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ItemCard from '@/ui-component/cards/ItemCard'
import WorkflowEmptySVG from '@/assets/images/workflow_empty.svg'
import ToolDialog from '@/views/tools/ToolDialog'
import { MarketplaceTable } from '@/ui-component/table/MarketplaceTable'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import { TabPanel } from '@/ui-component/tabs/TabPanel'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'

// API
import marketplacesApi from '@/api/marketplaces'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// const
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'
import { gridSpacing } from '@/store/constant'
import useNotifier from '@/utils/useNotifier'

const badges = ['POPULAR', 'NEW']
const types = ['chatflows', 'Agentflow', 'AgentflowV2', 'Tool']
const framework = ['Langchain', 'LlamaIndex']
const MenuProps = {
    PaperProps: {
        style: {
            width: 280
        }
    }
}

// ==============================|| Marketplace ||============================== //

const Marketplace = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    useNotifier()

    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [images, setImages] = useState({})
    const [icons, setIcons] = useState({})
    const [usecases, setUsecases] = useState([])
    const [eligibleUsecases, setEligibleUsecases] = useState([])
    const [selectedUsecases, setSelectedUsecases] = useState([])

    const [showToolDialog, setShowToolDialog] = useState(false)
    const [toolDialogProps, setToolDialogProps] = useState({})

    const getAllTemplatesMarketplacesApi = useApi(marketplacesApi.getAllTemplatesFromMarketplaces)

    const [view, setView] = React.useState(localStorage.getItem('mpDisplayStyle') || 'card')
    const [search, setSearch] = useState('')
    const [badgeFilter, setBadgeFilter] = useState([])
    const [typeFilter, setTypeFilter] = useState([])
    const [frameworkFilter, setFrameworkFilter] = useState([])

    const getAllCustomTemplatesApi = useApi(marketplacesApi.getAllCustomTemplates)
    const [activeTabValue, setActiveTabValue] = useState(0)
    const [templateImages, setTemplateImages] = useState({})
    const [templateIcons, setTemplateIcons] = useState({})
    const [templateUsecases, setTemplateUsecases] = useState([])
    const [eligibleTemplateUsecases, setEligibleTemplateUsecases] = useState([])
    const [selectedTemplateUsecases, setSelectedTemplateUsecases] = useState([])
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    const { confirm } = useConfirm()

    const getSelectStyles = (borderColor, isDarkMode) => ({
        '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: 2,
            borderColor: borderColor
        },
        '& .MuiSvgIcon-root': {
            color: isDarkMode ? '#fff' : 'inherit'
        }
    })

    const handleTabChange = (event, newValue) => {
        if (newValue === 1 && !getAllCustomTemplatesApi.data) {
            getAllCustomTemplatesApi.request()
        }
        setActiveTabValue(newValue)
    }

    const clearAllUsecases = () => {
        if (activeTabValue === 0) setSelectedUsecases([])
        else setSelectedTemplateUsecases([])
    }

    const handleBadgeFilterChange = (event) => {
        const {
            target: { value }
        } = event
        setBadgeFilter(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value
        )
        const data = activeTabValue === 0 ? getAllTemplatesMarketplacesApi.data : getAllCustomTemplatesApi.data
        getEligibleUsecases(data, {
            typeFilter,
            badgeFilter: typeof value === 'string' ? value.split(',') : value,
            frameworkFilter,
            search
        })
    }

    const handleTypeFilterChange = (event) => {
        const {
            target: { value }
        } = event
        setTypeFilter(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value
        )
        const data = activeTabValue === 0 ? getAllTemplatesMarketplacesApi.data : getAllCustomTemplatesApi.data
        getEligibleUsecases(data, {
            typeFilter: typeof value === 'string' ? value.split(',') : value,
            badgeFilter,
            frameworkFilter,
            search
        })
    }

    const handleFrameworkFilterChange = (event) => {
        const {
            target: { value }
        } = event
        setFrameworkFilter(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value
        )
        const data = activeTabValue === 0 ? getAllTemplatesMarketplacesApi.data : getAllCustomTemplatesApi.data
        getEligibleUsecases(data, {
            typeFilter,
            badgeFilter,
            frameworkFilter: typeof value === 'string' ? value.split(',') : value,
            search
        })
    }

    const handleViewChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('mpDisplayStyle', nextView)
        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
        const data = activeTabValue === 0 ? getAllTemplatesMarketplacesApi.data : getAllCustomTemplatesApi.data

        getEligibleUsecases(data, { typeFilter, badgeFilter, frameworkFilter, search: event.target.value })
    }

    const onDeleteCustomTemplate = async (template) => {
        const confirmPayload = {
            title: `Delete`,
            description: `Delete Custom Template ${template.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await marketplacesApi.deleteCustomTemplate(template.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'Custom Template deleted successfully!',
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
                    getAllCustomTemplatesApi.request()
                }
            } catch (error) {
                enqueueSnackbar({
                    message: `Failed to delete custom template: ${
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

    function filterFlows(data) {
        return (
            (data.categories ? data.categories.join(',') : '').toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            data.templateName.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            (data.description && data.description.toLowerCase().indexOf(search.toLowerCase()) > -1)
        )
    }

    function filterByBadge(data) {
        return badgeFilter.length > 0 ? badgeFilter.includes(data.badge) : true
    }

    function filterByType(data) {
        return typeFilter.length > 0 ? typeFilter.includes(data.type) : true
    }

    function filterByFramework(data) {
        return frameworkFilter.length > 0 ? (data.framework || []).some((item) => frameworkFilter.includes(item)) : true
    }

    function filterByUsecases(data) {
        if (activeTabValue === 0)
            return selectedUsecases.length > 0 ? (data.usecases || []).some((item) => selectedUsecases.includes(item)) : true
        else
            return selectedTemplateUsecases.length > 0
                ? (data.usecases || []).some((item) => selectedTemplateUsecases.includes(item))
                : true
    }

    const getEligibleUsecases = (data, filter) => {
        if (!data) return

        let filteredData = data
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
        if (activeTabValue === 0) setEligibleUsecases(Array.from(new Set(usecases)).sort())
        else setEligibleTemplateUsecases(Array.from(new Set(usecases)).sort())
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
        if (selectedChatflow.type === 'AgentflowV2') {
            navigate(`/v2/marketplace/${selectedChatflow.id}`, { state: selectedChatflow })
        } else {
            navigate(`/marketplace/${selectedChatflow.id}`, { state: selectedChatflow })
        }
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
                const icons = {}
                for (let i = 0; i < flows.length; i += 1) {
                    if (flows[i].flowData) {
                        const flowDataStr = flows[i].flowData
                        const flowData = JSON.parse(flowDataStr)
                        usecases.push(...flows[i].usecases)
                        const nodes = flowData.nodes || []
                        images[flows[i].id] = []
                        icons[flows[i].id] = []
                        for (let j = 0; j < nodes.length; j += 1) {
                            const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === nodes[j].data.name)
                            if (foundIcon) {
                                icons[flows[i].id].push(foundIcon)
                            } else {
                                const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`
                                if (!images[flows[i].id].includes(imageSrc)) {
                                    images[flows[i].id].push(imageSrc)
                                }
                            }
                        }
                    }
                }
                setImages(images)
                setIcons(icons)
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

    useEffect(() => {
        setLoading(getAllCustomTemplatesApi.loading)
    }, [getAllCustomTemplatesApi.loading])

    useEffect(() => {
        if (getAllCustomTemplatesApi.data) {
            try {
                const flows = getAllCustomTemplatesApi.data
                const usecases = []
                const tImages = {}
                const tIcons = {}
                for (let i = 0; i < flows.length; i += 1) {
                    if (flows[i].flowData) {
                        const flowDataStr = flows[i].flowData
                        const flowData = JSON.parse(flowDataStr)
                        usecases.push(...flows[i].usecases)
                        if (flows[i].framework) {
                            flows[i].framework = [flows[i].framework] || []
                        }
                        const nodes = flowData.nodes || []
                        tImages[flows[i].id] = []
                        tIcons[flows[i].id] = []
                        for (let j = 0; j < nodes.length; j += 1) {
                            const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === nodes[j].data.name)
                            if (foundIcon) {
                                tIcons[flows[i].id].push(foundIcon)
                            } else {
                                const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`
                                if (!tImages[flows[i].id].includes(imageSrc)) {
                                    tImages[flows[i].id].push(imageSrc)
                                }
                            }
                        }
                    }
                }
                setTemplateImages(tImages)
                setTemplateIcons(tIcons)
                setTemplateUsecases(Array.from(new Set(usecases)).sort())
                setEligibleTemplateUsecases(Array.from(new Set(usecases)).sort())
            } catch (e) {
                console.error(e)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAllCustomTemplatesApi.data])

    useEffect(() => {
        if (getAllCustomTemplatesApi.error) {
            setError(getAllCustomTemplatesApi.error)
        }
    }, [getAllCustomTemplatesApi.error])

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column'>
                        <ViewHeader
                            filters={
                                <>
                                    <Stack flexDirection='row' gap={2}>
                                        <FormControl variant='standard' style={{ width: '130px', marginTop: '-10px', marginLeft: '10px' }}>
                                            <InputLabel
                                                id='demo-simple-select-standard-label'
                                                sx={{
                                                    color: customization?.isDarkMode ? '#fff' : '#000',
                                                    '&.Mui-focused': {
                                                        color: customization?.isDarkMode ? '#fff' : '#000'
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
                                                    <MenuItem key={name} value={name}>
                                                        <Checkbox checked={typeFilter.indexOf(name) > -1} />
                                                        <ListItemText primary={name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl variant='standard' style={{ width: '130px', marginTop: '-10px' }}>
                                            <InputLabel
                                                id='framework-label'
                                                sx={{
                                                    color: customization?.isDarkMode ? '#fff' : '#000',
                                                    '&.Mui-focused': {
                                                        color: customization?.isDarkMode ? '#fff' : '#000'
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
                                                    <MenuItem key={name} value={name}>
                                                        <Checkbox checked={frameworkFilter.indexOf(name) > -1} />
                                                        <ListItemText primary={name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl variant='standard' style={{ width: '130px', marginTop: '-10px' }}>
                                            <InputLabel
                                                id='Select-label'
                                                sx={{
                                                    color: customization?.isDarkMode ? '#fff' : '#000',
                                                    '&.Mui-focused': {
                                                        color: customization?.isDarkMode ? '#fff' : '#000'
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
                                                onChange={(event) => {
                                                    const {
                                                        target: { value }
                                                    } = event
                                                    setSelectedUsecases(typeof value === 'string' ? value.split(',') : value)
                                                }}
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
                                                    <MenuItem key={index} value={usecase}>
                                                        <Checkbox checked={selectedUsecases.includes(usecase)} />
                                                        <ListItemText primary={usecase} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </>
                            }
                            onSearchChange={onSearchChange}
                            search={true}
                            searchPlaceholder='Search Name/Description/Node'
                            title='Templates'
                            description='Explore and use pre-built templates'
                        >
                            <ToggleButtonGroup
                                sx={{ borderRadius: 2, height: '100%' }}
                                value={view}
                                color='primary'
                                exclusive
                                onChange={handleViewChange}
                            >
                                <ToggleButton
                                    sx={{
                                        borderColor: theme.palette.grey[900] + 25,
                                        borderRadius: 2,
                                        color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                                    }}
                                    variant='contained'
                                    value='card'
                                    title='Card View'
                                >
                                    <IconLayoutGrid style={{ color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4' }} />
                                </ToggleButton>
                                <ToggleButton
                                    sx={{
                                        borderColor: theme.palette.grey[900] + 25,
                                        borderRadius: 2,
                                        color: theme?.customization?.isDarkMode ? 'white' : 'inherit'
                                    }}
                                    variant='contained'
                                    value='list'
                                    title='List View'
                                >
                                    <IconList style={{ color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4' }} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </ViewHeader>
                        {/* <Tabs
                            value={activeTabValue}
                            onChange={handleTabChange}
                            textColor='primary'
                            aria-label='tabs'
                            TabIndicatorProps={{
                                style: {
                                    backgroundColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                    padding: '0px'
                                }
                            }}
                            centered
                            sx={{ mb: 2 }}
                        >
                            <Tab
                                value={0}
                                label='Community Templates'
                                sx={{
                                    color: customization.isDarkMode ? '#fff' : '#000',
                                    '&.Mui-selected': {
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    },
                                    '&:hover': {
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }
                                }}
                            />
                            <Tab
                                value={1}
                                label='My Templates'
                                sx={{
                                    color: customization.isDarkMode ? '#fff' : '#000',
                                    '&.Mui-selected': {
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    },
                                    '&:hover': {
                                        color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                    }
                                }}
                            />
                        </Tabs> */}
                        <TabPanel value={activeTabValue} index={0}>
                            {/* <Stack direction='row' sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                {usecases.map((usecase, index) => (
                                    <FormControlLabel
                                        key={index}
                                        size='small'
                                        control={
                                            <Checkbox
                                                disabled={eligibleUsecases.length === 0 ? true : !eligibleUsecases.includes(usecase)}
                                                color='success'
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
                            </Stack> */}
                            {/* {selectedUsecases.length > 0 && (
                                <Button
                                    sx={{ width: 'max-content', mb: 2, borderRadius: '20px' }}
                                    variant='outlined'
                                    onClick={() => clearAllUsecases()}
                                    startIcon={<IconX />}
                                >
                                    Clear All
                                </Button>
                            )} */}

                            {!view || view === 'card' ? (
                                <>
                                    {isLoading ? (
                                        <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
                                            <Skeleton variant='rounded' height={280} />
                                            <Skeleton variant='rounded' height={280} />
                                            <Skeleton variant='rounded' height={280} />
                                            <Skeleton variant='rounded' height={280} />
                                        </Box>
                                    ) : (
                                        <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
                                            {getAllTemplatesMarketplacesApi.data
                                                ?.filter(filterByBadge)
                                                .filter(filterByType)
                                                .filter(filterFlows)
                                                .filter(filterByFramework)
                                                .filter(filterByUsecases)
                                                .map((data, index) => (
                                                    <Box key={index}>
                                                        {data.badge && (
                                                            <Badge
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    '& .MuiBadge-badge': {
                                                                        right: 20
                                                                    }
                                                                }}
                                                                // badgeContent={data.badge}
                                                                // color={data.badge === 'POPULAR' ? 'primary' : 'error'}
                                                            >
                                                                {(data.type === 'chatflows' ||
                                                                    data.type === 'Agentflow' ||
                                                                    data.type === 'AgentflowV2') && (
                                                                    <ItemCard
                                                                        onClick={() => goToCanvas(data)}
                                                                        data={data}
                                                                        images={images[data.id]}
                                                                        icons={icons[data.id]}
                                                                    />
                                                                )}
                                                                {data.type === 'Tool' && (
                                                                    <ItemCard data={data} onClick={() => goToTool(data)} />
                                                                )}
                                                            </Badge>
                                                        )}
                                                        {!data.badge &&
                                                            (data.type === 'chatflows' ||
                                                                data.type === 'Agentflow' ||
                                                                data.type === 'AgentflowV2') && (
                                                                <ItemCard
                                                                    onClick={() => goToCanvas(data)}
                                                                    data={data}
                                                                    images={images[data.id]}
                                                                    icons={icons[data.id]}
                                                                />
                                                            )}
                                                        {!data.badge && data.type === 'Tool' && (
                                                            <ItemCard data={data} onClick={() => goToTool(data)} />
                                                        )}
                                                    </Box>
                                                ))}
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <MarketplaceTable
                                    data={getAllTemplatesMarketplacesApi.data}
                                    filterFunction={filterFlows}
                                    filterByType={filterByType}
                                    filterByBadge={filterByBadge}
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
                                            style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                                            src={WorkflowEmptySVG}
                                            alt='WorkflowEmptySVG'
                                        />
                                    </Box>
                                    <div>No Marketplace Yet</div>
                                </Stack>
                            )}
                        </TabPanel>
                        <TabPanel value={activeTabValue} index={1}>
                            <Stack direction='row' sx={{ gap: 2, my: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                {templateUsecases.map((usecase, index) => (
                                    <FormControlLabel
                                        key={index}
                                        size='small'
                                        control={
                                            <Checkbox
                                                disabled={
                                                    eligibleTemplateUsecases.length === 0
                                                        ? true
                                                        : !eligibleTemplateUsecases.includes(usecase)
                                                }
                                                color='success'
                                                checked={selectedTemplateUsecases.includes(usecase)}
                                                onChange={(event) => {
                                                    setSelectedTemplateUsecases(
                                                        event.target.checked
                                                            ? [...selectedTemplateUsecases, usecase]
                                                            : selectedTemplateUsecases.filter((item) => item !== usecase)
                                                    )
                                                }}
                                            />
                                        }
                                        label={usecase}
                                    />
                                ))}
                            </Stack>
                            {selectedTemplateUsecases.length > 0 && (
                                <Button
                                    sx={{ width: 'max-content', mb: 2, borderRadius: '20px' }}
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
                                            <Skeleton variant='rounded' height={280} />
                                            <Skeleton variant='rounded' height={280} />
                                            <Skeleton variant='rounded' height={280} />
                                            <Skeleton variant='rounded' height={280} />
                                        </Box>
                                    ) : (
                                        <Box display='grid' gridTemplateColumns='repeat(4, 1fr)' gap={gridSpacing}>
                                            {getAllCustomTemplatesApi.data
                                                ?.filter(filterByBadge)
                                                .filter(filterByType)
                                                .filter(filterFlows)
                                                .filter(filterByFramework)
                                                .filter(filterByUsecases)
                                                .map((data, index) => (
                                                    <Box key={index}>
                                                        {data.badge && (
                                                            <Badge
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    '& .MuiBadge-badge': {
                                                                        right: 20
                                                                    }
                                                                }}
                                                                badgeContent={data.badge}
                                                                color={data.badge === 'POPULAR' ? 'primary' : 'error'}
                                                            >
                                                                {(data.type === 'chatflows' ||
                                                                    data.type === 'Agentflow' ||
                                                                    data.type === 'AgentflowV2') && (
                                                                    <ItemCard
                                                                        onClick={() => goToCanvas(data)}
                                                                        data={data}
                                                                        images={templateImages[data.id]}
                                                                        icons={templateIcons[data.id]}
                                                                    />
                                                                )}
                                                                {data.type === 'Tool' && (
                                                                    <ItemCard data={data} onClick={() => goToTool(data)} />
                                                                )}
                                                            </Badge>
                                                        )}
                                                        {!data.badge &&
                                                            (data.type === 'chatflows' ||
                                                                data.type === 'Agentflow' ||
                                                                data.type === 'AgentflowV2') && (
                                                                <ItemCard
                                                                    onClick={() => goToCanvas(data)}
                                                                    data={data}
                                                                    images={templateImages[data.id]}
                                                                    icons={templateIcons[data.id]}
                                                                />
                                                            )}
                                                        {!data.badge && data.type === 'Tool' && (
                                                            <ItemCard data={data} onClick={() => goToTool(data)} />
                                                        )}
                                                    </Box>
                                                ))}
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <MarketplaceTable
                                    data={getAllCustomTemplatesApi.data}
                                    filterFunction={filterFlows}
                                    filterByType={filterByType}
                                    filterByBadge={filterByBadge}
                                    filterByFramework={filterByFramework}
                                    filterByUsecases={filterByUsecases}
                                    goToTool={goToTool}
                                    goToCanvas={goToCanvas}
                                    isLoading={isLoading}
                                    setError={setError}
                                    onDelete={onDeleteCustomTemplate}
                                />
                            )}
                            {!isLoading && (!getAllCustomTemplatesApi.data || getAllCustomTemplatesApi.data.length === 0) && (
                                <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                    <Box sx={{ p: 2, height: 'auto' }}>
                                        <img
                                            style={{ objectFit: 'cover', height: '25vh', width: 'auto' }}
                                            src={WorkflowEmptySVG}
                                            alt='WorkflowEmptySVG'
                                        />
                                    </Box>
                                    <div>No Saved Custom Templates</div>
                                </Stack>
                            )}
                        </TabPanel>
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
            <ConfirmDialog />
        </>
    )
}

export default Marketplace
