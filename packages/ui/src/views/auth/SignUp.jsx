import { useState } from 'react'
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    CssBaseline,
    FormControl,
    OutlinedInput,
    FormHelperText,
    InputAdornment,
    IconButton,
    Divider
} from '@mui/material'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { Top } from './Top'

// images
import leftImage from '../../assets/images/auth/screen-5.png'
import thubLogo from '../../assets/images/THub_Logo_Icon.png'

const SignUp = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const formik = useFormik({
        initialValues: {
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            password: '',
            confirmPassword: '',
            login_type: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            firstName: Yup.string().required('Required'),
            lastName: Yup.string().required('Required'),
            phone: Yup.string()
                .matches(/^[0-9]{10,15}$/, 'Enter a valid phone number')
                .required('Required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Required'),
            login_type: Yup.string().oneOf(['user', 'admin'], 'Select a valid login type').required('Required')
        }),
        onSubmit: (values) => {
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
                console.log('SignUp attempted with:', values)
            }, 1000)
        }
    })

    return (
        <Box sx={{ bgcolor: '#121212' }}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    minHeight: '100vh',
                    backgroundColor: '#11121C'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        marginTop: '50px',
                        // alignItems: "center",
                        justifyContent: 'center',
                        width: '50%'
                    }}
                >
                    <Box
                        sx={{
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            border: '1px solid white',
                            padding: '0px 30px 80px 30px',
                            borderRadius: '10px'
                        }}
                    >
                        <Typography
                            variant='h2'
                            style={{ fontFamily: 'cambria math', fontWeight: 'bolder', color: 'white', fontSize: '32px' }}
                            align='center'
                        >
                            Unlock the Power of
                            <br />
                            <span style={{ color: '#E22A90' }}>THub</span> GenAI Builder Tool.
                        </Typography>
                        <Box component='img' src={leftImage} alt='login image' sx={{ width: '100%', height: 'auto' }} />
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: { xs: '100%', md: '50%' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        bgcolor: '#12121C'
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 380,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 3
                        }}
                    >
                        <Box component='img' src={thubLogo} alt='Thub image' sx={{ width: '180px', height: 'auto', paddingTop: '10px' }} />

                        <Top />
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', my: 4 }}>
                            <Divider sx={{ flexGrow: 1 }} />
                            <Typography sx={{ mx: 2, whiteSpace: 'nowrap' }} variant='h5' color='white'>
                                Or Register with Email
                            </Typography>
                            <Divider sx={{ flexGrow: 1 }} />
                        </Box>

                        <Box
                            component='form'
                            noValidate
                            onSubmit={formik.handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '350px' }}
                        >
                            {[
                                { name: 'email', label: 'Email', type: 'email', placeholder: 'user@company.com' },
                                { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'John' },
                                { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
                                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '1234567890' }
                            ].map(({ name, type, placeholder }) => (
                                <FormControl key={name} fullWidth error={formik.touched[name] && Boolean(formik.errors[name])}>
                                    <OutlinedInput
                                        id={name}
                                        name={name}
                                        type={type}
                                        placeholder={placeholder}
                                        value={formik.values[name]}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        sx={{
                                            bgcolor: '#2e2e2e',
                                            mt: -2,
                                            color: 'white',
                                            '& input': {
                                                color: 'white',
                                                backgroundColor: '#32353b',
                                                '::placeholder': {
                                                    fontWeight: 'bold',
                                                    color: '#bdbfd4'
                                                }
                                            }
                                        }}
                                    />
                                    <FormHelperText>
                                        {formik.touched[name] && formik.errors[name] ? formik.errors[name] : '\u00A0'}
                                    </FormHelperText>
                                </FormControl>
                            ))}

                            {/* Password */}
                            <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)}>
                                <OutlinedInput
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='********'
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    endAdornment={
                                        <InputAdornment position='end' sx={{ bgcolor: 'transparent' }}>
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge='end'
                                                sx={{ bgcolor: 'transparent' }}
                                            >
                                                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    sx={{
                                        bgcolor: '#32353b',
                                        mt: -2,
                                        color: 'white',
                                        '& input': {
                                            color: 'white',
                                            backgroundColor: '#32353b',
                                            '::placeholder': {
                                                fontWeight: 'bold',
                                                color: '#bdbfd4'
                                            }
                                        },
                                        '& .MuiInputAdornment-root': {
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.password && formik.errors.password ? formik.errors.password : '\u00A0'}
                                </FormHelperText>
                            </FormControl>

                            {/* Confirm Password */}
                            <FormControl fullWidth error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}>
                                <OutlinedInput
                                    id='confirmPassword'
                                    name='confirmPassword'
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder='********'
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    endAdornment={
                                        <InputAdornment position='end' sx={{ bgcolor: 'transparent' }}>
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge='end'
                                                sx={{ bgcolor: 'transparent' }}
                                            >
                                                {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    sx={{
                                        bgcolor: '#32353b',
                                        color: 'white',
                                        mt: -2,
                                        '& input': {
                                            color: 'white',
                                            backgroundColor: '#32353b',
                                            '::placeholder': {
                                                fontWeight: 'bold',
                                                color: '#bdbfd4'
                                            }
                                        },
                                        '& .MuiInputAdornment-root': {
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                />
                                <FormHelperText>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword
                                        ? formik.errors.confirmPassword
                                        : '\u00A0'}
                                </FormHelperText>
                            </FormControl>

                            <Button
                                type='submit'
                                variant='contained'
                                fullWidth
                                // disabled={loading}
                                sx={{
                                    py: 1.5,
                                    bgcolor: '#de1e88',
                                    '&:hover': { bgcolor: '#E32A90' },
                                    color: 'black',
                                    fontFamily: 'cambira math',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? <CircularProgress size={28} color='inherit' /> : 'Sign Up'}
                            </Button>

                            <Typography variant='body2' color='white' textAlign={'center'}>
                                Already have an account?
                                <Link to='/' style={{ color: '#E32A90', textDecoration: 'underline', marginLeft: '16px' }}>
                                    Login
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default SignUp
