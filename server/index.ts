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

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
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

  console.log('✅ Database tables initialized');
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

    if (!username || !password || !farmName || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password, farm_name, location) VALUES ($1, $2, $3, $4) RETURNING id, username, farm_name, location',
      [username, hashedPassword, farmName, location]
    );

    req.session.userId = result.rows[0].id;
    req.session.username = result.rows[0].username;

    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

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

    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
