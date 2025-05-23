import PropTypes from 'prop-types'

const IconInfo = ({ color = 'black' }) => {
    return (
        <svg fill={color} width='22px' height='22px' viewBox='0 0 24 20' xmlns='http://www.w3.org/2000/svg'>
            <g data-name='Layer 2'>
                <g data-name='info'>
                    <rect width='22' height='22' transform='rotate(180 12 12)' opacity='0' />

                    <path d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z' />

                    <circle cx='12' cy='8' r='1' />

                    <path d='M12 10a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1z' />
                </g>
            </g>
        </svg>
    )
}

IconInfo.propTypes = {
    color: PropTypes.string
}

export default IconInfo
