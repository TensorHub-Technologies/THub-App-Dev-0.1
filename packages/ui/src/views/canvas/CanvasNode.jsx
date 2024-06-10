import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import { useSelector } from 'react-redux'

// material-ui
import { useTheme } from '@mui/material/styles'
import { IconButton, Box, Typography, Divider, Button } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CallMadeIcon from '@mui/icons-material/CallMade'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'

// project imports
import NodeCardWrapper from '@/ui-component/cards/NodeCardWrapper'
import NodeTooltip from '@/ui-component/tooltip/NodeTooltip'
import NodeInputHandler from './NodeInputHandler'
import NodeOutputHandler from './NodeOutputHandler'
import AdditionalParamsDialog from '@/ui-component/dialog/AdditionalParamsDialog'
import NodeInfoDialog from '@/ui-component/dialog/NodeInfoDialog'

// const
import { baseURL } from '@/store/constant'
import { IconTrash, IconCopy, IconInfoCircle, IconAlertTriangle } from '@tabler/icons'
import { flowContext } from '@/store/context/ReactFlowContext'

// ===========================|| CANVAS NODE ||=========================== //

const CanvasNode = ({ data }) => {
    const theme = useTheme()
    const canvas = useSelector((state) => state.canvas)
    const { deleteNode, duplicateNode } = useContext(flowContext)

    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [showInfoDialog, setShowInfoDialog] = useState(false)
    const [infoDialogProps, setInfoDialogProps] = useState({})
    const [warningMessage, setWarningMessage] = useState('')
    const [open, setOpen] = useState(false)
    const [minMax, setMinMax] = useState('true')

    // const handleClose = () => {
    //     setOpen(false)
    // }
    const handleMin = () => {
        setMinMax(!minMax)
        setOpen(false)
    }
    // const handleMax=()=>{
    //     setMinMax(true)
    // }
    const handleOpen = () => {
        setOpen(!open)
    }
    console.log('open', open)
    const borderColorMap = {
        Agents: '#0066CC',
        Chains: '#009966',
        'Chat Models': '#CC0033',
        'Document Loaders': '#9933CC',
        Embeddings: '#FFCC00',
        LLMs: '#666666',
        Memory: '#999999',
        Prompts: '#33CCCC',
        Retrievers: '#FF9933',
        'Text Splitters': '#FF66B2',
        Tools: '#33CC99',
        'Vector Stores': '#990033',
        Cache: '#c65102',
        'Output Parsers': '#702963',
        Moderation: '#702963',
        Utilities: '#AE9C2C'
    }

    const headerColorMap = {
        Agents: '#66B2FF',
        Chains: '#66FFB2',
        'Chat Models': '#FF6688',
        'Document Loaders': '#CC99FF',
        Embeddings: '#FFFF99',
        LLMs: '#dddddd',
        Memory: '#D9D9D9',
        Prompts: '#99E6E6',
        Retrievers: '#FFCC99',
        'Text Splitters': '#FF99CC',
        Tools: '#99FFCC',
        'Vector Stores': '#FF99B2',
        Cache: '#FFA500',
        'Output Parsers': '#BF40BF',
        Moderation: '#C63287',
        Utilities: '#83831F'
    }

    const NodeBorder = () => {
        return borderColorMap[data.category] || '#FFD8DB'
    }

    const NodeHeader = () => {
        return headerColorMap[data.category] || '#FFD8DB'
    }
    const nodeOutdatedMessage = (oldVersion, newVersion) => `Node version ${oldVersion} outdated\nUpdate to latest version ${newVersion}`

    const nodeVersionEmptyMessage = (newVersion) => `Node outdated\nUpdate to latest version ${newVersion}`

    const onDialogClicked = () => {
        const dialogProps = {
            data,
            inputParams: data.inputParams.filter((inputParam) => !inputParam.hidden).filter((param) => param.additionalParams),
            confirmButtonName: 'Save',
            cancelButtonName: 'Cancel'
        }
        setDialogProps(dialogProps)
        setShowDialog(true)
    }

    // useEffect(() => {
    //     const componentNode = canvas.componentNodes.find((nd) => nd.name === data.name)
    //     if (componentNode) {
    //         if (!data.version) {
    //             setWarningMessage(nodeVersionEmptyMessage(componentNode.version))
    //         } else if (data.version && componentNode.version > data.version) {
    //             setWarningMessage(nodeOutdatedMessage(data.version, componentNode.version))
    //         } else if (componentNode.badge === 'DEPRECATING') {
    //             setWarningMessage('This node will be deprecated in the next release. Change to a new node tagged with NEW')
    //         }
    //     }
    // }, [canvas.componentNodes, data.name, data.version])
    console.log('data.inputParams', data.inputParams)
    return (
        <>
            <>
                <NodeCardWrapper
                    content={false}
                    sx={{
                        padding: 0,
                        borderColor: data.selected ? NodeHeader : NodeBorder,
                        '&:hover': {
                            borderColor: data.selected ? NodeBorder : NodeHeader
                        }
                    }}
                    border={false}
                >
                    <Tooltip
                        open={open}
                        onClick={handleOpen}
                        style={{
                            position: 'absolute',
                            margin: '14px 0px 0px 270px',
                            color: 'black',
                            backgroundColor: 'rgb(0,0,0,0)',
                            cursor: 'pointer'
                        }}
                    >
                        <MoreVertIcon />
                    </Tooltip>
                    <NodeTooltip
                        open={!canvas.canvasDialogShow && open}
                        disableFocusListener={true}
                        title={
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                <IconButton title='minmax' id='minmax-parent'>
                                    {minMax ? (
                                        <HorizontalRuleIcon onClick={handleMin} id='MinimizeIcon' />
                                    ) : (
                                        <button className='minmax-btn' onClick={handleMin}>
                                            <CallMadeIcon id='ExpandIcon' />
                                        </button>
                                    )}
                                </IconButton>
                                <IconButton
                                    title='Duplicate'
                                    onClick={() => {
                                        duplicateNode(data.id)
                                    }}
                                    sx={{ height: '35px', width: '35px', '&:hover': { color: theme?.palette.primary.main } }}
                                    color={theme?.customization?.isDarkMode ? theme.colors?.paper : 'inherit'}
                                >
                                    <IconCopy />
                                </IconButton>
                                <IconButton
                                    title='Delete'
                                    onClick={() => {
                                        deleteNode(data.id)
                                    }}
                                    sx={{ height: '35px', width: '35px', '&:hover': { color: 'red' } }}
                                    color={theme?.customization?.isDarkMode ? theme.colors?.paper : 'inherit'}
                                >
                                    <IconTrash />
                                </IconButton>
                                <IconButton
                                    title='Info'
                                    onClick={() => {
                                        setInfoDialogProps({ data })
                                        setShowInfoDialog(true)
                                    }}
                                    sx={{ height: '35px', width: '35px', '&:hover': { color: theme?.palette.secondary.main } }}
                                    color={theme?.customization?.isDarkMode ? theme.colors?.paper : 'inherit'}
                                >
                                    <IconInfoCircle />
                                </IconButton>
                            </div>
                        }
                        placement='right-start'
                    >
                        <Box>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    // border:"4px solid red",
                                    backgroundColor: data.selected ? NodeHeader(data) : NodeBorder(data)
                                }}
                            >
                                <Box style={{ width: 50, marginRight: 10, padding: 5 }}>
                                    <div
                                        style={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.largeAvatar,
                                            borderRadius: '20%',
                                            backgroundColor: 'white',
                                            // backgroundColor: data.selected ? NodeHeader(data) : NodeBorder(data),
                                            cursor: 'grab'
                                        }}
                                    >
                                        <img
                                            style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                            src={`${baseURL}/api/v1/node-icon/${data.name}`}
                                            alt='Notification'
                                        />
                                    </div>
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: '0.94rem',
                                            fontWeight: 500,
                                            mr: 2,
                                            color: '#000000'
                                        }}
                                    >
                                        {data.label}
                                    </Typography>
                                </Box>
                                <div style={{ flexGrow: 1 }}></div>
                                {data.tags && data.tags.includes('LlamaIndex') && (
                                    <>
                                        <div
                                            style={{
                                                borderRadius: '50%',
                                                padding: 15
                                            }}
                                        ></div>
                                    </>
                                )}
                                {warningMessage && (
                                    <>
                                        <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{warningMessage}</span>} placement='top'>
                                            <IconButton sx={{ height: 35, width: 35 }}>
                                                <IconAlertTriangle size={35} color='orange' />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </div>
                            {minMax ? (
                                <>
                                    {(data.inputAnchors.length > 0 || data.inputParams.length > 0) && (
                                        <>
                                            <Divider />
                                            <Box sx={{ background: theme.palette.asyncSelect.main, p: 1 }}>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 500,
                                                        textAlign: 'center',
                                                        color: '#2F5597'
                                                    }}
                                                >
                                                    Inputs
                                                </Typography>
                                            </Box>
                                            <Divider />
                                        </>
                                    )}
                                    {data.inputAnchors.map((inputAnchor, index) => (
                                        <NodeInputHandler key={index} inputAnchor={inputAnchor} data={data} />
                                    ))}
                                    {data.inputParams
                                        .filter((inputParam) => !inputParam.hidden)
                                        .map((inputParam, index) => (
                                            <NodeInputHandler key={index} inputParam={inputParam} data={data} />
                                        ))}
                                    {data.inputParams.find((param) => param.additionalParams) && (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                marginTop:
                                                    data.inputParams.filter((param) => param.additionalParams).length ===
                                                    data.inputParams.length + data.inputAnchors.length
                                                        ? 20
                                                        : 0
                                            }}
                                        >
                                            <Button
                                                sx={{ borderRadius: 25, width: '90%', mb: 2 }}
                                                variant='outlined'
                                                onClick={onDialogClicked}
                                            >
                                                Additional Parameters
                                            </Button>
                                        </div>
                                    )}
                                    <Divider />
                                    <Box sx={{ background: theme.palette.asyncSelect.main, p: 1 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 500,
                                                textAlign: 'center',
                                                color: '#EC73FF'
                                            }}
                                        >
                                            Output
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    {data.outputAnchors.map((outputAnchor, index) => (
                                        <NodeOutputHandler key={index} outputAnchor={outputAnchor} data={data} />
                                    ))}
                                </>
                            ) : undefined}
                        </Box>
                    </NodeTooltip>
                </NodeCardWrapper>
                <AdditionalParamsDialog
                    show={showDialog}
                    dialogProps={dialogProps}
                    onCancel={() => setShowDialog(false)}
                ></AdditionalParamsDialog>
                <NodeInfoDialog
                    show={showInfoDialog}
                    dialogProps={infoDialogProps}
                    onCancel={() => setShowInfoDialog(false)}
                ></NodeInfoDialog>
            </>
        </>
    )
}

CanvasNode.propTypes = {
    data: PropTypes.object
}

export default CanvasNode
