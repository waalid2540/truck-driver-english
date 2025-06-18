import fetch from 'node-fetch';

export interface ElevenLabsResponse {
  audioBuffer: Buffer;
  success: boolean;
  error?: string;
}

// Professional male voice IDs for DOT practice
const VOICE_IDS = {
  officer: 'pNInz6obpgDQGcFmaJgB', // Adam - Deep, authoritative male voice
  driver: '21m00Tcm4TlvDq8ikWAM', // Josh - Professional, clear male voice
};

export async function generateElevenLabsSpeech(
  text: string, 
  voice: 'officer' | 'driver' = 'officer'
): Promise<ElevenLabsResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return {
      audioBuffer: Buffer.alloc(0),
      success: false,
      error: 'ElevenLabs API key not configured'
    };
  }

  try {
    const voiceId = VOICE_IDS[voice];
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
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
  voice: 'officer' | 'driver' = 'officer'
): Promise<Buffer> {
  const result = await generateElevenLabsSpeech(text, voice);
  
  if (!result.success) {
    throw new Error(`ElevenLabs generation failed: ${result.error}`);
  }
  
  return result.audioBuffer;
}