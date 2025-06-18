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

  useEffect(() => {
    setOfficerVoiceId(selectedOfficerVoice || '');
    setDriverVoiceId(selectedDriverVoice || '');
  }, [selectedOfficerVoice, selectedDriverVoice]);

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
          {/* Officer Voice Input */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Officer
              </Badge>
              Voice ID
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="officer-voice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ElevenLabs Voice ID
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="officer-voice"
                    value={officerVoiceId}
                    onChange={(e) => setOfficerVoiceId(e.target.value)}
                    placeholder="pNInz6obpgDQGcFmaJgB"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testVoice(officerVoiceId, 'officer')}
                    disabled={!officerVoiceId.trim() || testingVoice === officerVoiceId}
                    className="flex items-center gap-1"
                  >
                    {testingVoice === officerVoiceId ? (
                      <Volume2 className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your ElevenLabs voice ID for the officer role
                </p>
              </div>
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
            <div className="space-y-3">
              <div>
                <Label htmlFor="driver-voice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ElevenLabs Voice ID
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="driver-voice"
                    value={driverVoiceId}
                    onChange={(e) => setDriverVoiceId(e.target.value)}
                    placeholder="EXAVITQu4vr4xnSDxMaL"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testVoice(driverVoiceId, 'driver')}
                    disabled={!driverVoiceId.trim() || testingVoice === driverVoiceId}
                    className="flex items-center gap-1"
                  >
                    {testingVoice === driverVoiceId ? (
                      <Volume2 className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your ElevenLabs voice ID for the driver role
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to get ElevenLabs Voice IDs:</h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>1. Go to elevenlabs.io and log into your account</li>
              <li>2. Click on "Voices" in the left sidebar</li>
              <li>3. Click on any voice you want to use</li>
              <li>4. Copy the Voice ID from the voice settings</li>
              <li>5. Paste it into the fields above and test</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Save Voice IDs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}