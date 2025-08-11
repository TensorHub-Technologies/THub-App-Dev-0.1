import PropTypes from 'prop-types'
import { forwardRef } from 'react'
import { useSelector } from 'react-redux'
import './card.css'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'

// constant
const headerSX = {
    '& .MuiCardHeader-action': { mr: 0 }
}

// ==============================|| CUSTOM MAIN CARD ||============================== //

const MainCard = forwardRef(function MainCard(
    {
        border = true,
        boxShadow,
        children,
        content = true,
        contentClass = '',
        contentSX = {},
        darkTitle,
        secondary,
        shadow,
        sx = {},
        title,
        ...others
    },
    ref
) {
    const otherProps = { ...others, border: others.border === false ? undefined : others.border }
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    return (
        <Card
            ref={ref}
            {...otherProps}
            className={customization.isDarkMode ? 'gradient-card-global-subtle-dark' : 'gradient-card-global-subtle-light'}
            sx={{
                // border: border ? '1px solid' : 'none',
                // borderColor: theme.palette.primary[200] + 75,
                // background: customization.isDarkMode
                //     ? 'radial-gradient(circle at center bottom, rgba(60, 91, 164, 1) 14%, rgba(0, 0, 0, 1) 82%)'
                //     : 'radial-gradient(circle at center bottom, rgb(186, 198, 225) 14%, rgb(255, 255, 255) 82%)',
                // backdropFilter: 'blur(12px)',
                // WebkitBackdropFilter: 'blur(12px)',
                // borderRadius: '16px',
                // // Make it follow the viewport
                // backgroundAttachment: 'fixed',
                // backgroundSize: '100vw 100vh',
                // backgroundPosition: 'center center',
                // backgroundRepeat: 'no-repeat',
                ':hover': {
                    boxShadow: boxShadow ? shadow || '0 2px 14px 0 rgb(32 40 45 / 8%)' : 'inherit'
                },
                // maxWidth: '1280px',
                mx: 'auto',
                ...sx
            }}
        >
            {/* card header and action */}
            {!darkTitle && title && <CardHeader sx={headerSX} title={title} action={secondary} />}
            {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant='h3'>{title}</Typography>} action={secondary} />}

            {/* content & header divider */}
            {title && <Divider />}

            {/* card content */}
            {content && (
                <CardContent sx={contentSX} className={contentClass}>
                    {children}
                </CardContent>
            )}
            {!content && children}
        </Card>
    )
})

MainCard.propTypes = {
    border: PropTypes.bool,
    boxShadow: PropTypes.bool,
    children: PropTypes.node,
    content: PropTypes.bool,
    contentClass: PropTypes.string,
    contentSX: PropTypes.object,
    darkTitle: PropTypes.bool,
    secondary: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
    shadow: PropTypes.string,
    sx: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object])
}

export default MainCard
