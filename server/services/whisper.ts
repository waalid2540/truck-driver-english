import OpenAI from "openai";
import fs from "fs";
import path from "path";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface TranscriptionResponse {
  text: string;
  confidence?: number;
}

export async function transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<TranscriptionResponse> {
  try {
    // Create a temporary file for the audio
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, fileName);
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    // Create a read stream for OpenAI Whisper
    const audioReadStream = fs.createReadStream(tempFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      // Remove language restriction to support multilingual transcription
      response_format: "json",
      temperature: 0.2,
    });
    
    // Clean up temporary file
    fs.unlinkSync(tempFilePath);
    
    return {
      text: transcription.text,
    };
  } catch (error) {
    console.error("Whisper transcription error:", error);
    throw new Error("Failed to transcribe audio: " + (error as Error).message);
  }
}

export async function generateSpeech(text: string, voice: 'officer' | 'driver' = 'officer', language?: string): Promise<Buffer> {
  try {
    // Detect language from text for multilingual support
    const detectedLanguage = detectLanguage(text);
    
    // Professional voice selection for DOT practice scenarios
    const voiceMap = {
      officer: "echo", // Authoritative, clear male voice for DOT officers
      driver: "nova"   // Professional, articulate voice for driver responses
    };

    const response = await openai.audio.speech.create({
      model: "tts-1-hd", // Higher quality model for better mobile audio
      voice: voiceMap[voice],
      input: text,
      response_format: "mp3",
      speed: detectedLanguage === 'arabic' ? 0.75 : 0.85, // Slower for Arabic and non-English languages
    });
    
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    throw new Error("Failed to generate speech: " + (error as Error).message);
  }
}

// Simple language detection for common trucking languages
function detectLanguage(text: string): string {
  const arabicRegex = /[\u0600-\u06FF]/;
  const spanishWords = ['sí', 'no', 'hola', 'gracias', 'ayuda', 'por favor', 'camión'];
  const russianRegex = /[\u0400-\u04FF]/;
  const hindiRegex = /[\u0900-\u097F]/;
  const frenchWords = ['oui', 'non', 'bonjour', 'merci', 'aide', 's\'il vous plaît', 'camion'];
  
  if (arabicRegex.test(text)) return 'arabic';
  if (russianRegex.test(text)) return 'russian';
  if (hindiRegex.test(text)) return 'hindi';
  if (spanishWords.some(word => text.toLowerCase().includes(word))) return 'spanish';
  if (frenchWords.some(word => text.toLowerCase().includes(word))) return 'french';
  
  return 'english';
}