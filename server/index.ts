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

  // Create input_prices table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS input_prices (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      current_price DECIMAL(10,2),
      last_updated TIMESTAMP,
      week_change DECIMAL(10,2),
      month_change DECIMAL(10,2),
      trend VARCHAR(20)
    );
  `);

  // Create price_alerts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      input_id VARCHAR(50) REFERENCES input_prices(id),
      input_name VARCHAR(255) NOT NULL,
      target_price DECIMAL(10,2) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      alert_type VARCHAR(10) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      triggered BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create purchases table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      input_id VARCHAR(50),
      input_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      price_per_unit DECIMAL(10,2) NOT NULL,
      total_cost DECIMAL(10,2) NOT NULL,
      supplier VARCHAR(255),
      purchase_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default input prices
  await pool.query(`
    INSERT INTO input_prices (id, name, category, unit) VALUES
      ('an_fertilizer', 'Ammonium Nitrate (AN)', 'fertilizer', 't'),
      ('urea', 'Urea', 'fertilizer', 't'),
      ('liquid_n', 'Liquid Nitrogen (N32)', 'fertilizer', 't'),
      ('tsp', 'Triple Super Phosphate (TSP)', 'fertilizer', 't'),
      ('mop', 'Muriate of Potash (MOP)', 'fertilizer', 't'),
      ('winter_wheat', 'Winter Wheat Seed', 'seed', 't'),
      ('spring_barley', 'Spring Barley Seed', 'seed', 't'),
      ('osr', 'Oilseed Rape Seed', 'seed', 'bag'),
      ('red_diesel', 'Red Diesel', 'fuel', 'pence/L'),
      ('adblue', 'AdBlue', 'fuel', 'L')
    ON CONFLICT (id) DO NOTHING;
  `);

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

// Spray Window Analysis
app.get('/api/spray-analysis', requireAuth, async (req, res) => {
  try {
    const { type = 'herbicide', lat: queryLat, lon: queryLon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    let lat: number;
    let lon: number;

    // If lat/lon provided in query (from weather location change), use those
    if (queryLat && queryLon) {
      lat = parseFloat(queryLat as string);
      lon = parseFloat(queryLon as string);
    } else {
      // Otherwise, get user's farm location from database
      const userResult = await pool.query(
        'SELECT location FROM users WHERE id = $1',
        [req.session.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].location) {
        return res.status(400).json({ message: 'Farm location not set. Please update your profile.' });
      }

      const farmLocation = userResult.rows[0].location;

      // Search for location coordinates
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(farmLocation)}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoResponse.json();

      if (geoData.length === 0) {
        return res.status(400).json({ message: 'Could not find coordinates for your farm location' });
      }

      lat = geoData[0].lat;
      lon = geoData[0].lon;
    }

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Analyze spray conditions
    const analysis = analyzeSprayConditions(forecastData, type as string);

    res.json(analysis);
  } catch (error) {
    console.error('❌ Spray analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze spray conditions' });
  }
});

// Helper function to analyze spray conditions
function analyzeSprayConditions(forecastData: any, sprayType: string) {
  const windLimits: any = {
    herbicide: { perfect: 10, risky: 15 },
    fungicide: { perfect: 12, risky: 15 },
    insecticide: { perfect: 15, risky: 18 },
  };

  const limits = windLimits[sprayType] || windLimits.herbicide;

  const timeline: any[] = [];
  const dayMap: any = {};

  forecastData.list.forEach((item: any) => {
    const dt = new Date(item.dt * 1000);
    const dayKey = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const hour = dt.getHours();
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const nextHour = (hour + 3) % 24;
    const timeRange = `${timeStr}-${nextHour.toString().padStart(2, '0')}:00`;

    // Convert m/s to mph
    const windMph = item.wind.speed * 2.237;
    const rainPercent = (item.pop || 0) * 100;
    const tempC = item.main.temp;

    let status: string;
    let reason: string;

    // Check if night time (before 6am or after 8pm)
    if (hour < 6 || hour >= 20) {
      status = 'NIGHT';
      reason = 'Outside spraying hours (6am-8pm)';
    }
    // Check PERFECT conditions
    else if (
      windMph >= 2 && windMph <= limits.perfect &&
      rainPercent < 5 &&
      tempC >= 5 && tempC <= 25
    ) {
      status = 'PERFECT';
      reason = 'Ideal spraying conditions';
    }
    // Check RISKY conditions
    else if (
      (windMph > limits.perfect && windMph <= limits.risky) ||
      (rainPercent >= 5 && rainPercent <= 20) ||
      (tempC >= 3 && tempC < 5) || (tempC > 25 && tempC <= 28)
    ) {
      status = 'RISKY';
      if (windMph > limits.perfect) reason = 'Wind approaching limit';
      else if (rainPercent >= 5) reason = 'Light rain possible';
      else reason = 'Temperature not ideal';
    }
    // DON'T SPRAY
    else {
      status = 'DONT_SPRAY';
      if (windMph > limits.risky) reason = `High wind (${Math.round(windMph)}mph)`;
      else if (rainPercent > 20) reason = `Rain forecast (${Math.round(rainPercent)}%)`;
      else if (tempC < 3) reason = 'Too cold';
      else if (tempC > 28) reason = 'Too hot';
      else reason = 'Unsuitable conditions';
    }

    const block = {
      time: timeRange,
      status,
      wind: windMph,
      windDir: item.wind.deg,
      rain: Math.round(rainPercent),
      temp: tempC,
      reason,
      dt: item.dt,
    };

    if (!dayMap[dayKey]) {
      dayMap[dayKey] = {
        day: dt.toLocaleDateString('en-US', { weekday: 'long' }),
        date: dt.toISOString().split('T')[0],
        blocks: [],
      };
    }

    dayMap[dayKey].blocks.push(block);
  });

  // Convert dayMap to timeline array
  Object.values(dayMap).forEach((day: any) => {
    timeline.push(day);
  });

  // Find spray windows
  const recommendedWindows = findSprayWindows(timeline);

  return {
    recommendedWindows,
    timeline,
    lastUpdated: new Date(),
  };
}

// Helper function to find continuous spray windows
function findSprayWindows(timeline: any[]) {
  const windows: any[] = [];

  timeline.forEach((day) => {
    let currentWindow: any = null;

    day.blocks.forEach((block: any, idx: number) => {
      // Only group PERFECT blocks together, or RISKY blocks together
      // Don't mix PERFECT and RISKY in the same window
      if (block.status === 'PERFECT' || block.status === 'RISKY') {
        if (!currentWindow) {
          // Start a new window
          currentWindow = {
            day: day.day,
            date: day.date,
            startTime: block.time.split('-')[0],
            blocks: [block],
            quality: block.status,
          };
        } else if (currentWindow.quality === block.status) {
          // Continue window only if same quality
          currentWindow.blocks.push(block);
        } else {
          // Quality changed, close current window and start new one
          const lastBlock = currentWindow.blocks[currentWindow.blocks.length - 1];
          currentWindow.endTime = lastBlock.time.split('-')[1];
          currentWindow.durationHours = currentWindow.blocks.length * 3;

          const totalWind = currentWindow.blocks.reduce((sum: number, b: any) => sum + b.wind, 0);
          const totalTemp = currentWindow.blocks.reduce((sum: number, b: any) => sum + b.temp, 0);
          const maxRain = Math.max(...currentWindow.blocks.map((b: any) => b.rain));

          currentWindow.avgWind = totalWind / currentWindow.blocks.length;
          currentWindow.avgTemp = totalTemp / currentWindow.blocks.length;
          currentWindow.rainChance = maxRain;

          delete currentWindow.blocks;
          windows.push(currentWindow);

          // Start new window with current block
          currentWindow = {
            day: day.day,
            date: day.date,
            startTime: block.time.split('-')[0],
            blocks: [block],
            quality: block.status,
          };
        }
      } else {
        // Window ended (DONT_SPRAY or NIGHT)
        if (currentWindow && currentWindow.blocks.length > 0) {
          const lastBlock = currentWindow.blocks[currentWindow.blocks.length - 1];
          currentWindow.endTime = lastBlock.time.split('-')[1];
          currentWindow.durationHours = currentWindow.blocks.length * 3;

          const totalWind = currentWindow.blocks.reduce((sum: number, b: any) => sum + b.wind, 0);
          const totalTemp = currentWindow.blocks.reduce((sum: number, b: any) => sum + b.temp, 0);
          const maxRain = Math.max(...currentWindow.blocks.map((b: any) => b.rain));

          currentWindow.avgWind = totalWind / currentWindow.blocks.length;
          currentWindow.avgTemp = totalTemp / currentWindow.blocks.length;
          currentWindow.rainChance = maxRain;

          delete currentWindow.blocks;
          windows.push(currentWindow);
          currentWindow = null;
        }
      }
    });

    // Close any remaining window at end of day
    if (currentWindow && currentWindow.blocks.length > 0) {
      const lastBlock = currentWindow.blocks[currentWindow.blocks.length - 1];
      currentWindow.endTime = lastBlock.time.split('-')[1];
      currentWindow.durationHours = currentWindow.blocks.length * 3;

      const totalWind = currentWindow.blocks.reduce((sum: number, b: any) => sum + b.wind, 0);
      const totalTemp = currentWindow.blocks.reduce((sum: number, b: any) => sum + b.temp, 0);
      const maxRain = Math.max(...currentWindow.blocks.map((b: any) => b.rain));

      currentWindow.avgWind = totalWind / currentWindow.blocks.length;
      currentWindow.avgTemp = totalTemp / currentWindow.blocks.length;
      currentWindow.rainChance = maxRain;

      delete currentWindow.blocks;
      windows.push(currentWindow);
    }
  });

  // Sort by quality (PERFECT first) then by duration
  windows.sort((a, b) => {
    if (a.quality === 'PERFECT' && b.quality !== 'PERFECT') return -1;
    if (a.quality !== 'PERFECT' && b.quality === 'PERFECT') return 1;
    return b.durationHours - a.durationHours;
  });

  return windows;
}

// Input Prices API
app.get('/api/input-prices', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM input_prices ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get input prices error:', error);
    res.status(500).json({ message: 'Failed to fetch input prices' });
  }
});

app.post('/api/input-prices/update', requireAuth, async (req, res) => {
  try {
    const { inputId, price } = req.body;

    if (!inputId || price === null || price === undefined) {
      return res.status(400).json({ message: 'Input ID and price are required' });
    }

    // Get current price for calculating changes
    const currentResult = await pool.query(
      'SELECT current_price, last_updated FROM input_prices WHERE id = $1',
      [inputId]
    );

    let weekChange = null;
    let monthChange = null;
    let trend = null;

    if (currentResult.rows.length > 0 && currentResult.rows[0].current_price) {
      const priceDiff = price - currentResult.rows[0].current_price;
      weekChange = priceDiff; // Simplified - would need historical data for accurate week/month changes
      monthChange = priceDiff;

      if (Math.abs(priceDiff) < 2) {
        trend = 'STABLE';
      } else if (priceDiff < 0) {
        trend = 'DOWN';
      } else {
        trend = 'UP';
      }
    }

    await pool.query(
      `UPDATE input_prices
       SET current_price = $1, last_updated = NOW(), week_change = $2, month_change = $3, trend = $4
       WHERE id = $5`,
      [price, weekChange, monthChange, trend, inputId]
    );

    console.log(`✅ Updated price for ${inputId}: £${price}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Update price error:', error);
    res.status(500).json({ message: 'Failed to update price' });
  }
});

