import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, FileText, TrafficCone, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DotPractice() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
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
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
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
        resetPractice();
      }
    }, 2000);
  };

  const resetPractice = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPractice}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">DOT Practice</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
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
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{currentQuestion.question}</h3>
              
              <div className="space-y-3">
                {(currentQuestion.options as string[]).map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isIncorrect = showResult && isSelected && !isCorrect;
                  const shouldShowCorrect = showResult && isCorrect;

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
                        <span>{option}</span>
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
          {categories?.map((category) => {
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
