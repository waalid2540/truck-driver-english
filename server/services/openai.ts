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

// Store for managing assistant threads
const threadStore = new Map<string, string>(); // userId -> threadId
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
  try {
    console.log(`Starting conversation for user: ${userId}`);
    
    // Get assistant and thread
    const assistantId = await getTruckerAssistant();
    const threadId = await getUserThread(userId);

    console.log(`Using assistant: ${assistantId}, thread: ${threadId}`);

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    console.log(`Created run: ${run.id}`);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      console.log(`Run status: ${runStatus.status}`);
      
      if (runStatus.status === 'completed') {
        // Get the latest message
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];
        
        if (latestMessage.content[0].type === 'text') {
          return {
            message: latestMessage.content[0].text.value,
            threadId,
            assistantId,
          };
        }
      } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        console.error('Run failed with status:', runStatus.status);
        throw new Error(`Assistant run failed: ${runStatus.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Assistant run timed out');
  } catch (error) {
    console.error("OpenAI Assistants API error:", error);
    
    // Fallback to regular chat completion with enhanced context
    return generateFallbackResponse(userMessage, conversationHistory);
  }
}

// Fallback function using regular chat completion
async function generateFallbackResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ConversationResponse> {
  const contextAnalysis = analyzeConversationContext(conversationHistory, userMessage);
  
  const systemPrompt = `You are a truck driver English coach. Keep responses short for voice interaction. ${contextAnalysis}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 150,
    temperature: 0.7,
  });

  return {
    message: response.choices[0].message.content || "I'm here to help with your English practice.",
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
