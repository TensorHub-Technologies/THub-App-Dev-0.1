import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect, useRef, useContext, memo } from 'react'
import { useUpdateNodeInternals } from 'reactflow'
import PropTypes from 'prop-types'
import { Stack, Box, Typography, TextField, Dialog, DialogContent, ButtonBase, Avatar } from '@mui/material'
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'
import { IconPencil, IconX, IconCheck, IconInfoCircle } from '@tabler/icons-react'
import { useTheme } from '@mui/material/styles'
import { flowContext } from '@/store/context/ReactFlowContext'
import { showHideInputParams } from '@/utils/genericHelper'
import AgentNodeInputHandler from '../canvas/AgentNodeInputHandler'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

const EditNodeDialog = ({ show, dialogProps, onCancel }) => {
    const portalElement = document.getElementById('portal')
    const dispatch = useDispatch()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const nodeNameRef = useRef()
    const { reactFlowInstance } = useContext(flowContext)
    const updateNodeInternals = useUpdateNodeInternals()

    const [inputParams, setInputParams] = useState([])
    const [data, setData] = useState({})
    const [isEditingNodeName, setEditingNodeName] = useState(null)
    const [nodeName, setNodeName] = useState('')

    const [value, setValue] = useState('1')

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const onNodeLabelChange = () => {
        reactFlowInstance.setNodes((nds) =>
            nds.map((node) => {
                if (node.id === data.id) {
                    node.data = {
                        ...node.data,
                        label: nodeNameRef.current.value
                    }
                    setData(node.data)
                }
                return node
            })
        )
        updateNodeInternals(data.id)
    }

    const onCustomDataChange = ({ nodeId, inputParam, newValue }) => {
        reactFlowInstance.setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    const updatedInputs = {
                        ...node.data.inputs,
                        [inputParam.name]: newValue
                    }

                    const updatedInputParams = showHideInputParams({
                        ...node.data,
                        inputs: updatedInputs
                    })

                    // Remove inputs with display set to false
                    Object.keys(updatedInputs).forEach((key) => {
                        const input = updatedInputParams.find((param) => param.name === key)
                        if (input && input.display === false) {
                            delete updatedInputs[key]
                        }
                    })

                    node.data = {
                        ...node.data,
                        inputParams: updatedInputParams,
                        inputs: updatedInputs
                    }

                    setInputParams(updatedInputParams)
                    setData(node.data)
                }
                return node
            })
        )
    }

    useEffect(() => {
        if (dialogProps.inputParams) {
            setInputParams(dialogProps.inputParams)
        }
        if (dialogProps.data) {
            setData(dialogProps.data)
            if (dialogProps.data.label) setNodeName(dialogProps.data.label)
        }

        return () => {
            setInputParams([])
            setData({})
        }
    }, [dialogProps])

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    const component = show ? (
        <Dialog
            onClose={onCancel}
            open={show}
            fullWidth
            maxWidth='sm'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogContent>
                {data && data.name && (
                    <Box sx={{ width: '100%' }}>
                        {!isEditingNodeName ? (
                            <Stack flexDirection='row' sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography
                                    sx={{
                                        ml: 2,
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap'
                                    }}
                                    variant='h4'
                                >
                                    {nodeName}
                                </Typography>

                                {data?.id && (
                                    <ButtonBase title='Edit Name' sx={{ borderRadius: '50%' }}>
                                        <Avatar
                                            variant='rounded'
                                            sx={{
                                                ...theme.typography.commonAvatar,
                                                ...theme.typography.mediumAvatar,
                                                transition: 'all .2s ease-in-out',
                                                ml: 1,
                                                background: theme.palette.secondary.light,
                                                color: theme.palette.secondary.dark,
                                                '&:hover': {
                                                    background: theme.palette.secondary.dark,
                                                    color: theme.palette.secondary.light
                                                }
                                            }}
                                            color='inherit'
                                            onClick={() => setEditingNodeName(true)}
                                        >
                                            <IconPencil stroke={1.5} size='1rem' />
                                        </Avatar>
                                    </ButtonBase>
                                )}
                            </Stack>
                        ) : (
                            <Stack flexDirection='row' sx={{ width: '100%' }}>
                                <TextField
                                    //eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                    size='small'
                                    sx={{
                                        width: '100%',
                                        ml: 2
                                    }}
                                    inputRef={nodeNameRef}
                                    defaultValue={nodeName}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            data.label = nodeNameRef.current.value
                                            setNodeName(nodeNameRef.current.value)
                                            onNodeLabelChange()
                                            setEditingNodeName(false)
                                        } else if (e.key === 'Escape') {
                                            setEditingNodeName(false)
                                        }
                                    }}
                                />
                                <ButtonBase title='Save Name' sx={{ borderRadius: '50%' }}>
                                    <Avatar
                                        variant='rounded'
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background: theme.palette.success.light,
                                            color: theme.palette.success.dark,
                                            ml: 1,
                                            '&:hover': {
                                                background: theme.palette.success.dark,
                                                color: theme.palette.success.light
                                            }
                                        }}
                                        color='inherit'
                                        onClick={() => {
                                            data.label = nodeNameRef.current.value
                                            setNodeName(nodeNameRef.current.value)
                                            onNodeLabelChange()
                                            setEditingNodeName(false)
                                        }}
                                    >
                                        <IconCheck stroke={1.5} size='1rem' />
                                    </Avatar>
                                </ButtonBase>
                                <ButtonBase title='Cancel' sx={{ borderRadius: '50%' }}>
                                    <Avatar
                                        variant='rounded'
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background: theme.palette.error.light,
                                            color: theme.palette.error.dark,
                                            ml: 1,
                                            '&:hover': {
                                                background: theme.palette.error.dark,
                                                color: theme.palette.error.light
                                            }
                                        }}
                                        color='inherit'
                                        onClick={() => setEditingNodeName(false)}
                                    >
                                        <IconX stroke={1.5} size='1rem' />
                                    </Avatar>
                                </ButtonBase>
                            </Stack>
                        )}
                    </Box>
                )}
                {data?.hint && (
                    <Stack
                        direction='row'
                        alignItems='center'
                        sx={{
                            ml: 2,
                            backgroundColor: customization.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                            borderRadius: '8px',
                            mr: 2,
                            px: 1.5,
                            py: 1,
                            mt: 1,
                            mb: 1,
                            border: `1px solid ${customization.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                        }}
                    >
                        <IconInfoCircle size='1rem' stroke={1.5} color={theme.palette.info.main} style={{ marginRight: '6px' }} />
                        <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                                fontStyle: 'italic',
                                lineHeight: 1.2
                            }}
                        >
                            {data.hint}
                        </Typography>
                    </Stack>
                )}
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label='lab API tabs example'>
                                <Tab label='Basic Settings' value='1' />
                                <Tab label='Model Settings' value='2' />
                                <Tab label='Additional Options' value='3' />
                            </TabList>
                        </Box>

                        <TabPanel value='1'>
                            {/* Tab 1: Basic Settings - Filter inputs for basic/essential parameters */}
                            {inputParams
                                .filter((inputParam) => inputParam.display !== false)
                                .filter((inputParam) => {
                                    // Define criteria for Tab 1 - Basic Settings
                                    const basicInputTypes = ['string', 'number', 'boolean', 'options']
                                    const basicInputNames = ['name', 'description', 'model', 'temperature', 'maxTokens']

                                    return (
                                        basicInputTypes.includes(inputParam.type) ||
                                        basicInputNames.includes(inputParam.name) ||
                                        inputParam.category === 'basic'
                                    )
                                })
                                .map((inputParam, index) => {
                                    console.log('Tab 1 inputParam:', inputParam)
                                    return (
                                        <AgentNodeInputHandler
                                            disabled={dialogProps.disabled}
                                            key={`tab1_${index}`}
                                            inputParam={inputParam}
                                            data={data}
                                            isAdditionalParams={true}
                                            onCustomDataChange={onCustomDataChange}
                                        />
                                    )
                                })}
                        </TabPanel>

                        <TabPanel value='2'>
                            {/* Tab 2: Advanced Settings - Filter inputs for advanced parameters */}
                            {inputParams
                                .filter((inputParam) => inputParam.display !== false)
                                .filter((inputParam) => {
                                    // Define criteria for Tab 2 - Advanced Settings
                                    const advancedInputTypes = ['code', 'json', 'asyncOptions', 'multiOptions']
                                    const advancedInputNames = ['systemPrompt', 'userPrompt', 'functions', 'tools']

                                    return (
                                        advancedInputTypes.includes(inputParam.type) ||
                                        advancedInputNames.includes(inputParam.name) ||
                                        inputParam.category === 'advanced'
                                    )
                                })
                                .map((inputParam, index) => {
                                    console.log('Tab 2 inputParam:', inputParam)
                                    return (
                                        <AgentNodeInputHandler
                                            disabled={dialogProps.disabled}
                                            key={`tab2_${index}`}
                                            inputParam={inputParam}
                                            data={data}
                                            isAdditionalParams={true}
                                            onCustomDataChange={onCustomDataChange}
                                        />
                                    )
                                })}
                        </TabPanel>

                        <TabPanel value='3'>
                            {/* Tab 3: Additional Options - Filter inputs for additional/optional parameters */}
                            {inputParams
                                .filter((inputParam) => inputParam.display !== false)
                                .filter((inputParam) => {
                                    // Define criteria for Tab 3 - Additional Options
                                    const additionalInputTypes = ['file', 'credential', 'datagrid', 'array']
                                    const additionalInputNames = ['metadata', 'tags', 'debug', 'verbose']

                                    return (
                                        additionalInputTypes.includes(inputParam.type) ||
                                        additionalInputNames.includes(inputParam.name) ||
                                        inputParam.category === 'additional' ||
                                        inputParam.optional === true
                                    )
                                })
                                .map((inputParam, index) => {
                                    console.log('Tab 3 inputParam:', inputParam)
                                    return (
                                        <AgentNodeInputHandler
                                            disabled={dialogProps.disabled}
                                            key={`tab3_${index}`}
                                            inputParam={inputParam}
                                            data={data}
                                            isAdditionalParams={true}
                                            onCustomDataChange={onCustomDataChange}
                                        />
                                    )
                                })}
                        </TabPanel>
                    </TabContext>
                </Box>
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

EditNodeDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func
}

export default memo(EditNodeDialog)
