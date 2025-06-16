import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bot, Send, Mic, MicOff, Volume2, Upload } from "lucide-react";
import ChatMessage from "@/components/chat-message";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ConversationalCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAutoReading, setIsAutoReading] = useState(true);
  const [isRecordingSupported, setIsRecordingSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: scenario } = useQuery({
    queryKey: ["/api/conversation/scenario"],
    queryFn: api.generatePracticeScenario,
  });

  const conversationMutation = useMutation({
    mutationFn: ({ message, history }: { message: string; history: any[] }) =>
      api.sendConversationMessage(message, history),
    onSuccess: (response) => {
      const aiMessage: Message = {
        id: Date.now().toString() + "_ai",
        content: response.message,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response.message }]);
      
      // Auto-read AI response if enabled using OpenAI TTS
      if (isAutoReading) {
        playAIGeneratedSpeech(response.message);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get response from AI coach. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Audio Recording and Whisper AI functions
  const initializeAudioRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Check if MediaRecorder supports webm format
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/wav';
        }
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        setIsListening(false);
        
        if (audioChunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No audio data recorded. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = []; // Clear chunks
        
        // Check if the blob has content
        if (audioBlob.size === 0) {
          toast({
            title: "Recording Error",
            description: "No audio content recorded. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        try {
          console.log('Sending audio blob to Whisper AI:', audioBlob.size, 'bytes', 'type:', audioBlob.type);
          const transcription = await api.transcribeAudio(audioBlob);
          if (transcription.text && transcription.text.trim()) {
            setInputValue(transcription.text);
            toast({
              title: "Speech Recognized",
              description: `"${transcription.text.substring(0, 50)}${transcription.text.length > 50 ? '...' : ''}"`,
            });
          } else {
            toast({
              title: "No Speech Detected",
              description: "Please speak clearly and try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Voice Error",
            description: "Could not transcribe speech. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      mediaRecorderRef.current = recorder;
      setIsRecordingSupported(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      setIsRecordingSupported(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access in your browser settings for voice input.",
        variant: "destructive",
      });
    }
  };

  const playAIGeneratedSpeech = async (text: string) => {
    try {
      const audioBlob = await api.generateSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS if OpenAI TTS fails
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const startListening = async () => {
    try {
      if (!mediaRecorderRef.current) {
        await initializeAudioRecording();
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = [];
        setIsListening(true);
        mediaRecorderRef.current.start(1000); // Record in 1-second chunks
        
        // Auto-stop after 10 seconds to prevent long recordings
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            stopListening();
          }
        }, 10000);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start voice recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAudioFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file (mp3, wav, m4a, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Uploading audio file for Whisper AI:', file.name, file.size, 'bytes');
      const transcription = await api.transcribeAudio(file);
      if (transcription.text && transcription.text.trim()) {
        setInputValue(transcription.text);
        toast({
          title: "Audio Transcribed",
          description: `"${transcription.text.substring(0, 50)}${transcription.text.length > 50 ? '...' : ''}"`,
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Could not detect speech in the audio file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Audio file transcription error:', error);
      toast({
        title: "Transcription Error",
        description: "Could not transcribe the audio file. Please try again.",
        variant: "destructive",
      });
    }

    // Clear the input
    event.target.value = '';
  };

  const toggleAutoReading = () => {
    setIsAutoReading(!isAutoReading);
    if (!isAutoReading) {
      toast({
        title: "Auto-Reading Enabled",
        description: "AI responses will be read aloud automatically.",
      });
    } else {
      toast({
        title: "Auto-Reading Disabled",
        description: "AI responses will no longer be read aloud.",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize audio recording
    initializeAudioRecording();
    
    // Initialize conversation with welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content: "Hello! I'm your English coach. Let's practice some conversations you might have on the road. You can speak to me using the microphone button for hands-free practice. What scenario would you like to practice?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    
    // Read welcome message if auto-reading is enabled
    if (isAutoReading) {
      setTimeout(() => playAIGeneratedSpeech(welcomeMessage.content), 1000);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || conversationMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, { role: 'user', content: inputValue }]);
    
    const messageToSend = inputValue;
    setInputValue("");

    // Send to AI
    conversationMutation.mutate({
      message: messageToSend,
      history: conversationHistory,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startScenarioPractice = () => {
    if (scenario?.scenario) {
      const scenarioMessage: Message = {
        id: Date.now().toString() + "_scenario",
        content: `Let's practice this scenario: ${scenario.scenario}. Go ahead and start the conversation!`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, scenarioMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-truck-blue rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">AI English Coach</h3>
            <p className="text-sm text-green-600 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {isListening ? 'Listening...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleAutoReading}
            size="sm"
            variant={isAutoReading ? "default" : "outline"}
            className={`${isAutoReading ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          {scenario && (
            <Button
              onClick={startScenarioPractice}
              size="sm"
              className="bg-truck-orange hover:bg-orange-600 text-white"
            >
              Practice
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {conversationMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-truck-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md p-4 max-w-xs shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={isListening ? "Listening..." : "Type your message or use voice..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12 rounded-2xl border-gray-300 focus:border-truck-blue focus:ring-truck-blue"
              disabled={conversationMutation.isPending || isListening}
            />
            {isRecordingSupported ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${
                  isListening 
                    ? 'text-red-500 hover:text-red-600 animate-pulse' 
                    : 'text-gray-400 hover:text-truck-blue'
                }`}
                disabled={conversationMutation.isPending}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            ) : (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
                  id="audio-upload"
                  disabled={conversationMutation.isPending}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-truck-blue p-1"
                  disabled={conversationMutation.isPending}
                  asChild
                >
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </label>
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || conversationMutation.isPending || isListening}
            className="bg-truck-blue hover:bg-blue-700 text-white p-3 rounded-2xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Voice Instructions */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {isListening ? (
            "🎤 Speak now - I'm listening with Whisper AI..."
          ) : isRecordingSupported ? (
            "Tap the microphone for hands-free practice with AI speech recognition"
          ) : (
            "Upload an audio file for Whisper AI transcription or type your message"
          )}
        </div>
      </div>
    </div>
  );
}
