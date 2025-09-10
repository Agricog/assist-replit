import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendWelcomeEmail } from "./emailService";
import { insertChatMessageSchema, insertFarmFieldSchema, insertMachinerySchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import Stripe from "stripe";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Universal authentication middleware - TEMPORARILY TRADITIONAL ONLY (for debugging)
const universalAuth = (req: any, res: any, next: any) => {
  let user = null;
  let userId = null;
  
  console.log('🔐 universalAuth Debug (TRADITIONAL ONLY):', {
    hasSession: !!req.session,
    hasUser: !!(req.session as any)?.user,
    hasPassport: !!(req.session as any)?.passport,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    hasReqUser: !!req.user
  });
  
  // TEMPORARILY ONLY ALLOW TRADITIONAL AUTH - NO FALLBACKS
  if ((req.session as any).user) {
    const sessionUser = (req.session as any).user;
    console.log('📝 Traditional auth found:', { id: sessionUser.id, expires_at: sessionUser.expires_at });
    // Verify session hasn't expired
    if (sessionUser.expires_at && sessionUser.expires_at > Math.floor(Date.now() / 1000)) {
      user = sessionUser;
      userId = sessionUser.id;
    }
  }
  // DISABLED: Passport and Replit auth fallbacks temporarily for debugging
  /*
  // Check for Passport session (could be Replit or traditional via passport)
  else if ((req.session as any)?.passport?.user) {
    const passportUser = (req.session as any).passport.user;
    console.log('🎫 Passport auth found:', { id: passportUser.id });
    user = passportUser;
    userId = passportUser.id;
  }
  // Check Replit auth (Passport authenticated)
  else if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log('🔐 Replit auth found:', { claims: !!req.user.claims });
    user = req.user;
    userId = req.user.claims?.sub;
  }
  */
  
  if (!user || !userId) {
    console.log('❌ universalAuth: No valid TRADITIONAL authentication found');
    return res.status(401).json({ message: 'Unauthorized - traditional auth required' });
  }
  
  console.log('✅ universalAuth: TRADITIONAL auth success for userId:', userId);
  // Attach user info to request for easier access
  req.authUser = user;
  req.authUserId = userId;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication and sessions FIRST (before any routes that need sessions)
  await setupAuth(app);

  // Stripe integration - will be enabled when keys are provided
  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    });
  }

  // Landing page with SmartSuite form (restored)
  // Root path now shows landing page, not payment

  // Signup page route

  // Login page route

  // Test signup page
  app.get('/test-signup', (req, res) => {
    res.sendFile('test-signup.html', { root: 'client/public' });
  });

  // Admin API to view user signups
  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Failed to fetch users');
    }
  });

  // Stripe payment intent creation for Agricog Assist
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY environment variable." });
      }

      // Fetch the actual product and price from Stripe
      const productId = 'prod_T1CIXEEYrvQx6v';
      
      // Get the product details
      const product = await stripe.products.retrieve(productId);
      
      // Get the active prices for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true
      });
      
      if (prices.data.length === 0) {
        return res.status(500).json({ message: "No active price found for product" });
      }
      
      // Use the first active price (should be £1.00)
      const price = prices.data[0];
      const amount = price.unit_amount || 100; // Fallback to £1.00 if not set
      
      console.log(`Creating payment intent for ${product.name}: £${(amount / 100).toFixed(2)}`);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'gbp',
        metadata: {
          product_id: productId,
          product_name: product.name,
          price_id: price.id,
          service: 'agricultural-ai-platform'
        }
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: amount 
      });
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Slack notification for new signups
  app.post('/api/notify-signup', async (req, res) => {
    try {
      const { firstName, lastName, email, username } = req.body;
      
      // For now, just log the signup (we'll implement Slack webhook later)
      console.log('\n🎉 NEW PAID SIGNUP NOTIFICATION:');
      console.log(`Name: ${firstName} ${lastName}`);
      console.log(`Email: ${email}`);
      console.log(`Username: ${username}`);
      console.log('💰 Payment: £1 processed successfully');
      console.log(`🕒 Time: ${new Date().toLocaleString('en-GB')}`);
      console.log('📊 View details: /admin\n');
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ success: false });
    }
  });

  // Password reset functionality
  app.post('/api/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).send('Email is required');
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).send('Password reset email sent if account exists');
      }

      // Generate a simple temporary password (in production, you'd use proper tokens)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTempPassword = await hashPassword(tempPassword);
      
      // Update user with temporary password
      await storage.updateUserPassword(user.id, hashedTempPassword);
      
      // Send email with temporary password
      try {
        await sendWelcomeEmail(email, user.firstName || 'User', tempPassword);
        res.status(200).send('Password reset email sent');
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        res.status(500).send('Failed to send password reset email');
      }
      
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).send('Password reset failed');
    }
  });

  // Traditional user login API
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send('Username and password are required');
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).send('Invalid username or password');
      }
      
      // Verify password
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).send('Invalid username or password');
      }
      
      console.log('User logged in successfully:', user.username);
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.status(200).json(userResponse);
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Login failed');
    }
  });

  // Traditional user registration API
  app.post('/api/register', async (req, res) => {
    const requestId = Date.now().toString();
    console.log(`🔍 [${requestId}] POST /api/register START:`, {
      body: req.body ? Object.keys(req.body) : 'no body',
      hasSession: !!req.session,
      cookies: Object.keys(req.cookies || {})
    });
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username || '');
      if (existingUser) {
        return res.status(400).send('Username already exists');
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email || '');
      if (existingEmail) {
        return res.status(400).send('Email already exists');
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password || '');
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        authType: 'traditional',
        onboardingCompleted: true,
      });
      
      console.log(`🔍 [${requestId}] User created successfully:`, user.username);
      
      // Create traditional auth session (NOT Passport login)
      const sessionUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        authType: user.authType,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
      };
      
      // Store user in session for traditional auth
      (req.session as any).user = sessionUser;
      
      console.log(`🔍 [${requestId}] ✅ Traditional auth session created for:`, user.username);
      console.log('📝 Session data stored:', { 
        userId: sessionUser.id, 
        authType: sessionUser.authType,
        expires_at: sessionUser.expires_at 
      });
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      console.log(`🔍 [${requestId}] POST /api/register SUCCESS - responding with user data`);
      res.status(201).json(userResponse);
      
    } catch (error) {
      console.error(`🔍 [${requestId}] Registration error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).send('Invalid input data');
      }
      res.status(500).send('Registration failed');
    }
  });

  // Traditional logout API
  app.post('/api/logout-traditional', async (req, res) => {
    try {
      // Clear the session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).send('Logout failed');
          }
          console.log('Traditional auth session cleared successfully');
          res.status(200).json({ message: 'Logged out successfully' });
        });
      } else {
        res.status(200).json({ message: 'No session to clear' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).send('Logout failed');
    }
  });

  // Traditional user login API
  app.post('/api/login-traditional', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send('Username and password are required');
      }
      
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user || user.authType !== 'traditional' || !user.password) {
        return res.status(401).send('Invalid credentials');
      }
      
      // Verify password
      const passwordMatch = await comparePasswords(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send('Invalid credentials');
      }
      
      // Create session for traditional auth user
      const sessionUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        authType: user.authType,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
      };
      
      // Store user in session
      (req.session as any).user = sessionUser;
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Login failed');
    }
  });

  // Auth middleware already set up above

  // TRADITIONAL AUTH ONLY user endpoint (temporary for debugging)
  app.get('/api/user', async (req, res) => {
    const requestId = Date.now().toString();
    console.log(`🔍 [${requestId}] GET /api/user START - TRADITIONAL ONLY`);
    try {
      let user = null;
      
      // Debug session data
      console.log(`🔍 [${requestId}] Session Debug:`, {
        hasSession: !!req.session,
        sessionData: req.session ? Object.keys(req.session) : 'none',
        hasUser: !!(req.session as any)?.user,
        hasPassport: !!(req.session as any)?.passport,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        hasReqUser: !!req.user
      });
      
      // ONLY CHECK traditional auth session - NO FALLBACKS
      if ((req.session as any).user) {
        const sessionUser = (req.session as any).user;
        console.log(`🔍 [${requestId}] Traditional session user found:`, { id: sessionUser.id, expires_at: sessionUser.expires_at });
        // Verify session hasn't expired
        if (sessionUser.expires_at && sessionUser.expires_at > Math.floor(Date.now() / 1000)) {
          // Get full user data from database (exclude password) - MUST EXIST IN DB
          user = await storage.getUser(sessionUser.id);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            user = userWithoutPassword;
            console.log(`🔍 [${requestId}] Database user found:`, user.username);
          } else {
            console.log(`🔍 [${requestId}] ❌ Traditional session user NOT FOUND in database:`, sessionUser.id);
          }
        } else {
          console.log(`🔍 [${requestId}] ❌ Traditional session EXPIRED`);
        }
      } else {
        console.log(`🔍 [${requestId}] ❌ No traditional auth session found`);
      }
      
      // DISABLED: All other auth types
      if (!user) {
        console.log(`🔍 [${requestId}] ❌ No valid TRADITIONAL authentication found`);
        return res.status(401).json({ message: 'Unauthorized - traditional auth required' });
      }
      
      console.log(`🔍 [${requestId}] ✅ User authenticated (traditional):`, { id: (user as any).id, username: (user as any).username });
      res.json(user);
    } catch (error) {
      console.error(`🔍 [${requestId}] Error fetching user:`, error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      let user;
      
      // Check if traditional auth user
      if (req.user && req.user.authType === 'traditional') {
        // Traditional auth - user data is directly in req.user
        user = await storage.getUser(req.user.id);
      } else if (req.user && req.user.claims) {
        // Replit auth - user id is in claims.sub
        const userId = req.user.claims.sub;
        user = await storage.getUser(userId);
      } else {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (including postcode)
  app.put('/api/user/profile', universalAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const { location } = req.body;
      
      if (!location || !location.trim()) {
        return res.status(400).json({ message: "Location is required" });
      }

      const user = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        location: location.trim(),
      });

      res.json(user);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Complete user onboarding
  app.put('/api/user/onboarding', universalAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const { firstName, lastName, email, farmName, location } = req.body;
      
      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !farmName?.trim() || !location?.trim()) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await storage.upsertUser({
        id: userId,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        farmName: farmName.trim(),
        location: location.trim(),
        profileImageUrl: req.user.claims.profile_image_url,
        onboardingCompleted: true,
      });

      // Send welcome email (don't block the response if email fails)
      sendWelcomeEmail({
        to: email.trim(),
        firstName: firstName.trim(),
        farmName: farmName.trim(),
        location: location.trim(),
      }).catch(error => {
        console.error('Failed to send welcome email:', error);
      });

      res.json(user);
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Weather API
  app.get('/api/weather/:location', universalAuth, async (req, res) => {
    try {
      const { location } = req.params;
      
      // Check cache first
      const cachedWeather = await storage.getWeatherCache(location);
      if (cachedWeather) {
        return res.json(cachedWeather.data);
      }

      // Fetch from OpenWeather API
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Weather API key not configured" });
      }

      // Use OpenWeather API to get coordinates from location name
      let geoData;
      try {
        const directGeoResponse = await fetch(
          `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},GB&limit=1&appid=${apiKey}`
        );
        
        if (directGeoResponse.ok) {
          const directGeoData = await directGeoResponse.json();
          if (directGeoData && directGeoData.length > 0) {
            geoData = { 
              lat: directGeoData[0].lat, 
              lon: directGeoData[0].lon, 
              name: directGeoData[0].name 
            };
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
      
      // If no data found, use a default UK location
      if (!geoData) {
        geoData = { lat: 52.4862, lon: -1.8904, name: 'Birmingham' }; // Central UK
      }
      
      // Get 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${geoData.lat}&lon=${geoData.lon}&appid=${apiKey}&units=metric`
      );

      if (!forecastResponse.ok) {
        return res.status(500).json({ message: "Failed to fetch weather data" });
      }

      const weatherData = await forecastResponse.json();
      
      // Add the city name to the response
      weatherData.city = { name: geoData.name };
      
      // Cache for 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.saveWeatherCache(location, weatherData, expiresAt);

      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Chat API - Market Intelligence (Perplexity)
  app.post('/api/chat/market', universalAuth, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.authUserId;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      await storage.saveChatMessage({
        userId,
        chatType: 'market',
        role: 'user',
        content: message,
      });

      // Call Perplexity API
      const perplexityKey = process.env.PERPLEXITY_API_KEY;
      if (!perplexityKey) {
        return res.status(500).json({ message: "Perplexity API key not configured" });
      }

      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a market intelligence assistant for farmers. Provide accurate, up-to-date information about commodity prices, market trends, and agricultural economics. Focus on UK markets when relevant.',
            },
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (!perplexityResponse.ok) {
        const errorText = await perplexityResponse.text();
        console.error("Perplexity API error:", perplexityResponse.status, errorText);
        return res.status(500).json({ message: "Failed to get market intelligence" });
      }

      const perplexityData = await perplexityResponse.json();
      const assistantMessage = perplexityData.choices[0].message.content;

      // Save assistant response
      const savedResponse = await storage.saveChatMessage({
        userId,
        chatType: 'market',
        role: 'assistant',
        content: assistantMessage,
      });

      res.json({ message: assistantMessage, id: savedResponse.id });
    } catch (error) {
      console.error("Market chat error:", error);
      res.status(500).json({ message: "Failed to process market query" });
    }
  });

  // Chat API - Farm Assistant (FastBots)
  app.post('/api/chat/farm', universalAuth, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.authUserId;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      await storage.saveChatMessage({
        userId,
        chatType: 'farm',
        role: 'user',
        content: message,
      });

      // Call FastBots API or provide fallback response
      const fastbotsKey = process.env.FASTBOTS_API_KEY;
      const fastbotsChatbotId = process.env.FASTBOTS_CHATBOT_ID;
      
      let assistantMessage = "";
      
      if (fastbotsKey && fastbotsChatbotId) {
        try {
          const fastbotsResponse = await fetch(`https://api.fastbots.ai/api/v1/chat/${fastbotsChatbotId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${fastbotsKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: message,
              session_id: userId,
            }),
          });

          if (fastbotsResponse.ok) {
            const fastbotsData = await fastbotsResponse.json();
            assistantMessage = fastbotsData.message || fastbotsData.response;
          } else {
            throw new Error('FastBots API error');
          }
        } catch (error) {
          console.error('FastBots API error:', error);
          assistantMessage = "I apologize, but I'm currently unable to access my full knowledge base. For personalized farm advice, please ensure your FastBots API is properly configured. In the meantime, I recommend consulting with local agricultural extension services or farming experts for specific guidance on your farming questions.";
        }
      } else {
        // Fallback response when FastBots is not configured
        assistantMessage = `Thank you for your question: "${message}"\n\nI'm your farm assistant, but I need to be properly configured with your farm's knowledge base to provide personalized advice. Once your FastBots integration is set up with your farm data, I'll be able to help with:\n\n• Field-specific crop guidance\n• Soil management advice\n• Planting and harvest timing\n• Yield optimization strategies\n• Equipment recommendations\n• Record keeping insights\n\nPlease contact your system administrator to configure the FastBots API with your farm's data.`;
      }

      // Save assistant response
      const savedResponse = await storage.saveChatMessage({
        userId,
        chatType: 'farm',
        role: 'assistant',
        content: assistantMessage,
      });

      res.json({ message: assistantMessage, id: savedResponse.id });
    } catch (error) {
      console.error("Farm chat error:", error);
      res.status(500).json({ message: "Failed to process farm query" });
    }
  });

  // Get chat history
  app.get('/api/chat/:type/history', universalAuth, async (req: any, res) => {
    try {
      const { type } = req.params;
      const userId = req.authUserId;

      if (!['market', 'farm'].includes(type)) {
        return res.status(400).json({ message: "Invalid chat type" });
      }

      const messages = await storage.getChatHistory(userId, type);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Clear chat history
  app.delete('/api/chat/:type/clear', universalAuth, async (req: any, res) => {
    try {
      const { type } = req.params;
      const userId = req.authUserId;
      
      if (!['market', 'farm'].includes(type)) {
        return res.status(400).json({ message: 'Invalid chat type' });
      }
      
      await storage.clearChatHistory(userId, type);
      res.json({ success: true });
    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({ message: 'Failed to clear chat history' });
    }
  });

  // Farm data API
  app.get('/api/farm/fields', universalAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const fields = await storage.getFarmFields(userId);
      res.json(fields);
    } catch (error) {
      console.error("Get farm fields error:", error);
      res.status(500).json({ message: "Failed to fetch farm fields" });
    }
  });

  app.post('/api/farm/fields', universalAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const fieldData = insertFarmFieldSchema.parse({ ...req.body, userId });
      
      const field = await storage.createFarmField(fieldData);
      
      // TODO: Integrate with SmartSuite API to sync data
      const smartsuiteKey = process.env.SMARTSUITE_API_KEY;
      if (smartsuiteKey) {
        try {
          await fetch('https://app.smartsuite.com/api/v1/applications/YOUR_APP_ID/records/', {
            method: 'POST',
            headers: {
              'Authorization': `Token ${smartsuiteKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              field_name: field.fieldName,
              size: field.size,
              crop_type: field.cropType,
              soil_type: field.soilType,
              expected_yield: field.expectedYield,
              notes: field.notes,
            }),
          });
        } catch (smartsuiteError) {
          console.error("SmartSuite sync error:", smartsuiteError);
          // Don't fail the request if SmartSuite sync fails
        }
      }

      res.json(field);
    } catch (error) {
      console.error("Create farm field error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid field data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create farm field" });
    }
  });

  app.put('/api/farm/fields/:id', universalAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const fieldData = req.body;
      
      const field = await storage.updateFarmField(id, fieldData);
      res.json(field);
    } catch (error) {
      console.error("Update farm field error:", error);
      res.status(500).json({ message: "Failed to update farm field" });
    }
  });

  app.delete('/api/farm/fields/:id', universalAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFarmField(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete farm field error:", error);
      res.status(500).json({ message: "Failed to delete farm field" });
    }
  });

  // Machinery service endpoints
  app.get('/api/machinery', universalAuth, async (req: any, res) => {
    try {
      const userId = req.authUserId;
      const machinery = await storage.getMachinery(userId);
      res.json(machinery);
    } catch (error) {
      console.error("Get machinery error:", error);
      res.status(500).json({ message: "Failed to fetch machinery" });
    }
  });

  // Make.com webhook endpoint for machinery data
  app.post('/api/webhook/machinery', async (req, res) => {
    try {
      console.log('Received webhook data:', req.body);
      
      // Validate webhook payload structure
      const webhookSchema = z.object({
        userId: z.string(),
        machines: z.array(z.object({
          name: z.string(),
          type: z.string(),
          lastServiceDate: z.string().optional().nullable(),
          serviceInterval: z.number(),
          status: z.enum(['good', 'service_due_soon', 'overdue']),
        }))
      });
      
      const validatedData = webhookSchema.parse(req.body);
      
      // Process each machine from the webhook
      const results = [];
      for (const machineData of validatedData.machines) {
        const machineryInput = {
          userId: validatedData.userId,
          name: machineData.name,
          type: machineData.type,
          lastServiceDate: machineData.lastServiceDate ? new Date(machineData.lastServiceDate) : null,
          serviceInterval: machineData.serviceInterval,
          status: machineData.status,
        };
        
        const machine = await storage.upsertMachinery(machineryInput);
        results.push(machine);
      }
      
      res.json({ success: true, processed: results.length, machines: results });
    } catch (error) {
      console.error("Webhook processing error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid webhook data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process webhook data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
