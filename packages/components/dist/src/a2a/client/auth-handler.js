"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthenticatingFetchWithRetry = createAuthenticatingFetchWithRetry;
/**
 * Higher-order function that wraps fetch with authentication handling logic.
 * Returns a new fetch function that automatically handles authentication retries for 401/403 responses.
 *
 * @param fetchImpl The underlying fetch implementation to wrap
 * @param authHandler Authentication handler for managing auth headers and retries
 * @returns A new fetch function with authentication handling capabilities
 *
 * Usage examples:
 * - const authFetch = createAuthHandlingFetch(fetch, authHandler);
 * - const response = await authFetch(url, options);
 * - const response = await authFetch(url); // Direct function call
 */
function createAuthenticatingFetchWithRetry(fetchImpl, authHandler) {
    /**
     * Executes a fetch request with authentication handling.
     * If the auth handler provides new headers for the shouldRetryWithHeaders() function,
     * then the request is retried.
     * @param url The URL to fetch
     * @param init The fetch request options
     * @returns A Promise that resolves to the Response
     */
    async function authFetch(url, init) {
        // Merge auth headers with provided headers
        const authHeaders = (await authHandler.headers()) || {};
        const mergedInit = {
            ...(init || {}),
            headers: {
                ...authHeaders,
                ...(init?.headers || {})
            }
        };
        let response = await fetchImpl(url, mergedInit);
        // Check if the auth handler wants to retry the request with new headers
        const updatedHeaders = await authHandler.shouldRetryWithHeaders(mergedInit, response);
        if (updatedHeaders) {
            // Retry request with revised headers
            const retryInit = {
                ...(init || {}),
                headers: {
                    ...updatedHeaders,
                    ...(init?.headers || {})
                }
            };
            response = await fetchImpl(url, retryInit);
            if (response.ok && authHandler.onSuccessfulRetry) {
                await authHandler.onSuccessfulRetry(updatedHeaders); // Remember headers that worked
            }
        }
        return response;
    }
    // Copy fetch properties to maintain compatibility
    Object.setPrototypeOf(authFetch, Object.getPrototypeOf(fetchImpl));
    Object.defineProperties(authFetch, Object.getOwnPropertyDescriptors(fetchImpl));
    return authFetch;
}
//# sourceMappingURL=auth-handler.js.map