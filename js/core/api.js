/* LUXA_FIT — client HTTP layer
 * Toutes les réponses API sont décodées au même endroit et les erreurs
 * conservent leur statut HTTP pour que les pages puissent réagir proprement.
 */
(function attachLuxaAPI(global) {
    "use strict";

    class ApiError extends Error {
        constructor(message, status, payload) {
            super(message);
            this.name = "ApiError";
            this.status = status;
            this.payload = payload;
        }
    }

    async function request(url, options = {}) {
        const headers = new Headers(options.headers || {});
        const init = { ...options, headers, credentials: "same-origin" };

        if (init.body !== undefined && init.body !== null && typeof init.body !== "string" && !(init.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
            init.body = JSON.stringify(init.body);
        }

        let response;
        try {
            response = await fetch(url, init);
        } catch (cause) {
            const error = new ApiError("Impossible de contacter le serveur.", 0);
            error.cause = cause;
            throw error;
        }

        const contentType = response.headers.get("content-type") || "";
        let payload = null;
        if (contentType.includes("application/json")) {
            payload = await response.json().catch(() => null);
        } else {
            payload = await response.text().catch(() => "");
        }

        if (!response.ok) {
            const message = payload && typeof payload === "object" && payload.message
                ? payload.message
                : `Erreur serveur (${response.status}).`;
            throw new ApiError(message, response.status, payload);
        }
        return payload;
    }

    global.LuxaAPI = Object.freeze({
        ApiError,
        request,
        get: (url, options = {}) => request(url, { ...options, method: "GET" }),
        post: (url, body, options = {}) => request(url, { ...options, method: "POST", body }),
        put: (url, body, options = {}) => request(url, { ...options, method: "PUT", body }),
        delete: (url, options = {}) => request(url, { ...options, method: "DELETE" })
    });
})(window);
