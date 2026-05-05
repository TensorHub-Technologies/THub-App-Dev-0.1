import PropTypes from 'prop-types'

const AppsOutlinedIcon = ({ color = 'black' }) => {
    return (
        <svg width='26' height='26' viewBox='-4 0 24 24' fill={color} xmlns='http://www.w3.org/2000/svg'>
            <g clipPath='url(#clip0_823_999)'>
                <path
                    d='M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z'
                    fill={color}
                />
            </g>
            <defs>
                <clipPath id='clip0_823_999'>
                    <rect width='26' height='26' fill={color} />
                </clipPath>
            </defs>
        </svg>
    )
}

AppsOutlinedIcon.propTypes = {
    color: PropTypes.string
}

export default AppsOutlinedIcon
