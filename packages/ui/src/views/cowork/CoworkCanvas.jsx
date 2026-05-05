import PropTypes from 'prop-types'
import { useEffect } from 'react'
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, MarkerType, Handle, Position } from 'reactflow'
import 'reactflow/dist/style.css'
import { Box, Typography } from '@mui/material'

// Node status → colour mapping — matches AgentMonitor event colours
const STATUS_BG = {
    pending: '#FEF3C7', // yellow
    ready: '#FEF3C7', // yellow
    running: '#DBEAFE', // blue
    completed: '#DCFCE7', // green
    failed: '#FEE2E2', // red
    skipped: '#F3F4F6' // gray
}
const STATUS_BORDER = {
    pending: '#F59E0B', // yellow border
    ready: '#F59E0B',
    running: '#2563EB',
    completed: '#16A34A',
    failed: '#DC2626',
    skipped: '#9CA3AF'
}

const PERSONA_ABBREV = {
    coder: 'COD',
    researcher: 'RES',
    analyst: 'ANL',
    reviewer: 'REV',
    architect: 'ARC',
    writer: 'WRI'
}

// Custom node component — shows task name, persona badge, status
const TaskNode = ({ data }) => {
    const bg = STATUS_BG[data.status] || STATUS_BG.pending
    const border = STATUS_BORDER[data.status] || STATUS_BORDER.pending
    return (
        <Box
            sx={{
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: 2,
                padding: '10px 14px',
                minWidth: 160,
                maxWidth: 200,
                boxShadow: data.status === 'running' ? `0 0 0 3px ${border}44` : 'none',
                animation: data.status === 'running' ? 'pulse 1.5s infinite' : 'none'
            }}
        >
            <Handle type='target' position={Position.Left} style={{ background: '#94A3B8', width: 8, height: 8 }} isConnectable={false} />
            <Typography variant='caption' sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.5 }}>
                {PERSONA_ABBREV[data.persona] || 'TSK'}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                {data.label}
            </Typography>
            <Handle type='source' position={Position.Right} style={{ background: '#94A3B8', width: 8, height: 8 }} isConnectable={false} />
        </Box>
    )
}

TaskNode.propTypes = {
    data: PropTypes.shape({
        status: PropTypes.string,
        persona: PropTypes.string,
        label: PropTypes.string
    })
}

const nodeTypes = { taskNode: TaskNode }

const CoworkCanvas = ({ tasks = [] }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    // Build nodes and edges from task array
    useEffect(() => {
        if (!tasks.length) return

        // Simple left-to-right layout: group tasks by dependency depth
        const depth = {}
        const getDepth = (taskId) => {
            if (depth[taskId] !== undefined) return depth[taskId]
            const task = tasks.find((t) => t.id === taskId)
            if (!task || !task.dependencies?.length) {
                depth[taskId] = 0
                return 0
            }
            const d = Math.max(...task.dependencies.map((d) => getDepth(d))) + 1
            depth[taskId] = d
            return d
        }
        tasks.forEach((t) => getDepth(t.id))

        const colCounts = {}
        const newNodes = tasks.map((task) => {
            const col = depth[task.id] || 0
            colCounts[col] = colCounts[col] || 0
            const row = colCounts[col]++
            return {
                id: task.id,
                type: 'taskNode',
                position: { x: col * 240 + 40, y: row * 120 + 40 },
                data: { label: task.name, status: task.status, persona: task.agentPersona }
            }
        })

        const newEdges = tasks.flatMap((task) =>
            (task.dependencies || []).map((depId) => ({
                id: `${depId}->${task.id}`,
                source: depId,
                target: task.id,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#94A3B8' }
            }))
        )

        setNodes(newNodes)
        setEdges(newEdges)
    }, [tasks, setNodes, setEdges])

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
        >
            <Background />
            <Controls showInteractive={false} />
        </ReactFlow>
    )
}

CoworkCanvas.propTypes = {
    tasks: PropTypes.array
}

export default CoworkCanvas
