/* Règles métier partagées : calculs déterministes sans accès réseau ni base. */
(function attachFitnessMetrics(root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) root.LuxaFitnessMetrics = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this, function createFitnessMetrics() {
    "use strict";

    function toDateOnly(value) {
        if (value instanceof Date && Number.isFinite(value.getTime())) {
            return value.toISOString().slice(0, 10);
        }
        const text = String(value ?? "");
        const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : null;
    }

    function latestWeightMeasurement(measurements) {
        if (!Array.isArray(measurements)) return null;
        return measurements
            .filter(item => item && item.poids !== null && item.poids !== undefined
                && item.poids !== "" && Number.isFinite(Number(item.poids))
                && Number(item.poids) > 0 && toDateOnly(item.date))
            .sort((a, b) => {
                const dateOrder = toDateOnly(b.date).localeCompare(toDateOnly(a.date));
                return dateOrder || Number(b.id || 0) - Number(a.id || 0);
            })[0] || null;
    }

    function shouldSyncProfileWeight(candidate, latestExisting) {
        if (!candidate || !Number.isFinite(Number(candidate.poids)) || Number(candidate.poids) <= 0) {
            return false;
        }
        if (!latestExisting) return true;
        const candidateDate = toDateOnly(candidate.date);
        const existingDate = toDateOnly(latestExisting.date);
        if (!candidateDate || !existingDate) return false;
        if (candidateDate !== existingDate) return candidateDate > existingDate;
        return Number(candidate.id || 0) >= Number(latestExisting.id || 0);
    }

    return { toDateOnly, latestWeightMeasurement, shouldSyncProfileWeight };
});
