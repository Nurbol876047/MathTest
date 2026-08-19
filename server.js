import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Communicate } from 'edge-tts-universal';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: 'uploads/' });

app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const comm = new Communicate(text, { voice: "kk-KZ-AigulNeural" });
    const audioData = [];
    
    for await (const chunk of comm.stream()) {
       if (chunk.type === 'audio') {
          audioData.push(chunk.data);
       }
    }
    
    const buf = Buffer.concat(audioData);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buf.length
    });
    res.send(buf);
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');
    
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Распознай речь на этом аудио. Ответь только точным текстом того, что сказано, на казахском языке, без дополнительных комментариев.";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: req.file.mimetype || 'audio/webm',
          data: audioBase64
        }
      }
    ]);
    
    const text = result.response.text().trim();
    
    // Clean up temp file
    fs.unlinkSync(audioPath);
    
    res.json({ text });
  } catch (error) {
    console.error('STT Error:', error);
    res.status(500).json({ error: 'Failed to recognize speech' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
