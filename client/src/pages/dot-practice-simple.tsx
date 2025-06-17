import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, FileText, TrafficCone, Truck, Package, Volume2, Mic } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DotPractice() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const { toast } = useToast();

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
        description: `You completed the practice session.`,
      });
    },
  });

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
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (!questions) return;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserResponse("");
      setShowAnswer(false);
    } else {
      // Practice complete
      if (sessionId) {
        updateSessionMutation.mutate({
          id: sessionId,
          updates: {
            duration: 5,
            score: 100,
            completed: true,
          },
        });
      }
      
      setTimeout(() => resetPractice(), 2000);
    }
  };

  const resetPractice = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setUserResponse("");
    setShowAnswer(false);
    setScore(0);
    setSessionId(null);
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
                      <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>20 questions</span>
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
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Officer-Driver Conversation Interface */}
              <div className="space-y-4">
                {/* Officer Question */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Officer</span>
                    </div>
                    <Button
                      onClick={() => speakText(currentQuestion.question)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="text-xs">Listen</span>
                    </Button>
                  </div>
                  <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">{currentQuestion.question}</p>
                </div>

                {/* Driver Response Section */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                    <span className="font-semibold text-green-700 dark:text-green-300">Your Response:</span>
                  </div>
                  
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your response to the officer here..."
                    className="w-full p-3 border rounded-lg resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>

                {/* Professional Answer (when shown) */}
                {showAnswer && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Professional Response:</h4>
                    <p className="text-gray-800 dark:text-gray-200 italic mb-2">"{currentQuestion.correctAnswer}"</p>
                    {currentQuestion.explanation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{currentQuestion.explanation}</p>
                    )}
                    <Button
                      onClick={() => speakText(currentQuestion.correctAnswer)}
                      variant="ghost"
                      size="sm"
                      className="mt-2 flex items-center space-x-1"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="text-xs">Listen to Answer</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                {!showAnswer ? (
                  <Button onClick={handleShowAnswer} className="flex items-center space-x-2">
                    <span>Show Professional Response</span>
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="flex items-center space-x-2">
                    <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}</span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                )}
              </div>

              {/* Progress */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                
                <Progress 
                  value={((currentQuestionIndex + 1) / questions.length) * 100} 
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading Questions...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}