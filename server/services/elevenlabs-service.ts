export interface ElevenLabsResponse {
  audioBuffer: Buffer;
  success: boolean;
  error?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  category: 'officer' | 'driver';
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  // Officer voices - authoritative, professional
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, authoritative male voice', category: 'officer' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Strong, commanding male voice', category: 'officer' },
  { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', description: 'Professional, clear male voice', category: 'officer' },
  { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', description: 'Calm, steady male voice', category: 'officer' },
  
  // Driver voices - respectful, clear
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sam', description: 'Professional, clear male voice', category: 'driver' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Friendly, respectful male voice', category: 'driver' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Warm, conversational male voice', category: 'driver' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', description: 'Polite, articulate male voice', category: 'driver' },
];

export async function generateElevenLabsSpeech(
  text: string, 
  voice: 'officer' | 'driver' = 'officer',
  voiceId?: string
): Promise<ElevenLabsResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return {
      audioBuffer: Buffer.alloc(0),
      success: false,
      error: 'ELEVENLABS_API_KEY environment variable is required'
    };
  }

  try {
    // Use custom voice ID or default voices
    let selectedVoiceId: string;
    
    if (voiceId) {
      selectedVoiceId = voiceId;
    } else {
      // Default voices
      const defaultVoices = {
        officer: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, authoritative
        driver: 'EXAVITQu4vr4xnSDxMaL', // Sam - professional, clear
      };
      selectedVoiceId = defaultVoices[voice];
    }
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true,
          speaking_rate: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audioBuffer,
      success: true
    };
    
  } catch (error) {
    console.error('ElevenLabs generation error:', error);
    return {
      audioBuffer: Buffer.alloc(0),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown ElevenLabs error'
    };
  }
}

export async function generateDOTSpeechElevenLabs(
  text: string, 
  voice: 'officer' | 'driver' = 'officer',
  voiceId?: string
): Promise<Buffer> {
  const result = await generateElevenLabsSpeech(text, voice, voiceId);
  
  if (!result.success) {
    throw new Error(`ElevenLabs generation failed: ${result.error}`);
  }
  
  return result.audioBuffer;
}