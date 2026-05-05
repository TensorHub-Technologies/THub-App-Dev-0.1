// validationSchema.js
import * as Yup from 'yup'

export const signUpValidationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    firstName: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    phone: Yup.string()
        .matches(/^[0-9]{10,15}$/, 'Enter a valid phone number')
        .required('Required'),
    password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required')
})
