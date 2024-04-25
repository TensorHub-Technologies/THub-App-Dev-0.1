import logo from '@/assets/images/THub_logo.png'
import logoDark from '@/assets/images/THub_logo_dark.png'
import logoColorfulIcon from '@/assets/images/THub_icon_colorful_logo.png'

import { useSelector } from 'react-redux'

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <>
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <img
                    style={{ objectFit: 'contain', height: 'auto', width: 35 }}
                    src={customization.isDarkMode ? logoColorfulIcon : logoColorfulIcon}
                    alt='THub Logo Icon'
                />
            </div>

            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <img
                    style={{ objectFit: 'contain', height: 'auto', width: 100 }}
                    src={customization.isDarkMode ? logoDark : logo}
                    alt='THub Logo'
                />
            </div>
        </>
    )
}

export default Logo
