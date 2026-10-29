// Regenerates public/audio/sidebar/*.mp3 with Microsoft's neural voice
// kk-KZ-AigulNeural, using the OFFICIAL Azure Cognitive Services Speech
// REST API (not the unofficial edge-tts hack — Microsoft now rejects that
// handshake with a 403 from basically every network, datacenter or home).
//
// One-time setup (free, no credit card needed for the F0 tier):
//   1. https://portal.azure.com -> sign in (or create a free Microsoft account)
//   2. "Create a resource" -> search "Speech" -> "Speech service" -> Create
//   3. Pricing tier: Free F0 (500,000 characters/month)
//   4. Once created, open the resource -> "Keys and Endpoint" (left menu)
//   5. Copy "KEY 1" and the "Location/Region" (e.g. "eastus", "westeurope")
//   6. Add to .env in this project:
//        AZURE_SPEECH_KEY=<KEY 1>
//        AZURE_SPEECH_REGION=<region>
//
// Usage: node scripts/generate-sidebar-audio.mjs

import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'sidebar');
const VOICE = 'kk-KZ-AigulNeural';

const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } = process.env;

// key -> text, matches the voiceKey/label pairs on each <SidebarItem> in src/App.jsx
const CLIPS = {
  dashboard: 'Басты тақта',
  tests: 'Менің тесттерім',
  bank: 'Тапсырмалар банкі',
  analytics: 'Аналитика',
  'ai-ktj': 'КТЖ',
  'ai-kmj': 'КМЖ',
  create: 'Тест жасау',
  'topic-explain': 'Тақырыпты түсіндіру',
  'ai-text': 'Мәтін бойынша',
  'ai-photo': 'Фото бойынша',
};

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function getAccessToken() {
  const res = await fetch(`https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY, 'Content-Length': '0' },
  });
  if (!res.ok) {
    throw new Error(`issueToken failed: HTTP ${res.status} ${await res.text()}`);
  }
  return res.text();
}

async function synthesize(token, text) {
  const ssml = `<speak version="1.0" xml:lang="kk-KZ"><voice xml:lang="kk-KZ" xml:gender="Female" name="${VOICE}">${escapeXml(text)}</voice></speak>`;
  const res = await fetch(`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'mathtest-sidebar-audio',
    },
    body: ssml,
  });
  if (!res.ok) {
    throw new Error(`synthesis failed: HTTP ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    console.log('Missing AZURE_SPEECH_KEY / AZURE_SPEECH_REGION.');
    console.log('Add both to .env — see the setup steps in the comment at the top of this script.');
    process.exitCode = 1;
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  console.log('Requesting access token...');
  const token = await getAccessToken();
  console.log('Got token.\n');

  let ok = 0;
  let failed = 0;
  for (const [key, text] of Object.entries(CLIPS)) {
    process.stdout.write(`${key.padEnd(16)} "${text}" ... `);
    try {
      const buf = await synthesize(token, text);
      if (buf.length === 0) throw new Error('empty audio returned');
      await writeFile(path.join(OUT_DIR, `${key}.mp3`), buf);
      console.log(`OK (${buf.length} bytes)`);
      ok++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n${ok} succeeded, ${failed} failed.`);
  if (failed > 0) {
    process.exitCode = 1;
  } else {
    console.log(`Wrote ${ok} files to ${OUT_DIR}`);
    console.log('Rebuild the app (npm run build) so dist/audio/sidebar picks up the new clips too.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exitCode = 1;
});
