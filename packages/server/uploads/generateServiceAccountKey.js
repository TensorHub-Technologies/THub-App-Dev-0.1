/**
 * Utility to load Google service account credentials from environment variables
 * This script helps prevent hardcoded credentials (CWE-798)
 */
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables from .env file in the uploads directory
dotenv.config({ path: path.join(__dirname, '.env') })

// Required environment variables for Google service account
const requiredEnvVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY_ID',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_X509_CERT_URL'
]

// Check if all required environment variables are set
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`)
    console.error('Please set these variables in the .env file in the uploads directory')
    process.exit(1)
}

// Create the service account key JSON object
const serviceAccountKey = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com'
}

// Write the service account key to the JSON file
fs.writeFileSync(path.join(__dirname, 'serviceAccountKey.json'), JSON.stringify(serviceAccountKey, null, 2))

console.log('Service account key file generated successfully')
