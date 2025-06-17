import { User, InsertUser, DotCategory, InsertDotCategory, DotQuestion, InsertDotQuestion, PracticeSession, InsertPracticeSession, ChatMessage, InsertChatMessage } from "@shared/schema";

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
      totalSessions: 25,
      dailyReminders: true,
      voicePractice: true,
      sessionDuration: 15,
      darkMode: true,
      createdAt: new Date()
    };
    this.users.set(1, defaultUser);

    // Create categories
    const categories = [
      { id: 1, name: "Safety Regulations", description: "DOT safety requirements and regulations", color: "truck-orange", icon: "shield", questionsCount: 50 },
      { id: 2, name: "Documentation", description: "Required paperwork and permits", color: "truck-blue", icon: "file-text", questionsCount: 40 },
      { id: 3, name: "Road Terminology", description: "Common terms and road signs", color: "green-600", icon: "traffic-cone", questionsCount: 30 },
      { id: 4, name: "Vehicle Operations", description: "Truck operation and maintenance", color: "truck-orange", icon: "truck", questionsCount: 45 },
      { id: 5, name: "Loading & Cargo", description: "Proper loading and cargo handling", color: "truck-blue", questionsCount: 35 },
      { id: 6, name: "Officer Interactions", description: "Professional communication with DOT officers", color: "truck-orange", icon: "shield", questionsCount: 200 }
    ];

    categories.forEach(cat => {
      const category: DotCategory = { 
        id: cat.id,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        questionsCount: cat.questionsCount
      };
      this.dotCategories.set(cat.id, category);
    });

    // Load all 200 officer-driver conversations
    const officerDriverConversations = [
      { officer: "What are you hauling?", driver: "I'm hauling refrigerated meat products for a grocery chain." },
      { officer: "How far are you from your delivery location?", driver: "I'm about 120 miles away from my drop-off point." },
      { officer: "Are your load straps secure?", driver: "Yes, I double-checked all straps before leaving the warehouse." },
      { officer: "When did you last take a break?", driver: "About 30 minutes ago, I stopped at a rest area for lunch." },
      { officer: "Are you hauling perishable goods?", driver: "Yes, I'm transporting frozen vegetables in a reefer trailer." },
      { officer: "What company are you driving for?", driver: "I'm with American Freight Logistics, based in Chicago." },
      { officer: "Are you aware of any violations on your record?", driver: "No, my record is clean for the past two years." },
      { officer: "Are you using a paper log or an ELD?", driver: "I'm using an Electronic Logging Device to track my hours." },
      { officer: "Have you had any alcohol in the last 24 hours?", driver: "No, officer. I haven't consumed any alcohol." },
      { officer: "Is your horn and lighting system working properly?", driver: "Yes, I tested them during my pre-trip inspection." },
      { officer: "Is your speed limiter functioning correctly?", driver: "Yes, it's working as required and set at 65 mph." },
      { officer: "Is your fire extinguisher charged and accessible?", driver: "Yes, it's fully charged and mounted right behind my seat." },
      { officer: "Is your trailer properly sealed?", driver: "Yes, the seal is intact and matches the shipping paperwork." },
      { officer: "Have you had any recent accidents or tickets?", driver: "No, I've had a clean record for over a year now." },
      { officer: "Have you completed your pre-trip inspection today?", driver: "Yes, I checked the tires, lights, brakes, and fluids this morning." },
      { officer: "Did you secure the back door of your trailer?", driver: "Yes, it's locked and sealed properly." },
      { officer: "How long have you been a CDL driver?", driver: "I've been driving commercially for 7 years now." },
      { officer: "Did you encounter any mechanical issues today?", driver: "No issues today, everything has been running smoothly." },
      { officer: "Is your load balanced properly?", driver: "Yes, it was checked and balanced during loading." },
      { officer: "Where did you last refuel?", driver: "I stopped at the Love's truck stop 40 miles back." },
      { officer: "Have you checked your tire pressure today?", driver: "Yes, I used a gauge before starting my shift this morning." },
      { officer: "Do you know your trailer's height and weight?", driver: "Yes, the height is 13 feet 6 inches and weight is 34,000 pounds empty." },
      { officer: "Can you explain what's in your load today?", driver: "Sure, I'm hauling pallets of dry food and packaged goods." },
      { officer: "How long have you been working with your current company?", driver: "I've been with them for about 14 months." },
      { officer: "What time did you start your shift today?", driver: "I began my shift at 6:30 this morning." },
      { officer: "Do you have reflective triangles or flares on board?", driver: "Yes, officer. I keep them stored in the side box." },
      { officer: "Can I see your driver's license and medical certificate?", driver: "Yes, officer. Here are both documents." },
      { officer: "Do you know why I pulled you over?", driver: "I'm not sure, officer. Was I speeding or crossing a line?" },
      { officer: "Are you familiar with the HOS rules?", driver: "Yes, I follow the Hours of Service rules carefully." },
      { officer: "When was your last safety inspection?", driver: "It was done last week before I left the terminal." },
      { officer: "Are you carrying your registration and insurance papers?", driver: "Yes, officer. They're in the glove compartment." },
      { officer: "How long have you been driving today?", driver: "I've been on the road for 5 hours so far today." },
      { officer: "Where are you headed today?", driver: "I'm driving to Houston, Texas to deliver a load of produce." },
      { officer: "Do you have your bill of lading?", driver: "Yes, officer. Here it is, showing pickup and delivery details." },
      { officer: "Do you have a valid medical card?", driver: "Yes, officer. It's in my wallet and still valid for 8 months." },
      { officer: "Do you know what your tire tread depth is?", driver: "Yes, it's above the legal limit—checked this morning." },
      { officer: "Are you hauling any hazardous materials?", driver: "No, this is a dry van with general consumer goods." },
      { officer: "How many hours have you rested in the past 24 hours?", driver: "I've had 10 hours of off-duty rest before starting this trip." },
      { officer: "Do you know your gross vehicle weight?", driver: "Yes, it's about 78,000 pounds loaded." },
      { officer: "Have you been feeling alert during your trip?", driver: "Yes, I'm fully rested and alert, officer." },
      { officer: "Are you carrying any oversized loads today?", driver: "No, officer. This load is within legal size and weight limits." },
      { officer: "Can you show me your emergency contact information?", driver: "Yes, it's listed on the back of my license and in my company profile." },
      { officer: "Is your ELD device synced properly?", driver: "Yes, it's working fine and synced with the vehicle's engine." },
      { officer: "When was your last drug and alcohol test?", driver: "It was two months ago, and I passed with no issues." },
      { officer: "Are you aware of your company's safety rating?", driver: "Yes, we currently hold a satisfactory safety rating from FMCSA." },
      { officer: "Do you have a co-driver today?", driver: "No, officer. I'm driving solo on this trip." },
      { officer: "Can you explain how you handled your cargo securement?", driver: "I used load locks and straps, checked every 150 miles." },
      { officer: "Have you had any recent vehicle repairs?", driver: "Yes, we just replaced the brake pads last week." },
      { officer: "What's your current duty status?", driver: "I'm currently on-duty, not driving." },
      { officer: "Did you review the weather before your route?", driver: "Yes, I checked and there are no alerts for my route." },
      { officer: "Have you inspected your brake system today?", driver: "Yes, I checked for leaks and air pressure levels this morning." },
      { officer: "Is your CDL currently valid and unrestricted?", driver: "Yes, officer. My CDL is valid and without restrictions." },
      { officer: "Do you carry a copy of the Federal Motor Carrier Safety Regulations?", driver: "Yes, I have a digital copy on my tablet." },
      { officer: "How many hours have you driven in the last 7 days?", driver: "I've driven around 42 hours this week." },
      { officer: "Are your mirrors and windows clean and unobstructed?", driver: "Yes, I cleaned all of them before departure today." },
      { officer: "Do you know how to use your fire extinguisher?", driver: "Yes, I've been trained and it's mounted behind my seat." },
      { officer: "Have you reported your last delivery to dispatch?", driver: "Yes, I checked in once I arrived at the receiver." },
      { officer: "Have you had any logbook violations in the past month?", driver: "No, officer. My logs have been in full compliance." },
      { officer: "Do you have an emergency reflective vest?", driver: "Yes, it's stored in the door pocket." },
      { officer: "When was the last time your truck was serviced?", driver: "It was serviced two weeks ago at our company shop." },
      { officer: "What would you do in case of a tire blowout?", driver: "I'd maintain control, pull over safely, and call for roadside help." },
      { officer: "Do you carry a paper backup log?", driver: "Yes, it's in my logbook folder in case the ELD fails." },
      { officer: "Can you describe how your cargo is loaded?", driver: "It's evenly distributed on pallets with load bars in place." },
      { officer: "Are your seat belts functioning correctly?", driver: "Yes, officer. I tested them before leaving the lot." },
      { officer: "Do you have your fuel receipts from the last state?", driver: "Yes, I saved them for IFTA reporting." },
      { officer: "Are you hauling a load that requires placards?", driver: "No, officer. This is a standard dry load." },
      { officer: "Is your air compressor functioning properly?", driver: "Yes, I checked the build-up time this morning." },
      { officer: "Do you know how to perform a leak-down test?", driver: "Yes, I follow DOT steps for that test regularly." },
      { officer: "Are your windshield wipers in good condition?", driver: "Yes, they're new and working well." },
      { officer: "Do you know where your ABS indicator light is?", driver: "Yes, it's on the dashboard and working correctly." },
      { officer: "Have you had any hours-of-service violations this quarter?", driver: "No, officer. I've stayed within all HOS limits." },
      { officer: "Can I see your reefer temperature logs?", driver: "Yes, I have them here in my trip records." },
      { officer: "When was your last load secured inspection?", driver: "It was done this morning at our shipper's dock." },
      { officer: "What's your tire inflation pressure today?", driver: "They're all at 100 PSI as required." },
      { officer: "Are your trailer lights all functional?", driver: "Yes, I confirmed during my pre-trip check." },
      { officer: "Do you have your permit for the oversized load?", driver: "Yes, it's attached to my trip sheet." },
      { officer: "Can I see your IFTA permit?", driver: "Yes, it's displayed inside the driver-side door." },
      { officer: "Do you carry a spill kit in case of leaks?", driver: "Yes, it's in the side equipment box." },
      { officer: "Do you know how to report a crash to FMCSA?", driver: "Yes, we follow our safety manager's protocol and file reports promptly." },
      { officer: "Can you provide your current trip manifest?", driver: "Yes, officer. Here's the manifest outlining all cargo and stops." },
      { officer: "Have you had any maintenance issues in the last month?", driver: "Just a minor issue with a tire, but it was fixed right away." },
      { officer: "Do you have an emergency contact listed with your company?", driver: "Yes, my company has my emergency contact on file." },
      { officer: "Do you carry a reflective vest for roadside inspections?", driver: "Yes, officer. It's stored in my side compartment." },
      { officer: "What's the total mileage for this trip?", driver: "It's about 1,200 miles from start to destination." },
      { officer: "Have you received any warnings this week?", driver: "No, officer. My log is clean for the week." },
      { officer: "Can you show proof of delivery for your last trip?", driver: "Yes, here is the signed delivery receipt from yesterday." },
      { officer: "What kind of brakes does your trailer use?", driver: "It uses air brakes, inspected this morning." },
      { officer: "Did you check your coupling devices today?", driver: "Yes, I inspected the kingpin and fifth wheel during pre-trip." },
      { officer: "How do you handle fatigue while driving long distances?", driver: "I take breaks every few hours and avoid driving when tired." },
      { officer: "How often do you perform full vehicle inspections?", driver: "I do a complete inspection before every trip and mid-trip on long hauls." },
      { officer: "Are your side mirrors adjusted correctly?", driver: "Yes, officer. I adjusted them before leaving the yard." },
      { officer: "Are you familiar with the nearest weigh station?", driver: "Yes, I passed it about 20 miles ago and everything was fine." },
      { officer: "Do you carry a first aid kit?", driver: "Yes, it's stored with the other safety equipment behind my seat." },
      { officer: "Are your turn signals and brake lights working properly?", driver: "Yes, I tested all lights during my inspection today." },
      { officer: "Have you ever had a DOT audit?", driver: "Not personally, but my company undergoes regular audits." },
      { officer: "Are you aware of the current weather advisory for your route?", driver: "Yes, I checked the weather before starting and have chains if needed." },
      { officer: "What's your trailer number?", driver: "It's trailer 40721, officer." },
      { officer: "Do you have a copy of your CDL medical examination report?", driver: "Yes, I have the certificate and the long-form in my folder." },
      { officer: "Do you carry spare fuses for electrical equipment?", driver: "Yes, I keep extra fuses in the dashboard compartment." },
      { officer: "Are you trained in using fire extinguishers?", driver: "Yes, I've completed safety training as part of onboarding." },
      { officer: "What speed were you traveling in the last construction zone?", driver: "I reduced to 45 mph as posted through the zone." },
      { officer: "Have you reviewed your logbook for errors today?", driver: "Yes, I checked everything this morning and it's accurate." },
      { officer: "When did you last attend a safety meeting?", driver: "Two weeks ago at our main terminal." },
      { officer: "Is your CB radio functioning?", driver: "Yes, it's working fine and I use it for traffic updates." },
      { officer: "Can you demonstrate your air brake check?", driver: "Yes, I can perform the air brake test for you now." },
      { officer: "What's the cargo value you're hauling today?", driver: "It's valued at around $85,000 according to the invoice." },
      { officer: "Do you have proof of your last drug test?", driver: "Yes, officer. My company has it on file and I carry a copy." },
      { officer: "What's your current fuel level?", driver: "I have about three-quarters of a tank." },
      { officer: "Have you crossed any state borders on this trip?", driver: "Yes, I've come from Nevada into California." },
      { officer: "Do you carry a spill kit for hazardous materials?", driver: "Yes, although I'm not hauling hazmat today, I have a kit on board." },
      { officer: "Can you show me your annual inspection sticker?", driver: "Yes, it's affixed to the driver-side door frame." },
      { officer: "Do you know the expiration date on your insurance?", driver: "Yes, it expires in three months — September 15th." },
      { officer: "Do you have any dashcam footage from today?", driver: "Yes, the dashcam records continuously and stores 48 hours of footage." },
      { officer: "How do you plan for your rest stops?", driver: "I use my ELD to plan breaks and mark safe rest areas in advance." },
      { officer: "How do you keep in touch with dispatch during your trip?", driver: "I call in every 4 hours and use the Qualcomm system for updates." },
      { officer: "Do you know your vehicle identification number?", driver: "Yes, it's 1XKAD49X0EJ123456." },
      { officer: "Have you had any weight violations in the past year?", driver: "No, officer. I always check weights before leaving the shipper." },
      { officer: "Do you carry emergency food and water supplies?", driver: "Yes, I keep supplies in case of delays or breakdowns." },
      { officer: "Are you familiar with bridge weight restrictions?", driver: "Yes, I check bridge laws and weights for each state I travel through." },
      { officer: "Do you have your hazmat endorsement?", driver: "Yes, it's current and I completed the background check last year." },
      { officer: "Can you show me your logbook from yesterday?", driver: "Yes, officer. Here's yesterday's complete log." },
      { officer: "Do you know the maximum driving time allowed per day?", driver: "Yes, it's 11 hours of driving within a 14-hour window." },
      { officer: "Have you been using any medications that could affect driving?", driver: "No, officer. I'm not taking any medications that would impair driving." },
      { officer: "Are you aware of any recalls on your vehicle?", driver: "No recalls that I'm aware of, and maintenance keeps us updated." },
      { officer: "Do you have a current physical card or just the medical certificate?", driver: "I have both the medical certificate and the long-form physical exam." },
      { officer: "When was your truck last weighed?", driver: "It was weighed yesterday at the shipper's scale." },
      { officer: "Do you know how to properly chain up for winter conditions?", driver: "Yes, I've been trained and carry the proper chains." },
      { officer: "Are you carrying any personal firearms?", driver: "No, officer. I don't carry any weapons." },
      { officer: "Do you have a valid TWIC card?", driver: "Yes, it's current and I use it for port deliveries." },
      { officer: "Can you tell me about your company's safety program?", driver: "We have monthly safety meetings and regular training on new regulations." },
      { officer: "Have you completed your annual recertification?", driver: "Yes, I completed it three months ago." },
      { officer: "Do you know the height of the bridges on your route?", driver: "Yes, I use a GPS that shows bridge heights and have checked my route." },
      { officer: "Are you hauling any refrigerated goods?", driver: "Yes, I'm hauling frozen foods that need to stay at -10 degrees." },
      { officer: "Do you have backup power for your reefer unit?", driver: "Yes, the unit has a backup generator and I carry extra fuel." },
      { officer: "Can you demonstrate your pre-trip inspection process?", driver: "Yes, I can walk you through the complete inspection." },
      { officer: "Do you know what to do if your ELD malfunctions?", driver: "Yes, I switch to paper logs and report the malfunction within 24 hours." },
      { officer: "Are you familiar with the new entry-level driver training rules?", driver: "Yes, although I've been driving for years, I stay updated on new requirements." },
      { officer: "Do you have your Clearinghouse consent on file?", driver: "Yes, my employer has it and I'm enrolled in the system." },
      { officer: "Can you explain your load securement method?", driver: "I use a combination of straps and chains based on the cargo type." },
      { officer: "Do you carry a portable scale for weight checks?", driver: "No, but I know where all the certified scales are on my routes." },
      { officer: "Have you had any moving violations in the past three years?", driver: "No, officer. My record has been clean." },
      { officer: "Do you know your company's out-of-service criteria?", driver: "Yes, we're trained on what conditions would put us out of service." },
      { officer: "Can you show me your fuel tax permits?", driver: "Yes, my IFTA decal is displayed and I have the permit in my packet." },
      { officer: "Do you have emergency contact numbers for roadside assistance?", driver: "Yes, they're programmed in my phone and written in my trip folder." },
      { officer: "Are you familiar with the signs of human trafficking?", driver: "Yes, we've had training on recognizing and reporting suspicious activity." },
      { officer: "Do you know how to handle a spilled load?", driver: "Yes, secure the area, call authorities, and follow company emergency procedures." },
      { officer: "Have you been through any DOT compliance reviews?", driver: "Not personally, but my company has and they share the results with us." },
      { officer: "Do you carry tools for basic roadside repairs?", driver: "Yes, I have basic tools and know how to change a tire safely." },
      { officer: "Can you tell me about your sleep schedule?", driver: "I maintain regular sleep hours and take my 10-hour breaks seriously." },
      { officer: "Do you know the penalties for logbook violations?", driver: "Yes, they can be severe, which is why I'm very careful with my logs." },
      { officer: "Are you trained in defensive driving techniques?", driver: "Yes, I completed a defensive driving course last year." },
      { officer: "Do you have experience with different trailer types?", driver: "Yes, I've pulled dry vans, reefers, and flatbeds." },
      { officer: "Can you explain the Smith System of driving?", driver: "Yes, it's the five keys for professional driving: aim high, get the big picture, keep your eyes moving, leave yourself an out, and make sure they see you." },
      { officer: "Do you know how to handle aggressive drivers?", driver: "Yes, stay calm, don't engage, and report dangerous behavior if necessary." },
      { officer: "Are you familiar with the new speed limiter requirements?", driver: "Yes, our trucks are equipped with limiters set at company policy speeds." },
      { officer: "Do you know what constitutes a critical safety violation?", driver: "Yes, things like brake issues, tire problems, or hours violations." },
      { officer: "Can you tell me about your company's drug testing policy?", driver: "We have pre-employment, random, post-accident, and reasonable suspicion testing." },
      { officer: "Do you know how to properly conduct a post-trip inspection?", driver: "Yes, I document any issues found and report them to maintenance." },
      { officer: "Are you familiar with cargo theft prevention?", driver: "Yes, we're trained on securing loads and parking in safe, well-lit areas." },
      { officer: "Do you know the maximum width for a standard trailer?", driver: "Yes, it's 8 feet 6 inches without permits." },
      { officer: "Can you explain the difference between gross weight and net weight?", driver: "Gross weight includes the truck, trailer, and cargo. Net weight is just the cargo." },
      { officer: "Do you know how to read a Commercial Vehicle Safety Alliance decal?", driver: "Yes, it shows the inspection level and results." },
      { officer: "Are you trained in handling hazardous weather conditions?", driver: "Yes, I know when to pull over and wait for conditions to improve." },
      { officer: "Do you know the requirements for transporting food products?", driver: "Yes, including temperature controls and sanitation requirements." },
      { officer: "Can you tell me about your emergency evacuation plan?", driver: "Yes, I know multiple exit routes and have emergency contacts." },
      { officer: "Do you know how to properly use your electronic logging device?", driver: "Yes, I'm trained on all functions and keep it updated." },
      { officer: "Are you familiar with weigh station bypass systems?", driver: "Yes, we use PrePass and I know when I need to enter stations." },
      { officer: "Do you know the requirements for transporting livestock?", driver: "Not currently, as I don't haul livestock, but I know it requires special permits." },
      { officer: "Can you explain your company's accident reporting procedure?", driver: "Yes, secure the scene, call authorities, notify dispatch, and document everything." },
      { officer: "Do you know how to handle a tire fire?", driver: "Yes, pull over safely, use the fire extinguisher, and call emergency services." },
      { officer: "Are you trained in first aid?", driver: "Yes, I have basic first aid training and carry a kit." },
      { officer: "Do you know the signs of brake fade?", driver: "Yes, loss of braking power, usually from overheating on long grades." },
      { officer: "Can you tell me about your route planning process?", driver: "I check weather, construction, bridge heights, and fuel stops before starting." },
      { officer: "Do you know how to handle a jackknife situation?", driver: "Yes, ease off the brakes, counter-steer gently, and regain control gradually." },
      { officer: "Are you familiar with the Clean Air Act requirements?", driver: "Yes, our trucks meet EPA standards and we follow idle restrictions." },
      { officer: "Do you know what a Level 1 inspection includes?", driver: "Yes, it's a comprehensive 37-step inspection of driver, vehicle, and cargo." },
      { officer: "Can you explain the importance of proper following distance?", driver: "Yes, I maintain at least 4 seconds following distance, more in bad weather." },
      { officer: "Do you know how to handle a runaway truck situation?", driver: "Yes, use engine brakes, downshift, and use runaway truck ramps if available." },
      { officer: "Are you trained in load securement for different cargo types?", driver: "Yes, I know the specific requirements for the types of freight I haul." },
      { officer: "Do you know the hours-of-service restart provisions?", driver: "Yes, I can restart my 70-hour clock with 34 consecutive hours off-duty." },
      { officer: "Can you tell me about your company's safety incentive program?", driver: "Yes, we get bonuses for safe driving records and accident-free miles." },
      { officer: "Do you know how to handle a vehicle fire?", driver: "Yes, pull over safely, evacuate, use the fire extinguisher if safe, and call 911." },
      { officer: "Are you familiar with bridge formulas for weight distribution?", driver: "Yes, I understand how axle spacing affects legal weight limits." },
      { officer: "Do you know the requirements for crossing international borders?", driver: "Yes, including proper documentation and customs procedures." },
      { officer: "Can you explain your pre-trip inspection documentation?", driver: "Yes, I note any defects, sign the form, and keep records as required." },
      { officer: "Do you know how to properly adjust your mirrors?", driver: "Yes, I adjust them to eliminate blind spots and check them regularly." },
      { officer: "Are you trained in recognizing signs of mechanical problems?", driver: "Yes, I know the sounds, vibrations, and warning signs to watch for." },
      { officer: "Do you know the penalties for operating with an out of service order?", driver: "Yes, they're severe and can include license suspension and fines." },
      { officer: "Can you tell me about your experience with electronic stability control?", driver: "Yes, our trucks have it and I understand how it helps prevent rollovers." },
      { officer: "Do you know how to handle a medical emergency while driving?", driver: "Yes, pull over safely, call 911, and provide first aid if trained to do so." },
      { officer: "Are you familiar with the unified carrier registration requirements?", driver: "Yes, our company handles the UCR registration and fees." },
      { officer: "Do you know how to properly conduct a brake adjustment?", driver: "That's a maintenance function I'm not qualified to perform myself." },
      { officer: "Can you explain the importance of proper trip planning?", driver: "Yes, it ensures legal compliance, safety, and efficient delivery." },
      { officer: "Do you know the requirements for transporting alcohol?", driver: "Yes, including proper documentation and restrictions on driver consumption." },
      { officer: "Are you trained in handling customer complaints?", driver: "Yes, I remain professional and refer issues to customer service when appropriate." },
      { officer: "Do you know how to handle a citation or violation notice?", driver: "Yes, accept it respectfully, report to my company, and handle it promptly." },
      { officer: "Can you tell me about your continuing education requirements?", driver: "Yes, I stay current with regulations and complete required training." },
      { officer: "Do you know the proper way to communicate on a CB radio?", driver: "Yes, use proper protocol, keep it professional, and follow FCC regulations." },
      { officer: "Are you familiar with environmental regulations for trucking?", driver: "Yes, including emissions standards and proper waste disposal." },
      { officer: "Do you know how to handle a scale house violation?", driver: "Yes, work with the officer to resolve it and contact my company for guidance." },
      { officer: "Can you explain your approach to fuel efficiency?", driver: "Yes, I maintain steady speeds, plan routes, and follow company fuel conservation practices." },
      { officer: "Do you know the requirements for driver qualification files?", driver: "Yes, my company maintains my DQ file with all required documents." },
      { officer: "Are you trained in proper backing and parking techniques?", driver: "Yes, I use the GOAL method: Get Out And Look." },
      { officer: "Do you know how to handle a roadside breakdown?", driver: "Yes, secure the vehicle, set out triangles, call for help, and stay safe." },
      { officer: "Can you tell me about your company's vehicle maintenance program?", driver: "Yes, we have scheduled maintenance and drivers report any issues immediately." }
    ];

    // Create questions from all conversations
    officerDriverConversations.forEach((conv, index) => {
      const question: DotQuestion = { 
        id: index + 1,
        categoryId: 6,
        question: conv.officer,
        options: [],
        correctAnswer: conv.driver,
        explanation: "Professional response demonstrating proper communication with DOT officers during traffic stops and inspections."
      };
      this.dotQuestions.set(index + 1, question);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.currentUserId;
    const user: User = { 
      id,
      name: insertUser.name,
      experienceLevel: insertUser.experienceLevel || "beginner",
      practiceStreak: insertUser.practiceStreak || 0,
      totalSessions: insertUser.totalSessions || 0,
      dailyReminders: insertUser.dailyReminders || true,
      voicePractice: insertUser.voicePractice || true,
      sessionDuration: insertUser.sessionDuration || 10,
      darkMode: insertUser.darkMode || true,
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
    const id = ++this.currentCategoryId;
    const category: DotCategory = { 
      id,
      name: insertCategory.name,
      description: insertCategory.description,
      color: insertCategory.color,
      icon: insertCategory.icon,
      questionsCount: insertCategory.questionsCount || 0
    };
    this.dotCategories.set(id, category);
    return category;
  }

  async getDotQuestionsByCategory(categoryId: number): Promise<DotQuestion[]> {
    return Array.from(this.dotQuestions.values())
      .filter(q => q.categoryId === categoryId);
  }

  async getDotQuestion(id: number): Promise<DotQuestion | undefined> {
    return this.dotQuestions.get(id);
  }

  async createDotQuestion(insertQuestion: InsertDotQuestion): Promise<DotQuestion> {
    const id = ++this.currentQuestionId;
    const question: DotQuestion = { 
      id,
      categoryId: insertQuestion.categoryId,
      question: insertQuestion.question,
      options: insertQuestion.options,
      correctAnswer: insertQuestion.correctAnswer,
      explanation: insertQuestion.explanation || null
    };
    this.dotQuestions.set(id, question);
    return question;
  }

  async getPracticeSessionsByUser(userId: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values())
      .filter(s => s.userId === userId);
  }

  async getRecentSessionsByUser(userId: number, limit: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = ++this.currentSessionId;
    const session: PracticeSession = { 
      id,
      userId: insertSession.userId,
      type: insertSession.type,
      categoryId: insertSession.categoryId || null,
      duration: insertSession.duration,
      score: insertSession.score || null,
      completed: insertSession.completed,
      createdAt: new Date()
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

  async getChatMessagesBySession(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.sessionId === sessionId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = ++this.currentMessageId;
    const message: ChatMessage = { 
      id,
      sessionId: insertMessage.sessionId,
      content: insertMessage.content,
      isUser: insertMessage.isUser,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();