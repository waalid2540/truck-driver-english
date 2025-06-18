import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ConversationResponse {
  message: string;
  scenario?: string;
  suggestions?: string[];
  threadId?: string;
  assistantId?: string;
}

// Store for managing assistant threads and conversation history
const threadStore = new Map<string, string>(); // userId -> threadId
const conversationStore = new Map<string, Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>(); // userId -> conversation history
let truckerAssistantId: string | null = null;

function analyzeConversationContext(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  currentMessage: string
): string {
  if (history.length === 0) {
    return "New conversation starting. Driver appears to be beginning English practice.";
  }

  // Extract key information from conversation
  const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.content);
  const allUserText = [...userMessages, currentMessage].join(' ').toLowerCase();
  
  // Analyze topics and context
  const topics = [];
  const skills = [];
  const scenarios = [];
  
  // Detect trucking topics
  if (allUserText.includes('dot') || allUserText.includes('inspection')) {
    topics.push('DOT inspections');
  }
  if (allUserText.includes('california') || allUserText.includes('route')) {
    topics.push('route planning and destinations');
  }
  if (allUserText.includes('customer') || allUserText.includes('delivery')) {
    topics.push('customer interactions');
  }
  if (allUserText.includes('dispatch')) {
    topics.push('dispatcher communication');
  }
  
  // Detect skill level and needs
  if (allUserText.includes('basic') || allUserText.includes('beginner')) {
    skills.push('basic level English learner');
  }
  if (allUserText.includes('practice') || allUserText.includes('help')) {
    skills.push('actively seeking practice');
  }
  if (allUserText.includes('repeat') || allUserText.includes('again')) {
    skills.push('needs repetition and clarification');
  }
  
  // Detect preferred scenarios
  if (allUserText.includes('roleplay') || allUserText.includes('act as')) {
    scenarios.push('prefers roleplay scenarios');
  }
  
  // Build context summary
  let context = `Conversation history: ${history.length} exchanges. `;
  if (topics.length > 0) {
    context += `Topics discussed: ${topics.join(', ')}. `;
  }
  if (skills.length > 0) {
    context += `Driver characteristics: ${skills.join(', ')}. `;
  }
  if (scenarios.length > 0) {
    context += `Learning preferences: ${scenarios.join(', ')}. `;
  }
  
  context += `Current message suggests: ${analyzeCurrentIntent(currentMessage)}`;
  
  return context;
}

function analyzeCurrentIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('can you')) {
    return "seeking assistance or guidance";
  }
  if (lowerMessage.includes('practice') || lowerMessage.includes("let's")) {
    return "wants to practice conversation";
  }
  if (lowerMessage.includes('repeat') || lowerMessage.includes('again')) {
    return "needs clarification or repetition";
  }
  if (lowerMessage.includes('question') || lowerMessage.includes('about')) {
    return "asking for information or explanation";
  }
  if (lowerMessage.includes('thank') || lowerMessage.includes('good')) {
    return "providing positive feedback";
  }
  if (lowerMessage.includes('don\'t know') || lowerMessage.includes('confused')) {
    return "expressing uncertainty, needs support";
  }
  
  return "continuing normal conversation";
}

// Initialize or get the truck driver assistant
async function getTruckerAssistant(): Promise<string> {
  if (truckerAssistantId) {
    return truckerAssistantId;
  }

  try {
    const assistant = await openai.beta.assistants.create({
      name: "Truck Driver English Coach",
      instructions: `You are an expert English conversation coach specialized in helping truck drivers improve their communication skills through voice conversations.

CORE CAPABILITIES:
- Provide hands-free voice conversation practice optimized for trucking scenarios
- Remember all previous conversations and build upon them naturally
- Track learning progress, common mistakes, and preferred topics
- Adapt teaching style based on driver's skill level and needs
- Create realistic roleplay scenarios for professional trucking situations

TRUCKING EXPERTISE:
- DOT inspections and compliance communication
- Customer delivery interactions and problem resolution
- Dispatcher communication for route changes, delays, breakdowns
- Weigh station procedures and officer interactions
- Loading dock protocols and warehouse communication
- Fuel stop etiquette and truck stop conversations
- Mechanic consultations and breakdown reporting
- Emergency communication and incident reporting

CONVERSATION STYLE:
- Keep responses concise (1-2 sentences) for voice interaction
- Use encouraging, supportive tone that builds confidence
- Provide immediate, gentle corrections when helpful
- Ask engaging follow-up questions to maintain conversation flow
- Reference previous conversations to show continuity
- Use authentic trucking terminology and real-world scenarios

MEMORY & PERSONALIZATION:
- Remember driver's routes, experience level, and challenges
- Track topics discussed and skills practiced
- Build on previous conversations naturally
- Provide personalized feedback based on conversation history
- Suggest relevant practice scenarios based on their needs`,
      model: "gpt-4o",
      tools: [],
    });

    truckerAssistantId = assistant.id;
    console.log(`Created Trucker Assistant: ${truckerAssistantId}`);
    return truckerAssistantId;
  } catch (error) {
    console.error("Failed to create assistant:", error);
    throw error;
  }
}

// Get or create thread for user
async function getUserThread(userId: string = "default"): Promise<string> {
  let threadId = threadStore.get(userId);
  
  if (!threadId) {
    try {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      threadStore.set(userId, threadId);
      console.log(`Created new thread for user ${userId}: ${threadId}`);
    } catch (error) {
      console.error("Failed to create thread:", error);
      throw error;
    }
  }
  
  return threadId;
}

