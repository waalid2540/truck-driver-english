import { 
  User, InsertUser, 
  DotCategory, InsertDotCategory,
  DotQuestion, InsertDotQuestion,
  PracticeSession, InsertPracticeSession,
  ChatMessage, InsertChatMessage 
} from "../shared/schema";

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
      practiceStreak: 5,
      totalSessions: 12,
      dailyReminders: true,
      voicePractice: true,
      sessionDuration: 15,
      darkMode: true,
      createdAt: new Date()
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create DOT categories
    const categories: InsertDotCategory[] = [
      {
        name: "Safety Regulations",
        description: "Essential safety rules and regulations for commercial drivers",
        icon: "fas fa-shield-alt",
        color: "red-600",
        questionsCount: 0,
      },
      {
        name: "Documentation",
        description: "Required paperwork and record-keeping for drivers",
        icon: "fas fa-file-alt",
        color: "blue-600",
        questionsCount: 0,
      },
      {
        name: "Road Terminology",
        description: "Common traffic signs, signals, and road markings",
        icon: "fas fa-road",
        color: "green-600",
        questionsCount: 0,
      },
      {
        name: "Vehicle Operations",
        description: "Proper vehicle handling and maintenance procedures",
        icon: "fas fa-cogs",
        color: "yellow-600",
        questionsCount: 0,
      },
      {
        name: "Loading & Cargo",
        description: "Cargo securement and weight distribution guidelines",
        icon: "fas fa-boxes",
        color: "truck-blue",
        questionsCount: 0,
      },
      {
        name: "Officer & Driver Interactions",
        description: "Professional communication with law enforcement and DOT officers",
        icon: "fas fa-user-shield",
        color: "indigo-600",
        questionsCount: 20,
      },
    ];

    categories.forEach((category, index) => {
      const id = index + 1;
      this.dotCategories.set(id, { ...category, id, questionsCount: category.questionsCount ?? 0 });
    });
    this.currentCategoryId = 7;

    // Officer & Driver Interaction Questions - Audio Format
    const questions: InsertDotQuestion[] = [
      {
        categoryId: 6,
        question: "What are you hauling?",
        options: [],
        correctAnswer: "I'm hauling refrigerated meat products for a grocery chain.",
        explanation: "Be specific, professional, and cooperative when describing your cargo."
      },
      {
        categoryId: 6,
        question: "How far are you from your delivery location?",
        options: [],
        correctAnswer: "I'm about 120 miles away from my drop-off point.",
        explanation: "Provide specific, helpful information to assist the officer."
      },
      {
        categoryId: 6,
        question: "Are your load straps secure?",
        options: [],
        correctAnswer: "Yes, I double-checked all straps before leaving the warehouse.",
        explanation: "Demonstrate that you follow proper safety procedures and double-check equipment."
      },
      {
        categoryId: 6,
        question: "When did you last take a break?",
        options: [],
        correctAnswer: "About 30 minutes ago, I stopped at a rest area for lunch.",
        explanation: "Be specific about break times to show compliance with HOS regulations."
      },
      {
        categoryId: 6,
        question: "Are you hauling perishable goods?",
        options: [],
        correctAnswer: "Yes, I'm transporting frozen vegetables in a reefer trailer.",
        explanation: "Know your cargo and provide accurate information about what you're transporting."
      },
      {
        categoryId: 6,
        question: "What company are you driving for?",
        options: [],
        correctAnswer: "I'm with American Freight Logistics, based in Chicago.",
        explanation: "Provide clear company identification and location when asked."
      },
      {
        categoryId: 6,
        question: "Are you aware of any violations on your record?",
        options: [],
        correctAnswer: "No, my record is clean for the past two years.",
        explanation: "Be honest about your driving record and demonstrate your clean safety history."
      },
      {
        categoryId: 6,
        question: "Are you using a paper log or an ELD?",
        options: [],
        correctAnswer: "I'm using an Electronic Logging Device to track my hours.",
        explanation: "Show compliance with current ELD mandate regulations."
      },
      {
        categoryId: 6,
        question: "Have you had any alcohol in the last 24 hours?",
        options: [],
        correctAnswer: "No, officer. I haven't consumed any alcohol.",
        explanation: "Always be truthful about alcohol consumption and maintain zero tolerance while driving."
      },
      {
        categoryId: 6,
        question: "Is your horn and lighting system working properly?",
        options: [],
        correctAnswer: "Yes, I tested them during my pre-trip inspection.",
        explanation: "Demonstrate that you perform thorough pre-trip inspections of all safety equipment."
      },
      {
        categoryId: 6,
        question: "Is your speed limiter functioning correctly?",
        options: [],
        correctAnswer: "Yes, it's working as required and set at 65 mph.",
        explanation: "Show knowledge of speed limiter requirements and proper settings."
      },
      {
        categoryId: 6,
        question: "Is your fire extinguisher charged and accessible?",
        options: [],
        correctAnswer: "Yes, it's fully charged and mounted right behind my seat.",
        explanation: "Know the location and condition of all required safety equipment."
      },
      {
        categoryId: 6,
        question: "Is your trailer properly sealed?",
        options: [],
        correctAnswer: "Yes, the seal is intact and matches the shipping paperwork.",
        explanation: "Verify seal integrity and match with documentation for cargo security."
      },
      {
        categoryId: 6,
        question: "Have you had any recent accidents or tickets?",
        options: [],
        correctAnswer: "No, I've had a clean record for over a year now.",
        explanation: "Be honest about your safety record and demonstrate your commitment to safe driving."
      },
      {
        categoryId: 6,
        question: "Have you completed your pre-trip inspection today?",
        options: [],
        correctAnswer: "Yes, I checked the tires, lights, brakes, and fluids this morning.",
        explanation: "Detail your thorough pre-trip inspection process to show compliance."
      },
      {
        categoryId: 6,
        question: "Did you secure the back door of your trailer?",
        options: [],
        correctAnswer: "Yes, it's locked and sealed properly.",
        explanation: "Always verify cargo security is your responsibility as the driver."
      },
      {
        categoryId: 6,
        question: "How long have you been a CDL driver?",
        options: [],
        correctAnswer: "I've been driving commercially for 7 years now.",
        explanation: "Provide specific experience information to establish your qualifications."
      },
      {
        categoryId: 6,
        question: "Did you encounter any mechanical issues today?",
        options: [],
        correctAnswer: "No issues today, everything has been running smoothly.",
        explanation: "Report the current mechanical condition accurately and confidently."
      },
      {
        categoryId: 6,
        question: "Is your load balanced properly?",
        options: [],
        correctAnswer: "Yes, it was checked and balanced during loading.",
        explanation: "Confirm proper load distribution for safe vehicle operation."
      },
      {
        categoryId: 6,
        question: "Where did you last refuel?",
        options: [],
        correctAnswer: "I stopped at the Love's truck stop 40 miles back.",
        explanation: "Provide specific location information to help with route verification."
      }
    ];

    questions.forEach((question, index) => {
      const id = index + 1;
      this.dotQuestions.set(id, { ...question, id, explanation: question.explanation ?? null });
    });
    this.currentQuestionId = questions.length + 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
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

  async getPracticeSessionsByUser(userId: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values()).filter(s => s.userId === userId);
  }

  async getRecentSessionsByUser(userId: number, limit: number): Promise<PracticeSession[]> {
    const sessions = Array.from(this.practiceSessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    return sessions;
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = this.currentSessionId++;
    const session: PracticeSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date()
    };
    this.practiceSessions.set(id, session);
    return session;
  }

  async updatePracticeSession(id: number, updates: Partial<InsertPracticeSession>): Promise<PracticeSession | undefined> {
    const session = this.practiceSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.practiceSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getChatMessagesBySession(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(m => m.sessionId === sessionId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();