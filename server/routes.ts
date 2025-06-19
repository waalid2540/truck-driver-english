import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateConversationResponse, generatePracticeScenario } from "./services/openai";
import { transcribeAudio, generateSpeech } from "./services/whisper";
import { generateDOTSpeech } from "./services/gtts-service";
import { generateDOTSpeechElevenLabs, AVAILABLE_VOICES } from "./services/elevenlabs-service";
import { insertPracticeSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Stripe integration
let stripe: any = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    console.log('Stripe configured successfully');
  } else {
    console.log('Stripe not configured - payment features disabled');
  }
} catch (error) {
  console.log('Stripe configuration error:', error);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Seed initial data
  await storage.seedInitialData();
  // Configure multer for audio file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    },
  });
  // User routes
  // Simple authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, experienceLevel } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create new user with unique ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const user = await storage.upsertUser({
        id: userId,
        email,
        name,
        experienceLevel: experienceLevel || 'intermediate',
        dailyReminders: true,
        voicePractice: true,
        sessionDuration: 15,
        darkMode: false,
      });

      // Generate simple token
      const token = `token_${userId}_${Date.now()}`;
      
      res.json({
        ...user,
        token,
        message: "Account created successfully"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For demo purposes, accept any password
      // In production, you'd verify against hashed password
      
      // Generate simple token
      const token = `token_${user.id}_${Date.now()}`;
      
      res.json({
        ...user,
        token,
        message: "Logged in successfully"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || !token.startsWith('token_')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Extract user ID from token
      const userId = token.split('_')[1];
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Legacy user routes (for compatibility with existing frontend)
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // DOT Categories routes
  app.get("/api/dot-categories", async (req, res) => {
    try {
      const categories = await storage.getDotCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get DOT categories" });
    }
  });

  // DOT Questions routes
  app.get("/api/dot-questions/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const questions = await storage.getDotQuestionsByCategory(categoryId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get DOT questions" });
    }
  });

  // Practice Sessions routes
  app.get("/api/practice-sessions/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessions = await storage.getPracticeSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get practice sessions" });
    }
  });

  app.get("/api/practice-sessions/user/:userId/recent", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 5;
      const sessions = await storage.getRecentSessionsByUser(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent sessions" });
    }
  });

  app.post("/api/practice-sessions", async (req, res) => {
    try {
      const validatedData = insertPracticeSessionSchema.parse(req.body);
      const session = await storage.createPracticeSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.patch("/api/practice-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedSession = await storage.updatePracticeSession(id, req.body);
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Chat routes
  app.get("/api/chat-messages/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  app.post("/api/chat-messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Conversation AI routes - with usage tracking
  app.post("/api/conversation/respond", isAuthenticated, async (req: any, res) => {
    try {
      const { message, history } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check conversation limits for free users
      if (user.subscriptionStatus === 'free' || !user.subscriptionStatus) {
        if (user.conversationsUsed >= user.conversationLimit) {
          return res.status(402).json({ 
            message: "Free conversation limit reached. Please upgrade to premium for unlimited conversations.",
            conversationsUsed: user.conversationsUsed,
            conversationLimit: user.conversationLimit,
            needsUpgrade: true
          });
        }
      }

      const response = await generateConversationResponse(message, history || [], userId);
      
      // Increment conversation count for free users
      if (user.subscriptionStatus === 'free' || !user.subscriptionStatus) {
        await storage.updateUser(userId, { 
          conversationsUsed: user.conversationsUsed + 1 
        });
      }

      res.json({
        ...response,
        conversationsUsed: user.conversationsUsed + 1,
        conversationLimit: user.conversationLimit,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate response: " + (error as Error).message });
    }
  });

  app.get("/api/conversation/scenario", async (req, res) => {
    try {
      const scenario = await generatePracticeScenario();
      res.json({ scenario });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate scenario" });
    }
  });

  // Whisper AI transcription endpoint
  app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
    try {
      console.log('Transcription request received:', {
        hasFile: !!req.file,
        bodyKeys: Object.keys(req.body),
        files: req.files ? Object.keys(req.files) : 'none'
      });
      
      if (!req.file) {
        console.log('No file found in request');
        return res.status(400).json({ message: "No audio file provided" });
      }

      console.log('Processing audio file:', req.file.originalname, req.file.size, 'bytes');
      const transcription = await transcribeAudio(req.file.buffer, req.file.originalname || 'audio.webm');
      res.json(transcription);
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio: " + (error as Error).message });
    }
  });

  // Text-to-speech endpoint
  app.post("/api/speak", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ message: "No text provided" });
      }

      const audioBuffer = await generateSpeech(text);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ message: "Failed to generate speech: " + (error as Error).message });
    }
  });

  // Get available voices from ElevenLabs account
  app.get("/api/voices", async (req, res) => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        // Return predefined voices if no API key
        return res.json(AVAILABLE_VOICES);
      }

      // Fetch user's actual voices from ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        const voices = data.voices.map((voice: any) => ({
          id: voice.voice_id,
          name: voice.name,
          description: voice.description || `${voice.name} voice`,
          category: 'general', // User can categorize manually
          preview_url: voice.preview_url
        }));
        
        console.log(`Fetched ${voices.length} voices from ElevenLabs account`);
        res.json(voices);
      } else {
        const errorText = await response.text();
        console.log('ElevenLabs voices fetch failed:', response.status, errorText);
        res.json(AVAILABLE_VOICES);
      }
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      res.json(AVAILABLE_VOICES);
    }
  });

  // DOT practice voice endpoint with voice selection support
  app.post("/api/speak-dot", async (req, res) => {
    try {
      const { text, voice, voiceId } = req.body;
      if (!text) {
        return res.status(400).json({ message: "No text provided" });
      }

      const voiceType = voice === 'driver' ? 'driver' : 'officer';
      
      // Use GTTS for testing - reliable and fast
      console.log(`Using GTTS to generate ${voiceType} voice for text: "${text}"`);
      const audioBuffer = await generateDOTSpeech(text, voiceType);
      console.log(`GTTS generated ${audioBuffer.length} bytes of audio data`);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Cache-Control': 'public, max-age=3600',
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error("Voice generation error:", error);
      res.status(500).json({ message: "Failed to generate voice: " + (error as Error).message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }
    
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Check subscription status
  app.get('/api/subscription-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        subscriptionStatus: user.subscriptionStatus || 'free',
        conversationsUsed: user.conversationsUsed || 0,
        conversationLimit: user.conversationLimit || 10,
        needsUpgrade: (user.conversationsUsed >= user.conversationLimit) && (user.subscriptionStatus === 'free' || !user.subscriptionStatus)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get subscription status" });
    }
  });

  // Subscription management for premium features
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
        return;
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
      });

      // Update user with Stripe customer ID
      await storage.updateUser(userId, { stripeCustomerId: customer.id });

      // Create $9.99/month price if it doesn't exist
      let priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId) {
        const price = await stripe.prices.create({
          unit_amount: 999, // $9.99 in cents
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: 'English Coach Premium',
            description: 'Unlimited AI conversations for truck drivers',
          },
        });
        priceId = price.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription ID
      await storage.updateUser(userId, { 
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: 'active'
      });
  
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Check subscription status
  app.get('/api/subscription-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        subscriptionStatus: user.subscriptionStatus || 'free',
        hasActiveSubscription: user.subscriptionStatus === 'active'
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
