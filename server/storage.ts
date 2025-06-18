import { User, InsertUser, UpsertUser, DotCategory, InsertDotCategory, DotQuestion, InsertDotQuestion, PracticeSession, InsertPracticeSession, ChatMessage, InsertChatMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, dotCategories, dotQuestions, practiceSessions, chatMessages } from "@shared/schema";

export interface IStorage {
  // User methods - updated for authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // DOT Categories methods
  getDotCategories(): Promise<DotCategory[]>;
  getDotCategory(id: number): Promise<DotCategory | undefined>;
  createDotCategory(category: InsertDotCategory): Promise<DotCategory>;

  // DOT Questions methods
  getDotQuestionsByCategory(categoryId: number): Promise<DotQuestion[]>;
  getDotQuestion(id: number): Promise<DotQuestion | undefined>;
  createDotQuestion(question: InsertDotQuestion): Promise<DotQuestion>;

  // Practice Sessions methods
  getPracticeSessionsByUser(userId: string): Promise<PracticeSession[]>;
  getRecentSessionsByUser(userId: string, limit: number): Promise<PracticeSession[]>;
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  updatePracticeSession(id: number, updates: Partial<InsertPracticeSession>): Promise<PracticeSession | undefined>;

  // Chat Messages methods
  getChatMessagesBySession(sessionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // DOT Categories methods
  async getDotCategories(): Promise<DotCategory[]> {
    return await db.select().from(dotCategories);
  }

  async getDotCategory(id: number): Promise<DotCategory | undefined> {
    const [category] = await db.select().from(dotCategories).where(eq(dotCategories.id, id));
    return category;
  }

  async createDotCategory(insertCategory: InsertDotCategory): Promise<DotCategory> {
    const [category] = await db
      .insert(dotCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // DOT Questions methods
  async getDotQuestionsByCategory(categoryId: number): Promise<DotQuestion[]> {
    return await db.select().from(dotQuestions).where(eq(dotQuestions.categoryId, categoryId));
  }

  async getDotQuestion(id: number): Promise<DotQuestion | undefined> {
    const [question] = await db.select().from(dotQuestions).where(eq(dotQuestions.id, id));
    return question;
  }

  async createDotQuestion(insertQuestion: InsertDotQuestion): Promise<DotQuestion> {
    const [question] = await db
      .insert(dotQuestions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  // Practice Sessions methods
  async getPracticeSessionsByUser(userId: string): Promise<PracticeSession[]> {
    // Convert userId to the format expected by the existing schema
    const userIdNum = parseInt(userId) || 1;
    return await db.select().from(practiceSessions).where(eq(practiceSessions.userId, userIdNum));
  }

  async getRecentSessionsByUser(userId: string, limit: number): Promise<PracticeSession[]> {
    const userIdNum = parseInt(userId) || 1;
    return await db.select().from(practiceSessions)
      .where(eq(practiceSessions.userId, userIdNum))
      .orderBy(practiceSessions.createdAt)
      .limit(limit);
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const [session] = await db
      .insert(practiceSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updatePracticeSession(id: number, updates: Partial<InsertPracticeSession>): Promise<PracticeSession | undefined> {
    const [session] = await db
      .update(practiceSessions)
      .set(updates)
      .where(eq(practiceSessions.id, id))
      .returning();
    return session;
  }

  // Chat Messages methods
  async getChatMessagesBySession(sessionId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Seed initial data
  async seedInitialData() {
    try {
      // Check if data already exists
      const existingCategories = await this.getDotCategories();
      if (existingCategories.length > 0) {
        return; // Data already seeded
      }

      // Seed DOT categories
      const categoriesData = [
        { name: "Vehicle Inspection", description: "Pre-trip and post-trip inspection procedures", icon: "🔧", color: "#3B82F6" },
        { name: "Hours of Service", description: "Driving hours and rest requirements", icon: "⏰", color: "#10B981" },
        { name: "Cargo Handling", description: "Loading, securing, and transporting cargo", icon: "📦", color: "#F59E0B" },
        { name: "Safety Regulations", description: "General safety rules and procedures", icon: "🛡️", color: "#EF4444" },
        { name: "Documentation", description: "Required paperwork and permits", icon: "📄", color: "#8B5CF6" },
        { name: "Emergency Procedures", description: "Handling emergencies and breakdowns", icon: "🚨", color: "#F97316" },
      ];

      for (const categoryData of categoriesData) {
        await this.createDotCategory(categoryData);
      }

      // Seed DOT questions
      const questionsData = [
        // Vehicle Inspection Questions
        { categoryId: 1, question: "What should you check during a pre-trip inspection?", options: ["Only the engine", "Tires, brakes, lights, and fluid levels", "Just the fuel level", "Only the mirrors"], correctAnswer: 1, explanation: "A thorough pre-trip inspection includes checking tires, brakes, lights, fluid levels, and other critical components to ensure safe operation." },
        { categoryId: 1, question: "How often should you perform a vehicle inspection?", options: ["Once a week", "Before each trip", "Only when required", "After each delivery"], correctAnswer: 1, explanation: "Federal regulations require drivers to perform a pre-trip inspection before each trip to identify potential safety issues." },
        { categoryId: 1, question: "What is the minimum tread depth for front tires?", options: ["2/32 inch", "4/32 inch", "6/32 inch", "8/32 inch"], correctAnswer: 1, explanation: "Front tires must have at least 4/32 inch tread depth for adequate traction and safe steering." },
        
        // Hours of Service Questions
        { categoryId: 2, question: "What is the maximum driving time allowed in a 14-hour period?", options: ["10 hours", "11 hours", "12 hours", "14 hours"], correctAnswer: 1, explanation: "Drivers can drive a maximum of 11 hours within a 14-hour on-duty period." },
        { categoryId: 2, question: "How many hours of off-duty time are required before starting a new 14-hour period?", options: ["8 hours", "10 hours", "12 hours", "14 hours"], correctAnswer: 1, explanation: "Drivers must have at least 10 consecutive hours off duty before starting a new 14-hour on-duty period." },
        { categoryId: 2, question: "What is the 70-hour rule?", options: ["Maximum weekly driving", "Maximum monthly driving", "Maximum daily driving", "Maximum shift length"], correctAnswer: 0, explanation: "The 70-hour rule limits drivers to 70 hours of on-duty time in 8 consecutive days." },
      ];

      for (const questionData of questionsData) {
        await this.createDotQuestion(questionData);
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
}

export const storage = new DatabaseStorage();