require("dotenv").config();

const mysql = require("mysql2/promise");

const requiredVariables = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingVariables = requiredVariables.filter(name => !process.env[name]);

if (missingVariables.length) {
    throw new Error(`Configuration MySQL incomplète : ${missingVariables.join(", ")}`);
}

const sslEnabled = process.env.DB_SSL !== "false";
const ssl = sslEnabled
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
    : undefined;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

module.exports = db;
