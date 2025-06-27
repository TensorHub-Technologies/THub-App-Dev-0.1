import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

// Material
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { TableViewOnly } from '@/ui-component/table/Table'
import { IconBook2 } from '@tabler/icons-react'
import { useTheme } from '@mui/material/styles'

// Store
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'

// API
import configApi from '@/api/config'
import useApi from '@/hooks/useApi'
import nodesApi from '@/api/nodes'

const NodeInfoDialog = ({ show, dialogProps, onCancel }) => {
    const portalElement = document.getElementById('portal')
    const dispatch = useDispatch()
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const getNodesApi = useApi(nodesApi.getAllNodes)
    const [outputNodes, setOutputNodes] = useState()

    const getNodeConfigApi = useApi(configApi.getNodeConfig)

    // get output nodes

    useEffect(() => {
        getNodesApi.request()
    }, [])

    const getOutputNode = (outputNodes) => {
        if (!outputNodes) return null

        return outputNodes.map((ele, index) => (
            <span
                key={index}
                style={{
                    padding: '5px 10px',
                    background: customization.isDarkMode ? '#333' : '#f1f1f1',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: customization.isDarkMode ? '#fff' : '#000',
                    marginRight: '8px'
                }}
            >
                {ele.label}
            </span>
        ))
    }

    useEffect(() => {
        if (getNodesApi.data) {
            const sourceNode = dialogProps.data

            if (sourceNode) {
                const allNodeDetails = getNodesApi.data

                const outputTypes = sourceNode.baseClasses

                const outputNodes = allNodeDetails.filter((x) => x.inputs?.some((z) => outputTypes.includes(z.type)))
                setOutputNodes(outputNodes)
            }
        }
    }, [getNodesApi.data, dialogProps.data])

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

    useEffect(() => {
        if (dialogProps.data) {
            getNodeConfigApi.request(dialogProps.data)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            maxWidth='md'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {dialogProps.data && dialogProps.data.name && dialogProps.data.label && (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        {dialogProps.data.color && !dialogProps.data.icon ? (
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
                                    background: customization.isDarkMode ? 'black' : 'white',
                                    marginRight: 10
                                }}
                            >
                                {renderIcon(dialogProps.data)}
                            </div>
                        ) : (
                            <div
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginRight: 10,
                                    borderRadius: '50%',
                                    backgroundColor: 'white'
                                }}
                            >
                                <img
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: 7,
                                        borderRadius: '50%',
                                        objectFit: 'contain'
                                    }}
                                    alt={dialogProps.data.name}
                                    src={`${baseURL}/api/v1/node-icon/${dialogProps.data.name}`}
                                />
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                            {dialogProps.data.label}
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: 'max-content',
                                        borderRadius: 15,
                                        background: 'rgb(254,252,191)',
                                        padding: 5,
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        marginTop: 5,
                                        marginBottom: 5
                                    }}
                                >
                                    <span style={{ color: 'rgb(116,66,16)', fontSize: '0.825rem' }}>{dialogProps.data.id}</span>
                                </div>
                                {dialogProps.data.version && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            width: 'max-content',
                                            borderRadius: 15,
                                            background: '#e9edc9',
                                            padding: 5,
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                            marginTop: 5,
                                            marginLeft: 10,
                                            marginBottom: 5
                                        }}
                                    >
                                        <span style={{ color: '#606c38', fontSize: '0.825rem' }}>version {dialogProps.data.version}</span>
                                    </div>
                                )}
                                {dialogProps.data.badge && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            width: 'max-content',
                                            borderRadius: 15,
                                            background: dialogProps.data.badge === 'DEPRECATING' ? '#ffe57f' : '#52b69a',
                                            padding: 5,
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                            marginTop: 5,
                                            marginLeft: 10,
                                            marginBottom: 5
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: dialogProps.data.badge !== 'DEPRECATING' ? 'white' : 'inherit',
                                                fontSize: '0.825rem'
                                            }}
                                        >
                                            {dialogProps.data.badge}
                                        </span>
                                    </div>
                                )}
                                {dialogProps.data.tags &&
                                    dialogProps.data.tags.length &&
                                    dialogProps.data.tags.map((tag, index) => (
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                width: 'max-content',
                                                borderRadius: 15,
                                                background: '#cae9ff',
                                                padding: 5,
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                                marginTop: 5,
                                                marginLeft: 10,
                                                marginBottom: 5
                                            }}
                                            key={index}
                                        >
                                            <span
                                                style={{
                                                    color: '#023e7d',
                                                    fontSize: '0.825rem'
                                                }}
                                            >
                                                {tag.toLowerCase()}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}></div>
                        {dialogProps.data.documentation && (
                            <Button
                                variant='outlined'
                                color='primary'
                                title='Open Documentation'
                                onClick={() => {
                                    window.open(dialogProps.data.documentation, '_blank', 'noopener,noreferrer')
                                }}
                                startIcon={<IconBook2 />}
                            >
                                Documentation
                            </Button>
                        )}
                    </div>
                )}
            </DialogTitle>
            <DialogContent>
                {/* Description Section */}
                {dialogProps.data?.description && (
                    <div
                        style={{
                            padding: '10px 0',
                            marginBottom: '15px',
                            color: customization.isDarkMode ? '#fff' : '#000'
                        }}
                    >
                        <strong style={{ display: 'block', marginBottom: '5px' }}>Description</strong>
                        <span>{dialogProps.data.description}</span>
                    </div>
                )}

                {/* Input & Output Nodes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                    {/* Input Nodes */}
                    <div>
                        <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.95rem' }}>Input Nodes</b>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginTop: '8px'
                            }}
                        >
                            {dialogProps?.data?.inputAnchors?.length > 0 ? (
                                dialogProps.data.inputAnchors.map((anchor, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            padding: '5px 10px',
                                            background: customization.isDarkMode ? '#333' : '#f1f1f1',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            color: customization.isDarkMode ? '#fff' : '#000'
                                        }}
                                    >
                                        {anchor.label}
                                    </span>
                                ))
                            ) : (
                                <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#888' }}>No Inputs</span>
                            )}
                        </div>
                    </div>

                    {/* Output Nodes */}
                    <div>
                        <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.95rem' }}>Output Nodes</b>
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{getOutputNode(outputNodes)}</div>
                    </div>
                </div>

                {/* Table Config Section */}
                {getNodeConfigApi.data && getNodeConfigApi.data.length > 0 && (
                    <TableViewOnly
                        rows={getNodeConfigApi.data.map(({ node, nodeId, ...rest }) => rest)}
                        columns={Object.keys(getNodeConfigApi.data[0]).slice(-3)}
                    />
                )}
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

NodeInfoDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func
}

export default NodeInfoDialog
