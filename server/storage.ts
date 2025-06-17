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
        questionsCount: 20,
      },
    ];

    categories.forEach((category, index) => {
      const id = index + 1;
      this.dotCategories.set(id, { ...category, id, questionsCount: category.questionsCount || 0 });
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
          "Why does that matter?",
          "I'm independent."
        ],
        correctAnswer: "I'm with American Freight Logistics, based in Chicago.",
        explanation: "Provide clear company identification and location when asked."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you aware of any violations on your record?' - Choose the best response:",
        options: [
          "No, my record is clean for the past two years.",
          "I don't think so.",
          "That's private information.",
          "I have a few minor things."
        ],
        correctAnswer: "No, my record is clean for the past two years.",
        explanation: "Be honest about your driving record and demonstrate your clean safety history."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you using a paper log or an ELD?' - Choose the best response:",
        options: [
          "I'm using an Electronic Logging Device to track my hours.",
          "I use whatever I want.",
          "Paper logs are easier.",
          "I don't keep logs."
        ],
        correctAnswer: "I'm using an Electronic Logging Device to track my hours.",
        explanation: "Show compliance with current ELD mandate regulations."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you had any alcohol in the last 24 hours?' - Choose the best response:",
        options: [
          "No, officer. I haven't consumed any alcohol.",
          "Just a beer with dinner last night.",
          "That's personal.",
          "I don't drink much."
        ],
        correctAnswer: "No, officer. I haven't consumed any alcohol.",
        explanation: "Always be truthful about alcohol consumption and maintain zero tolerance while driving."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your horn and lighting system working properly?' - Choose the best response:",
        options: [
          "Yes, I tested them during my pre-trip inspection.",
          "I assume they work.",
          "Probably.",
          "I don't check those things."
        ],
        correctAnswer: "Yes, I tested them during my pre-trip inspection.",
        explanation: "Demonstrate that you perform thorough pre-trip inspections of all safety equipment."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your speed limiter functioning correctly?' - Choose the best response:",
        options: [
          "Yes, it's working as required and set at 65 mph.",
          "I think it's working.",
          "I don't use a speed limiter.",
          "Speed limiters are optional."
        ],
        correctAnswer: "Yes, it's working as required and set at 65 mph.",
        explanation: "Show knowledge of speed limiter requirements and proper settings."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your fire extinguisher charged and accessible?' - Choose the best response:",
        options: [
          "Yes, it's fully charged and mounted right behind my seat.",
          "I have one somewhere.",
          "Fire extinguishers aren't required.",
          "I think it's charged."
        ],
        correctAnswer: "Yes, it's fully charged and mounted right behind my seat.",
        explanation: "Know the location and condition of all required safety equipment."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your trailer properly sealed?' - Choose the best response:",
        options: [
          "Yes, the seal is intact and matches the shipping paperwork.",
          "I think so.",
          "The shipper sealed it.",
          "I don't check seals."
        ],
        correctAnswer: "Yes, the seal is intact and matches the shipping paperwork.",
        explanation: "Verify seal integrity and match with documentation for cargo security."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you had any recent accidents or tickets?' - Choose the best response:",
        options: [
          "No, I've had a clean record for over a year now.",
          "Maybe a small fender bender.",
          "I don't remember.",
          "That's private information."
        ],
        correctAnswer: "No, I've had a clean record for over a year now.",
        explanation: "Be honest about your safety record and demonstrate your commitment to safe driving."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you completed your pre-trip inspection today?' - Choose the best response:",
        options: [
          "Yes, I checked the tires, lights, brakes, and fluids this morning.",
          "I looked at the truck.",
          "I do it when I remember.",
          "Pre-trip inspections are optional."
        ],
        correctAnswer: "Yes, I checked the tires, lights, brakes, and fluids this morning.",
        explanation: "Detail your thorough pre-trip inspection process to show compliance."
      },
      {
        categoryId: 6,
        question: "Officer: 'Did you secure the back door of your trailer?' - Choose the best response:",
        options: [
          "Yes, it's locked and sealed properly.",
          "The shipper did that.",
          "I think it's secure.",
          "I don't check the back."
        ],
        correctAnswer: "Yes, it's locked and sealed properly.",
        explanation: "Always verify cargo security is your responsibility as the driver."
      },
      {
        categoryId: 6,
        question: "Officer: 'How long have you been a CDL driver?' - Choose the best response:",
        options: [
          "I've been driving commercially for 7 years now.",
          "A few years.",
          "Long enough.",
          "Since I got my license."
        ],
        correctAnswer: "I've been driving commercially for 7 years now.",
        explanation: "Provide specific experience information to establish your qualifications."
      },
      {
        categoryId: 6,
        question: "Officer: 'Did you encounter any mechanical issues today?' - Choose the best response:",
        options: [
          "No issues today, everything has been running smoothly.",
          "Just minor problems.",
          "The truck seems okay.",
          "I don't pay attention to that."
        ],
        correctAnswer: "No issues today, everything has been running smoothly.",
        explanation: "Report the current mechanical condition accurately and confidently."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your load balanced properly?' - Choose the best response:",
        options: [
          "Yes, it was checked and balanced during loading.",
          "I think so.",
          "The shipper loaded it.",
          "I don't check load balance."
        ],
        correctAnswer: "Yes, it was checked and balanced during loading.",
        explanation: "Confirm proper load distribution for safe vehicle operation."
      },
      {
        categoryId: 6,
        question: "Officer: 'Where did you last refuel?' - Choose the best response:",
        options: [
          "I stopped at the Love's truck stop 40 miles back.",
          "Somewhere back there.",
          "At a gas station.",
          "I can't remember."
        ],
        correctAnswer: "I stopped at the Love's truck stop 40 miles back.",
        explanation: "Provide specific location information to help with route verification."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you checked your tire pressure today?' - Choose the best response:",
        options: [
          "Yes, I used a gauge before starting my shift this morning.",
          "They look fine.",
          "I check them sometimes.",
          "Tire pressure is automatic."
        ],
        correctAnswer: "Yes, I used a gauge before starting my shift this morning.",
        explanation: "Show proper tire maintenance procedures using appropriate tools."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you know your trailer's height and weight?' - Choose the best response:",
        options: [
          "Yes, the height is 13 feet 6 inches and weight is 34,000 pounds empty.",
          "It's a standard trailer.",
          "Pretty heavy.",
          "I don't know those details."
        ],
        correctAnswer: "Yes, the height is 13 feet 6 inches and weight is 34,000 pounds empty.",
        explanation: "Know your vehicle specifications for clearance and weight compliance."
      },
      {
        categoryId: 6,
        question: "Officer: 'Can you explain what's in your load today?' - Choose the best response:",
        options: [
          "Sure, I'm hauling pallets of dry food and packaged goods.",
          "Just regular stuff.",
          "Cargo.",
          "I don't open the trailer."
        ],
        correctAnswer: "Sure, I'm hauling pallets of dry food and packaged goods.",
        explanation: "Be knowledgeable about your cargo contents for security and safety."
      },
      {
        categoryId: 6,
        question: "Officer: 'How long have you been working with your current company?' - Choose the best response:",
        options: [
          "I've been with them for about 14 months.",
          "Not long.",
          "A while.",
          "I work for several companies."
        ],
        correctAnswer: "I've been with them for about 14 months.",
        explanation: "Provide specific employment history to establish your professional stability."
      },
      {
        categoryId: 6,
        question: "Officer: 'What time did you start your shift today?' - Choose the best response:",
        options: [
          "I began my shift at 6:30 this morning.",
          "Early this morning.",
          "A few hours ago.",
          "I don't track start times."
        ],
        correctAnswer: "I began my shift at 6:30 this morning.",
        explanation: "Be precise with timing for HOS compliance verification."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you have reflective triangles or flares on board?' - Choose the best response:",
        options: [
          "Yes, officer. I keep them stored in the side box.",
          "I think I have some.",
          "Those aren't required.",
          "I use my flashers instead."
        ],
        correctAnswer: "Yes, officer. I keep them stored in the side box.",
        explanation: "Know the location of required emergency equipment and confirm you have it."
      },
      {
        categoryId: 6,
        question: "Officer: 'Can I see your driver's license and medical certificate?' - Choose the best response:",
        options: [
          "Yes, officer. Here are both documents.",
          "I only have my license.",
          "My medical card expired.",
          "Do I have to show you those?"
        ],
        correctAnswer: "Yes, officer. Here are both documents.",
        explanation: "Always carry and readily provide required documentation when requested."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you know why I pulled you over?' - Choose the best response:",
        options: [
          "I'm not sure, officer. Was I speeding or crossing a line?",
          "No idea.",
          "You tell me.",
          "Probably for no reason."
        ],
        correctAnswer: "I'm not sure, officer. Was I speeding or crossing a line?",
        explanation: "Remain respectful and show willingness to learn if you made an error."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you familiar with the HOS rules?' - Choose the best response:",
        options: [
          "Yes, I follow the Hours of Service rules carefully.",
          "I know some of them.",
          "They're confusing.",
          "HOS rules are optional."
        ],
        correctAnswer: "Yes, I follow the Hours of Service rules carefully.",
        explanation: "Demonstrate knowledge and commitment to following federal regulations."
      },
      {
        categoryId: 6,
        question: "Officer: 'When was your last safety inspection?' - Choose the best response:",
        options: [
          "It was done last week before I left the terminal.",
          "A while ago.",
          "I don't remember.",
          "My company handles that."
        ],
        correctAnswer: "It was done last week before I left the terminal.",
        explanation: "Know your vehicle's inspection history and maintenance schedule."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you carrying your registration and insurance papers?' - Choose the best response:",
        options: [
          "Yes, officer. They're in the glove compartment.",
          "I think so.",
          "My company has them.",
          "Those should be somewhere."
        ],
        correctAnswer: "Yes, officer. They're in the glove compartment.",
        explanation: "Keep required documentation organized and easily accessible."
      },
      {
        categoryId: 6,
        question: "Officer: 'How long have you been driving today?' - Choose the best response:",
        options: [
          "I've been on the road for 5 hours so far today.",
          "Most of the day.",
          "I started early.",
          "I don't keep track."
        ],
        correctAnswer: "I've been on the road for 5 hours so far today.",
        explanation: "Track driving time accurately for HOS compliance."
      },
      {
        categoryId: 6,
        question: "Officer: 'Where are you headed today?' - Choose the best response:",
        options: [
          "I'm driving to Houston, Texas to deliver a load of produce.",
          "Down south.",
          "To make a delivery.",
          "Wherever dispatch sends me."
        ],
        correctAnswer: "I'm driving to Houston, Texas to deliver a load of produce.",
        explanation: "Provide specific destination and cargo information when asked."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you have your bill of lading?' - Choose the best response:",
        options: [
          "Yes, officer. Here it is, showing pickup and delivery details.",
          "I think it's somewhere.",
          "My company has it.",
          "What's a bill of lading?"
        ],
        correctAnswer: "Yes, officer. Here it is, showing pickup and delivery details.",
        explanation: "Always carry and be able to produce shipping documentation."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you have a valid medical card?' - Choose the best response:",
        options: [
          "Yes, officer. It's in my wallet and still valid for 8 months.",
          "I think it's current.",
          "Medical cards are optional.",
          "It might be expired."
        ],
        correctAnswer: "Yes, officer. It's in my wallet and still valid for 8 months.",
        explanation: "Keep medical certification current and know the expiration date."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you know what your tire tread depth is?' - Choose the best response:",
        options: [
          "Yes, it's above the legal limit—checked this morning.",
          "They look okay.",
          "I don't measure tread depth.",
          "The tires are new."
        ],
        correctAnswer: "Yes, it's above the legal limit—checked this morning.",
        explanation: "Monitor tire condition and know legal requirements for tread depth."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you hauling any hazardous materials?' - Choose the best response:",
        options: [
          "No, this is a dry van with general consumer goods.",
          "I don't think so.",
          "I just drive, I don't know what's inside.",
          "Maybe some chemicals."
        ],
        correctAnswer: "No, this is a dry van with general consumer goods.",
        explanation: "Know your cargo classification and hazmat requirements."
      },
      {
        categoryId: 6,
        question: "Officer: 'How many hours have you rested in the past 24 hours?' - Choose the best response:",
        options: [
          "I've had 10 hours of off-duty rest before starting this trip.",
          "I got some sleep.",
          "Enough to drive.",
          "I don't count rest hours."
        ],
        correctAnswer: "I've had 10 hours of off-duty rest before starting this trip.",
        explanation: "Track rest periods accurately to ensure HOS compliance."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you know your gross vehicle weight?' - Choose the best response:",
        options: [
          "Yes, it's about 78,000 pounds loaded.",
          "It's heavy.",
          "Within limits.",
          "I don't weigh the truck."
        ],
        correctAnswer: "Yes, it's about 78,000 pounds loaded.",
        explanation: "Know your vehicle weight for legal compliance and safety."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you been feeling alert during your trip?' - Choose the best response:",
        options: [
          "Yes, I'm fully rested and alert, officer.",
          "I'm okay.",
          "A little tired.",
          "I can handle it."
        ],
        correctAnswer: "Yes, I'm fully rested and alert, officer.",
        explanation: "Always prioritize alertness and never drive when fatigued."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you carrying any oversized loads today?' - Choose the best response:",
        options: [
          "No, officer. This load is within legal size and weight limits.",
          "I don't think so.",
          "It's a normal load.",
          "My company handles permits."
        ],
        correctAnswer: "No, officer. This load is within legal size and weight limits.",
        explanation: "Know load dimensions and legal limits for your cargo."
      },
      {
        categoryId: 6,
        question: "Officer: 'Can you show me your emergency contact information?' - Choose the best response:",
        options: [
          "Yes, it's listed on the back of my license and in my company profile.",
          "I have it somewhere.",
          "My company has that.",
          "I don't carry emergency contacts."
        ],
        correctAnswer: "Yes, it's listed on the back of my license and in my company profile.",
        explanation: "Keep emergency contact information easily accessible."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your ELD device synced properly?' - Choose the best response:",
        options: [
          "Yes, it's working fine and synced with the vehicle's engine.",
          "I think it's working.",
          "ELDs are confusing.",
          "I don't use an ELD."
        ],
        correctAnswer: "Yes, it's working fine and synced with the vehicle's engine.",
        explanation: "Ensure ELD compliance and proper device functionality."
      },
      {
        categoryId: 6,
        question: "Officer: 'When was your last drug and alcohol test?' - Choose the best response:",
        options: [
          "It was two months ago, and I passed with no issues.",
          "A while ago.",
          "I don't remember.",
          "That's private information."
        ],
        correctAnswer: "It was two months ago, and I passed with no issues.",
        explanation: "Be transparent about testing compliance and clean results."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are you aware of your company's safety rating?' - Choose the best response:",
        options: [
          "Yes, we currently hold a satisfactory safety rating from FMCSA.",
          "I think it's good.",
          "My company handles that.",
          "Safety ratings don't matter."
        ],
        correctAnswer: "Yes, we currently hold a satisfactory safety rating from FMCSA.",
        explanation: "Know your company's safety standing and compliance record."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you have a co-driver today?' - Choose the best response:",
        options: [
          "No, officer. I'm driving solo on this trip.",
          "Not today.",
          "Sometimes I do.",
          "Co-drivers are optional."
        ],
        correctAnswer: "No, officer. I'm driving solo on this trip.",
        explanation: "Clearly state your current driving arrangement and team status."
      },
      {
        categoryId: 6,
        question: "Officer: 'Can you explain how you handled your cargo securement?' - Choose the best response:",
        options: [
          "I used load locks and straps, checked every 150 miles.",
          "I strapped it down.",
          "The shipper secured it.",
          "It's not going anywhere."
        ],
        correctAnswer: "I used load locks and straps, checked every 150 miles.",
        explanation: "Detail your cargo securement methods and inspection frequency."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you had any recent vehicle repairs?' - Choose the best response:",
        options: [
          "Yes, we just replaced the brake pads last week.",
          "Some minor work.",
          "The truck is fine.",
          "I don't track repairs."
        ],
        correctAnswer: "Yes, we just replaced the brake pads last week.",
        explanation: "Know your vehicle's maintenance history and recent repairs."
      },
      {
        categoryId: 6,
        question: "Officer: 'What's your current duty status?' - Choose the best response:",
        options: [
          "I'm currently on-duty, not driving.",
          "I'm working.",
          "On the road.",
          "I don't use duty status."
        ],
        correctAnswer: "I'm currently on-duty, not driving.",
        explanation: "Know and accurately report your current HOS duty status."
      },
      {
        categoryId: 6,
        question: "Officer: 'Did you review the weather before your route?' - Choose the best response:",
        options: [
          "Yes, I checked and there are no alerts for my route.",
          "I looked outside.",
          "Weather looks okay.",
          "I don't check weather."
        ],
        correctAnswer: "Yes, I checked and there are no alerts for my route.",
        explanation: "Always check weather conditions for safe trip planning."
      },
      {
        categoryId: 6,
        question: "Officer: 'Have you inspected your brake system today?' - Choose the best response:",
        options: [
          "Yes, I checked for leaks and air pressure levels this morning.",
          "They seem to work.",
          "I tested them while driving.",
          "Brakes are automatic."
        ],
        correctAnswer: "Yes, I checked for leaks and air pressure levels this morning.",
        explanation: "Perform thorough brake system inspections as part of pre-trip safety."
      },
      {
        categoryId: 6,
        question: "Officer: 'Is your CDL currently valid and unrestricted?' - Choose the best response:",
        options: [
          "Yes, officer. My CDL is valid and without restrictions.",
          "I think it's current.",
          "It should be good.",
          "I don't have restrictions."
        ],
        correctAnswer: "Yes, officer. My CDL is valid and without restrictions.",
        explanation: "Know your license status and ensure it remains current and valid."
      },
      {
        categoryId: 6,
        question: "Officer: 'Do you carry a copy of the Federal Motor Carrier Safety Regulations?' - Choose the best response:",
        options: [
          "Yes, I have a digital copy on my tablet.",
          "I know the rules.",
          "My company has them.",
          "I don't need those."
        ],
        correctAnswer: "Yes, I have a digital copy on my tablet.",
        explanation: "Keep regulations accessible for reference and compliance verification."
      },
      {
        categoryId: 6,
        question: "Officer: 'How many hours have you driven in the last 7 days?' - Choose the best response:",
        options: [
          "I've driven around 42 hours this week.",
          "A lot of hours.",
          "I don't count weekly hours.",
          "Within the limit."
        ],
        correctAnswer: "I've driven around 42 hours this week.",
        explanation: "Track weekly driving hours for HOS 60/70 hour rule compliance."
      },
      {
        categoryId: 6,
        question: "Officer: 'Are your mirrors and windows clean and unobstructed?' - Choose the best response:",
        options: [
          "Yes, I cleaned all of them before departure today.",
          "They're clean enough.",
          "I can see fine.",
          "I clean them sometimes."
        ],
        correctAnswer: "Yes, I cleaned all of them before departure today.",
        explanation: "Maintain clear visibility through all mirrors and windows for safety."
      }
    ];

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
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();