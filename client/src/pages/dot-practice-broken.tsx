import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, FileText, TrafficCone, Truck, Package, Volume2, VolumeX, Mic, MicOff, PlayCircle, StopCircle } from "lucide-react";
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
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  // Audio and hands-free features
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const { toast } = useToast();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.trim();
          setUserResponse(transcript);
          setIsListening(false);
          
          toast({
            title: "Response Recorded",
            description: `Your response: "${transcript}"`,
          });
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Speech Recognition Error",
            description: "Please try speaking again or type your response.",
            variant: "destructive"
          });
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
      
      synthRef.current = window.speechSynthesis;
    }
  }, [toast]);

  const { data: categories } = useQuery({
    queryKey: ["/api/dot-categories"],
    queryFn: api.getDotCategories,
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/dot-questions", selectedCategory],
    queryFn: () => api.getDotQuestions(selectedCategory!),
    enabled: !!selectedCategory,
  });

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
        description: `You completed ${questions?.length || 0} officer-driver conversations.`,
      });
    },
  });

  // Auto-speak officer question when it loads
  useEffect(() => {
    if (questions && questions.length > 0 && isAudioEnabled && autoPlay && !showAnswer) {
      setTimeout(() => speakOfficerQuestion(), 1000);
    }
  }, [currentQuestionIndex, questions, isAudioEnabled, autoPlay, showAnswer]);

  const speakOfficerQuestion = () => {
    if (!questions || !isAudioEnabled) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(`Officer asks: ${currentQuestion.question}`);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-start listening after officer speaks
        if (isAudioEnabled && !userResponse) {
          setTimeout(() => startListening(), 1000);
        }
      };
      
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const speakDriverResponse = (text: string) => {
    if (!isAudioEnabled || !synthRef.current) return;
    
    synthRef.current.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(`Professional response: ${text}`);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening || isSpeaking) return;
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
      toast({
        title: "Listening...",
        description: "Speak your response to the officer's question.",
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startPractice = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowAnswer(false);
    setUserResponse("");

    createSessionMutation.mutate({
      userId: 1,
      type: "dot",
      categoryId,
      duration: 0,
      completed: false,
    });

    if (isAudioEnabled) {
      setTimeout(() => {
        if (synthRef.current) {
          const utterance = new SpeechSynthesisUtterance("Starting officer-driver conversation practice. Listen for the officer's questions and respond naturally.");
          synthRef.current.speak(utterance);
        }
      }, 1000);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    
    if (questions && isAudioEnabled) {
      const currentQuestion = questions[currentQuestionIndex];
      setTimeout(() => speakDriverResponse(currentQuestion.correctAnswer), 500);
    }
  };

  const handleNextQuestion = () => {
    if (!questions) return;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserResponse("");
      setShowAnswer(false);
    } else {
      // Practice complete
      const finalScore = Math.round((score / questions.length) * 100);
      if (sessionId) {
        updateSessionMutation.mutate({
          id: sessionId,
          updates: {
            duration: Math.floor((Date.now() - (sessionId * 1000)) / 60000), // Approximate duration
            score: finalScore,
            completed: true,
          },
        });
      }
      
      if (isAudioEnabled) {
        setTimeout(() => {
          if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(`Practice complete! You practiced ${questions.length} officer-driver conversations. Great job improving your professional communication skills.`);
            synthRef.current.speak(utterance);
          }
        }, 1000);
      }
      
      setTimeout(() => resetPractice(), 4000);
    }
  };

  const resetPractice = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setUserResponse("");
    setShowAnswer(false);
    setScore(0);
    setSessionId(null);
    stopListening();
    stopSpeaking();
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

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DOT Practice</h1>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setAutoPlay(!autoPlay)}
                variant={autoPlay ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {autoPlay ? <PlayCircle className="h-4 w-4" /> : <StopCircle className="h-4 w-4" />}
                <span>{autoPlay ? "Auto Play" : "Manual"}</span>
              </Button>
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
            {categories?.map((category: any) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                  onClick={() => startPractice(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>{category.questionsCount} conversations</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
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
                onClick={() => setAutoPlay(!autoPlay)}
                variant={autoPlay ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {autoPlay ? <PlayCircle className="h-4 w-4" /> : <StopCircle className="h-4 w-4" />}
                <span>{autoPlay ? "Auto" : "Manual"}</span>
              </Button>
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
              {/* Hands-free Instructions */}
              {isAudioEnabled && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Hands-Free Mode:</span> Officer questions play automatically. Use voice to respond or type manually.
                  </p>
                </div>
              )}
              
              {/* Officer-Driver Conversation Interface */}
              <div className="space-y-4">
                {/* Officer Question */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Officer</span>
                      </div>
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300">Officer asks:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isSpeaking && (
                        <Button
                          onClick={stopSpeaking}
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-red-600"
                        >
                          <StopCircle className="h-4 w-4" />
                          <span className="text-xs">Stop</span>
                        </Button>
                      )}
                      <Button
                        onClick={speakOfficerQuestion}
                        disabled={isSpeaking}
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="text-xs">Listen</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">{currentQuestion.question}</p>
                </div>

                {/* Driver Response Section */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                      <span className="font-semibold text-green-700 dark:text-green-300">Your Response:</span>
                    </div>
                    
                    {/* Voice Controls */}
                    <div className="flex items-center space-x-2">
                      {isListening ? (
                        <Button
                          onClick={stopListening}
                          variant="destructive"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <MicOff className="h-4 w-4" />
                          <span className="text-xs">Stop</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={startListening}
                          disabled={!isAudioEnabled || isSpeaking}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Mic className="h-4 w-4" />
                          <span className="text-xs">Speak</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {userResponse ? (
                    <div className="space-y-2">
                      <p className="text-lg text-gray-800 dark:text-gray-200 italic">"{userResponse}"</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder="Speak your response or type here..."
                        className="w-full p-3 border rounded-lg resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        rows={2}
                      />
                      {isListening && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Listening for your response...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Professional Answer (when shown) */}
                {showAnswer && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Professional Response:</h4>
                      <Button
                        onClick={() => speakDriverResponse(currentQuestion.correctAnswer)}
                        disabled={isSpeaking}
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="text-xs">Listen</span>
                      </Button>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 italic mb-2">"{currentQuestion.correctAnswer}"</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                {!showAnswer ? (
                  <Button 
                    onClick={handleShowAnswer} 
                    disabled={!userResponse}
                    className="flex items-center space-x-2"
                  >
                    <span>Show Professional Response</span>
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="flex items-center space-x-2">
                    <span>{currentQuestionIndex < questions.length - 1 ? 'Next Conversation' : 'Complete Practice'}</span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                )}
              </div>

              {/* Progress */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Conversation {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>Progress: {Math.round(((currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length) * 100)}%</span>
                </div>
                
                <Progress 
                  value={((currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length) * 100} 
                  className="w-full" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading Conversations...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}