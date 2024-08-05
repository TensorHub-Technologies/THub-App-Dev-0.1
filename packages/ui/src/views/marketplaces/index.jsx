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
    useMediaQuery,
    IconButton,
    FormControlLabel,
    FormGroup
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconChevronsDown, IconChevronsUp, IconLayoutGrid, IconList } from '@tabler/icons'
import IconFilterList from '@mui/icons-material/FilterList'
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

// const ITEM_HEIGHT = 48
// const ITEM_PADDING_TOP = 8
// const badges = ['POPULAR', 'NEW']
const types = ['Chatflow', 'Tool']
const framework = ['Langchain', 'LlamaIndex']
// const MenuProps = {
//     PaperProps: {
//         style: {
//             maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//             width: 250
//         }
//     }
// }
// ==============================|| Marketplace ||============================== //

const Marketplace = () => {
    const navigate = useNavigate()

    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const [isLoading, setLoading] = useState(true)
    const [images, setImages] = useState({})

    const [showToolDialog, setShowToolDialog] = useState(false)
    const [toolDialogProps, setToolDialogProps] = useState({})

    const getAllTemplatesMarketplacesApi = useApi(marketplacesApi.getAllTemplatesFromMarketplaces)

    const [view, setView] = React.useState(localStorage.getItem('mpDisplayStyle') || 'card')
    const [search, setSearch] = useState('')

    // const [badgeFilter, setBadgeFilter] = useState([])
    const [badgeFilter] = useState([])
    const [typeFilter, setTypeFilter] = useState([])
    const [frameworkFilter, setFrameworkFilter] = useState([])
    const [open, setOpen] = useState(false)
    const minScreen = useMediaQuery('(max-width:600px)')

    // const handleBadgeFilterChange = (event) => {
    //     const {
    //         target: { value }
    //     } = event
    //     setBadgeFilter(
    //         // On autofill we get a stringified value.
    //         typeof value === 'string' ? value.split(',') : value
    //     )
    // }

    const [isInputFocused, setInputFocused] = useState(false)
    const handleTypeFilterChange = (event) => {
        const {
            target: { value, checked }
        } = event

        const updatedTypeFilter = checked ? [...typeFilter, value] : typeFilter.filter((item) => item !== value)

        setTypeFilter(updatedTypeFilter)
    }
    const handleFrameworkFilterChange = (event) => {
        const {
            target: { value, checked }
        } = event

        const updatedFilter = checked ? [...frameworkFilter, value] : frameworkFilter.filter((item) => item !== value)

        setFrameworkFilter(updatedFilter)
    }

    const handleViewChange = (event, nextView) => {
        if (nextView === null) return
        localStorage.setItem('mpDisplayStyle', nextView)
        setView(nextView)
    }

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    function filterFlows(data) {
        return (
            data.categories?.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
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

                const images = {}
                for (let i = 0; i < flows.length; i += 1) {
                    if (flows[i].flowData) {
                        const flowDataStr = flows[i].flowData
                        const flowData = JSON.parse(flowDataStr)
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
            } catch (e) {
                console.error(e)
            }
        }
    }, [getAllTemplatesMarketplacesApi.data])

    return (
        <>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '#e3f2fd' }}>
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
                        {/*<h1>Templates</h1>*/}
                        {/*<TextField*/}
                        {/*    size='small'*/}
                        {/*    id='search-filter-textbox'*/}
                        {/*    sx={{ display: { xs: 'none', sm: 'block' }, ml: 3 }}*/}
                        {/*    variant='outlined'*/}
                        {/*    fullWidth='true'*/}
                        {/*    placeholder='Search name or description or node name'*/}
                        {/*    onChange={onSearchChange}*/}
                        {/*    InputProps={{*/}
                        {/*        startAdornment: (*/}
                        {/*            <InputAdornment position='start'>*/}
                        {/*                <IconSearch />*/}
                        {/*            </InputAdornment>*/}
                        {/*        )*/}
                        {/*    }}*/}
                        {/*/>*/}
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
                        {minScreen ? (
                            <IconButton sx={{ ml: 3 }} onClick={() => setOpen(!open)} aria-label={open ? 'Hide Filters' : 'Show Filters'}>
                                {open ? <IconFilterList /> : <IconFilterList />}
                            </IconButton>
                        ) : (
                            <Button
                                sx={{
                                    width: '220px',
                                    ml: 3,
                                    mr: 5,
                                    color: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    borderColor: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                    '&:hover': {
                                        borderColor: customization.isDarkMode ? '#3C5BA4 !important' : '#E22A90 !important'
                                    }
                                }}
                                variant='outlined'
                                onClick={() => setOpen(!open)}
                                startIcon={open ? <IconChevronsUp /> : <IconChevronsDown />}
                            >
                                {open ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        )}
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
                                            // color: theme?.customization?.isDarkMode ? 'white' : 'inherit',
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
                                            // color: theme?.customization?.isDarkMode ? 'white' : 'inherit',
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
                {open && (
                    <Box sx={{ flexGrow: 1, mb: 2 }}>
                        <Toolbar
                            disableGutters={true}
                            style={{
                                margin: 1,
                                padding: 1,
                                paddingBottom: 10,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                width: '100%',
                                borderBottom: '1px solid'
                            }}
                        >
                            {/* <FormControl sx={{ m: 1, width: 250 }}>
                                <InputLabel size='small' id='filter-badge-label'>
                                    Tag
                                </InputLabel>
                                <Select
                                    labelId='filter-badge-label'
                                    id='filter-badge-checkbox'
                                    size='small'
                                    multiple
                                    value={badgeFilter}
                                    onChange={handleBadgeFilterChange}
                                    input={<OutlinedInput label='Badge' />}
                                    renderValue={(selected) => selected.join(', ')}
                                    MenuProps={MenuProps}
                                >
                                    {badges.map((name) => (
                                        <MenuItem key={name} value={name}>
                                            <Checkbox checked={badgeFilter.indexOf(name) > -1} />
                                            <ListItemText primary={name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                                <FormControl
                                    component='fieldset'
                                    sx={{
                                        width: 280,
                                        border: `1.5px solid ${customization.isDarkMode ? '#E22A90' : '#3C5BA4'}`,
                                        borderRadius: '10px'
                                    }}
                                >
                                    <legend style={{ marginLeft: '28px' }}>AI Workspace</legend>
                                    <FormGroup row sx={{ paddingLeft: '26px', marginBottom: '8px' }}>
                                        {types.map((name) => (
                                            <FormControlLabel
                                                key={name}
                                                control={
                                                    <Checkbox
                                                        checked={typeFilter.indexOf(name) > -1}
                                                        onChange={handleTypeFilterChange}
                                                        value={name}
                                                        // sx={{
                                                        //     color: `${customization.isDarkMode ? '#E22A90' : '#3C5BA4'}`
                                                        // }}
                                                    />
                                                }
                                                label={name}
                                            />
                                        ))}
                                    </FormGroup>
                                </FormControl>
                                <FormControl
                                    component='fieldset'
                                    sx={{
                                        width: 280,
                                        border: `1.5px solid ${customization.isDarkMode ? '#E22A90' : '#3C5BA4'}`,
                                        borderRadius: '10px'
                                    }}
                                >
                                    <legend style={{ marginLeft: '28px' }}>Framework</legend>
                                    <FormGroup row sx={{ paddingLeft: '26px', marginBottom: '8px' }}>
                                        {framework.map((name) => (
                                            <FormControlLabel
                                                key={name}
                                                control={
                                                    <Checkbox
                                                        checked={frameworkFilter.indexOf(name) > -1}
                                                        onChange={handleFrameworkFilterChange}
                                                        value={name}
                                                        // sx={{
                                                        //     color: `${customization.isDarkMode ? '#E22A90' : '#3C5BA4'}`
                                                        // }}
                                                    />
                                                }
                                                label={name}
                                            />
                                        ))}
                                    </FormGroup>
                                </FormControl>
                            </Stack>
                        </Toolbar>
                    </Box>
                )}

                {!isLoading && (!view || view === 'card') && getAllTemplatesMarketplacesApi?.data && (
                    <>
                        <Grid container spacing={gridSpacing}>
                            {getAllTemplatesMarketplacesApi?.data
                                .filter(filterByBadge)
                                .filter(filterByType)
                                .filter(filterFlows)
                                .filter(filterByFramework)
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
                        </Grid>
                    </>
                )}
                {!isLoading && view === 'list' && getAllTemplatesMarketplacesApi.data && (
                    <MarketplaceTable
                        sx={{ mt: 20 }}
                        data={getAllTemplatesMarketplacesApi.data}
                        filterFunction={filterFlows}
                        filterByType={filterByType}
                        filterByBadge={filterByBadge}
                        filterByFramework={filterByFramework}
                        goToTool={goToTool}
                        goToCanvas={goToCanvas}
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
