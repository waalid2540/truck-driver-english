import { 
  User, InsertUser, 
  DotCategory, InsertDotCategory,
  DotQuestion, InsertDotQuestion,
  PracticeSession, InsertPracticeSession,
  ChatMessage, InsertChatMessage 
} from "../shared/schema.js";

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
      voicePractice: true,
      sessionDuration: 10,
      darkMode: true,
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create DOT categories - ready for custom prompts
    const categories: InsertDotCategory[] = [
      {
        name: "Safety Regulations",
        description: "Practice regulations, safety terms, and compliance",
        icon: "fas fa-shield-alt",
        color: "truck-orange",
        questionsCount: 0,
      },
      {
        name: "Documentation",
        description: "Learn about required paperwork and documentation",
        icon: "fas fa-file-alt",
        color: "truck-blue",
        questionsCount: 0,
      },
      {
        name: "Road Terminology",
        description: "Master road signs, traffic terms, and route planning",
        icon: "fas fa-road",
        color: "green-600",
        questionsCount: 0,
      },
      {
        name: "Vehicle Operations",
        description: "Vehicle controls, systems, and operational procedures",
        icon: "fas fa-truck",
        color: "truck-orange",
        questionsCount: 0,
      },
      {
        name: "Loading & Cargo",
        description: "Cargo handling, weight limits, and securing loads",
        icon: "fas fa-boxes",
        color: "truck-blue",
        questionsCount: 0,
      },
      {
        name: "Officer & Driver Interactions",
        description: "Professional communication with law enforcement and DOT officers",
        icon: "fas fa-user-shield",
        color: "indigo-600",
        questionsCount: 0,
      },
    ];

    categories.forEach((category, index) => {
      const id = index + 1;
      this.dotCategories.set(id, { ...category, id, questionsCount: 0 });
    });
    this.currentCategoryId = 7;

    // Questions ready for custom prompts
    const questions: InsertDotQuestion[] = [];

    questions.forEach((question, index) => {
      const id = index + 1;
      this.dotQuestions.set(id, { ...question, id, explanation: question.explanation || null });
    });
    this.currentQuestionId = questions.length + 1;
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
      experienceLevel: insertUser.experienceLevel || "beginner",
      practiceStreak: insertUser.practiceStreak || 0,
      totalSessions: insertUser.totalSessions || 0,
      dailyReminders: insertUser.dailyReminders || true,
      voicePractice: insertUser.voicePractice || false,
      sessionDuration: insertUser.sessionDuration || 15,
      darkMode: insertUser.darkMode || false,
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
    const category: DotCategory = { 
      ...insertCategory, 
      id,
      questionsCount: insertCategory.questionsCount || 0
    };
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
    const question: DotQuestion = { 
      ...insertQuestion, 
      id,
      explanation: insertQuestion.explanation || null
    };
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
      categoryId: insertSession.categoryId || null,
      score: insertSession.score || null,
      completed: insertSession.completed || false,
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
    return Array.from(this.chatMessages.values()).filter(m => m.sessionId === sessionId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();