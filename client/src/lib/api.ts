import { apiRequest } from "./queryClient";

export interface ConversationResponse {
  message: string;
  scenario?: string;
  suggestions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const api = {
  // User endpoints
  getUser: (id: number) => 
    apiRequest('GET', `/api/user/${id}`).then(res => res.json()),
  
  updateUser: (id: number, updates: any) =>
    apiRequest('PATCH', `/api/user/${id}`, updates).then(res => res.json()),

  // DOT Practice endpoints
  getDotCategories: () =>
    apiRequest('GET', '/api/dot-categories').then(res => res.json()),
  
  getDotQuestions: (categoryId: number) =>
    apiRequest('GET', `/api/dot-questions/${categoryId}`).then(res => res.json()),

  // Practice Sessions endpoints
  getPracticeSessions: (userId: number) =>
    apiRequest('GET', `/api/practice-sessions/user/${userId}`).then(res => res.json()),
  
  getRecentSessions: (userId: number, limit: number = 5) =>
    apiRequest('GET', `/api/practice-sessions/user/${userId}/recent?limit=${limit}`).then(res => res.json()),
  
  createPracticeSession: (session: any) =>
    apiRequest('POST', '/api/practice-sessions', session).then(res => res.json()),
  
  updatePracticeSession: (id: number, updates: any) =>
    apiRequest('PATCH', `/api/practice-sessions/${id}`, updates).then(res => res.json()),

  // Chat endpoints
  getChatMessages: (sessionId: number) =>
    apiRequest('GET', `/api/chat-messages/${sessionId}`).then(res => res.json()),
  
  createChatMessage: (message: any) =>
    apiRequest('POST', '/api/chat-messages', message).then(res => res.json()),

  // Conversation AI endpoints
  sendConversationMessage: (message: string, history: ChatMessage[] = []): Promise<ConversationResponse> =>
    apiRequest('POST', '/api/conversation/respond', { message, history }).then(res => res.json()),
  
  generatePracticeScenario: () =>
    apiRequest('GET', '/api/conversation/scenario').then(res => res.json()),

  // Whisper AI endpoints
  transcribeAudio: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Use fetch directly for file upload to avoid Content-Type issues
    return fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    }).then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    });
  },

  generateSpeech: (text: string) =>
    apiRequest('POST', '/api/speak', { text }).then(res => res.blob()),
};
