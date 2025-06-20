import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, Volume2, VolumeX, Mic, MicOff, PlayCircle, StopCircle, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import VoiceSelector from "@/components/voice-selector";

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
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  // Audio and hands-free features
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  
  // Voice selection with persistent storage
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedOfficerVoice, setSelectedOfficerVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dotPracticeOfficerVoice') || '';
    }
    return '';
  });
  const [selectedDriverVoice, setSelectedDriverVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dotPracticeDriverVoice') || '';
    }
    return '';
  });
  
  const { toast } = useToast();

  // Voice preference handlers with persistence
  const handleOfficerVoiceChange = (voice: string) => {
    setSelectedOfficerVoice(voice);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dotPracticeOfficerVoice', voice);
    }
  };

  const handleDriverVoiceChange = (voice: string) => {
    setSelectedDriverVoice(voice);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dotPracticeDriverVoice', voice);
    }
  };

  // Initialize speech recognition and synthesis with mobile optimization
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
      
      // Mobile volume optimization - request audio context activation with gain boost
      if (synthRef.current && 'AudioContext' in window) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          document.addEventListener('touchstart', () => {
            audioContext.resume();
          }, { once: true });
        }
        
        // Store audio context for volume boosting
        (window as any).audioContext = audioContext;
      }
    }
  }, [toast]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/dot-categories"],
    queryFn: api.getDotCategories,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
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

  // Auto-speak officer question when it loads, then auto-show answer
  useEffect(() => {
    if (questions && questions.length > 0 && isAudioEnabled && autoPlay && !showAnswer && !questionsLoading) {
      setTimeout(() => speakOfficerQuestion(), 1000);
    }
  }, [currentQuestionIndex, questions, isAudioEnabled, autoPlay, showAnswer, questionsLoading]);

  // Auto-show answer after officer speaks and play driver response
  // Sequential conversation - officer speaks first, then driver responds when officer finishes
  // No timer needed - driver response is triggered by officer completion

  const speakOfficerQuestion = async () => {
    if (!questions || !isAudioEnabled || !questions[currentQuestionIndex]) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    setIsSpeaking(true);

    try {
      // Use GTTS for professional voice quality
      console.log('Requesting GTTS officer voice for:', currentQuestion.question);
      
      const response = await fetch('/api/speak-dot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentQuestion.question,
          voice: 'officer',
          voiceId: selectedOfficerVoice
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        console.log('GTTS officer audio blob size:', audioBlob.size, 'type:', audioBlob.type);
        
        if (audioBlob.size === 0) {
          console.error('Empty GTTS officer audio blob received');
          setIsSpeaking(false);
          return;
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Created GTTS officer audio URL');
        
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        
        // Debug GTTS audio loading
        audio.onloadstart = () => console.log('GTTS officer audio loading...');
        audio.oncanplay = () => console.log('GTTS officer audio ready to play');
        audio.onerror = (e) => console.error('GTTS officer audio error:', e);
        
        // Maximum mobile audio amplification system
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(audio);
          
          // Extreme gain staging for maximum mobile volume
          const preGain = audioContext.createGain();
          const mainGain = audioContext.createGain();
          const boostGain = audioContext.createGain();
          
          // Ultra maximum amplification settings for GTTS
          preGain.gain.value = 15.0;    // 1500% pre-amplification
          mainGain.gain.value = 10.0;   // 1000% main amplification  
          boostGain.gain.value = 8.0;   // 800% final boost
          
          // Aggressive compression for maximum loudness
          const compressor = audioContext.createDynamicsCompressor();
          compressor.threshold.value = -12;
          compressor.knee.value = 30;
          compressor.ratio.value = 20;
          compressor.attack.value = 0.003;
          compressor.release.value = 0.25;
          
          // Speech frequency boost for clarity
          const speechFilter = audioContext.createBiquadFilter();
          speechFilter.type = 'peaking';
          speechFilter.frequency.value = 2000;  // Key speech frequency
          speechFilter.Q.value = 3.0;
          speechFilter.gain.value = 8;
          
          // Secondary speech boost
          const midBoost = audioContext.createBiquadFilter();
          midBoost.type = 'peaking';
          midBoost.frequency.value = 1000;
          midBoost.Q.value = 2.0;
          midBoost.gain.value = 6;
          
          // Final limiter to prevent distortion
          const limiter = audioContext.createDynamicsCompressor();
          limiter.threshold.value = -6;
          limiter.knee.value = 0;
          limiter.ratio.value = 50;
          limiter.attack.value = 0.001;
          limiter.release.value = 0.1;
          
          // Connect maximum volume chain
          source.connect(preGain);
          preGain.connect(midBoost);
          midBoost.connect(speechFilter);
          speechFilter.connect(mainGain);
          mainGain.connect(boostGain);
          boostGain.connect(compressor);
          compressor.connect(limiter);
          limiter.connect(audioContext.destination);
          
          // Ensure audio context is active
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          
          console.log('Applied maximum mobile amplification: 19,200% total gain with speech optimization');
        } catch (error) {
          console.log('Maximum mobile amplification unavailable:', error);
        }
        
        // Set normal playback speed to prevent cutting
        audio.playbackRate = 1.0;
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Show answer and play driver response after officer finishes
          if (autoPlay && questions[currentQuestionIndex]) {
            setShowAnswer(true);
            // Longer delay to let officer voice complete and user process the question
            setTimeout(() => {
              const currentQuestion = questions[currentQuestionIndex];
              const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswer];
              speakDriverResponse(correctAnswerText);
            }, 2000); // 2 second pause between officer and driver
          }
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        // Force audio to play on mobile devices
        audio.muted = false;
        audio.preload = 'auto';
        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (playError) {
          console.log('Officer voice play failed:', playError);
          setIsSpeaking(false);
        }
        return;
      }
    } catch (error) {
      console.log('GTTS not available, using browser synthesis fallback');
    }

    // Fallback to browser synthesis with mobile compatibility
    if (synthRef.current) {
      synthRef.current.cancel();
      
      // Wait for voices to load on mobile
      let voices = synthRef.current.getVoices();
      if (voices.length === 0) {
        synthRef.current.addEventListener('voiceschanged', () => {
          voices = synthRef.current.getVoices();
        });
        // Small delay for mobile voice loading
        await new Promise(resolve => setTimeout(resolve, 100));
        voices = synthRef.current.getVoices();
      }
      
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      utterance.rate = 0.5;  // Much slower speech for better learning
      utterance.pitch = 0.7;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      console.log('Available voices:', voices.map(v => v.name));
      
      // Find best male voice with mobile priority
      const maleVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && 
        !voice.name.toLowerCase().includes('female') &&
        !voice.name.toLowerCase().includes('woman') &&
        !voice.name.toLowerCase().includes('samantha') &&
        !voice.name.toLowerCase().includes('karen') &&
        !voice.name.toLowerCase().includes('susan') &&
        !voice.name.toLowerCase().includes('victoria') &&
        !voice.name.toLowerCase().includes('zoe')
      );
      
      // Prioritize mobile-compatible voices
      const bestVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('google male') ||
        voice.name.toLowerCase().includes('android male')
      ) || maleVoices.find(voice => 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('alex') ||
        voice.name.toLowerCase().includes('tom') ||
        voice.name.toLowerCase().includes('fred') ||
        voice.name.toLowerCase().includes('david')
      ) || maleVoices[0] || voices[0];
      
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log('Officer voice selected:', bestVoice.name);
      }
      
      utterance.onstart = () => {
        console.log('Speech synthesis started successfully');
      };
      
      utterance.onend = () => {
        console.log('Speech synthesis completed');
        setIsSpeaking(false);
        if (isAudioEnabled && !userResponse) {
          setTimeout(() => startListening(), 500);
        }
      };
      
      utterance.onerror = (event) => {
        console.log('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
      
      // Mobile-specific speech synthesis fixes
      try {
        // Clear any pending speech
        if (synthRef.current.speaking) {
          synthRef.current.cancel();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Resume if paused (common mobile issue)
        if (synthRef.current.paused) {
          synthRef.current.resume();
        }
        
        console.log('Starting speech synthesis for officer question');
        synthRef.current.speak(utterance);
        
        // Mobile workaround: check if actually speaking after delay
        setTimeout(() => {
          if (!synthRef.current.speaking && !utterance.text === '') {
            console.log('Speech may have failed, retrying...');
            synthRef.current.speak(utterance);
          }
        }, 500);
        
      } catch (synthError) {
        console.log('Speech synthesis failed:', synthError);
        setIsSpeaking(false);
      }
    } else {
      console.log('Speech synthesis not available');
      setIsSpeaking(false);
    }
  };

  const speakDriverResponse = async (text: string) => {
    if (!isAudioEnabled) return;
    
    setIsSpeaking(true);

    try {
      // Use professional voice for driver response
      const response = await fetch('/api/speak-dot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'driver',
          voiceId: selectedDriverVoice
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        audio.playbackRate = 1.0;
        
        // Debug GTTS driver audio
        console.log('GTTS driver audio blob size:', audioBlob.size, 'type:', audioBlob.type);
        
        if (audioBlob.size === 0) {
          console.error('Empty GTTS driver audio blob received');
          setIsSpeaking(false);
          return;
        }
        
        console.log('Created GTTS driver audio URL');
        
        // Debug audio loading
        audio.onloadstart = () => console.log('GTTS driver audio loading...');
        audio.oncanplay = () => console.log('GTTS driver audio ready to play');
        audio.onerror = (e) => console.error('GTTS driver audio error:', e);
        
        // Maximum mobile audio amplification for driver
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(audio);
          
          const preGain = audioContext.createGain();
          const mainGain = audioContext.createGain();
          const boostGain = audioContext.createGain();
          
          preGain.gain.value = 15.0;
          mainGain.gain.value = 10.0;
          boostGain.gain.value = 8.0;
          
          const compressor = audioContext.createDynamicsCompressor();
          compressor.threshold.value = -12;
          compressor.knee.value = 30;
          compressor.ratio.value = 20;
          
          source.connect(preGain);
          preGain.connect(mainGain);
          mainGain.connect(boostGain);
          boostGain.connect(compressor);
          compressor.connect(audioContext.destination);
          
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          
          console.log('Applied maximum driver mobile amplification: 19,200% total gain');
        } catch (error) {
          console.log('Driver amplification unavailable:', error);
        }
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Move to next question after driver speaks with much longer pause
          if (autoPlay && questions) {
            setTimeout(() => {
              handleNextQuestion();
            }, 4000); // 4 second pause between driver response and next officer question
          }
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.muted = false;
        audio.preload = 'auto';
        
        console.log('Attempting to play GTTS officer audio...');
        try {
          await audio.play();
          console.log('GTTS officer audio playing successfully');
        } catch (playError) {
          console.error('Audio play failed:', playError);
          throw playError;
        }
        return;
      }
    } catch (error) {
      console.log('Driver voice service unavailable, using browser fallback');
    }

    // Browser synthesis fallback for driver
    if (synthRef.current) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.5;
      utterance.pitch = 0.8;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      const voices = synthRef.current.getVoices();
      const maleVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && 
        !voice.name.toLowerCase().includes('female')
      );
      
      const driverVoice = maleVoices.find(voice => 
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('alex')
      ) || maleVoices[1] || maleVoices[0] || voices[0];
      
      if (driverVoice) {
        utterance.voice = driverVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
        if (autoPlay && questions) {
          handleNextQuestion();
        }
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
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
    setShowAnswer(false);
    setUserResponse("");

    createSessionMutation.mutate({
      userId: 1,
      type: "dot",
      categoryId,
      duration: 0,
      completed: false,
    });

    // Force unlock audio on mobile devices with user interaction
    if ('AudioContext' in window && (window as any).audioContext) {
      const audioContext = (window as any).audioContext;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    
    if (questions && isAudioEnabled && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex];
      setTimeout(() => speakDriverResponse(currentQuestion.options[currentQuestion.correctAnswer]), 500);
    }
  };

  const handleNextQuestion = () => {
    if (!questions || questions.length === 0) return;

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
    setSessionId(null);
    stopListening();
    stopSpeaking();
  };

  // Show loading state
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading DOT Practice...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

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
                onClick={() => setShowVoiceSelector(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Voices</span>
              </Button>
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

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Only show Officer Interactions category with 200 conversations */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
              onClick={() => startPractice(6)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <Shield className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Officer Interactions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Professional communication with DOT officers during traffic stops</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>200 conversations</span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon categories */}
            <Card className="opacity-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                    <Shield className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">More Categories</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Additional practice categories coming soon</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Coming soon</span>
                  <Button size="sm" disabled variant="outline">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voice Selector Modal */}
        <VoiceSelector
          selectedOfficerVoice={selectedOfficerVoice}
          selectedDriverVoice={selectedDriverVoice}
          onOfficerVoiceChange={handleOfficerVoiceChange}
          onDriverVoiceChange={handleDriverVoiceChange}
          isOpen={showVoiceSelector}
          onClose={() => setShowVoiceSelector(false)}
        />
      </div>
    );
  }

  // Show loading state for questions
  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading Conversations...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                onClick={() => setShowVoiceSelector(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Voices</span>
              </Button>
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
                        onClick={() => speakDriverResponse(questions[currentQuestionIndex]?.options[questions[currentQuestionIndex]?.correctAnswer] || '')}
                        disabled={isSpeaking}
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="text-xs">Listen</span>
                      </Button>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 italic mb-2 text-lg font-medium">"{questions[currentQuestionIndex]?.options[questions[currentQuestionIndex]?.correctAnswer] || 'Loading response...'}"</p>
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

        {/* Voice Selector Modal */}
        <VoiceSelector
          selectedOfficerVoice={selectedOfficerVoice}
          selectedDriverVoice={selectedDriverVoice}
          onOfficerVoiceChange={handleOfficerVoiceChange}
          onDriverVoiceChange={handleDriverVoiceChange}
          isOpen={showVoiceSelector}
          onClose={() => setShowVoiceSelector(false)}
        />
      </div>
    );
  }

  // No questions available
  const noQuestionsView = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No conversations available</h2>
        <Button onClick={resetPractice} variant="outline">
          Back to Categories
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {noQuestionsView}
      
      {/* Voice Selector Modal - Always available */}
      <VoiceSelector
        selectedOfficerVoice={selectedOfficerVoice}
        selectedDriverVoice={selectedDriverVoice}
        onOfficerVoiceChange={setSelectedOfficerVoice}
        onDriverVoiceChange={setSelectedDriverVoice}
        isOpen={showVoiceSelector}
        onClose={() => setShowVoiceSelector(false)}
      />
    </>
  );
}