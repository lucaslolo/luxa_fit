"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const ignored = new Set(["node_modules", ".git"]);
const files = [];
const failures = [];

function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (ignored.has(entry.name)) continue;
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(fullPath);
        else if (entry.isFile() && entry.name.endsWith(".js")) files.push(fullPath);
    }
}

function fail(message) { failures.push(message); }
walk(root);
for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) fail(`Erreur de syntaxe : ${path.relative(root, file)}\n${result.stderr}`);
}

if (!fs.existsSync(path.join(root, ".env.example"))) fail("Fichier .env.example absent.");
if (fs.existsSync(path.join(root, ".env"))) fail("Un vrai fichier .env ne doit pas être inclus dans le projet livré.");

// Détecte les références JS cassées dans les pages HTML (bug rencontré sur course.html).
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const html = fs.readFileSync(path.join(root, entry.name), "utf8");
    for (const match of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
        const source = match[1];
        if (/^(https?:)?\/\//i.test(source)) continue;
        if (!fs.existsSync(path.join(root, source))) fail(`${entry.name} référence un script absent : ${source}`);
    }
}

// Vérifie que les ancres de navigation du dashboard pointent vers une section existante.
const dashboardHtml = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const dashboardIds = new Set([...dashboardHtml.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]));
for (const match of dashboardHtml.matchAll(/<a\b[^>]*href=["']#([^"']+)["']/gi)) {
    if (!dashboardIds.has(match[1])) fail(`dashboard.html contient une ancre sans cible : #${match[1]}`);
}

// Contrôles ciblés sur les migrations et les protections critiques.
const migration = fs.readFileSync(path.join(root, "js/create-tables.js"), "utf8");
if (/WHERE CONSTRAINT_SCHEMA\s*=\s*\?\s*WHERE CONSTRAINT_SCHEMA/i.test(migration)) {
    fail("Requête INFORMATION_SCHEMA invalide : clause WHERE dupliquée.");
}
if (!/process\.exitCode\s*=\s*1/.test(migration)) fail("Le script de migration doit retourner un code d'échec si MySQL échoue.");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
if (!/app\.post\(\s*"\/api\/login",\s*loginRateLimit/s.test(server)) fail("La route login doit être protégée par son limiteur de tentatives.");
if (!/app\.post\(\s*"\/api\/register",\s*registerRateLimit/s.test(server)) fail("La route register doit être protégée par son limiteur de tentatives.");

if (failures.length) {
    for (const failure of failures) process.stderr.write(`\nERREUR : ${failure}\n`);
    process.exit(1);
}
console.log(`OK : ${files.length} fichiers JavaScript vérifiés, références HTML et contrôles structurels valides.`);
