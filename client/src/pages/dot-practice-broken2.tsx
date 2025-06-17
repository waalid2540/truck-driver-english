import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, FileText, TrafficCone, Volume2, VolumeX, Mic, MicOff, Truck, Package } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function DotPractice() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState<string>("");
  const [isQuestionAsked, setIsQuestionAsked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  // Audio and hands-free features
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const { toast } = useToast();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          console.log('Speech recognized:', transcript);
          handleVoiceCommand(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (autoRepeat && isAudioEnabled && selectedCategory) {
            setTimeout(() => startListening(), 1000);
          }
        };
      }
      
      synthRef.current = window.speechSynthesis;
    }
  }, [autoRepeat, isAudioEnabled, selectedCategory]);

  // Speech synthesis function
  const speak = async (text: string) => {
    if (!isAudioEnabled || !synthRef.current) return;
    
    synthRef.current.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  // Start voice recognition
  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle voice commands for conversational practice
  const handleVoiceCommand = (command: string) => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    // Store the user's voice response
    setUserResponse(command);
    
    // Stop listening while processing
    stopListening();
    
    // Provide feedback on the response
    evaluateDriverResponse(command);

    // Navigation commands
    if (command.includes('next') || command.includes('continue')) {
      if (userResponse && !showResult) {
        handleNextQuestion();
      }
    } else if (command.includes('repeat') || command.includes('again')) {
      readCurrentQuestion();
    } else if (command.includes('back') || command.includes('previous')) {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        setUserResponse("");
        setShowResult(false);
        setIsQuestionAsked(false);
      }
    } else if (command.includes('home') || command.includes('menu')) {
      resetPractice();
    }

    // Reset response
    if (command.includes('reset') || command.includes('clear')) {
      setUserResponse("");
      toast({
        title: "Response cleared",
        description: "You can now provide a new response.",
      });
    }
  };

  // Read the current officer question for conversation practice
  const readCurrentQuestion = () => {
    if (!questions || !isAudioEnabled) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const questionText = `Officer asks: ${currentQuestion.question}`;
    speak(questionText);
    setIsQuestionAsked(true);
    
    // Start listening for driver's response after officer asks
    setTimeout(() => {
      if (isAudioEnabled) {
        startListening();
      }
    }, 2000);
  };

  // Evaluate driver's voice response to officer's question
  const evaluateDriverResponse = async (response: string) => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    // Check if response contains key elements of the correct answer
    const correctAnswer = currentQuestion.correctAnswer.toLowerCase();
    const responseWords = response.toLowerCase().split(' ');
    const correctWords = correctAnswer.split(' ');
    
    // Simple scoring based on matching key words and phrases
    let matchScore = 0;
    correctWords.forEach((word: string) => {
      if (word.length > 3 && responseWords.some(rWord => rWord.includes(word) || word.includes(rWord))) {
        matchScore++;
      }
    });

    const scorePercentage = (matchScore / correctWords.length) * 100;
    const isGoodResponse = scorePercentage > 30; // 30% threshold for basic professional response

    if (isGoodResponse) {
      setScore(prev => prev + 1);
      speak(`Good response. ${currentQuestion.explanation}`);
      toast({
        title: "Professional Response",
        description: "That was a good professional answer to the officer.",
      });
    } else {
      speak(`That response could be improved. Here's a better approach: ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`);
      toast({
        title: "Practice More",
        description: "Try to be more specific and professional in your response.",
        variant: "destructive"
      });
    }

    setShowResult(true);
    setTimeout(() => {
      setShowResult(false);
      setIsQuestionAsked(false);
    }, 4000);
  };

  const { data: categories } = useQuery({
    queryKey: ["/api/dot-categories"],
    queryFn: api.getDotCategories,
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/dot-questions", selectedCategory],
    queryFn: () => api.getDotQuestions(selectedCategory!),
    enabled: !!selectedCategory,
  });

  // Auto-read question when it changes
  useEffect(() => {
    if (questions && questions.length > 0 && selectedCategory && !showResult && isAudioEnabled) {
      setTimeout(() => readCurrentQuestion(), 500);
    }
  }, [currentQuestionIndex, selectedCategory, questions, isAudioEnabled, showResult, readCurrentQuestion]);

  const createSessionMutation = useMutation({
    mutationFn: api.createPracticeSession,
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      api.updatePracticeSession(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-sessions"] });
      toast({
        title: "Practice Complete!",
        description: `You scored ${score}% on this practice session.`,
      });
    },
  });

  const startPractice = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setUserResponse("");
    setIsQuestionAsked(false);

    // Create practice session
    createSessionMutation.mutate({
      userId: 1,
      type: "dot",
      categoryId,
      duration: 0,
      completed: false,
    });

    // Start audio if enabled
    if (isAudioEnabled) {
      setTimeout(() => {
        speak("Starting practice session. Listen for the officer's questions and respond naturally.");
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    if (!questions) return;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserResponse("");
      setShowResult(false);
      setIsQuestionAsked(false);
      
      // Read next question automatically
      if (isAudioEnabled) {
        setTimeout(() => readCurrentQuestion(), 1000);
      }
    } else {
      // Practice complete
      const finalScore = Math.round((score / questions.length) * 100);
      if (sessionId) {
        updateSessionMutation.mutate({
          id: sessionId,
          updates: {
            duration: 10, // Approximate duration
            score: finalScore,
            completed: true,
          },
        });
      }
      
      if (isAudioEnabled) {
        speak(`Practice session complete! You scored ${finalScore} percent. Great job!`);
      }
      
      setTimeout(() => resetPractice(), 3000);
    }
  };

  const resetPractice = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setUserResponse("");
    setShowResult(false);
    setScore(0);
    setSessionId(null);
    setIsQuestionAsked(false);
    stopListening();
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'safety regulations':
        return Shield;
      case 'documentation':
        return FileText;
      case 'road terminology':
        return TrafficCone;
      case 'vehicle operations':
        return Truck;
      case 'loading & cargo':
        return Package;
      default:
        return Shield;
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'truck-orange':
        return 'text-truck-orange bg-orange-100';
      case 'truck-blue':
        return 'text-truck-blue bg-blue-100';
      case 'green-600':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-truck-orange bg-orange-100';
    }
  };

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">DOT Practice</h1>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                variant={isAudioEnabled ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{isAudioEnabled ? "Audio On" : "Audio Off"}</span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-truck-blue"
                  onClick={() => startPractice(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(category.color)}`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{category.questionsCount} questions</span>
                      <Button size="sm" className="bg-truck-blue hover:bg-blue-700">
                        Start Practice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Practice session view
  if (questions && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={resetPractice}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Categories</span>
            </Button>

            {/* Audio Controls */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                variant={isAudioEnabled ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{isAudioEnabled ? "Audio On" : "Audio Off"}</span>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Voice Instructions */}
              {isAudioEnabled && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Audio Practice:</span> Listen to the officer's question and respond naturally using your voice
                  </p>
                </div>
              )}
              
              {/* Officer-Driver Conversation Interface */}
              <div className="space-y-4">
                {/* Officer Question Display */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">O</span>
                    </div>
                    <span className="font-semibold text-indigo-700">Officer:</span>
                  </div>
                  <p className="text-lg text-gray-800">{currentQuestion.question}</p>
                </div>

                {/* Driver Response Section */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">D</span>
                    </div>
                    <span className="font-semibold text-green-700">Your Response:</span>
                  </div>
                  
                  {userResponse ? (
                    <div className="space-y-2">
                      <p className="text-lg text-gray-800 italic">"{userResponse}"</p>
                      {showResult && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm font-medium text-gray-700 mb-1">Suggested Professional Response:</p>
                          <p className="text-sm text-gray-600 italic">"{currentQuestion.correctAnswer}"</p>
                          {currentQuestion.explanation && (
                            <p className="text-xs text-gray-500 mt-2">{currentQuestion.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      {isListening ? (
                        <>
                          <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Listening for your response...</span>
                        </>
                      ) : (
                        <span className="text-sm">Tap the microphone to respond or click "Ask Question" to hear it again</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Controls */}
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  onClick={readCurrentQuestion}
                  disabled={isSpeaking}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Ask Question</span>
                </Button>
                
                {isListening ? (
                  <Button
                    onClick={stopListening}
                    variant="destructive"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <MicOff className="h-4 w-4" />
                    <span>Stop Listening</span>
                  </Button>
                ) : (
                  <Button
                    onClick={startListening}
                    disabled={!isAudioEnabled}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Start Responding</span>
                  </Button>
                )}
              </div>

              {/* Progress and Navigation */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>Score: {score}/{currentQuestionIndex + (userResponse ? 1 : 0)}</span>
                </div>
                
                <Progress 
                  value={((currentQuestionIndex + (userResponse ? 1 : 0)) / questions.length) * 100} 
                  className="w-full" 
                />
                
                {userResponse && (
                  <div className="flex justify-center">
                    <Button onClick={handleNextQuestion} className="flex items-center space-x-2">
                      <span>Next Question</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Questions...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-truck-blue mx-auto"></div>
      </div>
    </div>
  );
}