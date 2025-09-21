import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect, useRef, useContext, memo } from 'react'
import { useUpdateNodeInternals } from 'reactflow'
import PropTypes from 'prop-types'
import { Stack, Box, Typography, TextField, Dialog, DialogContent, ButtonBase } from '@mui/material'
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

const DynamicNodeTabView = ({ inputParams, dialogProps, data, onCustomDataChange }) => {
    const customization = useSelector((state) => state.customization)

    // Helper function to check if a tab should be displayedd
    const shouldShowTab = (tabType, inputParams) => {
        // For tools tab, check all params including those with display: false
        if (tabType === 'tools') {
            return inputParams.some(
                (param) =>
                    param.name.includes('Tools') ||
                    param.name.includes('Tool') ||
                    param.loadMethod === 'listTools' ||
                    param.name === 'agentToolsBuiltInOpenAI' // Include OpenAI built-in tools regardless of display
            )
        }

        const visibleParams = inputParams.filter((param) => param.display !== false)

        switch (tabType) {
            case 'model':
                return visibleParams.some(
                    (param) => param.name.includes('Model') || (param.type === 'asyncOptions' && param.loadMethod === 'listModels')
                )

            case 'messages':
                return visibleParams.some(
                    (param) =>
                        param.name.includes('Messages') ||
                        param.name.includes('UserMessage') ||
                        param.name.includes('Input') ||
                        (param.type === 'array' && param.name.toLowerCase().includes('message'))
                )

            case 'knowledge':
                return visibleParams.some(
                    (param) =>
                        param.name.includes('Knowledge') ||
                        param.name.includes('DocumentStores') ||
                        param.name.includes('VSEmbeddings') ||
                        param.loadMethod === 'listStores' ||
                        param.loadMethod === 'listVectorStores'
                )

            case 'memory':
                return visibleParams.some((param) => param.name.includes('Memory') || param.name.includes('Ephemeral'))

            case 'state':
                return visibleParams.some((param) => param.name.includes('State') || param.name.includes('UpdateState'))

            case 'form':
                return visibleParams.some(
                    (param) => param.name.includes('form') || param.name.includes('Form') || param.name === 'startInputType'
                )

            case 'loop':
                return visibleParams.some(
                    (param) => param.name.includes('Loop') || param.name.includes('loop') || param.loadMethod === 'listPreviousNodes'
                )

            case 'additional': {
                const excludedParams = [
                    'Model',
                    'Messages',
                    'UserMessage',
                    'Tools',
                    'Tool',
                    'Knowledge',
                    'DocumentStores',
                    'VSEmbeddings',
                    'Memory',
                    'Ephemeral',
                    'State',
                    'UpdateState',
                    'form',
                    'Form',
                    'startInputType',
                    'Loop',
                    'loop'
                ]
                const excludedLoadMethods = ['listModels', 'listTools', 'listStores', 'listVectorStores', 'listPreviousNodes']
                const excludedSpecificNames = ['agentToolsBuiltInOpenAI'] // Exclude OpenAI built-in tools from additional tab

                return visibleParams.some((param) => {
                    const hasExcludedName = excludedParams.some((excluded) => param.name.includes(excluded))
                    const hasExcludedLoadMethod = param.loadMethod && excludedLoadMethods.includes(param.loadMethod)
                    const hasExcludedSpecificName = excludedSpecificNames.includes(param.name)
                    return !hasExcludedName && !hasExcludedLoadMethod && !hasExcludedSpecificName
                })
            }

            default:
                return false
        }
    }

    // Get filtered parameters for each tab
    const getTabParameters = (tabType, inputParams) => {
        return inputParams
            .filter((param) => {
                // For tools tab, include OpenAI built-in tools even if display is false
                if (tabType === 'tools' && param.name === 'agentToolsBuiltInOpenAI') {
                    return true
                }
                // For other parameters, respect the display property
                return param.display !== false
            })
            .filter((param) => {
                switch (tabType) {
                    case 'model':
                        return param.name.includes('Model') || (param.type === 'asyncOptions' && param.loadMethod === 'listModels')

                    case 'messages':
                        return (
                            param.name.includes('Messages') ||
                            param.name.includes('UserMessage') ||
                            param.name.includes('Input') ||
                            (param.type === 'array' && param.name.toLowerCase().includes('message'))
                        )

                    case 'tools':
                        return (
                            param.name.includes('Tools') ||
                            param.name.includes('Tool') ||
                            param.loadMethod === 'listTools' ||
                            param.name === 'agentToolsBuiltInOpenAI' // Include OpenAI built-in tools
                        )

                    case 'knowledge':
                        return (
                            param.name.includes('Knowledge') ||
                            param.name.includes('DocumentStores') ||
                            param.name.includes('VSEmbeddings') ||
                            param.loadMethod === 'listStores' ||
                            param.loadMethod === 'listVectorStores'
                        )

                    case 'memory':
                        return param.name.includes('Memory') || param.name.includes('Ephemeral')

                    case 'state':
                        return param.name.includes('State') || param.name.includes('UpdateState')

                    case 'form':
                        return param.name.includes('form') || param.name.includes('Form') || param.name === 'startInputType'

                    case 'loop':
                        return param.name.includes('Loop') || param.name.includes('loop') || param.loadMethod === 'listPreviousNodes'

                    case 'additional': {
                        const excludedParams = [
                            'Model',
                            'Messages',
                            'UserMessage',
                            'Tools',
                            'Tool',
                            'Knowledge',
                            'DocumentStores',
                            'VSEmbeddings',
                            'Memory',
                            'Ephemeral',
                            'State',
                            'UpdateState',
                            'form',
                            'Form',
                            'startInputType',
                            'Loop',
                            'loop'
                        ]
                        const excludedLoadMethods = ['listModels', 'listTools', 'listStores', 'listVectorStores', 'listPreviousNodes']
                        const excludedSpecificNames = ['agentToolsBuiltInOpenAI'] // Exclude OpenAI built-in tools from additional tab

                        const hasExcludedName = excludedParams.some((excluded) => param.name.includes(excluded))
                        const hasExcludedLoadMethod = param.loadMethod && excludedLoadMethods.includes(param.loadMethod)
                        const hasExcludedSpecificName = excludedSpecificNames.includes(param.name)
                        return !hasExcludedName && !hasExcludedLoadMethod && !hasExcludedSpecificName
                    }

                    default:
                        return false
                }
            })
    }

    // Define all possible tabs with their configurations
    const tabConfigs = [
        { key: 'model', label: 'LLM', value: '1' },
        { key: 'messages', label: 'Prompts ', value: '2' },
        { key: 'tools', label: 'Tools', value: '3' },
        { key: 'knowledge', label: 'Storage', value: '4' },
        { key: 'memory', label: 'Memory', value: '5' },
        { key: 'state', label: 'State', value: '6' },
        { key: 'form', label: 'Form', value: '7' },
        { key: 'loop', label: 'Loop', value: '8' },
        { key: 'additional', label: 'Additional', value: '9' }
    ]

    // Filter tabs based on available parameters
    const availableTabs = tabConfigs.filter((tab) => shouldShowTab(tab.key, inputParams))

    // Set default value to first available tab
    const [value, setValue] = useState(availableTabs[0]?.value || '1')

    // Update selected tab when availableTabs change
    useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.some((tab) => tab.value === value)) {
            setValue(availableTabs[0].value)
        }
    }, [availableTabs, value])

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    // Don't render if no tabs are available
    if (availableTabs.length === 0) {
        return null
    }

    const tabColor = customization.isDarkMode ? '#e22a90' : '#3c5ba4'

    return (
        <Box sx={{ width: '100%', typography: 'body1', marginTop: '10px' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        onChange={handleChange}
                        aria-label='Dynamic node configuration tabs'
                        textColor='inherit'
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: tabColor // underline color
                            }
                        }}
                    >
                        {availableTabs.map((tab) => (
                            <Tab
                                key={tab.key}
                                label={tab.label}
                                value={tab.value}
                                sx={{
                                    color: customization.isDarkMode ? '#fff' : 'black',
                                    '&.Mui-selected': {
                                        color: tabColor
                                    }
                                }}
                            />
                        ))}
                    </TabList>
                </Box>

                {availableTabs.map((tab) => (
                    <TabPanel key={tab.key} value={tab.value}>
                        {getTabParameters(tab.key, inputParams).map((inputParam, index) => {
                            // Remove console.log in production or use a proper logging solution
                            if (process.env.NODE_ENV === 'development') {
                                console.log(`${tab.key} tab inputParam:`, inputParam)
                            }
                            return (
                                <AgentNodeInputHandler
                                    disabled={dialogProps?.disabled}
                                    key={`${tab.key}_${index}`}
                                    inputParam={inputParam}
                                    data={data}
                                    isAdditionalParams={true}
                                    onCustomDataChange={onCustomDataChange}
                                />
                            )
                        })}
                    </TabPanel>
                ))}
            </TabContext>
        </Box>
    )
}

