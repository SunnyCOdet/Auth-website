import express from 'express';
import ViteExpress from 'vite-express';
import bcrypt from 'bcryptjs'; // Changed from 'bcrypt' to 'bcryptjs'
import cors from 'cors';
import { db, initDb, generateSecretKey } from './db.js';

const app = express();
const port = 3001; // Port for the backend API

// --- Database Initialization ---
try {
  await initDb(); // Ensure DB is ready before starting server
} catch (error) {
  console.error("FATAL: Database initialization failed. Exiting.", error);
  process.exit(1); // Exit if DB setup fails
}

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// --- API Routes ---

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    // Check if username already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [username]
    });

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash the password
    const saltRounds = 10;
    // Use bcryptjs (API is the same as bcrypt for hash)
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate a unique secret key
    let secretKey;
    let keyExists = true;
    while (keyExists) {
        secretKey = generateSecretKey();
        const existingKey = await db.execute({
            sql: "SELECT id FROM users WHERE secret_key = ?",
            args: [secretKey]
        });
        if (existingKey.rows.length === 0) {
            keyExists = false;
        }
    }


    // Insert new user into the database
    await db.execute({
      sql: "INSERT INTO users (username, password_hash, secret_key) VALUES (?, ?, ?)",
      args: [username, passwordHash, secretKey]
    });

    // Return the secret key to the user ONCE
    res.status(201).json({
      message: 'User registered successfully. Save your secret key securely!',
      secretKey: secretKey // Send the key back
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// POST /api/validate-key (For your .exe application)
app.post('/api/validate-key', async (req, res) => {
  const { username, secretKey } = req.body;

  if (!username || !secretKey) {
    return res.status(400).json({ message: 'Username and secret key are required' });
  }

  try {
    const result = await db.execute({
      sql: "SELECT id FROM users WHERE username = ? AND secret_key = ?",
      args: [username, secretKey]
    });

    if (result.rows.length > 0) {
      // Key is valid for the given username
      res.status(200).json({ valid: true, message: 'Authentication successful' });
    } else {
      // Invalid username or key
      res.status(401).json({ valid: false, message: 'Invalid username or secret key' });
    }
  } catch (error) {
    console.error('Key validation error:', error);
    res.status(500).json({ message: 'Internal server error during key validation' });
  }
});

// --- Vite Integration ---
// This uses ViteExpress to serve the React frontend AND the API from the same server process.
// Vite handles HMR and building the frontend. Express handles the API routes.
ViteExpress.listen(app, port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);

// Note: For production, you'd typically build the React app (\`npm run build\`)
// and serve the static files from the \`dist\` folder using express.static,
// while the API routes remain the same. ViteExpress handles this integration
// nicely for development.
