import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play } from 'lucide-react';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  category: 'officer' | 'driver';
}

interface VoiceSelectorProps {
  selectedOfficerVoice?: string;
  selectedDriverVoice?: string;
  onOfficerVoiceChange: (voiceId: string) => void;
  onDriverVoiceChange: (voiceId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSelector({
  selectedOfficerVoice,
  selectedDriverVoice,
  onOfficerVoiceChange,
  onDriverVoiceChange,
  isOpen,
  onClose
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchVoices();
    }
  }, [isOpen]);

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices');
      const voiceData = await response.json();
      setVoices(voiceData);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId: string, category: 'officer' | 'driver') => {
    setTestingVoice(voiceId);
    
    const testText = category === 'officer' 
      ? "License and registration please, driver." 
      : "Yes sir, here are my documents.";

    try {
      const response = await fetch('/api/speak-dot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voice: category,
          voiceId: voiceId
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        await audio.play();
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setTestingVoice(null);
        };
      }
    } catch (error) {
      console.error('Voice test failed:', error);
      setTestingVoice(null);
    }
  };

  const officerVoices = voices.filter(v => v.category === 'officer');
  const driverVoices = voices.filter(v => v.category === 'driver');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Choose Your Voices
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 dark:text-gray-400">
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select professional male voices for realistic DOT practice
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading voices...</p>
            </div>
          ) : (
            <>
              {/* Officer Voices */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Officer
                  </Badge>
                  Authoritative Voices
                </h3>
                <div className="grid gap-3">
                  {officerVoices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedOfficerVoice === voice.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => onOfficerVoiceChange(voice.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{voice.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            testVoice(voice.id, 'officer');
                          }}
                          disabled={testingVoice === voice.id}
                          className="text-blue-600 dark:text-blue-400"
                        >
                          {testingVoice === voice.id ? (
                            <Volume2 className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Voices */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    Driver
                  </Badge>
                  Professional Voices
                </h3>
                <div className="grid gap-3">
                  {driverVoices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedDriverVoice === voice.id 
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => onDriverVoiceChange(voice.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{voice.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            testVoice(voice.id, 'driver');
                          }}
                          disabled={testingVoice === voice.id}
                          className="text-orange-600 dark:text-orange-400"
                        >
                          {testingVoice === voice.id ? (
                            <Volume2 className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Save Voice Selection
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}