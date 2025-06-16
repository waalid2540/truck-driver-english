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
      language: "en",
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

export async function generateSpeech(text: string): Promise<Buffer> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy", // Natural, friendly voice good for coaching
      input: text,
      response_format: "mp3",
      speed: 0.9, // Slightly slower for better comprehension
    });
    
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    throw new Error("Failed to generate speech: " + (error as Error).message);
  }
}