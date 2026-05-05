import PropTypes from 'prop-types'
import React, { useContext, memo, useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Handle, Position, useUpdateNodeInternals, NodeToolbar } from 'reactflow'

// material-ui
import { styled, useTheme } from '@mui/material/styles'
import { ButtonGroup, Avatar, Box, Typography, IconButton, Tooltip, Card } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { flowContext } from '@/store/context/ReactFlowContext'
import NodeInfoDialog from '@/ui-component/dialog/NodeInfoDialog'

// icons
import {
    IconCheck,
    IconExclamationMark,
    IconCircleChevronRightFilled,
    IconCopy,
    IconTrash,
    IconInfoCircle,
    IconLoader,
    IconAlertCircleFilled,
    IconCode,
    IconWorldWww,
    IconPhoto
} from '@tabler/icons-react'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import CancelIcon from '@mui/icons-material/Cancel'

// const
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: theme.palette.card.main,
    color: theme.darkTextPrimary,
    border: 'solid 1px',
    width: 'max-content',
    height: 'auto',
    padding: '10px',
    boxShadow: 'none'
}))

const StyledNodeToolbar = styled(NodeToolbar)(({ theme }) => ({
    backgroundColor: theme.palette.card.main,
    color: theme.darkTextPrimary,
    padding: '5px',
    borderRadius: '10px',
    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
}))

// ===========================|| CANVAS NODE ||=========================== //

