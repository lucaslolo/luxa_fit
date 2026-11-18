"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidDateOnly, toPositiveInteger } = require("../shared/validation");

test("date SQL stricte : accepte les dates réelles", () => {
    assert.equal(isValidDateOnly("2024-02-29"), true);
    assert.equal(isValidDateOnly("2026-11-18"), true);
});

test("date SQL stricte : refuse les dates impossibles et les formats ambigus", () => {
    for (const value of ["2025-02-29", "2026-13-01", "2026-04-31", "18/11/2026", "2026-1-01", "", null]) {
        assert.equal(isValidDateOnly(value), false, String(value));
    }
});

test("identifiant : accepte uniquement les entiers strictement positifs", () => {
    assert.equal(toPositiveInteger("12"), 12);
    assert.equal(toPositiveInteger(1), 1);
    for (const value of [0, -1, 1.5, "abc", "", null, Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal(toPositiveInteger(value), null);
    }
});


const { latestWeightMeasurement, shouldSyncProfileWeight } = require("../shared/fitness-metrics");

test("dashboard : ignore les mensurations sans poids pour afficher le dernier poids", () => {
    const latest = latestWeightMeasurement([
        { id: 8, date: "2026-11-18", poids: null },
        { id: 7, date: "2026-11-17", poids: "75.4" },
        { id: 6, date: "2026-11-16", poids: "74.8" }
    ]);
    assert.equal(latest.id, 7);
    assert.equal(latest.poids, "75.4");
});

test("profil : une mesure rétroactive ne remplace pas le poids le plus récent", () => {
    assert.equal(shouldSyncProfileWeight(
        { id: 12, date: "2026-11-10", poids: 74 },
        { id: 11, date: "2026-11-17", poids: 76 }
    ), false);
    assert.equal(shouldSyncProfileWeight(
        { id: 12, date: "2026-11-18", poids: 75 },
        { id: 11, date: "2026-11-17", poids: 76 }
    ), true);
});

test("profil : à date égale, la mesure ajoutée ensuite devient la référence", () => {
    assert.equal(shouldSyncProfileWeight(
        { id: 12, date: "2026-11-18", poids: 75 },
        { id: 11, date: "2026-11-18", poids: 76 }
    ), true);
});

test("profil : la mesure venant d'être insérée est reconnue comme la dernière", () => {
    assert.equal(shouldSyncProfileWeight(
        { id: 15, date: "2026-11-18", poids: 75 },
        { id: 15, date: "2026-11-18", poids: 75 }
    ), true);
});
