import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, Volume2, VolumeX, PlayCircle, StopCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DotPracticeSimple() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversationState, setConversationState] = useState<'idle' | 'officer-speaking' | 'pause' | 'driver-speaking' | 'waiting'>('idle');

  const { toast } = useToast();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/dot-categories'],
  });

  // Fetch questions for selected category
  const { data: questions } = useQuery({
    queryKey: ['/api/dot-questions', selectedCategory],
    enabled: selectedCategory !== null,
  });

  // Create practice session
  const createSessionMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest('POST', '/api/practice-sessions', {
        type: 'dot',
        categoryId: categoryId,
      });
    },
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  // Speech functions
  const speakText = async (text: string, voice: 'officer' | 'driver' = 'officer') => {
    try {
      const response = await fetch('/api/speak-dot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) throw new Error('Voice generation failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Speech error:', error);
      throw error;
    }
  };

  // Simple conversation flow
  const startConversation = async () => {
    if (!questions || !questions[currentQuestionIndex]) return;

    setIsPlaying(true);
    setConversationState('officer-speaking');

    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Officer speaks
      await speakText(currentQuestion.question, 'officer');
      
      // Pause
      setConversationState('pause');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Driver responds
      setConversationState('driver-speaking');
      setShowAnswer(true);
      const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];
      await speakText(correctAnswer, 'driver');
      
      // Wait before next
      setConversationState('waiting');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowAnswer(false);
        setConversationState('idle');
        // Auto-continue
        setTimeout(() => startConversation(), 1000);
      } else {
        // Completed
        setIsPlaying(false);
        setConversationState('idle');
        toast({
          title: "Practice Complete!",
          description: `You completed ${questions.length} conversations.`,
        });
      }
    } catch (error) {
      setIsPlaying(false);
      setConversationState('idle');
      toast({
        title: "Audio Error",
        description: "Could not play audio. Try again.",
        variant: "destructive",
      });
    }
  };

  const stopConversation = () => {
    setIsPlaying(false);
    setConversationState('idle');
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    createSessionMutation.mutate(categoryId);
  };

  const handleNextQuestion = () => {
    if (!questions) return;
    
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DOT Practice</h1>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories?.map((category: any) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Practice authentic officer conversations
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              DOT Practice - {categories?.find(c => c.id === selectedCategory)?.name}
            </h1>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Question {currentQuestionIndex + 1} of {questions?.length || 0}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Conversation Controls */}
        <div className="flex gap-4 mb-6 justify-center">
          {!isPlaying ? (
            <Button onClick={startConversation} className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Start Conversation
            </Button>
          ) : (
            <Button onClick={stopConversation} variant="destructive" className="flex items-center gap-2">
              <StopCircle className="w-5 h-5" />
              Stop Conversation
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          <div className="text-lg font-medium text-slate-900 dark:text-white">
            {conversationState === 'idle' && 'Ready to start conversation'}
            {conversationState === 'officer-speaking' && '🚔 Officer speaking...'}
            {conversationState === 'pause' && '⏸️ Processing...'}
            {conversationState === 'driver-speaking' && '🚛 Driver responding...'}
            {conversationState === 'waiting' && '⏳ Next question coming...'}
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Officer Question:
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  {currentQuestion.question}
                </p>
              </div>

              {showAnswer && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-md font-semibold text-green-800 dark:text-green-200 mb-2">
                    Professional Driver Response:
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0 || isPlaying}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNextQuestion}
            disabled={!questions || currentQuestionIndex === questions.length - 1 || isPlaying}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}