import { createClient } from "@libsql/client";
import crypto from 'crypto';

const db = createClient({
  url: "file:./local.db", // Use a local SQLite file
});

// Initialize Database Schema
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        secret_key TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    // Propagate the error if initialization fails critical setup
    throw error;
  }
}

// Function to generate a secure secret key
function generateSecretKey(length = 32) {
  return crypto.randomBytes(length).toString('hex'); // Generate a 64-character hex key
}

export { db, initDb, generateSecretKey };
