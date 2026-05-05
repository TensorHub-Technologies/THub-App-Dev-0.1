import PropTypes from 'prop-types'

const IconLogout = ({ color = 'black' }) => {
    return (
        <svg width='22' height='22' viewBox='0 0 25 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M0.886002 0.517963H24.886V24.518H0.886002V0.517963Z' fill={color} fillOpacity='0.01' />
            <path d='M12.8819 3.51796H3.88601V21.518H12.886' stroke={color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path
                d='M17.386 17.018L21.886 12.518L17.386 8.01796'
                stroke={color}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path d='M8.886 12.5138H21.886' stroke={color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
    )
}

IconLogout.propTypes = {
    color: PropTypes.string
}

export default IconLogout
