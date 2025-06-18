import { ElevenLabs } from 'elevenlabs';

export interface ElevenLabsResponse {
  audioBuffer: Buffer;
  success: boolean;
  error?: string;
}

let elevenLabsClient: ElevenLabs | null = null;

function initElevenLabs(): ElevenLabs {
  if (!elevenLabsClient) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    elevenLabsClient = new ElevenLabs({ apiKey });
  }
  return elevenLabsClient;
}

export async function generateElevenLabsSpeech(
  text: string, 
  voice: 'officer' | 'driver' = 'officer'
): Promise<ElevenLabsResponse> {
  try {
    const client = initElevenLabs();
    
    // Professional male voices optimized for DOT practice
    const voiceIds = {
      officer: 'pNInz6obpgDQGcFmaJgB', // Adam - authoritative male voice
      driver: 'EXAVITQu4vr4xnSDxMaL', // Sam - professional male voice
    };
    
    const response = await client.textToSpeech(voiceIds[voice], {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true,
      },
    });
    
    // Convert response to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
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