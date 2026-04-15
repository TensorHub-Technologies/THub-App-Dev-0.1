import nodemailer, { SendMailOptions, Transporter } from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config()
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: false })

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.office365.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'
const EMAIL_USER =
    process.env.NO_REPLY_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER || 'no-reply@thub.tech'
const EMAIL_PASS =
    process.env.NO_REPLY_MAIL_PASSWORD || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.MAIL_PASSWORD
const EMAIL_FROM = process.env.NO_REPLY_EMAIL || process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_FROM || EMAIL_USER

let transporter: Transporter | null = null

if (EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
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
    console.warn('Mail credentials are not configured. Auth emails will be skipped.')
}

const sendMail = async (options: SendMailOptions) => {
    if (!transporter) {
        console.warn(`Skipping email send for "${options.subject}" because mail credentials are not configured.`)
        return { messageId: 'mail-skipped-no-credentials' }
    }

    return transporter.sendMail({
        from: options.from || EMAIL_FROM,
        ...options
    })
}

const isConfigured = () => Boolean(transporter)

export default { sendMail, isConfigured }
