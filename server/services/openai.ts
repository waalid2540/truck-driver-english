import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ConversationResponse {
  message: string;
  scenario?: string;
  suggestions?: string[];
}

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

export async function generateConversationResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ConversationResponse> {
  try {
    // Analyze conversation context and user's current needs
    const contextAnalysis = analyzeConversationContext(conversationHistory, userMessage);
    
    const systemPrompt = `You are an intelligent English conversation coach for truck drivers with advanced memory and contextual awareness. Your enhanced capabilities include:

MEMORY & CONTEXT:
- Remember everything discussed in this conversation thread
- Track the driver's skill level, common mistakes, and improvement areas
- Adapt teaching style based on their progress and preferences
- Reference previous topics and build upon them naturally
- Maintain conversation continuity and relationship building

INTELLIGENT RESPONSES:
- Provide personalized feedback based on conversation history
- Suggest practice scenarios relevant to their mentioned routes, experiences, or challenges
- Remember their preferred learning style (roleplay, corrections, scenarios)
- Build on previously practiced vocabulary and situations
- Ask intelligent follow-up questions that advance their learning

TRUCK DRIVER FOCUS:
- Master all trucking scenarios: DOT inspections, customer deliveries, dispatch communication, weigh stations, breakdowns, route planning, fuel stops, loading/unloading
- Use authentic trucking terminology and situations
- Provide industry-specific language practice
- Help with professional communication skills for career advancement

CONVERSATION STYLE:
- Keep responses 1-2 sentences for voice interaction
- Be encouraging and build confidence
- Give immediate, helpful corrections when needed
- Create natural conversation flow
- Ask engaging questions that continue the dialogue

Current context: ${contextAnalysis}

Remember everything they've told you and build upon it in this response.`;

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

    const aiMessage = response.choices[0].message.content || "I'm sorry, I didn't understand that. Could you try again?";

    return {
      message: aiMessage,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate conversation response: " + (error as Error).message);
  }
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