const AgentFlowNode = ({ data }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const canvas = useSelector((state) => state.canvas)
    const ref = useRef(null)
    const updateNodeInternals = useUpdateNodeInternals()
    // eslint-disable-next-line
    const [position, setPosition] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [warningMessage, setWarningMessage] = useState('')
    const { deleteNode, duplicateNode } = useContext(flowContext)
    const [showInfoDialog, setShowInfoDialog] = useState(false)
    const [infoDialogProps, setInfoDialogProps] = useState({})

    const nodeColor = customization?.isDarkMode ? '#E22A90' : '#3C5BA4'

    const getOutputAnchors = () => {
        return data.outputAnchors ?? []
    }

    const getAnchorPosition = (index) => {
        const currentHeight = ref.current?.clientHeight || 0
        const spacing = currentHeight / (getOutputAnchors().length + 1)
        const position = spacing * (index + 1)

        // Update node internals when we get a non-zero position
        if (position > 0) {
            updateNodeInternals(data.id)
        }

        return position
    }

    const getStatusBackgroundColor = (status) => {
        switch (status) {
            case 'ERROR':
                return theme.palette.error.dark
            case 'INPROGRESS':
                return theme.palette.warning.dark
            case 'STOPPED':
            case 'TERMINATED':
                return theme.palette.error.main
            case 'FINISHED':
                return theme.palette.success.dark
            default:
                return theme.palette.primary.dark
        }
    }

    const renderIcon = (node) => {
        const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.name)

        if (!foundIcon) return null

        return (
            <img
                src={foundIcon.icon}
                alt={node.name}
                style={{
                    width: 30,
                    height: 30,
                    objectFit: 'contain'
                }}
            />
        )
    }

    const getBuiltInOpenAIToolIcon = (toolName) => {
        switch (toolName) {
            case 'web_search_preview':
                return <IconWorldWww size={14} color={'white'} />
            case 'code_interpreter':
                return <IconCode size={14} color={'white'} />
            case 'image_generation':
                return <IconPhoto size={14} color={'white'} />
            default:
                return null
        }
    }

    // Function to render all icons in a single line with max 5 display
    const renderSingleLineIcons = () => {
        // Collect all icons in a single array
        const allIcons = []

        // Array of model configs to check and collect
        const modelConfigs = [
            { model: data.inputs?.llmModel, config: data.inputs?.llmModelConfig },
            { model: data.inputs?.agentModel, config: data.inputs?.agentModelConfig },
            { model: data.inputs?.conditionAgentModel, config: data.inputs?.conditionAgentModelConfig }
        ]

        // Add model icons
        modelConfigs
            .filter((item) => item.model && item.config)
            .forEach((item, index) => {
                allIcons.push({
                    type: 'model',
                    key: `model-${index}`,
                    element: (
                        <img
                            style={{ width: 10, height: 10, objectFit: 'contain' }}
                            src={`${baseURL}/api/v1/node-icon/${item.model}`}
                            alt={item.model}
                        />
                    )
                })
            })

        // Array of tool configurations to check and collect
        const toolConfigs = [
            { tools: data.inputs?.llmTools, toolProperty: 'llmSelectedTool' },
            { tools: data.inputs?.agentTools, toolProperty: 'agentSelectedTool' },
            {
                tools:
                    data.inputs?.selectedTool ?? data.inputs?.toolAgentflowSelectedTool
                        ? [{ selectedTool: data.inputs?.selectedTool ?? data.inputs?.toolAgentflowSelectedTool }]
                        : [],
                toolProperty: ['selectedTool', 'toolAgentflowSelectedTool']
            },
            { tools: data.inputs?.agentKnowledgeVSEmbeddings, toolProperty: ['vectorStore', 'embeddingModel'] },
            {
                tools: data.inputs?.agentToolsBuiltInOpenAI
                    ? (typeof data.inputs.agentToolsBuiltInOpenAI === 'string'
                          ? JSON.parse(data.inputs.agentToolsBuiltInOpenAI)
                          : data.inputs.agentToolsBuiltInOpenAI
                      ).map((tool) => ({ builtInTool: tool }))
                    : [],
                toolProperty: 'builtInTool',
                isBuiltInOpenAI: true
            }
        ]

        // Add tool icons
        toolConfigs
            .filter((config) => config.tools && config.tools.length > 0)
            .forEach((config, configIndex) => {
                config.tools.forEach((tool, toolIndex) => {
                    if (Array.isArray(config.toolProperty)) {
                        config.toolProperty
                            .filter((prop) => tool[prop])
                            .forEach((prop, propIndex) => {
                                const toolName = tool[prop]
                                allIcons.push({
                                    type: 'tool',
                                    key: `tool-${configIndex}-${toolIndex}-${propIndex}`,
                                    element: (
                                        <Box
                                            component='img'
                                            src={`${baseURL}/api/v1/node-icon/${toolName}`}
                                            alt={toolName}
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                objectFit: 'contain'
                                            }}
                                        />
                                    )
                                })
                            })
                    } else {
                        const toolName = tool[config.toolProperty]
                        if (toolName) {
                            // Handle built-in OpenAI tools with icons
                            if (config.isBuiltInOpenAI) {
                                const icon = getBuiltInOpenAIToolIcon(toolName)
                                if (icon) {
                                    allIcons.push({
                                        type: 'builtInTool',
                                        key: `tool-${configIndex}-${toolIndex}`,
                                        element: (
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {React.cloneElement(icon, { size: 10 })}
                                            </Box>
                                        )
                                    })
                                }
                            } else {
                                allIcons.push({
                                    type: 'tool',
                                    key: `tool-${configIndex}-${toolIndex}`,
                                    element: (
                                        <Box
                                            component='img'
                                            src={`${baseURL}/api/v1/node-icon/${toolName}`}
                                            alt={toolName}
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                objectFit: 'contain'
                                            }}
                                        />
                                    )
                                })
                            }
                        }
                    }
                })
            })

        // Display maximum 5 icons in a single line
        const maxIcons = 5
        const visibleIcons = allIcons.slice(0, maxIcons)
        const hiddenCount = Math.max(0, allIcons.length - maxIcons)

        // Only render if there are icons to show
        if (allIcons.length === 0) return null

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    marginLeft: '12px',
                    justifyContent: 'flex-start',
                    minHeight: '12px'
                }}
            >
                {visibleIcons.map((icon) => (
                    <Box
                        key={icon.key}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0
                        }}
                    >
                        {icon.element}
                    </Box>
                ))}
                {hiddenCount > 0 && (
                    <Typography
                        sx={{
                            fontSize: '0.35rem',
                            color: customization.isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                            fontWeight: 500,
                            marginLeft: 0.3,
                            flexShrink: 0
                        }}
                    >
                        +{hiddenCount}
                    </Typography>
                )}
            </Box>
        )
    }

    useEffect(() => {
        if (ref.current) {
            setTimeout(() => {
                setPosition(ref.current?.offsetTop + ref.current?.clientHeight / 2)
                updateNodeInternals(data.id)
            }, 10)
        }
    }, [data, ref, updateNodeInternals])

    useEffect(() => {
        const nodeOutdatedMessage = (oldVersion, newVersion) =>
            `Node version ${oldVersion} outdated\nUpdate to latest version ${newVersion}`
        const nodeVersionEmptyMessage = (newVersion) => `Node outdated\nUpdate to latest version ${newVersion}`

        const componentNode = canvas.componentNodes.find((nd) => nd.name === data.name)
        if (componentNode) {
            if (!data.version) {
                setWarningMessage(nodeVersionEmptyMessage(componentNode.version))
            } else if (data.version && componentNode.version > data.version) {
                setWarningMessage(nodeOutdatedMessage(data.version, componentNode.version))
            } else if (componentNode.badge === 'DEPRECATING') {
                setWarningMessage(
                    componentNode?.deprecateMessage ??
                        'This node will be deprecated in the next release. Change to a new node tagged with NEW'
                )
            } else {
                setWarningMessage('')
            }
        }
    }, [canvas.componentNodes, data.name, data.version])

    return (
        <div ref={ref} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <StyledNodeToolbar>
                <ButtonGroup sx={{ gap: 1 }} variant='outlined' aria-label='Basic button group'>
                    {data.name !== 'startAgentflow' && (
                        <IconButton
                            size={'small'}
                            title='Duplicate'
                            onClick={() => {
                                duplicateNode(data.id)
                            }}
                            sx={{
                                color: customization.isDarkMode ? 'white' : 'black',
                                '&:hover': {
                                    color: customization.isDarkMode ? 'white' : 'black'
                                }
                            }}
                        >
                            <IconCopy size={20} />
                        </IconButton>
                    )}
                    <IconButton
                        size={'small'}
                        title='Delete'
                        onClick={() => {
                            deleteNode(data.id)
                        }}
                        sx={{
                            color: customization.isDarkMode ? 'white' : 'black',
                            '&:hover': {
                                color: customization.isDarkMode ? 'white' : 'black'
                            }
                        }}
                    >
                        <IconTrash size={20} />
                    </IconButton>
                    <IconButton
                        size={'small'}
                        title='Info'
                        onClick={() => {
                            setInfoDialogProps({ data })
                            setShowInfoDialog(true)
                        }}
                        sx={{
                            color: customization.isDarkMode ? 'white' : 'black',
                            '&:hover': {
                                color: customization.isDarkMode ? 'white' : 'black'
                            }
                        }}
                    >
                        <IconInfoCircle size={20} />
                    </IconButton>
                </ButtonGroup>
            </StyledNodeToolbar>
            <Card
                content={false}
                sx={{
                    borderColor: nodeColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: data.id == 'startAgentflow_0' ? '50px' : '',
                    height: data.id == 'startAgentflow_0' ? '80px' : '70px',
                    width: data.id == 'startAgentflow_0' ? '80px' : '100px',
                    backgroundColor: customization.isDarkMode ? 'black' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                        boxShadow: data.selected ? `0 0 0 1px #E5E7EB !important` : 'none'
                    }
                }}
                border={false}
            >
                {data && data.status && (
                    <Tooltip title={data.status === 'ERROR' ? data.error || 'Error' : ''}>
                        <Avatar
                            variant='rounded'
                            sx={{
                                ...theme.typography.smallAvatar,
                                borderRadius: '50%',
                                background:
                                    data.status === 'STOPPED' || data.status === 'TERMINATED'
                                        ? 'white'
                                        : getStatusBackgroundColor(data.status),
                                color: 'white',
                                ml: 2,
                                position: 'absolute',
                                top: -10,
                                right: -10
                            }}
                        >
                            {data.status === 'INPROGRESS' ? (
                                <IconLoader className='spin-animation' />
                            ) : data.status === 'ERROR' ? (
                                <IconExclamationMark />
                            ) : data.status === 'TERMINATED' ? (
                                <CancelIcon sx={{ color: getStatusBackgroundColor(data.status) }} />
                            ) : data.status === 'STOPPED' ? (
                                <StopCircleIcon sx={{ color: getStatusBackgroundColor(data.status) }} />
                            ) : (
                                <IconCheck />
                            )}
                        </Avatar>
                    </Tooltip>
                )}

                {warningMessage && (
                    <Tooltip placement='right-start' title={<span style={{ whiteSpace: 'pre-line' }}>{warningMessage}</span>}>
                        <Avatar
                            variant='rounded'
                            sx={{
                                ...theme.typography.smallAvatar,
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: -10,
                                left: -10
                            }}
                        >
                            <IconAlertCircleFilled color='orange' />
                        </Avatar>
                    </Tooltip>
                )}

                <Box sx={{ width: '100%' }}>
                    {!data.hideInput && (
                        <Handle
                            type='target'
                            position={Position.Left}
                            id={data.id}
                            style={{
                                width: 5,
                                height: 20,
                                backgroundColor: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                                border: 'none',
                                position: 'absolute',
                                left: -2
                            }}
                        >
                            <div
                                style={{
                                    width: 5,
                                    height: 20,
                                    backgroundColor: nodeColor,
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        </Handle>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Box item style={{ width: 50 }}>
                            {data.color && !data.icon ? (
                                <div
                                    style={{
                                        ...theme.typography.commonAvatar,
                                        ...theme.typography.largeAvatar,
                                        borderRadius: '15px',
                                        backgroundColor: customization.isDarkMode ? 'black' : 'white',
                                        cursor: 'grab',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: customization.isDarkMode ? 'black' : 'white'
                                    }}
                                >
                                    {renderIcon(data)}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        ...theme.typography.commonAvatar,
                                        ...theme.typography.largeAvatar,
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        cursor: 'grab'
                                    }}
                                >
                                    <img
                                        style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                        src={`${baseURL}/api/v1/node-icon/${data.name}`}
                                        alt={data.name}
                                    />
                                </div>
                            )}
                        </Box>
                        <Box sx={{ flex: 1, paddingLeft: 0.5 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.45rem',
                                    fontWeight: 200,
                                    color: customization.isDarkMode ? 'white' : 'black',
                                    lineHeight: 1.2
                                }}
                            >
                                {data.label}
                            </Typography>
                        </Box>
                    </div>
                    {renderSingleLineIcons()}
                    {getOutputAnchors().map((outputAnchor, index) => {
                        return (
                            <Handle
                                type='source'
                                position={Position.Right}
                                key={outputAnchor.id}
                                id={outputAnchor.id}
                                style={{
                                    height: 20,
                                    width: 20,
                                    top: getAnchorPosition(index),
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    position: 'absolute',
                                    right: -10,
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.background.paper, // or 'white'
                                        pointerEvents: 'none'
                                    }}
                                />
                                <IconCircleChevronRightFilled
                                    size={20}
                                    color={nodeColor}
                                    style={{
                                        pointerEvents: 'none',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                            </Handle>
                        )
                    })}
                </Box>
            </Card>
            <NodeInfoDialog show={showInfoDialog} dialogProps={infoDialogProps} onCancel={() => setShowInfoDialog(false)}></NodeInfoDialog>
        </div>
    )
}

AgentFlowNode.propTypes = {
    data: PropTypes.object
}

export default memo(AgentFlowNode)
