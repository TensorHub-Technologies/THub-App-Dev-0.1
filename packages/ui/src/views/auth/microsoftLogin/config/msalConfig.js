import { LogLevel } from '@azure/msal-browser'

const hostname = window.location.hostname

const REDIRECT_URI_MAP = {
    localhost: 'http://localhost:8080/',
    'app.thub.tech': 'https://app.thub.tech/',
    'dev.thub.tech': 'https://dev.thub.tech/',
    'qa.thub.tech': 'https://qa.thub.tech/'
}

const redirectUri = REDIRECT_URI_MAP[hostname] || 'http://localhost:8080/'

export const msalConfig = {
    auth: {
        clientId: 'bf29daca-eef6-438f-850f-8a746c246a14',
        authority: 'https://login.microsoftonline.com/common/18be12b6-e243-4a84-85f2-0be345a96956/',
        redirectUri
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return

                switch (level) {
                    case LogLevel.Error:
                        console.error(message)
                        break
                    case LogLevel.Info:
                        console.info(message)
                        break
                    case LogLevel.Verbose:
                        console.debug(message)
                        break
                    case LogLevel.Warning:
                        console.warn(message)
                        break
                    default:
                        break
                }
            }
        }
    }
}

export const loginRequest = {
    scopes: ['User.Read']
}

export const graphConfig = {
    graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me'
}
