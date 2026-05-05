import PropTypes from 'prop-types'

const IconUserPlus = ({ color = 'black' }) => {
    return (
        <svg width='18' height='18' viewBox='0 0 25 25' fill={color} xmlns='http://www.w3.org/2000/svg'>
            <path d='M5.386 15.0894V12.1965H8.086V10.268H5.386V7.37511H3.586V10.268H0.886002V12.1965H3.586V15.0894H5.386Z' fill={color} />
            <path
                d='M14.486 12.518C17.5788 12.518 20.086 9.83167 20.086 6.51796C20.086 3.20425 17.5788 0.517963 14.486 0.517963C11.3932 0.517963 8.886 3.20425 8.886 6.51796C8.886 9.83167 11.3932 12.518 14.486 12.518Z'
                fill={color}
            />
            <path
                d='M14.486 14.2323C11.015 14.2323 4.086 16.5294 4.086 21.0894V24.518H24.886V21.0894C24.886 16.5294 17.957 14.2323 14.486 14.2323Z'
                fill={color}
            />
        </svg>
    )
}

IconUserPlus.propTypes = {
    color: PropTypes.string
}

export default IconUserPlus