// Add PropTypes for the component
DynamicNodeTabView.propTypes = {
    inputParams: PropTypes.array.isRequired,
    dialogProps: PropTypes.object,
    data: PropTypes.object,
    onCustomDataChange: PropTypes.func
}

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

    console.log(inputParams, 'inputParams')

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
            maxWidth='lg'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            PaperProps={{
                sx: {
                    width: '650px',
                    height: '80vh',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }
            }}
        >
            <DialogContent
                className={customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'}
                sx={{ padding: '0px' }}
            >
                {data && data.name && (
                    <Box
                        sx={{
                            width: '100%',
                            backgroundColor: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {!isEditingNodeName ? (
                            <Stack
                                flexDirection='row'
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '0 16px'
                                }}
                            >
                                <Typography
                                    sx={{
                                        flex: 1,
                                        color: '#fff',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    {nodeName}
                                </Typography>

                                {data?.id && (
                                    <ButtonBase
                                        title='Edit Name'
                                        sx={{
                                            borderRadius: '50%',
                                            color: 'inherit',
                                            '&:hover': {
                                                '& svg': {
                                                    transform: 'scale(1.2)'
                                                }
                                            }
                                        }}
                                        onClick={() => setEditingNodeName(true)}
                                    >
                                        <IconPencil
                                            stroke={1.5}
                                            size='1.5rem'
                                            style={{
                                                color: '#fff',
                                                transition: 'transform 0.2s ease-in-out'
                                            }}
                                        />
                                    </ButtonBase>
                                )}
                            </Stack>
                        ) : (
                            <Stack
                                flexDirection='row'
                                sx={{
                                    width: '100%',
                                    padding: '0 16px',
                                    alignItems: 'center'
                                }}
                            >
                                <TextField
                                    id='standard-basic'
                                    variant='standard'
                                    size='small'
                                    sx={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'none',
                                        input: {
                                            color: '#fff',
                                            fontSize: '1.1rem',
                                            padding: '0'
                                        }
                                    }}
                                    InputProps={{
                                        disableUnderline: false,
                                        sx: {
                                            '&:before': {
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
                                            },
                                            '&:after': {
                                                borderBottom: '2px solid #fff'
                                            },
                                            '&:hover:not(.Mui-disabled):before': {
                                                borderBottom: '2px solid rgba(255, 255, 255, 0.7)'
                                            }
                                        }
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
                                <ButtonBase
                                    title='Save Name'
                                    sx={{
                                        borderRadius: '50%',
                                        color: 'inherit',
                                        ml: 1,
                                        '&:hover': {
                                            '& svg': {
                                                transform: 'scale(1.2)'
                                            }
                                        }
                                    }}
                                    onClick={() => {
                                        data.label = nodeNameRef.current.value
                                        setNodeName(nodeNameRef.current.value)
                                        onNodeLabelChange()
                                        setEditingNodeName(false)
                                    }}
                                >
                                    <IconCheck
                                        stroke={1.5}
                                        size='1.5rem'
                                        style={{
                                            color: '#fff',
                                            transition: 'transform 0.2s ease-in-out'
                                        }}
                                    />
                                </ButtonBase>
                                <ButtonBase
                                    title='Cancel'
                                    sx={{
                                        borderRadius: '50%',
                                        color: 'inherit',
                                        ml: 1,
                                        '&:hover': {
                                            '& svg': {
                                                transform: 'scale(1.2)'
                                            }
                                        }
                                    }}
                                    onClick={() => setEditingNodeName(false)}
                                >
                                    <IconX
                                        stroke={1.5}
                                        size='1.5rem'
                                        style={{
                                            color: '#fff',
                                            transition: 'transform 0.2s ease-in-out'
                                        }}
                                    />
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
                <DynamicNodeTabView
                    inputParams={inputParams}
                    dialogProps={dialogProps}
                    data={data}
                    onCustomDataChange={onCustomDataChange}
                />
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
