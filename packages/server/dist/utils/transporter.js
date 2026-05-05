"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '..', '.env'), override: false });
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.office365.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const EMAIL_USER = process.env.NO_REPLY_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER || 'no-reply@thub.tech';
const EMAIL_PASS = process.env.NO_REPLY_MAIL_PASSWORD || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.MAIL_PASSWORD;
const EMAIL_FROM = process.env.NO_REPLY_EMAIL || process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_FROM || EMAIL_USER;
let transporter = null;
if (EMAIL_PASS) {
    transporter = nodemailer_1.default.createTransport({
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
    });
    transporter.verify((error) => {
        if (error) {
            console.error('Email transporter error:', error);
        }
        else {
            console.log('Email server is ready to send messages');
        }
    });
}
else {
    console.warn('Mail credentials are not configured. Auth emails will be skipped.');
}
const sendMail = async (options) => {
    if (!transporter) {
        console.warn(`Skipping email send for "${options.subject}" because mail credentials are not configured.`);
        return { messageId: 'mail-skipped-no-credentials' };
    }
    return transporter.sendMail({
        from: options.from || EMAIL_FROM,
        ...options
    });
};
const isConfigured = () => Boolean(transporter);
exports.default = { sendMail, isConfigured };
//# sourceMappingURL=transporter.js.map