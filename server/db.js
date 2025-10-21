import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'ubuy';
const DB_CONN_LIMIT = Number(process.env.DB_CONN_LIMIT || 10);

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DB_CONN_LIMIT,
  queueLimit: 0,
});

// quick ping to detect connection problems early and print helpful message
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ Connected to MySQL at ${DB_HOST}:${DB_PORT} (database: ${DB_NAME})`);
  } catch (err) {
    console.error(`❌ Failed to connect to MySQL at ${DB_HOST}:${DB_PORT} — ${err.code || err.message}`);
    console.error('Hint: ensure MySQL server is running, credentials in .env are correct, and the server accepts TCP connections on the configured port.');
  }
}

await testConnection();

export default pool;

