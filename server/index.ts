import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Session store
const pgStore = connectPg(session);

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Error logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Middleware
const allowedOrigins = ['https://www.agricogassist.com', 'https://agricogassist.com'];
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5000', 'http://localhost:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(
  session({
    store: new pgStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for Railway compatibility
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

// Create tables on startup
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      farm_name VARCHAR(255),
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing table: drop email column if exists, add new columns if missing
  try {
    await pool.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS email,
      ADD COLUMN IF NOT EXISTS farm_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255);
    `);
    console.log('✅ Database migration completed');
  } catch (error) {
    console.log('⚠️ Database migration skipped (might already be up to date)');
  }

  console.log('✅ Database tables initialized');
}

// Input validation helpers
function validateUsername(username: string): boolean {
  return typeof username === 'string' && username.length >= 2 && username.length <= 100;
}

function validatePassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6 && password.length <= 100;
}

function validateField(field: string, maxLength = 255): boolean {
  return typeof field === 'string' && field.trim().length > 0 && field.length <= maxLength;
}

function sanitizeString(str: string): string {
  return str.trim().substring(0, 255);
}

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, farmName, location } = req.body;

    // Validate all fields
    if (!validateUsername(username)) {
      return res.status(400).json({ message: 'Name must be between 2-100 characters' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be between 6-100 characters' });
    }
    if (!validateField(farmName)) {
      return res.status(400).json({ message: 'Farm name is required' });
    }
    if (!validateField(location)) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Sanitize inputs
    const cleanUsername = sanitizeString(username);
    const cleanFarmName = sanitizeString(farmName);
    const cleanLocation = sanitizeString(location);

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password, farm_name, location) VALUES ($1, $2, $3, $4) RETURNING id, username, farm_name, location',
      [cleanUsername, hashedPassword, cleanFarmName, cleanLocation]
    );

    req.session.userId = result.rows[0].id;
    req.session.username = result.rows[0].username;

    console.log(`✅ New user registered: ${cleanUsername} (${cleanFarmName})`);
    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    if (error.code === '23505') {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!validateUsername(username) || !validatePassword(password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    console.log(`✅ User logged in: ${user.username}`);
    res.json({ success: true, user: { id: user.id, username: user.username, farm_name: user.farm_name, location: user.location } });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, farm_name, location FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Weather API - Current weather
app.get('/api/weather', requireAuth, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weather' });
  }
});

// Weather API - 5-day forecast with 3-hour intervals
app.get('/api/weather/forecast', requireAuth, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch forecast' });
  }
});

// Weather API - Search location by name
app.get('/api/weather/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${apiKey}`
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search location' });
  }
});

// Perplexity Chat API
app.post('/api/chat/market', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      console.error('❌ PERPLEXITY_API_KEY not found');
      return res.status(500).json({ message: 'Perplexity API key not configured' });
    }

    console.log('📡 Calling Perplexity API with message:', message);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful agricultural market intelligence assistant. Provide insights about crop prices, market trends, and farming economics.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      return res.status(500).json({ message: `Perplexity API error: ${response.status}` });
    }

    const data = await response.json();
    console.log('✅ Perplexity response received');
    res.json(data);
  } catch (error: any) {
    console.error('❌ Market chat error:', error.message);
    res.status(500).json({ message: `Failed to get response: ${error.message}` });
  }
});

// Start server
async function start() {
  await initDatabase();

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('/*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
