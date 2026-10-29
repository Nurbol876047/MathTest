import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Communicate } from 'edge-tts-universal';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: 'uploads/' });

const EDGE_TTS_TIMEOUT_MS = 2500;

// Edge TTS — табиғи нейрондық қазақша дауыс, бірақ Microsoft көбіне дата-центр
// IP-лерінен келетін қосылымды бұғаттайды, сондықтан бұл әрекет сәтсіз аяқталуы мүмкін.
async function generateWithEdgeTts(text) {
  const comm = new Communicate(text, { voice: "kk-KZ-AigulNeural" });
  const audioData = [];
  for await (const chunk of comm.stream()) {
    if (chunk.type === 'audio') {
      audioData.push(chunk.data);
    }
  }
  return Buffer.concat(audioData);
}

// espeak-ng — желіге тәуелді емес, жергілікті қазақша дауыс синтезі (роботша
// дыбысталады, бірақ дұрыс қазақ фонетикасымен, орысша екпінсіз).
function generateWithEspeak(text) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      'espeak-ng',
      ['-v', 'kk', '--stdout'],
      { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 },
      (error, stdout) => {
        if (error) return reject(error);
        resolve(stdout);
      }
    );
    child.stdin.write(text, 'utf8');
    child.stdin.end();
  });
}

app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    let buf;
    let contentType;
    try {
      const edgePromise = generateWithEdgeTts(text);
      edgePromise.catch(() => {}); // уакыты бітсе де, өңделмеген reject жасамау үшін
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('edge-tts timed out')), EDGE_TTS_TIMEOUT_MS)
      );
      buf = await Promise.race([edgePromise, timeout]);
      contentType = 'audio/mpeg';
    } catch (edgeError) {
      console.warn('edge-tts қолжетімсіз, espeak-ng-ге ауысамыз:', edgeError.message);
      buf = await generateWithEspeak(text);
      contentType = 'audio/wav';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Length': buf.length
    });
    res.send(buf);
  } catch (error) {
    console.error('TTS Error:', error.message);
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
