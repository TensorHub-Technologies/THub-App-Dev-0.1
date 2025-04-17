import { getSmoothStepPath, EdgeText } from 'reactflow'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useContext, useEffect, useState, useRef } from 'react'
import { SET_DIRTY } from '@/store/actions'
import { flowContext } from '@/store/context/ReactFlowContext'

import './index.css'

const foreignObjectSize = 40
const animationDuration = 2000 // Duration for the animated indicator

const ButtonEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }) => {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    })

    const { deleteEdge } = useContext(flowContext)
    const dispatch = useDispatch()
    const customization = useSelector((state) => state.customization)
    const [buttonPosition, setButtonPosition] = useState({ x: sourceX, y: sourceY })
    const pathRef = useRef(null)
    const startTimeRef = useRef(null)

    const onEdgeClick = (evt, id) => {
        evt.stopPropagation()
        deleteEdge(id)
        dispatch({ type: SET_DIRTY })
    }

    useEffect(() => {
        const path = pathRef.current
        if (!path) return

        const length = path.getTotalLength()

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp
            const elapsed = timestamp - startTimeRef.current
            const progress = (elapsed % animationDuration) / animationDuration
            const point = path.getPointAtLength(length * progress)
            setButtonPosition({ x: point.x, y: point.y })
            requestAnimationFrame(animate)
        }

        requestAnimationFrame(animate)
    }, [edgePath])

    // Center position of the delete button
    const centerButtonPosition = {
        x: (sourceX + targetX) / 2 - foreignObjectSize / 2,
        y: (sourceY + targetY) / 2 - foreignObjectSize / 2
    }

    return (
        <>
            <path
                id={id}
                ref={pathRef}
                style={{
                    stroke: customization?.isDarkMode ? '#e22a90' : '#3c5ba4',
                    strokeWidth: '2px'
                }}
                className='react-flow__edge-path'
                d={edgePath}
                markerEnd={markerEnd}
            />

            {data?.label && (
                <EdgeText
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 - 20}
                    label={data.label}
                    labelStyle={{ fill: 'black' }}
                    labelBgStyle={{ fill: 'transparent' }}
                    labelBgPadding={[2, 4]}
                    labelBgBorderRadius={2}
                />
            )}

            <foreignObject
                width={foreignObjectSize}
                height={foreignObjectSize}
                x={centerButtonPosition.x}
                y={centerButtonPosition.y}
                className='edgebutton-foreignobject'
                requiredExtensions='http://www.w3.org/1999/xhtml'
            >
                <div>
                    <button
                        className='edgebutton'
                        onClick={(event) => onEdgeClick(event, id)}
                        style={{
                            background: customization?.isDarkMode ? '#E22A90' : '#3C5BA4',
                            color: customization?.isDarkMode ? '#000' : '#fff'
                        }}
                    >
                        x
                    </button>
                </div>
            </foreignObject>

            <foreignObject
                width={foreignObjectSize}
                height={foreignObjectSize}
                x={buttonPosition.x - foreignObjectSize / 2}
                y={buttonPosition.y - foreignObjectSize / 2}
                className='edgebutton-foreignobject'
                requiredExtensions='http://www.w3.org/1999/xhtml'
            >
                <div className='animated-indicator' />
            </foreignObject>
        </>
    )
}

ButtonEdge.propTypes = {
    id: PropTypes.string,
    sourceX: PropTypes.number,
    sourceY: PropTypes.number,
    targetX: PropTypes.number,
    targetY: PropTypes.number,
    sourcePosition: PropTypes.any,
    targetPosition: PropTypes.any,
    data: PropTypes.object,
    markerEnd: PropTypes.any
}

export default ButtonEdge
