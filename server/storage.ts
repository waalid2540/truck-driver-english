import { 
  users, 
  dotCategories, 
  dotQuestions, 
  practiceSessions, 
  chatMessages,
  type User, 
  type InsertUser,
  type DotCategory,
  type InsertDotCategory,
  type DotQuestion,
  type InsertDotQuestion,
  type PracticeSession,
  type InsertPracticeSession,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // DOT Categories methods
  getDotCategories(): Promise<DotCategory[]>;
  getDotCategory(id: number): Promise<DotCategory | undefined>;
  createDotCategory(category: InsertDotCategory): Promise<DotCategory>;

  // DOT Questions methods
  getDotQuestionsByCategory(categoryId: number): Promise<DotQuestion[]>;
  getDotQuestion(id: number): Promise<DotQuestion | undefined>;
  createDotQuestion(question: InsertDotQuestion): Promise<DotQuestion>;

  // Practice Sessions methods
  getPracticeSessionsByUser(userId: number): Promise<PracticeSession[]>;
  getRecentSessionsByUser(userId: number, limit: number): Promise<PracticeSession[]>;
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  updatePracticeSession(id: number, updates: Partial<InsertPracticeSession>): Promise<PracticeSession | undefined>;

  // Chat Messages methods
  getChatMessagesBySession(sessionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private dotCategories: Map<number, DotCategory> = new Map();
  private dotQuestions: Map<number, DotQuestion> = new Map();
  private practiceSessions: Map<number, PracticeSession> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  
  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentQuestionId = 1;
  private currentSessionId = 1;
  private currentMessageId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      name: "John Driver",
      experienceLevel: "intermediate",
      practiceStreak: 7,
      totalSessions: 24,
      dailyReminders: true,
      voicePractice: false,
      sessionDuration: 10,
      darkMode: false,
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create DOT categories
    const categories: InsertDotCategory[] = [
      {
        name: "Safety Regulations",
        description: "Practice regulations, safety terms, and compliance",
        icon: "fas fa-shield-alt",
        color: "truck-orange",
        questionsCount: 15,
      },
      {
        name: "Documentation",
        description: "Learn about required paperwork and documentation",
        icon: "fas fa-file-alt",
        color: "truck-blue",
        questionsCount: 12,
      },
      {
        name: "Road Terminology",
        description: "Master road signs, traffic terms, and route planning",
        icon: "fas fa-road",
        color: "green-600",
        questionsCount: 20,
      },
    ];

    categories.forEach((category, index) => {
      const id = index + 1;
      this.dotCategories.set(id, { ...category, id });
    });
    this.currentCategoryId = 4;

    // Create sample DOT questions
    const questions: InsertDotQuestion[] = [
      {
        categoryId: 1,
        question: "What is the maximum driving time allowed in a 14-hour period?",
        options: ["10 hours", "11 hours", "12 hours", "13 hours"],
        correctAnswer: "11 hours",
        explanation: "Federal regulations limit driving time to 11 hours within a 14-hour on-duty period.",
      },
      {
        categoryId: 1,
        question: "How often must you conduct a pre-trip inspection?",
        options: ["Once a week", "Before each trip", "Once a month", "Only when problems occur"],
        correctAnswer: "Before each trip",
        explanation: "Pre-trip inspections are required before each trip to ensure vehicle safety.",
      },
      {
        categoryId: 2,
        question: "How long must you keep your logbook records?",
        options: ["30 days", "60 days", "6 months", "1 year"],
        correctAnswer: "6 months",
        explanation: "DOT regulations require logbook records to be kept for at least 6 months.",
      },
      {
        categoryId: 3,
        question: "What does a yellow diamond-shaped sign typically indicate?",
        options: ["Stop required", "Warning or caution", "Speed limit", "No parking"],
        correctAnswer: "Warning or caution",
        explanation: "Yellow diamond signs warn drivers of potential hazards or changing road conditions.",
      },
    ];

    questions.forEach((question, index) => {
      const id = index + 1;
      this.dotQuestions.set(id, { ...question, id });
    });
    this.currentQuestionId = 5;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // DOT Categories methods
  async getDotCategories(): Promise<DotCategory[]> {
    return Array.from(this.dotCategories.values());
  }

  async getDotCategory(id: number): Promise<DotCategory | undefined> {
    return this.dotCategories.get(id);
  }

  async createDotCategory(insertCategory: InsertDotCategory): Promise<DotCategory> {
    const id = this.currentCategoryId++;
    const category: DotCategory = { ...insertCategory, id };
    this.dotCategories.set(id, category);
    return category;
  }

  // DOT Questions methods
  async getDotQuestionsByCategory(categoryId: number): Promise<DotQuestion[]> {
    return Array.from(this.dotQuestions.values()).filter(q => q.categoryId === categoryId);
  }

  async getDotQuestion(id: number): Promise<DotQuestion | undefined> {
    return this.dotQuestions.get(id);
  }

  async createDotQuestion(insertQuestion: InsertDotQuestion): Promise<DotQuestion> {
    const id = this.currentQuestionId++;
    const question: DotQuestion = { ...insertQuestion, id };
    this.dotQuestions.set(id, question);
    return question;
  }

  // Practice Sessions methods
  async getPracticeSessionsByUser(userId: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values()).filter(s => s.userId === userId);
  }

  async getRecentSessionsByUser(userId: number, limit: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = this.currentSessionId++;
    const session: PracticeSession = { 
      ...insertSession, 
      id,
      createdAt: new Date(),
    };
    this.practiceSessions.set(id, session);
    return session;
  }

  async updatePracticeSession(id: number, updates: Partial<InsertPracticeSession>): Promise<PracticeSession | undefined> {
    const session = this.practiceSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.practiceSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Chat Messages methods
  async getChatMessagesBySession(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
