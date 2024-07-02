import { useEffect, useRef, useState, useCallback, useContext } from 'react'
import ReactFlow, { addEdge, Controls, Background, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePrompt } from '@/utils/usePrompt'
import {
    REMOVE_DIRTY,
    SET_DIRTY,
    SET_CHATFLOW,
    enqueueSnackbar as enqueueSnackbarAction,
    closeSnackbar as closeSnackbarAction,
    setMinMax,
    setNodesMinMax
} from '@/store/actions'
import { omit, cloneDeep } from 'lodash'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import CallMadeIcon from '@mui/icons-material/CallMade'

// material-ui
import { Toolbar, Box, AppBar, Button, Switch, Link } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// project imports
import { styled } from '@mui/material/styles'
import CanvasNode from './CanvasNode'
import ButtonEdge from './ButtonEdge'
import StickyNote from './StickyNote'
import CanvasHeader from './CanvasHeader'
import AddNodes from './AddNodes'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import { ChatPopUp } from '@/views/chatmessage/ChatPopUp'
// import { VectorStorePopUp } from '@/views/vectorstore/VectorStorePopUp'
import { flowContext } from '@/store/context/ReactFlowContext'

// API
import nodesApi from '@/api/nodes'
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'
import useConfirm from '@/hooks/useConfirm'

// icons
import { IconX } from '@tabler/icons'

// utils
import { getUniqueNodeId, initNode, rearrangeToolsOrdering, getUpsertDetails } from '@/utils/genericHelper'
import useNotifier from '@/utils/useNotifier'

// const
import { FLOWISE_CREDENTIAL_ID } from '@/store/constant'
import { IconArrowBackUp } from '@tabler/icons-react'

const nodeTypes = { customNode: CanvasNode, stickyNote: StickyNote }
const edgeTypes = { buttonedge: ButtonEdge }

// ==============================|| CANVAS ||============================== //

