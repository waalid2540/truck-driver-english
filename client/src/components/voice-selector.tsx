import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play, Copy } from 'lucide-react';

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
  const [officerVoiceId, setOfficerVoiceId] = useState(selectedOfficerVoice || '');
  const [driverVoiceId, setDriverVoiceId] = useState(selectedDriverVoice || '');
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    setOfficerVoiceId(selectedOfficerVoice || '');
    setDriverVoiceId(selectedDriverVoice || '');
  }, [selectedOfficerVoice, selectedDriverVoice]);

  useEffect(() => {
    if (isOpen) {
      fetchVoices();
    }
  }, [isOpen]);

  const fetchVoices = async () => {
    setLoading(true);
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
    if (!voiceId.trim()) return;
    
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

  const handleSave = () => {
    if (officerVoiceId.trim()) {
      onOfficerVoiceChange(officerVoiceId.trim());
    }
    if (driverVoiceId.trim()) {
      onDriverVoiceChange(driverVoiceId.trim());
    }
    onClose();
  };

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
              <p className="text-gray-600 dark:text-gray-300">Loading your ElevenLabs voices...</p>
            </div>
          ) : (
            <>
              {/* Toggle between visual selection and manual input */}
              <div className="flex justify-center">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <Button
                    variant={!showManual ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowManual(false)}
                    className="rounded-md"
                  >
                    Select from Library
                  </Button>
                  <Button
                    variant={showManual ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowManual(true)}
                    className="rounded-md"
                  >
                    Enter Voice ID
                  </Button>
                </div>
              </div>

              {!showManual ? (
                /* Visual Voice Selection */
                <>
                  {/* Officer Voices */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Officer
                      </Badge>
                      Select Voice
                    </h3>
                    <div className="grid gap-3 max-h-48 overflow-y-auto">
                      {voices.map((voice) => (
                        <div
                          key={voice.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            officerVoiceId === voice.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => setOfficerVoiceId(voice.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{voice.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {voice.id}</p>
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
                      Select Voice
                    </h3>
                    <div className="grid gap-3 max-h-48 overflow-y-auto">
                      {voices.map((voice) => (
                        <div
                          key={voice.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            driverVoiceId === voice.id 
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => setDriverVoiceId(voice.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{voice.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {voice.id}</p>
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
                </>
              ) : (
                /* Manual Voice ID Input */
                <>
                  {/* Officer Voice Input */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Officer
                      </Badge>
                      Voice ID
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        value={officerVoiceId}
                        onChange={(e) => setOfficerVoiceId(e.target.value)}
                        placeholder="Enter ElevenLabs Voice ID"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVoice(officerVoiceId, 'officer')}
                        disabled={!officerVoiceId.trim() || testingVoice === officerVoiceId}
                      >
                        {testingVoice === officerVoiceId ? (
                          <Volume2 className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Driver Voice Input */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                        Driver
                      </Badge>
                      Voice ID
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        value={driverVoiceId}
                        onChange={(e) => setDriverVoiceId(e.target.value)}
                        placeholder="Enter ElevenLabs Voice ID"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVoice(driverVoiceId, 'driver')}
                        disabled={!driverVoiceId.trim() || testingVoice === driverVoiceId}
                      >
                        {testingVoice === driverVoiceId ? (
                          <Volume2 className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
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