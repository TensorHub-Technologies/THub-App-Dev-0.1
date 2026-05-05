export interface AuthTokenPayload {
    uid: string;
    email: string;
    login_type: string;
}
export declare const signAuthToken: (payload: AuthTokenPayload) => string;
export declare const verifyAuthToken: (token: string) => AuthTokenPayload;
