import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

// Import gtts using dynamic import to handle the lack of types
let GTTS: any;

export interface GTTSResponse {
  audioBuffer: Buffer;
  success: boolean;
  error?: string;
}

async function initGTTS() {
  if (!GTTS) {
    GTTS = (await import('gtts')).default;
  }
  return GTTS;
}

export async function generateGTTSSpeech(text: string, voice: 'officer' | 'driver' = 'officer'): Promise<GTTSResponse> {
  try {
    const GTTSClass = await initGTTS();
    
    // Create GTTS instance with male voice optimization for mobile
    const tts = new GTTSClass(text, 'en', {
      slow: false, // Normal speed for better comprehension
      host: 'https://translate.google.com',
    });
    
    // Generate unique filename
    const tempFile = path.join('/tmp', `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`);
    
    // Convert to promise-based operation
    const saveToFile = promisify(tts.save.bind(tts));
    
    // Generate the audio file
    await saveToFile(tempFile);
    
    // Read the generated file
    const audioBuffer = fs.readFileSync(tempFile);
    
    // Clean up temp file
    try {
      await fs.promises.unlink(tempFile);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }
    
    return {
      audioBuffer,
      success: true
    };
    
  } catch (error) {
    console.error('GTTS generation error:', error);
    return {
      audioBuffer: Buffer.alloc(0),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown GTTS error'
    };
  }
}

export async function generateDOTSpeech(text: string, voice: 'officer' | 'driver' = 'officer'): Promise<Buffer> {
  const result = await generateGTTSSpeech(text, voice);
  
  if (!result.success) {
    throw new Error(`GTTS generation failed: ${result.error}`);
  }
  
  return result.audioBuffer;
}