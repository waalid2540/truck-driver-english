import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, Volume2, PlayCircle, Play, Pause } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DotCategory, DotQuestion } from "@shared/schema";

export default function DotPracticeFixed() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isPlayingOfficer, setIsPlayingOfficer] = useState(false);
  const [isPlayingDriver, setIsPlayingDriver] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const { toast } = useToast();

  // Fetch categories
  const { data: categories } = useQuery<DotCategory[]>({
    queryKey: ['/api/dot-categories'],
  });

  // Fetch questions for selected category
  const { data: questions } = useQuery<DotQuestion[]>({
    queryKey: [`/api/dot-questions/${selectedCategory}`],
    enabled: selectedCategory !== null,
  });

  // Create practice session
  const createSessionMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await apiRequest('POST', '/api/practice-sessions', {
        type: 'dot',
        categoryId: categoryId,
      });
      return response;
    },
    onSuccess: (data: any) => {
      setSessionId(data.id);
    },
  });

  // Simple voice function
  const playVoice = async (text: string, voice: 'officer' | 'driver' = 'officer') => {
    try {
      if (voice === 'officer') setIsPlayingOfficer(true);
      if (voice === 'driver') setIsPlayingDriver(true);

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
          if (voice === 'officer') setIsPlayingOfficer(false);
          if (voice === 'driver') setIsPlayingDriver(false);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          if (voice === 'officer') setIsPlayingOfficer(false);
          if (voice === 'driver') setIsPlayingDriver(false);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
    } catch (error) {
      if (voice === 'officer') setIsPlayingOfficer(false);
      if (voice === 'driver') setIsPlayingDriver(false);
      toast({
        title: "Audio Error",
        description: "Could not play audio. Try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-play sequence: officer question → driver response → next question
  const playAutoSequence = async () => {
    if (!questions || questions.length === 0 || !questions[currentQuestionIndex]) return;
    
    setIsAutoPlaying(true);
    setShowAnswer(true);
    
    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Play officer question
      await playVoice(currentQuestion.question, 'officer');
      
      // Wait 2 seconds between officer and driver
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Play driver response
      if (Array.isArray(currentQuestion.options)) {
        const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];
        await playVoice(correctAnswer, 'driver');
      }
      
      // Wait 3 seconds then move to next question
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (autoPlay) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setShowAnswer(false);
          setIsAutoPlaying(false); // Reset so next question can start
        } else {
          setAutoPlay(false);
          setIsAutoPlaying(false);
          toast({
            title: "Auto-play Complete!",
            description: `Finished all ${questions.length} questions.`,
          });
        }
      }
    } catch (error) {
      setAutoPlay(false);
      setIsAutoPlaying(false);
    } finally {
      setIsAutoPlaying(false);
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && questions && questions.length > 0 && !isAutoPlaying) {
      playAutoSequence();
    }
  }, [autoPlay, currentQuestionIndex, questions]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    // Skip session creation for now, just load questions
  };

  const handleNextQuestion = () => {
    if (!questions || questions.length === 0) return;
    
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      toast({
        title: "Practice Complete!",
        description: `You completed all ${questions.length} questions.`,
      });
    }
  };

  const handlePrevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const playOfficerQuestion = () => {
    if (!questions || questions.length === 0 || !questions[currentQuestionIndex]) return;
    playVoice(questions[currentQuestionIndex].question, 'officer');
  };

  const playDriverResponse = () => {
    if (!questions || questions.length === 0 || !questions[currentQuestionIndex]) return;
    const currentQuestion = questions[currentQuestionIndex];
    if (Array.isArray(currentQuestion.options)) {
      const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];
      playVoice(correctAnswer, 'driver');
    }
  };

  const progress = questions && questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Auto-load your authentic questions directly
  if (!selectedCategory) {
    setSelectedCategory(6); // Set category directly without calling function
  }

  // Show loading while questions are fetching
  if (selectedCategory && !questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-300">Loading your authentic officer-driver questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Your Authentic Officer-Driver Questions ({questions?.length || 0})
            </h1>
          </div>
        </div>

        {/* Auto-play Controls */}
        <div className="mb-6 text-center">
          <Button
            onClick={() => {
              setAutoPlay(!autoPlay);
              if (!autoPlay) {
                setCurrentQuestionIndex(0);
                setShowAnswer(false);
              } else {
                setIsAutoPlaying(false);
              }
            }}
            size="lg"
            variant={autoPlay ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {autoPlay ? (
              <>
                <Pause className="w-5 h-5" />
                Stop Hands-Free Mode
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Hands-Free Auto-Play
              </>
            )}
          </Button>
          {autoPlay && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Auto-playing: Officer question → Driver response → Next question
            </p>
          )}
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

        {/* Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Officer Question:
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-lg mb-4">
                  {currentQuestion.question}
                </p>
                <Button 
                  onClick={playOfficerQuestion}
                  disabled={isPlayingOfficer}
                  className="flex items-center gap-2"
                >
                  {isPlayingOfficer ? (
                    <>
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      Playing Officer...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" />
                      Play Officer Question
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  className="mb-4"
                >
                  {showAnswer ? 'Hide Answer' : 'Show Professional Response'}
                </Button>
              </div>

              {showAnswer && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-md font-semibold text-green-800 dark:text-green-200 mb-3 text-center">
                    Professional Driver Response:
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-center mb-4">
                    {Array.isArray(currentQuestion.options) ? currentQuestion.options[currentQuestion.correctAnswer] : 'Loading...'}
                  </p>
                  <div className="text-center">
                    <Button 
                      onClick={playDriverResponse}
                      disabled={isPlayingDriver}
                      variant="outline"
                      className="flex items-center gap-2 mx-auto"
                    >
                      {isPlayingDriver ? (
                        <>
                          <Volume2 className="w-5 h-5 animate-pulse" />
                          Playing Driver...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-5 h-5" />
                          Play Driver Response
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0 || autoPlay}
          >
            Previous Question
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={(!questions || currentQuestionIndex === questions.length - 1) || autoPlay}
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
}