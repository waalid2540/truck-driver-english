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
      this.dotCategories.set(id, { ...category, id, questionsCount: category.questionsCount || 0 });
    });
    this.currentCategoryId = 7;

    // Questions ready for custom prompts
    const questions: InsertDotQuestion[] = [];
      {
        categoryId: 1,
        question: "What is the minimum tread depth for front tires on commercial vehicles?",
        options: ["2/32 inch", "4/32 inch", "6/32 inch", "8/32 inch"],
        correctAnswer: "4/32 inch",
        explanation: "Front tires must have at least 4/32 inch of tread depth for safe operation.",
      },
      {
        categoryId: 1,
        question: "How many hours of off-duty time are required before starting a new driving period?",
        options: ["8 hours", "10 hours", "12 hours", "14 hours"],
        correctAnswer: "10 hours",
        explanation: "Drivers must have 10 consecutive hours off-duty before driving again.",
      },
      {
        categoryId: 1,
        question: "What is the maximum speed limit for trucks in most states on interstate highways?",
        options: ["55 mph", "65 mph", "70 mph", "75 mph"],
        correctAnswer: "65 mph",
        explanation: "Most states set truck speed limits at 65 mph on interstate highways.",
      },
      {
        categoryId: 1,
        question: "When must you use hazard lights while driving?",
        options: ["During rain", "When driving slowly", "Only when stopped", "Never while moving"],
        correctAnswer: "Only when stopped",
        explanation: "Hazard lights should only be used when stopped, not while driving.",
      },
      {
        categoryId: 1,
        question: "What is the minimum following distance for trucks at highway speeds?",
        options: ["3 seconds", "4 seconds", "6 seconds", "8 seconds"],
        correctAnswer: "6 seconds",
        explanation: "Trucks need at least 6 seconds following distance at highway speeds.",
      },
      {
        categoryId: 1,
        question: "When is a CDL medical certificate required to be renewed?",
        options: ["Every year", "Every 2 years", "Every 3 years", "Every 5 years"],
        correctAnswer: "Every 2 years",
        explanation: "CDL medical certificates must be renewed every 2 years for most drivers.",
      },
      {
        categoryId: 1,
        question: "What blood alcohol content (BAC) level is considered legally intoxicated for CDL holders?",
        options: ["0.04%", "0.06%", "0.08%", "0.10%"],
        correctAnswer: "0.04%",
        explanation: "CDL holders are legally intoxicated at 0.04% BAC, half the limit for regular drivers.",
      },
      {
        categoryId: 1,
        question: "How often should tire pressure be checked?",
        options: ["Daily", "Weekly", "Monthly", "Before each trip"],
        correctAnswer: "Before each trip",
        explanation: "Tire pressure should be checked during every pre-trip inspection.",
      },
      {
        categoryId: 1,
        question: "What is the maximum width allowed for commercial vehicles?",
        options: ["8 feet", "8.5 feet", "9 feet", "10 feet"],
        correctAnswer: "8.5 feet",
        explanation: "Commercial vehicles cannot exceed 8.5 feet in width without special permits.",
      },
      {
        categoryId: 1,
        question: "When backing up, how often should you check your mirrors?",
        options: ["Once before starting", "Every few seconds", "Only when someone is guiding", "Continuously"],
        correctAnswer: "Continuously",
        explanation: "Mirrors should be checked continuously while backing to ensure safety.",
      },
      {
        categoryId: 1,
        question: "What is the penalty for driving a CMV without a valid CDL?",
        options: ["Warning only", "Fine up to $500", "Fine up to $5,000", "Immediate arrest"],
        correctAnswer: "Fine up to $5,000",
        explanation: "Driving a CMV without a valid CDL can result in fines up to $5,000.",
      },
      {
        categoryId: 1,
        question: "How long must you wait after drinking alcohol before driving a CMV?",
        options: ["4 hours", "8 hours", "12 hours", "24 hours"],
        correctAnswer: "4 hours",
        explanation: "Federal regulations prohibit driving within 4 hours of consuming alcohol.",
      },
      {
        categoryId: 1,
        question: "What is the maximum height allowed for commercial vehicles on most highways?",
        options: ["12 feet", "13 feet", "13.6 feet", "14 feet"],
        correctAnswer: "13.6 feet",
        explanation: "Most highways allow commercial vehicles up to 13 feet 6 inches in height.",
      },
      {
        categoryId: 1,
        question: "When should you perform a post-trip inspection?",
        options: ["Never required", "Once per week", "After each trip", "Only if problems occur"],
        correctAnswer: "After each trip",
        explanation: "Post-trip inspections help identify problems that developed during the trip.",
      },
      {
        categoryId: 1,
        question: "What is the minimum age requirement for an interstate CDL?",
        options: ["18 years", "19 years", "21 years", "25 years"],
        correctAnswer: "21 years",
        explanation: "Interstate CDL holders must be at least 21 years old.",
      },
      {
        categoryId: 1,
        question: "How many points on your regular license can result in CDL suspension?",
        options: ["6 points", "8 points", "10 points", "12 points"],
        correctAnswer: "8 points",
        explanation: "Accumulating 8 points on your regular license can lead to CDL suspension.",
      },
      {
        categoryId: 1,
        question: "What is required when transporting hazardous materials?",
        options: ["Special license only", "Hazmat endorsement", "Extra insurance", "Government permit"],
        correctAnswer: "Hazmat endorsement",
        explanation: "A hazmat endorsement on your CDL is required for transporting hazardous materials.",
      },
      {
        categoryId: 1,
        question: "When must you use tire chains?",
        options: ["Never required", "When required by law", "Only in snow", "Only on ice"],
        correctAnswer: "When required by law",
        explanation: "Tire chains must be used when required by state or local laws.",
      },
      {
        categoryId: 1,
        question: "What is the maximum driving time allowed in a 7-day period?",
        options: ["60 hours", "70 hours", "77 hours", "84 hours"],
        correctAnswer: "60 hours",
        explanation: "Drivers cannot drive more than 60 hours in a 7-day period (or 70 in 8 days).",
      },
      {
        categoryId: 1,
        question: "How far should reflective triangles be placed behind a stopped truck on a highway?",
        options: ["50, 100, 150 feet", "100, 200, 300 feet", "10, 100, 200 feet", "25, 50, 100 feet"],
        correctAnswer: "10, 100, 200 feet",
        explanation: "Triangles should be placed at 10, 100, and 200 feet behind the vehicle.",
      },
      {
        categoryId: 1,
        question: "What is the minimum tread depth for rear tires on commercial vehicles?",
        options: ["2/32 inch", "4/32 inch", "6/32 inch", "8/32 inch"],
        correctAnswer: "2/32 inch",
        explanation: "Rear tires must have at least 2/32 inch of tread depth.",
      },
      {
        categoryId: 1,
        question: "When is double-clutching required?",
        options: ["Always", "Never", "With manual transmissions", "Only when fully loaded"],
        correctAnswer: "With manual transmissions",
        explanation: "Double-clutching is the proper technique for shifting manual transmissions in trucks.",
      },
      {
        categoryId: 1,
        question: "What should you do if your brakes fail while driving?",
        options: ["Pump the brakes", "Use the parking brake", "Downshift and use engine braking", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Brake failure requires multiple techniques: pumping, parking brake, and engine braking.",
      },
      {
        categoryId: 1,
        question: "How often should you check your mirrors while driving?",
        options: ["Every 30 seconds", "Every 5-8 seconds", "Every minute", "Only when changing lanes"],
        correctAnswer: "Every 5-8 seconds",
        explanation: "Mirrors should be checked every 5-8 seconds to maintain awareness.",
      },
      {
        categoryId: 1,
        question: "What is the proper way to hold the steering wheel?",
        options: ["10 and 2 o'clock", "9 and 3 o'clock", "8 and 4 o'clock", "Any comfortable position"],
        correctAnswer: "9 and 3 o'clock",
        explanation: "The 9 and 3 o'clock position provides the best control and safety.",
      },
      {
        categoryId: 1,
        question: "When should you use your horn?",
        options: ["To warn other drivers", "When angry", "To get attention", "Only in emergencies"],
        correctAnswer: "To warn other drivers",
        explanation: "The horn should be used to warn other drivers of your presence when necessary.",
      },
      {
        categoryId: 1,
        question: "What is the safe operating temperature for engine coolant?",
        options: ["180-195°F", "200-220°F", "165-185°F", "220-240°F"],
        correctAnswer: "180-195°F",
        explanation: "Engine coolant should operate between 180-195°F for optimal performance.",
      },
      {
        categoryId: 1,
        question: "How should you approach a curve with a large truck?",
        options: ["Maintain speed", "Accelerate slightly", "Slow down before the curve", "Brake in the curve"],
        correctAnswer: "Slow down before the curve",
        explanation: "Always slow down before entering a curve, not during the curve.",
      },
      {
        categoryId: 1,
        question: "What is the proper technique for going down a steep hill?",
        options: ["Use brakes continuously", "Use engine braking", "Coast in neutral", "Use cruise control"],
        correctAnswer: "Use engine braking",
        explanation: "Engine braking prevents brake overheating and maintains better control.",
      },
      {
        categoryId: 1,
        question: "When should you use low beam headlights?",
        options: ["Only at night", "In fog and rain", "During dawn and dusk", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Low beams should be used whenever visibility is reduced.",
      },
      {
        categoryId: 1,
        question: "What is the maximum allowable air pressure loss in one minute with engine off?",
        options: ["1 psi", "2 psi", "3 psi", "4 psi"],
        correctAnswer: "2 psi",
        explanation: "Air pressure should not drop more than 2 psi per minute with engine off.",
      },
      {
        categoryId: 1,
        question: "How should you test your service brakes?",
        options: ["Apply hard while moving", "Test at 5 mph", "Pump the pedal", "Use only in emergency"],
        correctAnswer: "Test at 5 mph",
        explanation: "Service brakes should be tested at low speed (about 5 mph) to ensure they work.",
      },
      {
        categoryId: 1,
        question: "What causes most truck accidents?",
        options: ["Mechanical failure", "Driver error", "Weather conditions", "Road conditions"],
        correctAnswer: "Driver error",
        explanation: "Driver error is the leading cause of truck accidents, making proper training crucial.",
      },
      {
        categoryId: 1,
        question: "When is it acceptable to use a cell phone while driving a CMV?",
        options: ["For business calls only", "With hands-free device", "In emergencies only", "Never while driving"],
        correctAnswer: "Never while driving",
        explanation: "CDL holders are prohibited from using cell phones while driving CMVs.",
      },
      {
        categoryId: 1,
        question: "What should you do if you feel drowsy while driving?",
        options: ["Drink coffee", "Open windows", "Stop and rest", "Turn up radio"],
        correctAnswer: "Stop and rest",
        explanation: "The only safe solution for drowsiness is to stop and get adequate rest.",
      },
      {
        categoryId: 1,
        question: "What is the purpose of the safety valve on air brakes?",
        options: ["Prevent overheating", "Release excess pressure", "Test brake function", "Control air flow"],
        correctAnswer: "Release excess pressure",
        explanation: "The safety valve releases air if system pressure becomes dangerously high.",
      },
      {
        categoryId: 1,
        question: "How should cargo be secured?",
        options: ["Tightly packed only", "With proper tie-downs", "Weight distributed evenly", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Proper cargo securement requires tight packing, tie-downs, and even weight distribution.",
      },
      {
        categoryId: 1,
        question: "What is the minimum number of tie-downs required for cargo up to 10 feet long?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "2",
        explanation: "Cargo up to 10 feet long requires a minimum of 2 tie-downs.",
      },
      {
        categoryId: 1,
        question: "When should you check your cargo securement?",
        options: ["Before starting", "Every 3 hours", "After 50 miles", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Cargo securement should be checked before starting, after 50 miles, and every 3 hours.",
      },
      {
        categoryId: 1,
        question: "What is the maximum gross vehicle weight for a CDL Class A license?",
        options: ["26,000 lbs", "26,001 lbs", "No limit", "80,000 lbs"],
        correctAnswer: "No limit",
        explanation: "CDL Class A has no upper weight limit for the combination vehicle.",
      },
      {
        categoryId: 1,
        question: "How should you handle a tire blowout?",
        options: ["Brake immediately", "Hold steering wheel firmly", "Accelerate quickly", "Turn sharply"],
        correctAnswer: "Hold steering wheel firmly",
        explanation: "During a blowout, hold the steering wheel firmly and gradually slow down.",
      },
      {
        categoryId: 1,
        question: "What is required when crossing railroad tracks?",
        options: ["Stop and look", "Honk horn", "Turn on flashers", "Stop completely"],
        correctAnswer: "Stop completely",
        explanation: "All commercial vehicles must stop completely before crossing railroad tracks.",
      },
      {
        categoryId: 1,
        question: "When should you use jake brakes or engine retarders?",
        options: ["Always when slowing", "Never in city limits", "Only on highways", "When conditions permit"],
        correctAnswer: "When conditions permit",
        explanation: "Jake brakes should be used only when conditions and local laws permit.",
      },
      {
        categoryId: 1,
        question: "What is the purpose of the pre-trip inspection?",
        options: ["Legal requirement only", "Find defects before driving", "Company policy", "Insurance requirement"],
        correctAnswer: "Find defects before driving",
        explanation: "Pre-trip inspections identify defects that could cause accidents or breakdowns.",
      },
      {
        categoryId: 1,
        question: "How should you adjust mirrors?",
        options: ["See entire trailer", "Minimize blind spots", "See rear bumper", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Proper mirror adjustment involves seeing the trailer, minimizing blind spots, and seeing the rear.",
      },
      {
        categoryId: 1,
        question: "What should you do in dense fog?",
        options: ["Use high beams", "Pull over and stop", "Follow other vehicles closely", "Drive slower"],
        correctAnswer: "Pull over and stop",
        explanation: "In dense fog, it's safest to pull over and wait for conditions to improve.",
      },
      {
        categoryId: 1,
        question: "When is a vehicle inspection report required?",
        options: ["Only if defects found", "Every trip", "Weekly", "Monthly"],
        correctAnswer: "Every trip",
        explanation: "A vehicle inspection report must be completed after every trip.",
      },
      {
        categoryId: 1,
        question: "What is the maximum penalty for a first-time serious traffic violation in a CMV?",
        options: ["30-day disqualification", "60-day disqualification", "90-day disqualification", "1-year disqualification"],
        correctAnswer: "60-day disqualification",
        explanation: "A first serious traffic violation results in 60-day CDL disqualification.",
      },

      // Documentation (40 questions)
      {
        categoryId: 2,
        question: "How long must you keep your logbook records?",
        options: ["30 days", "60 days", "6 months", "1 year"],
        correctAnswer: "6 months",
        explanation: "DOT regulations require logbook records to be kept for at least 6 months.",
      },
      {
        categoryId: 2,
        question: "What information must be included in a logbook entry?",
        options: ["Date and time only", "Miles driven only", "Duty status changes", "Fuel purchases"],
        correctAnswer: "Duty status changes",
        explanation: "Logbooks must record all changes in duty status with times and locations.",
      },
      {
        categoryId: 2,
        question: "When must a bill of lading be prepared?",
        options: ["For every shipment", "Only for hazardous materials", "Only for interstate travel", "Only when requested"],
        correctAnswer: "For every shipment",
        explanation: "A bill of lading is required for every commercial shipment as proof of contract.",
      },
      {
        categoryId: 2,
        question: "What is required on a shipping paper for hazardous materials?",
        options: ["Weight only", "Proper shipping name", "Driver's license number", "Vehicle identification"],
        correctAnswer: "Proper shipping name",
        explanation: "Hazmat shipping papers must include the proper shipping name, class, and identification number.",
      },
      {
        categoryId: 2,
        question: "How often must Electronic Logging Device (ELD) data be transferred?",
        options: ["Daily", "Weekly", "Upon request", "Monthly"],
        correctAnswer: "Upon request",
        explanation: "ELD data must be transferred to enforcement officials upon request during inspections.",
      },
      {
        categoryId: 2,
        question: "What documents must be carried while operating a CMV?",
        options: ["License only", "Registration only", "License, medical card, logbook", "Insurance card only"],
        correctAnswer: "License, medical card, logbook",
        explanation: "Drivers must carry their CDL, medical certificate, and current logbook.",
      },
      {
        categoryId: 2,
        question: "When can you drive with an expired medical certificate?",
        options: ["Never", "Up to 30 days", "Until next physical", "With doctor's note"],
        correctAnswer: "Never",
        explanation: "Driving with an expired medical certificate is prohibited and results in immediate disqualification.",
      },
      {
        categoryId: 2,
        question: "What must be recorded when going off-duty?",
        options: ["Location only", "Time only", "Time and location", "Reason for going off-duty"],
        correctAnswer: "Time and location",
        explanation: "Both the time and location must be recorded when changing to off-duty status.",
      },
      {
        categoryId: 2,
        question: "How long must vehicle inspection reports be kept?",
        options: ["7 days", "30 days", "90 days", "1 year"],
        correctAnswer: "90 days",
        explanation: "Vehicle inspection reports must be kept on file for 90 days.",
      },
      {
        categoryId: 2,
        question: "What is required for sleeper berth time to count toward off-duty?",
        options: ["At least 2 hours", "At least 8 hours", "Any amount of time", "Must be combined with off-duty"],
        correctAnswer: "At least 8 hours",
        explanation: "Sleeper berth periods must be at least 8 hours to count as off-duty time.",
      },
      {
        categoryId: 2,
        question: "When must shipping papers be within driver's reach?",
        options: ["Always", "Only during loading", "Only at weigh stations", "When carrying hazmat"],
        correctAnswer: "Always",
        explanation: "Shipping papers must always be within immediate reach of the driver.",
      },
      {
        categoryId: 2,
        question: "What information is required on a driver's daily log?",
        options: ["Miles driven", "Fuel consumed", "Duty status", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Daily logs must include duty status, miles driven, and other required information.",
      },
      {
        categoryId: 2,
        question: "How should corrections be made to paper logbooks?",
        options: ["Use white-out", "Cross out and initial", "Start new page", "Use pencil eraser"],
        correctAnswer: "Cross out and initial",
        explanation: "Corrections must be made by crossing out the error and initialing the change.",
      },
      {
        categoryId: 2,
        question: "What is the maximum penalty for falsifying logbook records?",
        options: ["$1,000 fine", "$5,000 fine", "$11,000 fine", "Criminal charges"],
        correctAnswer: "Criminal charges",
        explanation: "Falsifying logbooks can result in criminal charges and severe penalties.",
      },
      {
        categoryId: 2,
        question: "When must a new daily log sheet be started?",
        options: ["Every 12 hours", "Every 24 hours", "At midnight", "When changing duty status"],
        correctAnswer: "At midnight",
        explanation: "A new daily log sheet must be started at midnight (12:01 AM).",
      },
      {
        categoryId: 2,
        question: "What must be included in accident reports?",
        options: ["Date and time", "Weather conditions", "Injuries", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Accident reports must include comprehensive details about the incident.",
      },
      {
        categoryId: 2,
        question: "How long must fuel receipts be kept?",
        options: ["30 days", "90 days", "6 months", "1 year"],
        correctAnswer: "1 year",
        explanation: "Fuel receipts must be kept for one year for tax and regulatory purposes.",
      },
      {
        categoryId: 2,
        question: "What is required when transporting food products?",
        options: ["Special license", "Temperature logs", "Sanitation certificate", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Food transportation requires proper licensing, temperature monitoring, and sanitation.",
      },
      {
        categoryId: 2,
        question: "When must a Commercial Driver's License be renewed?",
        options: ["Every 4 years", "Every 5 years", "Every 8 years", "Varies by state"],
        correctAnswer: "Varies by state",
        explanation: "CDL renewal periods vary by state, typically between 4-8 years.",
      },
      {
        categoryId: 2,
        question: "What information must be on a delivery receipt?",
        options: ["Driver signature", "Delivery time", "Condition of goods", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Delivery receipts must document the complete delivery transaction.",
      },
      {
        categoryId: 2,
        question: "How should hazmat placards be maintained?",
        options: ["Clean and visible", "Weather-resistant", "Properly mounted", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Hazmat placards must be clean, visible, weather-resistant, and properly mounted.",
      },
      {
        categoryId: 2,
        question: "What is required for international border crossings?",
        options: ["Passport", "Commercial documentation", "Customs forms", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Border crossings require proper identification, commercial papers, and customs documentation.",
      },
      {
        categoryId: 2,
        question: "When must Weight and Inspection station stops be recorded?",
        options: ["Never required", "Only if cited", "All stops", "Only random inspections"],
        correctAnswer: "All stops",
        explanation: "All stops at weight and inspection stations should be recorded in logs.",
      },
      {
        categoryId: 2,
        question: "What documentation is required for trailer interchange?",
        options: ["Inspection report", "Equipment receipt", "Insurance verification", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Trailer interchange requires comprehensive documentation for liability protection.",
      },
      {
        categoryId: 2,
        question: "How long must Employment Eligibility Verification (I-9) forms be kept?",
        options: ["1 year", "3 years", "5 years", "Permanently"],
        correctAnswer: "3 years",
        explanation: "I-9 forms must be kept for 3 years after hire or 1 year after termination, whichever is longer.",
      },
      {
        categoryId: 2,
        question: "What is required when carrying livestock?",
        options: ["Health certificates", "Feed documentation", "Water records", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Livestock transportation requires health certificates and proper care documentation.",
      },
      {
        categoryId: 2,
        question: "When must equipment defects be reported?",
        options: ["Immediately", "End of shift", "Next business day", "Within 24 hours"],
        correctAnswer: "Immediately",
        explanation: "Safety-related defects must be reported immediately to prevent accidents.",
      },
      {
        categoryId: 2,
        question: "What information must be on a Uniform Hazardous Waste Manifest?",
        options: ["Generator information", "Transporter details", "Destination facility", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Hazardous waste manifests must track materials from generation to disposal.",
      },
      {
        categoryId: 2,
        question: "How should Electronic Logging Device malfunctions be handled?",
        options: ["Continue using device", "Switch to paper logs", "Stop driving", "Call supervisor"],
        correctAnswer: "Switch to paper logs",
        explanation: "When ELDs malfunction, drivers must switch to paper logs immediately.",
      },
      {
        categoryId: 2,
        question: "What is required for oversize load permits?",
        options: ["Route planning", "Escort vehicles", "Special equipment", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Oversize loads require comprehensive planning, escorts, and special equipment.",
      },
      {
        categoryId: 2,
        question: "When must drug and alcohol test results be recorded?",
        options: ["Only if positive", "All tests", "Random tests only", "Pre-employment only"],
        correctAnswer: "All tests",
        explanation: "All drug and alcohol test results must be documented regardless of outcome.",
      },
      {
        categoryId: 2,
        question: "What documentation is required for equipment leasing?",
        options: ["Lease agreement", "Insurance proof", "Maintenance records", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Equipment leasing requires comprehensive documentation for legal compliance.",
      },
      {
        categoryId: 2,
        question: "How should logbook entries be made for team drivers?",
        options: ["Separate logs", "Shared log", "One driver logs for both", "Electronic only"],
        correctAnswer: "Separate logs",
        explanation: "Each team driver must maintain their own individual logbook.",
      },
      {
        categoryId: 2,
        question: "What is required when carrying controlled substances legally?",
        options: ["DEA registration", "Chain of custody", "Security measures", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Legal controlled substance transport requires registration, documentation, and security.",
      },
      {
        categoryId: 2,
        question: "When must hours of service violations be reported?",
        options: ["Never", "If caught", "Within 24 hours", "Immediately"],
        correctAnswer: "Immediately",
        explanation: "Hours of service violations must be reported immediately to the motor carrier.",
      },
      {
        categoryId: 2,
        question: "What information must be on a certificate of delivery?",
        options: ["Delivery time", "Condition of goods", "Recipient signature", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Delivery certificates must document all aspects of the delivery transaction.",
      },
      {
        categoryId: 2,
        question: "How should vehicle maintenance records be organized?",
        options: ["By date", "By vehicle", "By type of service", "All methods are acceptable"],
        correctAnswer: "All methods are acceptable",
        explanation: "Maintenance records can be organized by various methods as long as they're accessible.",
      },
      {
        categoryId: 2,
        question: "What is required for cross-border freight documentation?",
        options: ["Commercial invoice", "Packing list", "Country of origin", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "International freight requires comprehensive customs and commercial documentation.",
      },
      {
        categoryId: 2,
        question: "When must Annual DOT Inspections be completed?",
        options: ["Every 6 months", "Every 12 months", "Every 18 months", "Every 24 months"],
        correctAnswer: "Every 12 months",
        explanation: "Annual DOT inspections must be completed every 12 months for commercial vehicles.",
      },
      {
        categoryId: 2,
        question: "What records must be available during DOT audits?",
        options: ["Driver logs", "Vehicle maintenance", "Drug testing records", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "DOT audits can examine all aspects of carrier operations and records.",
      },

      // Road Terminology (45 questions)
      {
        categoryId: 3,
        question: "What does a yellow diamond-shaped sign typically indicate?",
        options: ["Stop required", "Warning or caution", "Speed limit", "No parking"],
        correctAnswer: "Warning or caution",
        explanation: "Yellow diamond signs warn drivers of potential hazards or changing road conditions.",
      },
      {
        categoryId: 3,
        question: "What does a red octagonal sign mean?",
        options: ["Yield", "Stop", "Do not enter", "Wrong way"],
        correctAnswer: "Stop",
        explanation: "Red octagonal signs always mean stop and come to a complete halt.",
      },
      {
        categoryId: 3,
        question: "What is the meaning of a white rectangular sign with black text?",
        options: ["Warning", "Regulatory", "Guide information", "Construction"],
        correctAnswer: "Regulatory",
        explanation: "White rectangular signs with black text indicate regulatory information or laws.",
      },
      {
        categoryId: 3,
        question: "What does a green sign typically indicate?",
        options: ["Warning", "Stop", "Distance and direction", "Construction zone"],
        correctAnswer: "Distance and direction",
        explanation: "Green signs provide distance and direction information for travel guidance.",
      },
      {
        categoryId: 3,
        question: "What is the shape of a yield sign?",
        options: ["Circle", "Triangle pointing down", "Diamond", "Rectangle"],
        correctAnswer: "Triangle pointing down",
        explanation: "Yield signs are triangular shaped with the point facing downward.",
      },
      {
        categoryId: 3,
        question: "What does a blue sign typically indicate?",
        options: ["Warning", "Services and facilities", "Speed limit", "Hazard ahead"],
        correctAnswer: "Services and facilities",
        explanation: "Blue signs indicate services like rest areas, gas stations, and facilities.",
      },
      {
        categoryId: 3,
        question: "What is an interchange?",
        options: ["Railroad crossing", "Bridge", "Connection between highways", "Toll booth"],
        correctAnswer: "Connection between highways",
        explanation: "An interchange is where two or more highways connect with ramps for traffic flow.",
      },
      {
        categoryId: 3,
        question: "What is a cloverleaf intersection?",
        options: ["Four-way stop", "Traffic circle", "Highway interchange design", "Railroad crossing"],
        correctAnswer: "Highway interchange design",
        explanation: "A cloverleaf is a highway interchange design with loop ramps resembling a four-leaf clover.",
      },
      {
        categoryId: 3,
        question: "What does 'right-of-way' mean?",
        options: ["Right to drive fast", "Legal right to proceed", "Right side of road", "Emergency vehicle path"],
        correctAnswer: "Legal right to proceed",
        explanation: "Right-of-way is the legal right to proceed first in traffic situations.",
      },
      {
        categoryId: 3,
        question: "What is a merge area?",
        options: ["Passing zone", "Where traffic combines", "Parking area", "Construction zone"],
        correctAnswer: "Where traffic combines",
        explanation: "A merge area is where traffic from different roadways combines into one.",
      },
      {
        categoryId: 3,
        question: "What is the shoulder of a road?",
        options: ["Center divider", "Edge area for emergencies", "Passing lane", "Bike path"],
        correctAnswer: "Edge area for emergencies",
        explanation: "The shoulder is the edge area of a road used for emergencies and breakdowns.",
      },
      {
        categoryId: 3,
        question: "What is a roundabout?",
        options: ["Square intersection", "Circular intersection", "Highway on-ramp", "Parking area"],
        correctAnswer: "Circular intersection",
        explanation: "A roundabout is a circular intersection where traffic flows in one direction around a center island.",
      },
      {
        categoryId: 3,
        question: "What does 'No Zone' refer to?",
        options: ["Parking restriction", "Truck blind spots", "Speed limit area", "Construction zone"],
        correctAnswer: "Truck blind spots",
        explanation: "No Zones are the blind spot areas around large trucks where cars disappear from view.",
      },
      {
        categoryId: 3,
        question: "What is a weigh station?",
        options: ["Gas station", "Rest area", "Truck inspection facility", "Toll booth"],
        correctAnswer: "Truck inspection facility",
        explanation: "Weigh stations check truck weights and conduct safety inspections.",
      },
      {
        categoryId: 3,
        question: "What is an overpass?",
        options: ["Bridge over water", "Bridge over road", "Tunnel", "Railroad crossing"],
        correctAnswer: "Bridge over road",
        explanation: "An overpass is a bridge that carries one road over another road.",
      },
      {
        categoryId: 3,
        question: "What is an underpass?",
        options: ["Bridge", "Road under a bridge", "Tunnel through hill", "Subway"],
        correctAnswer: "Road under a bridge",
        explanation: "An underpass is a road that goes under a bridge or overpass.",
      },
      {
        categoryId: 3,
        question: "What is a frontage road?",
        options: ["Main highway", "Side road parallel to highway", "Exit ramp", "Entrance ramp"],
        correctAnswer: "Side road parallel to highway",
        explanation: "A frontage road runs parallel to a highway and provides access to adjacent properties.",
      },
      {
        categoryId: 3,
        question: "What does 'grade' mean in trucking terms?",
        options: ["Quality rating", "Slope of road", "Speed limit", "Weight limit"],
        correctAnswer: "Slope of road",
        explanation: "Grade refers to the steepness or slope of a road, usually expressed as a percentage.",
      },
      {
        categoryId: 3,
        question: "What is a truck route?",
        options: ["Any road", "Designated path for trucks", "Emergency route", "Construction detour"],
        correctAnswer: "Designated path for trucks",
        explanation: "Truck routes are designated roads that trucks are required or encouraged to use.",
      },
      {
        categoryId: 3,
        question: "What is a runaway truck ramp?",
        options: ["Loading dock", "Emergency escape route", "Weigh station", "Rest area"],
        correctAnswer: "Emergency escape route",
        explanation: "Runaway truck ramps provide emergency stopping areas for trucks with brake problems.",
      },
      {
        categoryId: 3,
        question: "What does 'clearance' refer to?",
        options: ["Speed limit", "Weight limit", "Height limit", "Width limit"],
        correctAnswer: "Height limit",
        explanation: "Clearance typically refers to the maximum height allowed under bridges and overpasses.",
      },
      {
        categoryId: 3,
        question: "What is a chicane?",
        options: ["Straight road", "S-shaped curves", "Traffic circle", "Railroad crossing"],
        correctAnswer: "S-shaped curves",
        explanation: "A chicane is a series of S-shaped curves designed to slow traffic.",
      },
      {
        categoryId: 3,
        question: "What is a median?",
        options: ["Center divider", "Shoulder", "Exit ramp", "Merge lane"],
        correctAnswer: "Center divider",
        explanation: "A median is the center divider that separates opposing traffic lanes.",
      },
      {
        categoryId: 3,
        question: "What does 'arterial road' mean?",
        options: ["Small street", "Major traffic-carrying road", "Dead-end street", "Private road"],
        correctAnswer: "Major traffic-carrying road",
        explanation: "Arterial roads are major roads designed to carry large volumes of traffic.",
      },
      {
        categoryId: 3,
        question: "What is a collector road?",
        options: ["Toll road", "Road connecting arterials to local streets", "Highway", "Private road"],
        correctAnswer: "Road connecting arterials to local streets",
        explanation: "Collector roads connect arterial roads to local streets and neighborhoods.",
      },
      {
        categoryId: 3,
        question: "What does 'HOV lane' stand for?",
        options: ["Heavy Overweight Vehicle", "High Occupancy Vehicle", "Highway Official Vehicle", "Hazardous Operations Vehicle"],
        correctAnswer: "High Occupancy Vehicle",
        explanation: "HOV lanes are reserved for vehicles with multiple occupants to reduce traffic congestion.",
      },
      {
        categoryId: 3,
        question: "What is a contraflow lane?",
        options: ["Normal traffic lane", "Lane with reversed traffic direction", "Parking lane", "Emergency lane"],
        correctAnswer: "Lane with reversed traffic direction",
        explanation: "Contraflow lanes temporarily reverse direction to manage traffic flow during events or construction.",
      },
      {
        categoryId: 3,
        question: "What does 'bottleneck' mean in traffic terms?",
        options: ["Traffic signal", "Point where traffic slows", "Parking area", "Rest stop"],
        correctAnswer: "Point where traffic slows",
        explanation: "A bottleneck is a point where traffic flow is restricted, causing congestion.",
      },
      {
        categoryId: 3,
        question: "What is a jersey barrier?",
        options: ["Traffic cone", "Concrete traffic divider", "Speed bump", "Road sign"],
        correctAnswer: "Concrete traffic divider",
        explanation: "Jersey barriers are concrete dividers used to separate traffic lanes or protect work zones.",
      },
      {
        categoryId: 3,
        question: "What does 'zipper merge' mean?",
        options: ["Lane change", "Alternating merge pattern", "Emergency stop", "U-turn"],
        correctAnswer: "Alternating merge pattern",
        explanation: "Zipper merge is when vehicles from two lanes alternate merging into one lane.",
      },
      {
        categoryId: 3,
        question: "What is a gore area?",
        options: ["Triangular area between ramps", "Parking zone", "Loading area", "Rest stop"],
        correctAnswer: "Triangular area between ramps",
        explanation: "The gore area is the triangular space between highway lanes and entrance/exit ramps.",
      },
      {
        categoryId: 3,
        question: "What does 'MUTCD' stand for?",
        options: ["Manual of Traffic Control Devices", "Motor Unit Testing and Control Department", "Municipal Transportation Code Department", "Multi-Use Traffic Control Document"],
        correctAnswer: "Manual of Traffic Control Devices",
        explanation: "MUTCD is the Manual on Uniform Traffic Control Devices, which standardizes road signs and markings.",
      },
      {
        categoryId: 3,
        question: "What is a travel lane?",
        options: ["Emergency lane", "Lane for normal traffic flow", "Passing lane", "Breakdown lane"],
        correctAnswer: "Lane for normal traffic flow",
        explanation: "Travel lanes are the normal traffic lanes used for regular driving.",
      },
      {
        categoryId: 3,
        question: "What does 'curb weight' refer to?",
        options: ["Weight of cargo", "Weight of empty vehicle", "Weight limit", "Tire pressure"],
        correctAnswer: "Weight of empty vehicle",
        explanation: "Curb weight is the weight of a vehicle without cargo or passengers.",
      },
      {
        categoryId: 3,
        question: "What is a truck stop?",
        options: ["Weigh station", "Commercial fuel and service facility", "Loading dock", "Inspection station"],
        correctAnswer: "Commercial fuel and service facility",
        explanation: "Truck stops are commercial facilities providing fuel, food, and services for truck drivers.",
      },
      {
        categoryId: 3,
        question: "What does 'dead-head' mean in trucking?",
        options: ["Broken headlight", "Driving without cargo", "Traffic violation", "Mechanical problem"],
        correctAnswer: "Driving without cargo",
        explanation: "Dead-heading refers to driving a truck without carrying any paying cargo.",
      },
      {
        categoryId: 3,
        question: "What is a drop-and-hook operation?",
        options: ["Backing maneuver", "Trailer exchange method", "Loading technique", "Parking procedure"],
        correctAnswer: "Trailer exchange method",
        explanation: "Drop-and-hook involves dropping off one trailer and picking up another pre-loaded trailer.",
      },
      {
        categoryId: 3,
        question: "What does 'bobtail' mean?",
        options: ["Short trailer", "Truck without trailer", "Small truck", "Damaged trailer"],
        correctAnswer: "Truck without trailer",
        explanation: "Bobtail refers to a truck tractor operating without a trailer attached.",
      },
      {
        categoryId: 3,
        question: "What is a fifth wheel in trucking terms?",
        options: ["Extra tire", "Coupling device", "Navigation system", "Safety equipment"],
        correctAnswer: "Coupling device",
        explanation: "The fifth wheel is the coupling device that connects the truck tractor to the trailer.",
      },
      {
        categoryId: 3,
        question: "What does 'LTL' stand for in freight terms?",
        options: ["Less Than Load", "Light Transport License", "Local Traffic Law", "Long Term Lease"],
        correctAnswer: "Less Than Load",
        explanation: "LTL stands for Less Than Truckload, referring to shipments that don't fill an entire trailer.",
      },
      {
        categoryId: 3,
        question: "What is a reefer truck?",
        options: ["Flatbed truck", "Refrigerated truck", "Dump truck", "Tanker truck"],
        correctAnswer: "Refrigerated truck",
        explanation: "A reefer truck is a refrigerated truck used to transport temperature-sensitive cargo.",
      },
      {
        categoryId: 3,
        question: "What does 'gross weight' include?",
        options: ["Vehicle weight only", "Cargo weight only", "Vehicle plus cargo weight", "Driver weight only"],
        correctAnswer: "Vehicle plus cargo weight",
        explanation: "Gross weight includes the combined weight of the vehicle, cargo, fuel, and driver.",
      },
      {
        categoryId: 3,
        question: "What is a tandems in trucking?",
        options: ["Two drivers", "Two trailers", "Axle group", "Two loads"],
        correctAnswer: "Axle group",
        explanation: "Tandems refer to a group of axles, typically two axles placed close together.",
      },
      {
        categoryId: 3,
        question: "What does 'cross-dock' mean?",
        options: ["Bridge crossing", "Direct transfer of goods", "Parking technique", "Loading method"],
        correctAnswer: "Direct transfer of goods",
        explanation: "Cross-docking involves transferring goods directly from inbound to outbound trucks with minimal storage.",
      },
      {
        categoryId: 3,
        question: "What is a king pin?",
        options: ["Important person", "Trailer connection pin", "Safety device", "Locking mechanism"],
        correctAnswer: "Trailer connection pin",
        explanation: "The king pin is the large pin on a trailer that connects to the fifth wheel on the truck.",
      },

      // Vehicle Operations (35 questions)
      {
        categoryId: 4,
        question: "What is the proper procedure for starting a diesel engine in cold weather?",
        options: ["Start immediately", "Use glow plugs/block heater", "Rev engine immediately", "Add cold weather fuel"],
        correctAnswer: "Use glow plugs/block heater",
        explanation: "Cold weather starting requires glow plugs or block heaters to warm the engine properly.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of a differential lock?",
        options: ["Lock steering", "Prevent wheel spin", "Lock brakes", "Lock transmission"],
        correctAnswer: "Prevent wheel spin",
        explanation: "Differential locks prevent wheel spin by forcing both wheels on an axle to turn at the same speed.",
      },
      {
        categoryId: 4,
        question: "When should you use engine braking?",
        options: ["Only in emergencies", "On steep downgrades", "Never", "Only at high speeds"],
        correctAnswer: "On steep downgrades",
        explanation: "Engine braking is most effective and important on steep downgrades to control speed.",
      },
      {
        categoryId: 4,
        question: "What is the correct way to test air brakes?",
        options: ["Visual inspection only", "Apply and release", "Check pressure gauge", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Air brake testing requires visual inspection, application test, and pressure gauge monitoring.",
      },
      {
        categoryId: 4,
        question: "What should you do if the low air pressure warning comes on?",
        options: ["Continue driving carefully", "Stop safely and fix problem", "Drive to nearest shop", "Ignore if brakes work"],
        correctAnswer: "Stop safely and fix problem",
        explanation: "Low air pressure warnings require immediate attention - stop safely and address the problem.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of a turbocharger?",
        options: ["Cool engine", "Increase power", "Reduce emissions", "Save fuel"],
        correctAnswer: "Increase power",
        explanation: "Turbochargers force more air into the engine, increasing power output.",
      },
      {
        categoryId: 4,
        question: "When should you check engine oil level?",
        options: ["While engine running", "Immediately after stopping", "After engine cools", "Once a month"],
        correctAnswer: "After engine cools",
        explanation: "Oil level should be checked after the engine has cooled for accurate measurement.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of the exhaust brake?",
        options: ["Reduce emissions", "Cool exhaust", "Engine braking", "Increase power"],
        correctAnswer: "Engine braking",
        explanation: "Exhaust brakes create backpressure to provide engine braking assistance.",
      },
      {
        categoryId: 4,
        question: "What should coolant temperature typically be during operation?",
        options: ["160-180°F", "180-200°F", "200-220°F", "220-240°F"],
        correctAnswer: "180-200°F",
        explanation: "Normal engine coolant temperature should be between 180-200°F during operation.",
      },
      {
        categoryId: 4,
        question: "What is the correct tire inflation pressure procedure?",
        options: ["Check when tires are hot", "Check when tires are cold", "Check anytime", "Estimate by appearance"],
        correctAnswer: "Check when tires are cold",
        explanation: "Tire pressure should be checked when tires are cold for accurate readings.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of the DEF (Diesel Exhaust Fluid) system?",
        options: ["Increase power", "Reduce emissions", "Cool engine", "Lubricate engine"],
        correctAnswer: "Reduce emissions",
        explanation: "DEF systems reduce harmful NOx emissions from diesel engines.",
      },
      {
        categoryId: 4,
        question: "When should transmission fluid be checked?",
        options: ["Engine off", "Engine running, transmission warm", "Anytime", "Only when problems occur"],
        correctAnswer: "Engine running, transmission warm",
        explanation: "Automatic transmission fluid should be checked with engine running and transmission warm.",
      },
      {
        categoryId: 4,
        question: "What causes tire blowouts?",
        options: ["Overinflation", "Underinflation", "Overheating", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Tire blowouts can be caused by overinflation, underinflation, or overheating.",
      },
      {
        categoryId: 4,
        question: "What is the proper procedure for coupling a trailer?",
        options: ["Back up quickly", "Line up slowly and check connection", "Let air out of suspension", "Use maximum backing speed"],
        correctAnswer: "Line up slowly and check connection",
        explanation: "Proper coupling requires slow, careful alignment and thorough connection verification.",
      },
      {
        categoryId: 4,
        question: "What should you do if you experience a steering tire blowout?",
        options: ["Brake hard immediately", "Hold steering wheel firmly", "Turn sharply", "Accelerate"],
        correctAnswer: "Hold steering wheel firmly",
        explanation: "During a steering tire blowout, hold the wheel firmly and gradually slow down.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of anti-lock brakes (ABS)?",
        options: ["Stop faster", "Prevent wheel lockup", "Reduce brake wear", "Increase brake power"],
        correctAnswer: "Prevent wheel lockup",
        explanation: "ABS prevents wheel lockup during hard braking, maintaining steering control.",
      },
      {
        categoryId: 4,
        question: "When should you replace windshield wipers?",
        options: ["Every year", "When they streak", "Every 6 months", "Only when broken"],
        correctAnswer: "When they streak",
        explanation: "Windshield wipers should be replaced when they begin streaking or leave uncleared areas.",
      },
      {
        categoryId: 4,
        question: "What is the correct procedure for uncoupling a trailer?",
        options: ["Disconnect electrical first", "Lower landing gear first", "Release fifth wheel first", "Pull pin and drive away"],
        correctAnswer: "Lower landing gear first",
        explanation: "Always lower the landing gear before disconnecting the trailer to prevent damage.",
      },
      {
        categoryId: 4,
        question: "What should you check in the engine compartment during pre-trip?",
        options: ["Fluid levels only", "Belts and hoses only", "Battery only", "All engine components"],
        correctAnswer: "All engine components",
        explanation: "Pre-trip engine compartment inspection should cover all visible components and systems.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of a retarder?",
        options: ["Slow acceleration", "Auxiliary braking", "Reduce engine speed", "Delay shifting"],
        correctAnswer: "Auxiliary braking",
        explanation: "Retarders provide additional braking power without using the service brakes.",
      },
      {
        categoryId: 4,
        question: "When should you check air compressor belt?",
        options: ["During pre-trip inspection", "Monthly", "When air pressure is low", "Annually"],
        correctAnswer: "During pre-trip inspection",
        explanation: "The air compressor belt should be checked during every pre-trip inspection.",
      },
      {
        categoryId: 4,
        question: "What causes most air brake problems?",
        options: ["Electrical issues", "Water and oil contamination", "Worn brake pads", "Cold weather"],
        correctAnswer: "Water and oil contamination",
        explanation: "Water and oil contamination are the leading causes of air brake system problems.",
      },
      {
        categoryId: 4,
        question: "What is the proper following distance calculation method?",
        options: ["Car lengths", "Time-based method", "Distance markers", "Speed-based formula"],
        correctAnswer: "Time-based method",
        explanation: "The time-based method (seconds between vehicles) is most accurate for following distance.",
      },
      {
        categoryId: 4,
        question: "When should you drain air tanks?",
        options: ["Weekly", "Daily", "Monthly", "When pressure drops"],
        correctAnswer: "Daily",
        explanation: "Air tanks should be drained daily to remove moisture and contaminants.",
      },
      {
        categoryId: 4,
        question: "What is the correct way to check slack adjusters?",
        options: ["Visual inspection only", "Apply brakes and measure movement", "Check with engine off", "Use special tools"],
        correctAnswer: "Apply brakes and measure movement",
        explanation: "Slack adjusters should be checked by applying brakes and measuring the movement.",
      },
      {
        categoryId: 4,
        question: "What should you do if oil pressure drops while driving?",
        options: ["Continue to destination", "Stop immediately", "Check oil level while driving", "Reduce speed only"],
        correctAnswer: "Stop immediately",
        explanation: "Loss of oil pressure requires immediate stopping to prevent catastrophic engine damage.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of the cooling system thermostat?",
        options: ["Prevent overheating", "Control coolant flow", "Monitor temperature", "Pressurize system"],
        correctAnswer: "Control coolant flow",
        explanation: "The thermostat controls coolant flow to maintain proper engine operating temperature.",
      },
      {
        categoryId: 4,
        question: "When should you use four-way flashers?",
        options: ["In heavy traffic", "When driving slowly", "When stopped or moving very slowly", "In construction zones"],
        correctAnswer: "When stopped or moving very slowly",
        explanation: "Four-way flashers should be used when stopped or moving much slower than traffic.",
      },
      {
        categoryId: 4,
        question: "What is the correct procedure for testing parking brakes?",
        options: ["Set and try to move forward", "Visual inspection only", "Check air pressure", "Test while driving"],
        correctAnswer: "Set and try to move forward",
        explanation: "Parking brakes should be tested by setting them and attempting to move the vehicle.",
      },
      {
        categoryId: 4,
        question: "What should you do if the engine overheats?",
        options: ["Continue driving slowly", "Turn on heater", "Stop and let cool", "Add cold water immediately"],
        correctAnswer: "Stop and let cool",
        explanation: "Engine overheating requires immediate stopping and allowing the engine to cool down.",
      },
      {
        categoryId: 4,
        question: "What is the purpose of a fifth wheel slide?",
        options: ["Adjust trailer height", "Distribute weight", "Lock trailer", "Improve turning"],
        correctAnswer: "Distribute weight",
        explanation: "Fifth wheel slides allow adjustment of weight distribution between axles.",
      },
      {
        categoryId: 4,
        question: "When should you check trailer brake connections?",
        options: ["Weekly", "During coupling", "Monthly", "Before each trip"],
        correctAnswer: "During coupling",
        explanation: "Trailer brake connections should be checked every time you couple a trailer.",
      },
      {
        categoryId: 4,
        question: "What causes jackknifing?",
        options: ["Trailer brakes locking", "Tractor brakes locking", "Loss of traction", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Jackknifing can be caused by brake lockup on either unit or loss of traction.",
      },
      {
        categoryId: 4,
        question: "What is the correct way to use compression release brakes?",
        options: ["Use continuously", "Use on dry pavement only", "Use when conditions allow", "Never use"],
        correctAnswer: "Use when conditions allow",
        explanation: "Compression release brakes should be used when road and weather conditions allow.",
      },
      {
        categoryId: 4,
        question: "What should you do if trailer wheels start to skid?",
        options: ["Apply more brakes", "Release brakes", "Turn steering wheel", "Stop immediately"],
        correctAnswer: "Release brakes",
        explanation: "If trailer wheels skid, release the brakes to allow wheels to regain traction.",
      },

      // Loading & Cargo (30 questions)
      {
        categoryId: 5,
        question: "What is the maximum gross vehicle weight for most highways?",
        options: ["70,000 lbs", "80,000 lbs", "90,000 lbs", "100,000 lbs"],
        correctAnswer: "80,000 lbs",
        explanation: "Federal regulations limit gross vehicle weight to 80,000 lbs on most interstate highways.",
      },
      {
        categoryId: 5,
        question: "What is the maximum weight allowed on a single axle?",
        options: ["20,000 lbs", "34,000 lbs", "12,000 lbs", "25,000 lbs"],
        correctAnswer: "20,000 lbs",
        explanation: "Single axles are limited to 20,000 lbs under federal weight regulations.",
      },
      {
        categoryId: 5,
        question: "What is the maximum weight allowed on tandem axles?",
        options: ["30,000 lbs", "34,000 lbs", "40,000 lbs", "32,000 lbs"],
        correctAnswer: "34,000 lbs",
        explanation: "Tandem axles are limited to 34,000 lbs under federal weight regulations.",
      },
      {
        categoryId: 5,
        question: "How should cargo weight be distributed?",
        options: ["Front heavy", "Rear heavy", "Evenly distributed", "Top heavy"],
        correctAnswer: "Evenly distributed",
        explanation: "Cargo should be distributed evenly to maintain vehicle stability and control.",
      },
      {
        categoryId: 5,
        question: "What is the minimum number of tie-downs for cargo up to 10 feet long?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "2",
        explanation: "Cargo up to 10 feet long requires a minimum of 2 tie-downs regardless of weight.",
      },
      {
        categoryId: 5,
        question: "How often should cargo securement be checked?",
        options: ["Once before departure", "Every 3 hours or 150 miles", "Only at destination", "When problems suspected"],
        correctAnswer: "Every 3 hours or 150 miles",
        explanation: "Cargo securement must be checked within the first 50 miles and then every 3 hours or 150 miles.",
      },
      {
        categoryId: 5,
        question: "What is the working load limit for a tie-down?",
        options: ["Maximum weight it can hold", "Half the breaking strength", "Double the breaking strength", "Weight of the cargo"],
        correctAnswer: "Half the breaking strength",
        explanation: "Working load limit is typically half the breaking strength to provide a safety margin.",
      },
      {
        categoryId: 5,
        question: "What type of cargo requires special securement?",
        options: ["Heavy machinery", "Logs", "Steel coils", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Heavy machinery, logs, and steel coils all require specific securement methods.",
      },
      {
        categoryId: 5,
        question: "Where should the heaviest cargo be placed?",
        options: ["As high as possible", "As low as possible", "In the middle", "Doesn't matter"],
        correctAnswer: "As low as possible",
        explanation: "Heavy cargo should be placed as low as possible to lower the center of gravity.",
      },
      {
        categoryId: 5,
        question: "What is the bridge formula used for?",
        options: ["Bridge clearance", "Weight distribution limits", "Turning radius", "Speed limits"],
        correctAnswer: "Weight distribution limits",
        explanation: "The bridge formula determines legal weight limits based on axle spacing.",
      },
      {
        categoryId: 5,
        question: "What is required when hauling hazardous materials?",
        options: ["Special placards", "Hazmat endorsement", "Shipping papers", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Hazmat loads require placards, endorsement, and proper shipping papers.",
      },
      {
        categoryId: 5,
        question: "How should palletized cargo be secured?",
        options: ["Straps only", "Shrink wrap only", "Proper blocking and tie-downs", "No securement needed"],
        correctAnswer: "Proper blocking and tie-downs",
        explanation: "Palletized cargo requires proper blocking and tie-downs to prevent shifting.",
      },
      {
        categoryId: 5,
        question: "What is the purpose of blocking in cargo securement?",
        options: ["Prevent forward movement", "Prevent rearward movement", "Prevent side-to-side movement", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Blocking prevents cargo movement in all directions during transport.",
      },
      {
        categoryId: 5,
        question: "What should you do if cargo shifts during transport?",
        options: ["Continue carefully", "Stop and re-secure", "Report at destination", "Drive slower"],
        correctAnswer: "Stop and re-secure",
        explanation: "Shifted cargo must be re-secured immediately to prevent accidents.",
      },
      {
        categoryId: 5,
        question: "What is the aggregate working load limit rule?",
        options: ["Total tie-down strength must equal cargo weight", "Total tie-down strength must be half cargo weight", "Each tie-down must equal cargo weight", "No specific requirement"],
        correctAnswer: "Total tie-down strength must equal cargo weight",
        explanation: "The total working load limit of tie-downs must equal at least the weight of cargo.",
      },
      {
        categoryId: 5,
        question: "How should steel coils be transported?",
        options: ["Lying flat", "Standing upright", "Either position with proper securement", "No special requirements"],
        correctAnswer: "Either position with proper securement",
        explanation: "Steel coils can be transported in either position but require specific securement methods.",
      },
      {
        categoryId: 5,
        question: "What is required for oversized loads?",
        options: ["Special permits", "Escort vehicles", "Route restrictions", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Oversized loads require permits, escorts, and must follow designated routes.",
      },
      {
        categoryId: 5,
        question: "What is the maximum overhang allowed without permits?",
        options: ["3 feet", "4 feet", "5 feet", "6 feet"],
        correctAnswer: "4 feet",
        explanation: "Most states allow up to 4 feet of rear overhang without special permits.",
      },
      {
        categoryId: 5,
        question: "How should logs be secured on a trailer?",
        options: ["Stakes and chains", "Straps only", "Binders and chains", "Stakes, binders, and chains"],
        correctAnswer: "Stakes, binders, and chains",
        explanation: "Log loads require stakes, binders, and chains for proper securement.",
      },
      {
        categoryId: 5,
        question: "What is the purpose of edge protection in cargo securement?",
        options: ["Protect cargo", "Protect tie-downs", "Improve appearance", "Required by law"],
        correctAnswer: "Protect tie-downs",
        explanation: "Edge protection prevents tie-downs from being cut or damaged by sharp cargo edges.",
      },
      {
        categoryId: 5,
        question: "What should you check when loading liquid tankers?",
        options: ["Weight distribution", "Surge effects", "Baffle systems", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Liquid tankers require attention to weight, surge effects, and baffle systems.",
      },
      {
        categoryId: 5,
        question: "How does liquid surge affect vehicle control?",
        options: ["No effect", "Can cause loss of control", "Improves stability", "Only affects braking"],
        correctAnswer: "Can cause loss of control",
        explanation: "Liquid surge can cause sudden weight shifts that lead to loss of vehicle control.",
      },
      {
        categoryId: 5,
        question: "What is the proper way to load a flatbed trailer?",
        options: ["Load from back to front", "Load from front to back", "Distribute weight evenly", "Load heaviest items first"],
        correctAnswer: "Distribute weight evenly",
        explanation: "Flatbed loading requires even weight distribution to maintain proper axle weights.",
      },
      {
        categoryId: 5,
        question: "What equipment is required for securing metal coils?",
        options: ["Chains only", "Straps only", "Chains and blocking", "Any tie-down method"],
        correctAnswer: "Chains and blocking",
        explanation: "Metal coils require chains and proper blocking due to their weight and shape.",
      },
      {
        categoryId: 5,
        question: "When is a cargo manifest required?",
        options: ["Never", "For hazmat only", "For all commercial loads", "For interstate loads only"],
        correctAnswer: "For all commercial loads",
        explanation: "Cargo manifests document what is being transported and are required for commercial loads.",
      },
      {
        categoryId: 5,
        question: "What is the minimum strength requirement for tie-down equipment?",
        options: ["1,500 lbs working load limit", "500 lbs working load limit", "3,000 lbs breaking strength", "No minimum requirement"],
        correctAnswer: "1,500 lbs working load limit",
        explanation: "Tie-down equipment must have a minimum working load limit of 1,500 lbs.",
      },
      {
        categoryId: 5,
        question: "How should cargo doors be secured during transport?",
        options: ["Locked only", "Sealed only", "Locked and sealed", "No special requirements"],
        correctAnswer: "Locked and sealed",
        explanation: "Cargo doors should be both locked and sealed to prevent tampering and theft.",
      },
      {
        categoryId: 5,
        question: "What is required when transporting automobiles?",
        options: ["Special trailer only", "Wheel chocks", "Tie-down chains", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "Auto transport requires special trailers, wheel chocks, and proper tie-down chains.",
      },
      {
        categoryId: 5,
        question: "What should you do if you notice a tie-down is damaged?",
        options: ["Continue using it", "Replace immediately", "Use extra tie-downs", "Report at destination"],
        correctAnswer: "Replace immediately",
        explanation: "Damaged tie-downs must be replaced immediately as they may fail during transport.",
      },
      {
        categoryId: 5,
        question: "What is the purpose of load securement regulations?",
        options: ["Protect cargo value", "Prevent accidents", "Reduce insurance costs", "Speed up loading"],
        correctAnswer: "Prevent accidents",
        explanation: "Load securement regulations are designed to prevent accidents caused by shifting or falling cargo.",
      },
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
