import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

// Material
import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { TableViewOnly } from '@/ui-component/table/Table'

// Store
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'
import { baseURL } from '@/store/constant'

// API
import configApi from '@/api/config'
import useApi from '@/hooks/useApi'

import nodesApi from '@/api/nodes'

import { flowContext } from '@/store/context/ReactFlowContext'

const NodeInfoDialog = ({ show, dialogProps, onCancel }) => {
    const { reactFlowInstance } = useContext(flowContext)
    const getNodesApi = useApi(nodesApi.getAllNodes)
    const [outputNodes, setOutputNodes] = useState()

    const portalElement = document.getElementById('portal')
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    const getNodeConfigApi = useApi(configApi.getNodeConfig)

    useEffect(() => {
        if (dialogProps.data) {
            getNodeConfigApi.request(dialogProps.data)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialogProps])

    const getOutputNodeName = () => {
        const sourceNode = dialogProps.data
        const outputNode = getOutputNode(sourceNode.id)
        if (outputNode) {
            return outputNode.data.label
        }
        return null
    }

    // const getOutputNode = (outputNodes) => {
    //     if(outputNodes){
    //         console.log(outputNodes,"#####")
    // var labelStore=outputNodes.map((ele)=>{
    //         console.log(ele.label)
    //         return ele.label;
    //     })
    //     }
    //     return labelStore;
    const getOutputNode = (outputNodes) => {
        if (!outputNodes) return null

        return outputNodes.map((ele, index) => (
            <span key={index} style={{ padding: '8px' }}>
                {ele.label}
                {index !== outputNodes.length - 1 ? ',' : ''}
            </span>
        ))
    }
    // console.log('sourceNodeId',sourceNodeId)

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    useEffect(() => {
        getNodesApi.request()
    }, [])

    useEffect(() => {
        if (getNodesApi.data) {
            const sourceNode = dialogProps.data

            if (sourceNode) {
                const allNodeDetails = getNodesApi.data //.map(x => ({ type: x.type, label: x.label }))//.filter((x, index, arr) => arr.indexOf(x) === index);
                //console.log('allNodes', allNodeDetails);

                const outputTypes = sourceNode.baseClasses

                const outputNodes = allNodeDetails.filter((x) => x.inputs?.some((z) => outputTypes.includes(z.type)))
                setOutputNodes(outputNodes)
            }
        }
    }, [getNodesApi.data, dialogProps.data])

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
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                            {dialogProps.data.label}
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <div
                                    style={{
                                        border: '5px solid red',

                                        display: 'none',
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
                                            display: 'none',
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
                                        {/* <span style={{ color: '#606c38', fontSize: '0.825rem' }}>version {dialogProps.data.version}</span> */}
                                    </div>
                                )}
                                {/* <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', right: '0px' }}>

                                    <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                                        <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.9rem' }}>
                                            Input
                                        </b>
                                        {dialogProps?.data?.inputAnchors.map((anchor, index) => (
                                            <span key={index}>{anchor.label}</span>
                                        ))}
                                    </div>


                                    <div> 
                                        {console.log(outputNodes)}
                                        <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.9rem' }}>Output</b>
                                        <span style={{ marginLeft: '18px' }}>{getOutputNode(outputNodes)}</span>
                                    </div>
                                </div> */}

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: 'max-content',
                                        borderRadius: 15,
                                        background: customization.isDarkMode ? '#E22A90' : '#3C5BA4',
                                        padding: 5,
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        marginTop: 5,
                                        // marginLeft: '10px',
                                        marginBottom: 5,
                                        position: 'absolute',
                                        top: '5px',
                                        right: '21px'
                                    }}
                                >
                                    <a
                                        href={`https://docs.thub.tech/${dialogProps.data.category.replace(/\s+/g, '-').toLowerCase()}`}
                                        style={{ textDecoration: 'none' }}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        <span style={{ color: '#fff', fontSize: '0.825rem' }}>Documentation</span>
                                    </a>
                                </div>
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
                            </div>
                        </div>
                    </div>
                )}
            </DialogTitle>

            <DialogContent>
                {dialogProps.data?.description && (
                    <div
                        style={{
                            padding: 10,
                            marginBottom: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            right: '11px'
                        }}
                    >
                        <span style={{ color: customization.isDarkMode ? '#fff' : '#000', display: 'flex', gap: '10px' }}>
                            <strong>Description</strong> {dialogProps.data.description}
                        </span>
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', right: '0px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '17px', marginBottom: '5px' }}>
                        <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.9rem' }}>Input Nodes</b>
                        {dialogProps?.data?.inputAnchors?.length > 0 ? (
                            dialogProps.data.inputAnchors.map((anchor, index, array) => (
                                <span key={index}>
                                    {anchor.label}
                                    {index !== array.length - 1 ? ', ' : ''}
                                </span>
                            ))
                        ) : (
                            <span>No Inputs</span>
                        )}
                    </div>

                    {/* <div> 
    {console.log(outputNodes)}
    <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.9rem' }}>Output</b>
    <span style={{ marginLeft: '18px' }}>{getOutputNode(outputNodes)}</span>
</div> */}
                    <div style={{ alignItems: 'center', gap: '15px' }}>
                        <b style={{ color: customization.isDarkMode ? '#fff' : '#000', fontSize: '0.9rem' }}>Output Nodes</b>
                        {getOutputNode(outputNodes)}
                    </div>
                </div>

                {getNodeConfigApi.data && getNodeConfigApi.data.length > 0 && (
                    <TableViewOnly
                        rows={getNodeConfigApi.data.map((obj) => {
                            // eslint-disable-next-line
                            const { node, nodeId, ...rest } = obj
                            return rest
                        })}
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