export async function generateConversationResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  userId: string = "default"
): Promise<ConversationResponse> {
  // Store user message in persistent conversation history
  const fullHistory = getOrCreateUserHistory(userId);
  fullHistory.push({ role: 'user', content: userMessage, timestamp: new Date() });
  
  // Merge current session history with persistent history
  const recentHistory = fullHistory.slice(-20); // Keep last 20 messages for context
  
  console.log(`Generating response for user: ${userId} with ${recentHistory.length} messages of persistent history`);
  const response = await generateFallbackResponse(userMessage, recentHistory.map((h: any) => ({ role: h.role, content: h.content })), userId);
  
  // Store AI response in persistent history
  fullHistory.push({ role: 'assistant', content: response.message, timestamp: new Date() });
  
  return response;
}

// Analyze conversation history to provide intelligent context
function summarizeConversationHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>): string {
  if (history.length === 0) {
    return "First conversation with this driver.";
  }

  const userMessages = history.filter(h => h.role === 'user').map(h => h.content);
  const assistantMessages = history.filter(h => h.role === 'assistant').map(h => h.content);
  
  // Extract key topics discussed
  const allText = [...userMessages, ...assistantMessages].join(' ').toLowerCase();
  const topics = [];
  
  if (allText.includes('dot') || allText.includes('inspection') || allText.includes('officer')) {
    topics.push('DOT inspections and officer interactions');
  }
  if (allText.includes('delivery') || allText.includes('customer') || allText.includes('warehouse')) {
    topics.push('delivery and customer communication');
  }
  if (allText.includes('dispatch') || allText.includes('route') || allText.includes('load')) {
    topics.push('dispatcher coordination and logistics');
  }
  if (allText.includes('practice') || allText.includes('english') || allText.includes('learn')) {
    topics.push('English practice and learning goals');
  }
  if (allText.includes('question') || allText.includes('help') || allText.includes('explain')) {
    topics.push('questions and explanations requested');
  }

  // Identify recent questions asked by assistant
  const recentQuestions = assistantMessages.slice(-5).filter(msg => msg.includes('?'));
  
  // Build context summary
  let summary = `Conversation history: ${history.length} total exchanges. `;
  
  if (topics.length > 0) {
    summary += `Topics covered: ${topics.join(', ')}. `;
  }
  
  if (recentQuestions.length > 0) {
    summary += `Recent questions asked: "${recentQuestions[recentQuestions.length - 1]}". `;
  }
  
  // Check for specific references to previous conversations
  const lastUserMessage = userMessages[userMessages.length - 1] || '';
  if (lastUserMessage.includes('question you asked') || lastUserMessage.includes('we talked about') || lastUserMessage.includes('you said')) {
    summary += `Driver is referencing previous conversation content - provide specific recall. `;
  }
  
  return summary;
}

// Get or create persistent conversation history for user
function getOrCreateUserHistory(userId: string): Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, []);
  }
  return conversationStore.get(userId)!;
}

// Enhanced chat completion with persistent thread tracking
async function generateFallbackResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userId: string = "default"
): Promise<ConversationResponse> {
  const contextAnalysis = analyzeConversationContext(conversationHistory, userMessage);
  
  // Get or create thread for memory persistence
  const threadId = await getUserThread(userId);
  
  // Analyze conversation patterns to provide better context
  const conversationSummary = summarizeConversationHistory(conversationHistory);
  
  const systemPrompt = `You are an expert English conversation coach for truck drivers with full memory of past conversations.

PERSISTENT MEMORY:
- You remember ALL previous conversations with this driver (${conversationHistory.length} messages in history)
- When they reference "that question you asked me" or "we talked about", recall specific details from earlier exchanges
- Build naturally on topics, practice areas, and challenges discussed before
- Reference their progress, mistakes, and improvements from previous sessions
- Maintain conversation continuity as if you've been talking continuously

CONVERSATION CONTEXT:
${conversationSummary}

CURRENT SITUATION: ${contextAnalysis}

RESPONSE GUIDELINES:
- Keep responses 1-2 sentences for voice interaction
- Reference previous conversations when relevant ("As we discussed earlier...", "Remember when you mentioned...")
- When they ask about "that question" or "what we talked about", specifically recall and reference it
- Build on their established skill level and practice preferences
- Use supportive, encouraging tone that acknowledges their ongoing journey

TRUCKING SCENARIOS TO DRAW FROM:
- DOT inspections and officer interactions
- Customer delivery communications
- Dispatcher coordination and problem-solving
- Equipment maintenance discussions
- Route planning and logistics communication

Remember: This driver knows you from previous conversations. Act with familiarity and continuity.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 200,
    temperature: 0.7,
    presence_penalty: 0.6,
    frequency_penalty: 0.3,
  });

  return {
    message: response.choices[0].message.content || "I'm here to help with your English practice.",
    threadId,
  };
}

export async function generatePracticeScenario(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: 'system',
          content: 'Generate a realistic conversation scenario that a truck driver might encounter. Keep it simple and practical. Examples: talking to a customer at delivery, speaking with a dispatcher, dealing with a mechanic, or interacting with law enforcement during an inspection.'
        },
        {
          role: 'user',
          content: 'Generate a new practice scenario for a truck driver to practice English conversation.'
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "Practice introducing yourself to a customer at a delivery location.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Practice introducing yourself to a customer at a delivery location.";
  }
}
