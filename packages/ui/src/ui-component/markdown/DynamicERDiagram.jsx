/* eslint-disable react/prop-types, no-unreachable, unused-imports/no-unused-vars */
import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import ReactFlow, {
    Background,
    Controls,
    Panel,
    MarkerType,
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionLineType,
    Handle,
    Position
} from 'reactflow'
import 'reactflow/dist/style.css'

export const DynamicERDiagram = ({ schemaData }) => {
    const [nodes, setNodes, onNodesChange1] = useNodesState([])
    const [edges, setEdges, onEdgesChange1] = useEdgesState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const [selectedEdge, setSelectedEdge] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showFieldEditor, setShowFieldEditor] = useState(false)
    const [currentFields, setCurrentFields] = useState([])
    const [newField, setNewField] = useState({
        name: '',
        type: '',
        key: null,
        constraint: null
    })

    // Table colors for visual distinction
    const tableColors = {
        primary: '#D4F1F9',
        secondary: '#FFE8D6',
        tertiary: '#E2F0CB',
        quaternary: '#FFC2C2',
        other: '#F0E6FF'
    }

    // Custom node component for tables
    const TableNode = ({ data, selected }) => {
        return (
            <div
                className={`bg-white rounded shadow-md border ${selected ? 'border-blue-500 border-2' : 'border-gray-300'} overflow-hidden`}
                style={{ width: 220 }}
            >
                {/* Add handles for connections */}
                <Handle type='source' position={Position.Right} id='right' style={{ background: '#555', width: 10, height: 10 }} />
                <Handle type='target' position={Position.Left} id='left' style={{ background: '#555', width: 10, height: 10 }} />
                <Handle type='source' position={Position.Bottom} id='bottom' style={{ background: '#555', width: 10, height: 10 }} />
                <Handle type='target' position={Position.Top} id='top' style={{ background: '#555', width: 10, height: 10 }} />

                <div className='bg-gray-800 text-white font-bold p-2 text-center flex justify-between items-center'>
                    <span>{data.label}</span>
                    {selected && isEditing && (
                        <button
                            className='text-xs bg-blue-500 px-2 py-1 rounded'
                            onClick={(e) => {
                                e.stopPropagation()
                                openFieldEditor(data.fields)
                            }}
                        >
                            Edit Fields
                        </button>
                    )}
                </div>
                <div className='p-2' style={{ backgroundColor: data.color }}>
                    {data.fields.map((field, index) => (
                        <div key={index} className='py-1 px-2 border-b border-gray-200 font-mono text-sm'>
                            {field.name} {field.type}
                            {field.key === 'PK' && ' 🔑'}
                            {field.key === 'FK' && ' 🔗'}
                            {field.constraint && ` (${field.constraint})`}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    TableNode.propTypes = {
        data: PropTypes.shape({
            label: PropTypes.string.isRequired,
            fields: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string.isRequired,
                    type: PropTypes.string.isRequired,
                    key: PropTypes.oneOf(['PK', 'FK', null]),
                    constraint: PropTypes.oneOf(['UNIQUE', 'NOT NULL', null])
                })
            ).isRequired,
            color: PropTypes.string
        }).isRequired,
        selected: PropTypes.bool
    }

    // Field editor component
    const FieldEditor = () => {
        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                    <h3 className='text-xl font-bold mb-4'>Edit Table Fields</h3>

                    <div className='mb-4'>
                        <h4 className='font-semibold mb-2'>Current Fields</h4>
                        <table className='w-full border-collapse'>
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className='border p-2 text-left'>Field Name</th>
                                    <th className='border p-2 text-left'>Type</th>
                                    <th className='border p-2 text-left'>Key</th>
                                    <th className='border p-2 text-left'>Constraint</th>
                                    <th className='border p-2 text-left'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentFields.map((field, index) => (
                                    <tr key={index}>
                                        <td className='border p-2'>
                                            <input
                                                className='w-full border rounded p-1'
                                                value={field.name}
                                                onChange={(e) => updateField(index, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td className='border p-2'>
                                            <input
                                                className='w-full border rounded p-1'
                                                value={field.type}
                                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                            />
                                        </td>
                                        <td className='border p-2'>
                                            <select
                                                className='w-full border rounded p-1'
                                                value={field.key || ''}
                                                onChange={(e) => updateField(index, 'key', e.target.value || null)}
                                            >
                                                <option value=''>None</option>
                                                <option value='PK'>Primary Key</option>
                                                <option value='FK'>Foreign Key</option>
                                            </select>
                                        </td>
                                        <td className='border p-2'>
                                            <select
                                                className='w-full border rounded p-1'
                                                value={field.constraint || ''}
                                                onChange={(e) => updateField(index, 'constraint', e.target.value || null)}
                                            >
                                                <option value=''>None</option>
                                                <option value='UNIQUE'>UNIQUE</option>
                                                <option value='NOT NULL'>NOT NULL</option>
                                            </select>
                                        </td>
                                        <td className='border p-2'>
                                            <button className='bg-red-500 text-white px-2 py-1 rounded' onClick={() => removeField(index)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='mb-4'>
                        <h4 className='font-semibold mb-2'>Add New Field</h4>
                        <div className='grid grid-cols-6 gap-2'>
                            <div className='col-span-2'>
                                <input
                                    className='w-full border rounded p-2'
                                    placeholder='Field Name'
                                    value={newField.name}
                                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                />
                            </div>
                            <div className='col-span-2'>
                                <input
                                    className='w-full border rounded p-2'
                                    placeholder='Type (e.g. VARCHAR(255))'
                                    value={newField.type}
                                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                />
                            </div>
                            <div className='col-span-1'>
                                <select
                                    className='w-full border rounded p-2'
                                    value={newField.key || ''}
                                    onChange={(e) => setNewField({ ...newField, key: e.target.value || null })}
                                >
                                    <option value=''>Key</option>
                                    <option value='PK'>PK</option>
                                    <option value='FK'>FK</option>
                                </select>
                            </div>
                            <div className='col-span-1'>
                                <select
                                    className='w-full border rounded p-2'
                                    value={newField.constraint || ''}
                                    onChange={(e) =>
                                        setNewField({
                                            ...newField,
                                            constraint: e.target.value || null
                                        })
                                    }
                                >
                                    <option value=''>Constraint</option>
                                    <option value='UNIQUE'>UNIQUE</option>
                                    <option value='NOT NULL'>NOT NULL</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className='mt-2 bg-green-500 text-white px-3 py-1 rounded'
                            onClick={addNewField}
                            disabled={!newField.name || !newField.type}
                        >
                            Add Field
                        </button>
                    </div>

                    <div className='flex justify-end gap-2 mt-4'>
                        <button className='bg-gray-400 text-white px-4 py-2 rounded' onClick={() => setShowFieldEditor(false)}>
                            Cancel
                        </button>
                        <button className='bg-blue-500 text-white px-4 py-2 rounded' onClick={saveFieldChanges}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Edge editor component
    const EdgeEditor = ({ edge }) => {
        const [edgeLabel, setEdgeLabel] = useState(edge.label || '')

        const saveEdgeChanges = () => {
            setEdges((eds) => eds.map((e) => (e.id === edge.id ? { ...e, label: edgeLabel } : e)))
            setSelectedEdge(null)
        }

        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-6 max-w-md w-full'>
                    <h3 className='text-xl font-bold mb-4'>Edit Relationship</h3>

                    <div className='mb-4'>
                        <label htmlFor='relationshipLabel' className='block text-sm font-medium mb-2'>
                            Relationship Label
                        </label>
                        <input
                            id='relationshipLabel'
                            className='w-full border rounded p-2'
                            placeholder='e.g. UserID -&gt; UserID'
                            value={edgeLabel}
                            onChange={(e) => setEdgeLabel(e.target.value)}
                        />
                        <p className='text-sm text-gray-500 mt-1'>
                            Tip: Use format &quot;sourceField -&gt; targetField&quot; for better SQL generation
                        </p>
                    </div>

                    <div className='flex justify-end gap-2 mt-4'>
                        <button className='bg-gray-400 text-white px-4 py-2 rounded' onClick={() => setSelectedEdge(null)}>
                            Cancel
                        </button>
                        <button className='bg-blue-500 text-white px-4 py-2 rounded' onClick={saveEdgeChanges}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )

        EdgeEditor.propTypes = {
            edge: PropTypes.shape({
                id: PropTypes.string.isRequired,
                label: PropTypes.string
            }).isRequired,
            setEdges: PropTypes.func.isRequired,
            setSelectedEdge: PropTypes.func.isRequired
        }
    }

    // Register custom node types
    const nodeTypes = {
        tableNode: TableNode
    }

    // Open field editor
    const openFieldEditor = (fields) => {
        setCurrentFields([...fields])
        setShowFieldEditor(true)
    }

    // Handle adding a new field
    const addNewField = () => {
        if (newField.name && newField.type) {
            setCurrentFields([...currentFields, { ...newField }])
            setNewField({ name: '', type: '', key: null, constraint: null })
        }
    }

    // Handle removing a field
    const removeField = (index) => {
        const updatedFields = [...currentFields]
        updatedFields.splice(index, 1)
        setCurrentFields(updatedFields)
    }

    // Handle updating a field
    const updateField = (index, property, value) => {
        const updatedFields = [...currentFields]
        updatedFields[index] = { ...updatedFields[index], [property]: value }
        setCurrentFields(updatedFields)
    }

    // Save field changes
    const saveFieldChanges = () => {
        if (selectedNode) {
            setNodes((nds) =>
                nds.map((node) => (node.id === selectedNode.id ? { ...node, data: { ...node.data, fields: currentFields } } : node))
            )
            setShowFieldEditor(false)
        }
    }

    // Handle node selection
    const onNodeClick = useCallback((event, node) => {
        event.stopPropagation()
        setSelectedNode(node)
        setSelectedEdge(null)
    }, [])

    // Handle edge selection
    const onEdgeClick = useCallback((event, edge) => {
        event.stopPropagation()
        setSelectedEdge(edge)
        setSelectedNode(null)
    }, [])

    // Handle background click to deselect
    const onPaneClick = useCallback(() => {
        setSelectedNode(null)
        setSelectedEdge(null)
    }, [])

    // Handle edge connection
    const onConnect = useCallback(
        (params) => {
            // Create a unique ID for the new edge
            const edgeId = `e-${Date.now()}`

            // Default edge properties
            const newEdge = {
                ...params,
                id: edgeId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#333', strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20
                },
                label: 'New Relationship'
            }

            setEdges((eds) => addEdge(newEdge, eds))
        },
        [setEdges]
    )

    // Toggle edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing)
        setSelectedNode(null)
        setSelectedEdge(null)
    }

    // Delete selected node or edge
    const deleteSelected = () => {
        if (selectedNode) {
            setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
            setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
            setSelectedNode(null)
        } else if (selectedEdge) {
            setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id))
            setSelectedEdge(null)
        }
    }

    // Edit table name
    const editTableName = () => {
        if (!selectedNode) return

        const newName = prompt('Enter a new name for the table:', selectedNode.data.label)
        if (newName && newName.trim() !== '') {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === selectedNode.id
                        ? {
                              ...node,
                              id: newName, // Update the node ID to the new table name
                              data: { ...node.data, label: newName }
                          }
                        : node
                )
            )

            // Update any edges that reference this node
            setEdges((eds) =>
                eds.map((edge) => ({
                    ...edge,
                    source: edge.source === selectedNode.id ? newName : edge.source,
                    target: edge.target === selectedNode.id ? newName : edge.target
                }))
            )

            // Update selected node reference
            setSelectedNode({
                ...selectedNode,
                id: newName,
                data: { ...selectedNode.data, label: newName }
            })
        }
    }

    // Add a new table node
    const addNewTable = () => {
        const newNodeId = `NewTable_${Date.now()}`
        const newNode = {
            id: newNodeId,
            type: 'tableNode',
            position: { x: 100, y: 100 },
            data: {
                label: 'New Table',
                fields: [
                    { name: 'id', type: 'INT', key: 'PK' },
                    { name: 'name', type: 'VARCHAR(255)' }
                ],
                color: getTableColor(nodes.length)
            }
        }

        setNodes((nds) => [...nds, newNode])
    }

    // Edit edge (relationship) properties
    const editEdge = () => {
        if (!selectedEdge) return
    }

    // Parse schema on component mount or when schema changes
    useEffect(() => {
        if (!schemaData) return

        const parsedTables = {}
        const parsedRelationships = []

        // Parse schema SQL to extract table definitions and relationships
        const statements = schemaData.split(';').filter((stmt) => stmt.trim().length > 0)

        statements.forEach((statement) => {
            // Extract table creation statements
            if (statement.trim().toUpperCase().startsWith('CREATE TABLE')) {
                const tableMatch = statement.match(/CREATE TABLE\s+(\w+)/i)
                if (!tableMatch) return

                const tableName = tableMatch[1]
                const fieldsSection = statement.substring(statement.indexOf('(') + 1, statement.lastIndexOf(')'))

                // Parse fields and constraints
                const fieldLines = fieldsSection.split(',').map((f) => f.trim())
                const fields = []
                const foreignKeys = []

                fieldLines.forEach((line) => {
                    // Check if line is a FOREIGN KEY definition
                    if (line.toUpperCase().includes('FOREIGN KEY')) {
                        const fkMatch = line.match(/FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s*(\w+)\s*\((\w+)\)/i)
                        if (fkMatch) {
                            const [_, localField, foreignTable, foreignField] = fkMatch
                            foreignKeys.push({ localField, foreignTable, foreignField })

                            // Add to relationships
                            parsedRelationships.push({
                                from: tableName,
                                to: foreignTable,
                                fromField: localField,
                                toField: foreignField
                            })
                        }
                    }
                    // Regular field definition
                    else if (line.split(/\s+/).length >= 2) {
                        const parts = line.split(/\s+/)
                        const fieldName = parts[0]
                        const fieldType = parts.slice(1).join(' ')

                        let key = null
                        let constraint = null

                        if (line.toUpperCase().includes('PRIMARY KEY')) {
                            key = 'PK'
                        }

                        if (line.toUpperCase().includes('UNIQUE')) {
                            constraint = 'UNIQUE'
                        }

                        if (line.toUpperCase().includes('NOT NULL')) {
                            constraint = constraint || 'NOT NULL'
                        }

                        fields.push({
                            name: fieldName,
                            type: fieldType.replace('PRIMARY KEY', '').replace('UNIQUE', '').replace('NOT NULL', '').trim(),
                            key,
                            constraint
                        })
                    }
                })

                // Mark foreign keys in the fields
                foreignKeys.forEach((fk) => {
                    const fieldIndex = fields.findIndex((f) => f.name === fk.localField)
                    if (fieldIndex !== -1) {
                        fields[fieldIndex].key = fields[fieldIndex].key || 'FK'
                    }
                })

                parsedTables[tableName] = { fields }
            }
        })

        // Convert tables to React Flow nodes
        const tableNodes = Object.entries(parsedTables).map(([tableName, table], index) => {
            // Calculate position in a grid layout
            const row = Math.floor(index / 3)
            const col = index % 3

            return {
                id: tableName,
                type: 'tableNode',
                position: { x: col * 300, y: row * 300 },
                data: {
                    label: tableName,
                    fields: table.fields,
                    color: getTableColor(index)
                },
                draggable: true
            }
        })

        // Convert relationships to React Flow edges
        const relationshipEdges = parsedRelationships.map((rel, index) => ({
            id: `e-${index}`,
            source: rel.from,
            target: rel.to,
            label: `${rel.fromField} → ${rel.toField}`,
            labelStyle: { fill: '#333', fontWeight: 500 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20
            },
            style: { stroke: '#333', strokeWidth: 2 },
            type: 'smoothstep',
            animated: true
        }))

        setNodes(tableNodes)
        setEdges(relationshipEdges)
    }, [schemaData])

    // Get color for a table
    const getTableColor = (index) => {
        const colors = Object.values(tableColors)
        return colors[index % colors.length]
    }

    // Export diagram to SQL
    const exportToSQL = () => {
        let sqlOutput = ''

        // Generate SQL for each table
        nodes.forEach((node) => {
            sqlOutput += `CREATE TABLE ${node.data.label} (\n`

            // Add fields
            node.data.fields.forEach((field, index) => {
                sqlOutput += `    ${field.name} ${field.type}`

                if (field.key === 'PK') {
                    sqlOutput += ' PRIMARY KEY'
                }

                if (field.constraint) {
                    sqlOutput += ` ${field.constraint}`
                }

                if (index < node.data.fields.length - 1) {
                    sqlOutput += ',\n'
                } else {
                    // Check if we need to add foreign keys
                    const nodeForeignKeys = edges.filter((edge) => edge.source === node.id)
                    if (nodeForeignKeys.length > 0) {
                        sqlOutput += ',\n'
                    } else {
                        sqlOutput += '\n'
                    }
                }
            })

            // Add foreign key constraints
            const foreignKeyEdges = edges.filter((edge) => edge.source === node.id)
            foreignKeyEdges.forEach((edge, index) => {
                if (!edge.label) return

                const parts = edge.label.split('→')
                if (parts.length !== 2) return

                const fromField = parts[0].trim()
                const toField = parts[1].trim()

                if (!fromField || !toField) return

                sqlOutput += `    FOREIGN KEY (${fromField}) REFERENCES ${edge.target}(${toField})`
                if (index < foreignKeyEdges.length - 1) {
                    sqlOutput += ',\n'
                } else {
                    sqlOutput += '\n'
                }
            })

            sqlOutput += ');\n\n'
        })

        return sqlOutput
    }

    return (
        <div className='w-full overflow-hidden bg-white p-4 rounded-lg shadow-lg'>
            <h2 className='text-xl font-bold mb-4 text-center'>Database Schema Visualization</h2>

            <div className='mb-2 flex flex-wrap gap-2'>
                <button className={`px-3 py-1 rounded ${isEditing ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={toggleEditMode}>
                    {isEditing ? 'Editing Mode: ON' : 'Editing Mode: OFF'}
                </button>

                {isEditing && (
                    <>
                        <button className='px-3 py-1 rounded bg-blue-500 text-white' onClick={addNewTable}>
                            Add Table
                        </button>
                        {selectedNode && (
                            <>
                                <button className='px-3 py-1 rounded bg-purple-500 text-white' onClick={editTableName}>
                                    Rename Table
                                </button>
                                <button
                                    className='px-3 py-1 rounded bg-orange-500 text-white'
                                    onClick={() => openFieldEditor(selectedNode.data.fields)}
                                >
                                    Edit Fields
                                </button>
                                <button className='px-3 py-1 rounded bg-red-500 text-white' onClick={deleteSelected}>
                                    Delete Table
                                </button>
                            </>
                        )}
                        {selectedEdge && (
                            <>
                                <button
                                    className='px-3 py-1 rounded bg-orange-500 text-white'
                                    onClick={() => setSelectedEdge(selectedEdge)}
                                >
                                    Edit Relationship
                                </button>
                                <button className='px-3 py-1 rounded bg-red-500 text-white' onClick={deleteSelected}>
                                    Delete Relationship
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            <div style={{ height: 700 }} className='border border-gray-200 bg-white rounded'>
                {nodes.length === 0 ? (
                    <div className='text-center p-4'>Loading schema or no schema provided...</div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange1}
                        onEdgesChange={onEdgesChange1}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        connectionLineType={ConnectionLineType.SmoothStep}
                        connectionMode='loose'
                        snapToGrid={true}
                        snapGrid={[15, 15]}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            markerEnd: {
                                type: MarkerType.ArrowClosed
                            },
                            style: { stroke: '#333', strokeWidth: 2 }
                        }}
                    >
                        <Background />
                        <Controls />

                        <Panel position='bottom-right'>
                            <div className='bg-white p-2 rounded shadow-md border'>
                                <p className='font-semibold mb-1'>Diagram Legend:</p>
                                <ul className='space-y-1'>
                                    <li className='flex items-center'>
                                        <span className='inline-block w-4 h-4 mr-2 text-center'>🔑</span> Primary Key
                                    </li>
                                    <li className='flex items-center'>
                                        <span className='inline-block w-4 h-4 mr-2 text-center'>🔗</span> Foreign Key
                                    </li>
                                </ul>
                            </div>
                        </Panel>
                    </ReactFlow>
                )}
            </div>

            <div className='mt-4'>
                <button
                    className='px-3 py-1 rounded bg-indigo-600 text-white'
                    onClick={() => {
                        const sql = exportToSQL()
                        alert(sql)
                    }}
                >
                    Export to SQL
                </button>
            </div>

            {showFieldEditor && <FieldEditor />}
            {selectedEdge && <EdgeEditor edge={selectedEdge} />}
        </div>
    )
}

DynamicERDiagram.propTypes = {
    schemaData: PropTypes.string
}
