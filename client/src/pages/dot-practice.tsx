import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, FileText, TrafficCone, Check, X, Volume2, VolumeX, Mic, MicOff, Repeat, PlayCircle, Truck, Package } from "lucide-react";
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
            // Auto-restart listening after speech ends
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
    
    // Stop any current speech
    synthRef.current.cancel();
    
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
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

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    // Convert options to lowercase for matching
    const optionMatches = (currentQuestion.options as string[]).map((option, index) => ({
      option: option.toLowerCase(),
      index,
      originalOption: option
    }));

    // Check for direct option matches
    for (const match of optionMatches) {
      if (command.includes(match.option) || 
          command.includes(`option ${match.index + 1}`) ||
          command.includes(`choice ${match.index + 1}`) ||
          command.includes(`answer ${match.index + 1}`)) {
        handleAnswerSelect(match.originalOption);
        return;
      }
    }

    // Check for letter choices (A, B, C, D)
    const letterMap = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < letterMap.length && i < optionMatches.length; i++) {
      if (command.includes(letterMap[i]) || command.includes(`letter ${letterMap[i]}`)) {
        handleAnswerSelect(optionMatches[i].originalOption);
        return;
      }
    }

    // Navigation commands
    if (command.includes('next') || command.includes('continue')) {
      if (selectedAnswer && !showResult) {
        handleNextQuestion();
      }
    } else if (command.includes('repeat') || command.includes('again')) {
      readCurrentQuestion();
    } else if (command.includes('back') || command.includes('previous')) {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    } else if (command.includes('home') || command.includes('menu')) {
      resetPractice();
    }
  };

  // Read the current question and options
  const readCurrentQuestion = () => {
    if (!questions || !isAudioEnabled) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const questionText = `Question ${currentQuestionIndex + 1} of ${questions.length}. ${currentQuestion.question}`;
    const optionsText = (currentQuestion.options as string[])
      .map((option, index) => `Option ${index + 1}: ${option}`)
      .join('. ');
    
    const fullText = `${questionText}. Your options are: ${optionsText}. Please say your answer, option number, or letter A through D.`;
    speak(fullText);
  };

  // Auto-read question when it changes
  useEffect(() => {
    if (selectedCategory && questions && isAudioEnabled && !showResult) {
      setTimeout(() => readCurrentQuestion(), 500);
    }
  }, [currentQuestionIndex, selectedCategory, questions, isAudioEnabled, showResult]);

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
        description: `You scored ${score}% on this practice session.`,
      });
    },
  });

  const startPractice = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);

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
        speak("Starting DOT practice session. Please wait for the first question.");
        setTimeout(() => startListening(), 2000);
      }, 1000);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!questions || !selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);

    // Provide audio feedback
    if (isAudioEnabled) {
      const feedback = isCorrect ? "Correct!" : "Incorrect.";
      const explanation = currentQuestion.explanation ? ` ${currentQuestion.explanation}` : "";
      speak(`${feedback}${explanation}`);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        
        // Read next question automatically
        if (isAudioEnabled) {
          setTimeout(() => readCurrentQuestion(), 1000);
        }
      } else {
        // Practice complete
        const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / questions.length) * 100);
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
    }, 3000);
  };

  const resetPractice = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSessionId(null);
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

  if (selectedCategory && questions) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPractice}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-medium text-gray-900">DOT Practice</h2>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            
            {/* Audio Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRepeat(!autoRepeat)}
                className={`p-2 ${autoRepeat ? 'text-truck-blue' : 'text-gray-400'}`}
                title="Auto-repeat listening"
              >
                <Repeat className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={readCurrentQuestion}
                className="p-2"
                title="Read question aloud"
                disabled={isSpeaking}
              >
                <PlayCircle className={`h-4 w-4 ${isSpeaking ? 'text-truck-blue' : 'text-gray-600'}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={`p-2 ${isListening ? 'text-green-600' : 'text-gray-600'}`}
                title={isListening ? 'Stop listening' : 'Start voice recognition'}
              >
                {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-2 ${isAudioEnabled ? 'text-truck-blue' : 'text-gray-400'}`}
                title={isAudioEnabled ? 'Disable audio' : 'Enable audio'}
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {isListening && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">Listening for your answer...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex-1">{currentQuestion.question}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={readCurrentQuestion}
                  className="ml-2 p-1"
                  title="Read question aloud"
                  disabled={isSpeaking}
                >
                  <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-truck-blue' : 'text-gray-500'}`} />
                </Button>
              </div>
              
              {/* Voice Instructions */}
              {isAudioEnabled && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Voice Commands:</span> Say "Option 1", "Option 2", "A", "B", "C", "D", or speak the full answer
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {(currentQuestion.options as string[]).map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isIncorrect = showResult && isSelected && !isCorrect;
                  const shouldShowCorrect = showResult && isCorrect;
                  const letter = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && handleAnswerSelect(option)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected && !showResult
                          ? 'border-truck-blue bg-blue-50'
                          : showResult && shouldShowCorrect
                          ? 'border-green-500 bg-green-50'
                          : isIncorrect
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-500 text-sm min-w-[20px]">{letter}.</span>
                          <span className="flex-1">{option}</span>
                        </div>
                        {showResult && shouldShowCorrect && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                        {isIncorrect && (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && currentQuestion.explanation && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                  <p className="text-blue-800 text-sm">{currentQuestion.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Button */}
          {selectedAnswer && !showResult && (
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-truck-blue hover:bg-blue-700"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-medium">DOT Practice</h2>
          <p className="text-sm text-gray-600">Regulation & Safety Terms</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Practice Categories */}
        <div className="space-y-3">
          {categories?.map((category: any) => {
            const Icon = getCategoryIcon(category.name);
            const colorClasses = getCategoryColor(category.color);
            
            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.questionsCount} questions available</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => startPractice(category.id)}
                      className={`${
                        category.color === 'truck-orange'
                          ? 'bg-truck-orange hover:bg-orange-600'
                          : category.color === 'truck-blue'
                          ? 'bg-truck-blue hover:bg-blue-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      Practice
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
