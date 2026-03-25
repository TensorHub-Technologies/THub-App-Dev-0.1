import nodemailer, { SendMailOptions, Transporter } from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const EMAIL_USER = process.env.NO_REPLY_EMAIL || 'no-reply@thub.tech'
const EMAIL_PASS = process.env.NO_REPLY_MAIL_PASSWORD

let transporter: Transporter | null = null

if (EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3'
        }
    })

    transporter.verify((error) => {
        if (error) {
            console.error('Email transporter error:', error)
        } else {
            console.log('Email server is ready to send messages')
        }
    })
} else {
    console.warn('NO_REPLY_MAIL_PASSWORD is not set. Auth emails will be skipped.')
}

const sendMail = async (options: SendMailOptions) => {
    if (!transporter) {
        console.warn(`Skipping email send for "${options.subject}" because mail credentials are not configured.`)
        return { messageId: 'mail-skipped-no-credentials' }
    }

    return transporter.sendMail({
        from: options.from || EMAIL_USER,
        ...options
    })
}

export default { sendMail }
