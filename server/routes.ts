import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertChatMessageSchema, insertFarmFieldSchema, insertMachinerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (including postcode)
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.put('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

      res.json(user);
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Weather API
  app.get('/api/weather/:location', isAuthenticated, async (req, res) => {
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
  app.post('/api/chat/market', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.claims.sub;

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
  app.post('/api/chat/farm', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.claims.sub;

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
  app.get('/api/chat/:type/history', isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.params;
      const userId = req.user.claims.sub;

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
  app.delete('/api/chat/:type/clear', isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.params;
      const userId = req.user.claims.sub;
      
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
  app.get('/api/farm/fields', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fields = await storage.getFarmFields(userId);
      res.json(fields);
    } catch (error) {
      console.error("Get farm fields error:", error);
      res.status(500).json({ message: "Failed to fetch farm fields" });
    }
  });

  app.post('/api/farm/fields', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put('/api/farm/fields/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/farm/fields/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/machinery', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
