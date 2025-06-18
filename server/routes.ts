import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateConversationResponse, generatePracticeScenario } from "./services/openai";
import { transcribeAudio, generateSpeech } from "./services/whisper";
import { generateDOTSpeech } from "./services/gtts-service";
import { generateDOTSpeechElevenLabs, AVAILABLE_VOICES } from "./services/elevenlabs-service";
import { insertPracticeSessionSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getPracticeSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get practice sessions" });
    }
  });

  app.get("/api/practice-sessions/user/:userId/recent", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
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

  // Conversation AI routes
  app.post("/api/conversation/respond", async (req, res) => {
    try {
      const { message, history, userId } = req.body;
      const response = await generateConversationResponse(message, history || [], userId || "default");
      res.json(response);
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

  // Get available voices endpoint
  app.get("/api/voices", (req, res) => {
    res.json(AVAILABLE_VOICES);
  });

  // DOT practice voice endpoint with voice selection support
  app.post("/api/speak-dot", async (req, res) => {
    try {
      const { text, voice, voiceId } = req.body;
      if (!text) {
        return res.status(400).json({ message: "No text provided" });
      }

      const voiceType = voice === 'driver' ? 'driver' : 'officer';
      
      try {
        // Try ElevenLabs first for premium quality with custom voice
        const audioBuffer = await generateDOTSpeechElevenLabs(text, voiceType, voiceId);
        
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length,
          'Cache-Control': 'public, max-age=3600',
        });
        
        res.send(audioBuffer);
        return;
      } catch (elevenLabsError) {
        console.log("ElevenLabs unavailable, falling back to GTTS:", (elevenLabsError as Error).message);
        
        // Fallback to GTTS
        const audioBuffer = await generateDOTSpeech(text, voiceType);
        
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length,
          'Cache-Control': 'public, max-age=3600',
        });
        
        res.send(audioBuffer);
      }
    } catch (error) {
      console.error("Voice generation error:", error);
      res.status(500).json({ message: "Failed to generate voice: " + (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
