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

export async function generateConversationResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ConversationResponse> {
  try {
    const systemPrompt = `You are an English conversation coach specifically designed to help truck drivers improve their English communication skills through voice conversations. Your role is to:

1. Help truck drivers practice real-world conversations they encounter on the job
2. Provide gentle corrections and suggestions for better English usage
3. Create roleplay scenarios relevant to trucking (talking to customers, dispatchers, law enforcement, mechanics, DOT inspectors, weigh station officers, etc.)
4. Be encouraging, patient, and supportive while helping them improve
5. Use simple, clear language appropriate for English learners
6. Focus on practical, job-relevant vocabulary and phrases
7. Keep responses SHORT and conversational since this is voice-based interaction
8. Ask follow-up questions to keep the conversation flowing
9. Provide immediate feedback on pronunciation, grammar, or word choice when helpful
10. Simulate real trucking scenarios like delivery confirmations, route changes, breakdown reports, etc.

Keep responses under 2-3 sentences to work well with voice interaction. Be conversational, helpful, and focused on trucking-related scenarios. Provide gentle corrections when needed and suggest better ways to express ideas. Remember that drivers may be using this hands-free while driving or during breaks.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 150,
      temperature: 0.8,
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