// Price Alerts API
app.get('/api/price-alerts', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM price_alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

app.post('/api/price-alerts', requireAuth, async (req, res) => {
  try {
    const { inputId, inputName, targetPrice, quantity, unit, alertType } = req.body;

    if (!inputId || !targetPrice || !quantity || !unit || !alertType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await pool.query(
      `INSERT INTO price_alerts (user_id, input_id, input_name, target_price, quantity, unit, alert_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.session.userId, inputId, inputName, targetPrice, quantity, unit, alertType]
    );

    console.log(`✅ Created alert for ${inputName} at £${targetPrice}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Create alert error:', error);
    res.status(500).json({ message: 'Failed to create alert' });
  }
});

app.delete('/api/price-alerts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM price_alerts WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete alert error:', error);
    res.status(500).json({ message: 'Failed to delete alert' });
  }
});

// Purchases API
app.get('/api/purchases', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM purchases WHERE user_id = $1 ORDER BY purchase_date DESC',
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});

app.post('/api/purchases', requireAuth, async (req, res) => {
  try {
    const { inputId, inputName, quantity, pricePerUnit, totalCost, supplier, purchaseDate, notes } = req.body;

    if (!inputName || !quantity || !pricePerUnit || !totalCost || !purchaseDate) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const result = await pool.query(
      `INSERT INTO purchases (user_id, input_id, input_name, quantity, price_per_unit, total_cost, supplier, purchase_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.session.userId, inputId, inputName, quantity, pricePerUnit, totalCost, supplier, purchaseDate, notes]
    );

    console.log(`✅ Logged purchase: ${quantity} ${inputName} at £${pricePerUnit}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Create purchase error:', error);
    res.status(500).json({ message: 'Failed to log purchase' });
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