const Canvas = () => {
    const theme = useTheme()
    const navigate = useNavigate()

    const { state } = useLocation()
    const templateFlowData = state ? state.templateFlowData : ''

    const URLpath = document.location.pathname.toString().split('/')
    const chatflowId = URLpath[URLpath.length - 1] === 'canvas' ? '' : URLpath[URLpath.length - 1]

    const { confirm } = useConfirm()

    const dispatch = useDispatch()
    const canvas = useSelector((state) => state.canvas)
    const customization = useSelector((state) => state.customization)
    const userData = useSelector((state) => state.user.userData)
    const tenantId = userData['uid']
    const [canvasDataStore, setCanvasDataStore] = useState(canvas)
    const [chatflow, setChatflow] = useState(null)

    const { reactFlowInstance, setReactFlowInstance } = useContext(flowContext)

    // ==============================|| Snackbar ||============================== //

    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    // ==============================|| ReactFlow ||============================== //

    const [nodes, setNodes, onNodesChange] = useNodesState()
    const [edges, setEdges, onEdgesChange] = useEdgesState()

    const [selectedNode, setSelectedNode] = useState(null)
    const [isUpsertButtonEnabled, setIsUpsertButtonEnabled] = useState(false)

    const [deletedNode, setDeletedNodes] = useState([])

    const reactFlowWrapper = useRef(null)

    // ==============================|| Workflow API ||============================== //

    const getNodesApi = useApi(nodesApi.getAllNodes)
    const createNewChatflowApi = useApi(chatflowsApi.createNewChatflow)
    const testChatflowApi = useApi(chatflowsApi.testChatflow)
    const updateChatflowApi = useApi(chatflowsApi.updateChatflow)
    const getSpecificChatflowApi = useApi(chatflowsApi.getSpecificChatflow)

    //=======// Expand and Collapse All Node//===========//
    const [menuPosition, setMenuPosition] = useState(null)
    const { minMax, uniqueId } = useSelector((state) => state.minMax)

    const nodeMinMax = useSelector((state) => state.nodeMinMax.nodeMinMax)

    useEffect(() => {
        dispatch(setNodesMinMax(minMax))
    }, [minMax, uniqueId])

    const handleMin = () => {
        dispatch(setMinMax(true))
    }
    const handleMax = () => {
        dispatch(setMinMax(false))
    }

    const handleContextMenu = (event) => {
        event.preventDefault()
        setMenuPosition({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 })
    }

    const handleClose = () => {
        setMenuPosition(null)
    }

    const handleClick = () => {
        if (menuPosition) {
            setMenuPosition(null)
        }
    }

    // =================// undo // =====================
    const handleUndo = () => {
        if (deletedNode.length > 0) {
            const lastDeletedNode = deletedNode[deletedNode.length - 1]
            setSelectedNode(lastDeletedNode)
            setDeletedNodes(deletedNode.slice(0, -1))
            setNodes((nds) =>
                nds.concat(lastDeletedNode).map((node) => {
                    if (node.id === lastDeletedNode.id) {
                        node.data = {
                            ...node.data,
                            selected: true
                        }
                    } else {
                        node.data = {
                            ...node.data,
                            selected: false
                        }
                    }
                    return node
                })
            )
        }
        if (getSpecificChatflowApi.data) {
            const chatflow = getSpecificChatflowApi.data
            const initialFlow = chatflow.flowData ? JSON.parse(chatflow.flowData) : []
            setEdges(initialFlow.edges || [])
            dispatch({ type: SET_CHATFLOW, chatflow })
        }
    }

    // ==============================|| Events & Actions ||============================== //

    const onConnect = (params) => {
        const newEdge = {
            ...params,
            type: 'buttonedge',
            id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`
        }

        const targetNodeId = params.targetHandle.split('-')[0]
        const sourceNodeId = params.sourceHandle.split('-')[0]
        const targetInput = params.targetHandle.split('-')[2]

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === targetNodeId) {
                    setTimeout(() => setDirty(), 0)
                    let value
                    const inputAnchor = node.data.inputAnchors.find((ancr) => ancr.name === targetInput)
                    const inputParam = node.data.inputParams.find((param) => param.name === targetInput)

                    if (inputAnchor && inputAnchor.list) {
                        const newValues = node.data.inputs[targetInput] || []
                        if (targetInput === 'tools') {
                            rearrangeToolsOrdering(newValues, sourceNodeId)
                        } else {
                            newValues.push(`{{${sourceNodeId}.data.instance}}`)
                        }
                        value = newValues
                    } else if (inputParam && inputParam.acceptVariable) {
                        value = node.data.inputs[targetInput] || ''
                    } else {
                        value = `{{${sourceNodeId}.data.instance}}`
                    }
                    node.data = {
                        ...node.data,
                        inputs: {
                            ...node.data.inputs,
                            [targetInput]: value
                        }
                    }
                }
                return node
            })
        )

        setEdges((eds) => addEdge(newEdge, eds))
    }

    const handleLoadFlow = (file) => {
        try {
            const flowData = JSON.parse(file)
            const nodes = flowData.nodes || []

            setNodes(nodes)
            setEdges(flowData.edges || [])
            setDirty()
        } catch (e) {
            console.error(e)
        }
    }

    const handleDeleteFlow = async () => {
        const confirmPayload = {
            title: `Delete`,
            description: `Delete chatflow ${chatflow.name}?`,
            confirmButtonName: 'Delete',
            cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                await chatflowsApi.deleteChatflow(chatflow.id)
                localStorage.removeItem(`${chatflow.id}_INTERNAL`)
                navigate('/')
            } catch (error) {
                enqueueSnackbar({
                    message: typeof error.response.data === 'object' ? error.response.data.message : error.response.data,
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

    const handleSaveFlow = (chatflowName) => {
        if (reactFlowInstance) {
            const nodes = reactFlowInstance.getNodes().map((node) => {
                const nodeData = cloneDeep(node.data)
                if (Object.prototype.hasOwnProperty.call(nodeData.inputs, FLOWISE_CREDENTIAL_ID)) {
                    nodeData.credential = nodeData.inputs[FLOWISE_CREDENTIAL_ID]
                    nodeData.inputs = omit(nodeData.inputs, [FLOWISE_CREDENTIAL_ID])
                }
                node.data = {
                    ...nodeData,
                    selected: false
                }
                return node
            })

            const rfInstanceObject = reactFlowInstance.toObject()
            rfInstanceObject.nodes = nodes
            const flowData = JSON.stringify(rfInstanceObject)

            if (!chatflow.id) {
                const newChatflowBody = {
                    name: chatflowName,
                    deployed: false,
                    isPublic: false,
                    tenantId,
                    flowData
                }
                createNewChatflowApi.request(newChatflowBody)
            } else {
                const updateBody = {
                    name: chatflowName,
                    flowData
                }
                updateChatflowApi.request(chatflow.id, updateBody)
            }
        }
    }

    // eslint-disable-next-line
    const onNodeClick = useCallback((event, clickedNode) => {
        setDeletedNodes((prevDeletedNodes) => [...prevDeletedNodes, clickedNode])
        setSelectedNode(clickedNode)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === clickedNode.id) {
                    node.data = {
                        ...node.data,
                        selected: true
                    }
                } else {
                    node.data = {
                        ...node.data,
                        selected: false
                    }
                }

                return node
            })
        )
    })

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event) => {
            event.preventDefault()
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
            let nodeData = event.dataTransfer.getData('application/reactflow')

            // check if the dropped element is valid
            if (typeof nodeData === 'undefined' || !nodeData) {
                return
            }

            nodeData = JSON.parse(nodeData)

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left - 100,
                y: event.clientY - reactFlowBounds.top - 50
            })

            const newNodeId = getUniqueNodeId(nodeData, reactFlowInstance.getNodes())

            const newNode = {
                id: newNodeId,
                position,
                type: nodeData.type !== 'StickyNote' ? 'customNode' : 'stickyNote',
                data: initNode(nodeData, newNodeId)
            }

            setSelectedNode(newNode)
            setNodes((nds) =>
                nds.concat(newNode).map((node) => {
                    if (node.id === newNode.id) {
                        node.data = {
                            ...node.data,
                            selected: true
                        }
                    } else {
                        node.data = {
                            ...node.data,
                            selected: false
                        }
                    }

                    return node
                })
            )
            setTimeout(() => setDirty(), 0)
        },

        // eslint-disable-next-line
        [reactFlowInstance]
    )

    const saveChatflowSuccess = () => {
        dispatch({ type: REMOVE_DIRTY })
        enqueueSnackbar({
            message: 'Workflow saved',
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
    }

    const errorFailed = (message) => {
        enqueueSnackbar({
            message,
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

    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        '#fff'
                    )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? '#3C5BA4' : '#E22A90'
                }
            }
        },
        '& .MuiSwitch-thumb': {
            background: 'linear-gradient(to right, #3C5BA4, #E22A90)',
            width: 32,
            height: 32,
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff'
                )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`
            }
        },
        '& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: theme.palette.mode === 'dark' ? '#E22A90' : '#3C5BA4',
            borderRadius: 20 / 2
        }
    }))
    const StyledLink = styled(Link)(({ theme }) => ({
        color: theme.palette.text.primary,
        fontSize: '1.25rem', // Adjust font size as needed
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        textDecoration: 'none',
        '&:hover': {
            //   color: theme.palette.red, // Adjust hover color as needed
        }
    }))

    const setDirty = () => {
        dispatch({ type: SET_DIRTY })
    }

    const checkIfUpsertAvailable = (nodes, edges) => {
        const upsertNodeDetails = getUpsertDetails(nodes, edges)
        if (upsertNodeDetails.length) setIsUpsertButtonEnabled(true)
        else setIsUpsertButtonEnabled(false)
    }

    // ==============================|| useEffect ||============================== //

    // Get specific chatflow successful
    useEffect(() => {
        if (getSpecificChatflowApi.data) {
            const chatflow = getSpecificChatflowApi.data
            const initialFlow = chatflow.flowData ? JSON.parse(chatflow.flowData) : []
            setNodes(initialFlow.nodes || [])
            setEdges(initialFlow.edges || [])
            dispatch({ type: SET_CHATFLOW, chatflow })
        } else if (getSpecificChatflowApi.error) {
            errorFailed(`Failed to retrieve workspace: ${getSpecificChatflowApi.error.response.data.message}`)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getSpecificChatflowApi.data, getSpecificChatflowApi.error])

    // Create new chatflow successful
    useEffect(() => {
        if (createNewChatflowApi.data) {
            const chatflow = createNewChatflowApi.data
            dispatch({ type: SET_CHATFLOW, chatflow })
            saveChatflowSuccess()
            window.history.replaceState(null, null, `/canvas/${chatflow.id}`)
        } else if (createNewChatflowApi.error) {
            errorFailed(`Failed to save workspace: ${createNewChatflowApi.error.response.data.message}`)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createNewChatflowApi.data, createNewChatflowApi.error])

    // Update chatflow successful
    useEffect(() => {
        if (updateChatflowApi.data) {
            dispatch({ type: SET_CHATFLOW, chatflow: updateChatflowApi.data })
            saveChatflowSuccess()
        } else if (updateChatflowApi.error) {
            errorFailed(`Failed to save workspace: ${updateChatflowApi.error.response.data.message}`)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateChatflowApi.data, updateChatflowApi.error])

    // Test chatflow failed
    useEffect(() => {
        if (testChatflowApi.error) {
            enqueueSnackbar({
                message: 'Test workspace failed',
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testChatflowApi.error])

    useEffect(() => {
        setChatflow(canvasDataStore.chatflow)
        if (canvasDataStore.chatflow) {
            const flowData = canvasDataStore.chatflow.flowData ? JSON.parse(canvasDataStore.chatflow.flowData) : []
            checkIfUpsertAvailable(flowData.nodes || [], flowData.edges || [])
        }
    }, [canvasDataStore.chatflow])

    // Initialization
    useEffect(() => {
        if (chatflowId) {
            getSpecificChatflowApi.request(chatflowId)
        } else {
            if (localStorage.getItem('duplicatedFlowData')) {
                handleLoadFlow(localStorage.getItem('duplicatedFlowData'))
                setTimeout(() => localStorage.removeItem('duplicatedFlowData'), 0)
            } else {
                setNodes([])
                setEdges([])
            }
            dispatch({
                type: SET_CHATFLOW,
                chatflow: {
                    name: 'Untitled workspace'
                }
            })
        }

        getNodesApi.request()

        // Clear dirty state before leaving and remove any ongoing test triggers and webhooks
        return () => {
            setTimeout(() => dispatch({ type: REMOVE_DIRTY }), 0)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setCanvasDataStore(canvas)
    }, [canvas])

    useEffect(() => {
        function handlePaste(e) {
            const pasteData = e.clipboardData.getData('text')
            //TODO: prevent paste event when input focused, temporary fix: catch chatflow syntax
            if (pasteData.includes('{"nodes":[') && pasteData.includes('],"edges":[')) {
                handleLoadFlow(pasteData)
            }
        }

        window.addEventListener('paste', handlePaste)

        return () => {
            window.removeEventListener('paste', handlePaste)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (templateFlowData && templateFlowData.includes('"nodes":[') && templateFlowData.includes('],"edges":[')) {
            handleLoadFlow(templateFlowData)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateFlowData])

    usePrompt('You have unsaved changes! Do you want to navigate away?', canvasDataStore.isDirty)

    return (
        <>
            <Box>
                <AppBar
                    enableColorOnDark
                    position='fixed'
                    background='red'
                    color='inherit'
                    elevation={1}
                    sx={{
                        bgcolor: theme.palette.background.default,
                        height: '80px'
                    }}
                >
                    <Toolbar>
                        <CanvasHeader
                            chatflow={chatflow}
                            handleSaveFlow={handleSaveFlow}
                            handleDeleteFlow={handleDeleteFlow}
                            handleLoadFlow={handleLoadFlow}
                        />
                    </Toolbar>
                </AppBar>

                <Box sx={{ display: 'flex', mt: '70px', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
                    <Box sx={{ width: customization.menu_open ? '350px' : '100px' }}>
                        <AddNodes nodesData={getNodesApi.data} node={selectedNode} />
                    </Box>

                    <Box sx={{ width: '100%' }} onClick={handleClick}>
                        <div className='reactflow-parent-wrapper'>
                            <div className='reactflow-wrapper' ref={reactFlowWrapper}>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onNodeClick={onNodeClick}
                                    onEdgesChange={onEdgesChange}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    onNodeDragStop={setDirty}
                                    nodeTypes={nodeTypes}
                                    edgeTypes={edgeTypes}
                                    onConnect={onConnect}
                                    onInit={setReactFlowInstance}
                                    fitView
                                    deleteKeyCode={canvas.canvasDialogShow ? null : ['Delete']}
                                    minZoom={0.1}
                                    onContextMenu={handleContextMenu}
                                >
                                    <Controls
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />
                                    <Background color='#aaa' gap={16} />

                                    {/* {isUpsertButtonEnabled && <VectorStorePopUp chatflowid={chatflowId} />} */}
                                    <ChatPopUp chatflowid={chatflowId} />
                                </ReactFlow>
                                <Menu
                                    open={menuPosition !== null}
                                    onClose={handleClose}
                                    anchorReference='anchorPosition'
                                    anchorPosition={
                                        menuPosition !== null ? { top: menuPosition.mouseY, left: menuPosition.mouseX } : undefined
                                    }
                                    sx={{
                                        '& .MuiPaper-root': {
                                            position: 'relative',
                                            top: '65px',
                                            width: '200px',
                                            fontSize: '0.875rem',
                                            padding: '12px',
                                            overflow: 'hidden',
                                            height: 'auto',
                                            fontFamily: 'roboto sans-serif',
                                            maxHeight: 'calc(-235px + 100vh)'
                                        }
                                    }}
                                >
                                    <MenuItem
                                        sx={{
                                            color: customization.isDarkMode ? '#FFF' : '#616161',
                                            lineHeight: '3em',
                                            '&:hover': {
                                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                                '& .MuiSvgIcon-root': {
                                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }
                                        }}
                                        onClick={handleMin}
                                        disabled={minMax && nodeMinMax}
                                    >
                                        <CallMadeIcon id='ExpandIcon' sx={{ mr: '12px' }} />
                                        Expand All Node
                                    </MenuItem>
                                    <MenuItem
                                        sx={{
                                            color: customization.isDarkMode ? '#FFF' : '#616161',
                                            lineHeight: '3em',
                                            '&:hover': {
                                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                                '& .MuiSvgIcon-root': {
                                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }
                                        }}
                                        onClick={handleMax}
                                        disabled={!minMax && !nodeMinMax}
                                    >
                                        <HorizontalRuleIcon id='MinimizeIcon' sx={{ mr: '12px' }} />
                                        Collapse All Node
                                    </MenuItem>

                                    <MenuItem
                                        sx={{
                                            color: customization.isDarkMode ? '#FFF' : '#616161',
                                            lineHeight: '3em',
                                            '&:hover': {
                                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                                '& .MuiSvgIcon-root': {
                                                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4'
                                                }
                                            }
                                        }}
                                        onClick={handleUndo}
                                    >
                                        <IconArrowBackUp id='MinimizeIcon' sx={{ mr: '12px' }} />
                                        Undo
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>
                    </Box>
                </Box>
                <ConfirmDialog />
            </Box>
        </>
    )
}

export default Canvas
