// Regenerates public/audio/sidebar/*.mp3 using the local espeak-ng Kazakh
// voice — robotic, but phonetically correct Kazakh (no Russian accent),
// runs fully offline, no API key, no network, no external blocking risk.
//
// Use this when the official Azure kk-KZ-AigulNeural voice
// (scripts/generate-sidebar-audio.mjs) isn't set up yet.
//
// Requires: espeak-ng and ffmpeg on PATH (both preinstalled on this machine).
//
// Usage: node scripts/generate-sidebar-audio-espeak.mjs

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'sidebar');

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

const ESPEAK_SPEED_WPM = 140;
const ESPEAK_PITCH = 60; // 0-99, default 50 — a bit higher reads less harsh

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let ok = 0;
  let failed = 0;
  for (const [key, text] of Object.entries(CLIPS)) {
    process.stdout.write(`${key.padEnd(16)} "${text}" ... `);
    const wavPath = path.join(OUT_DIR, `${key}.tmp.wav`);
    const mp3Path = path.join(OUT_DIR, `${key}.mp3`);
    try {
      await run('espeak-ng', ['-v', 'kk', '-s', String(ESPEAK_SPEED_WPM), '-p', String(ESPEAK_PITCH), '-w', wavPath, text]);
      await run('ffmpeg', ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-qscale:a', '4', mp3Path, '-loglevel', 'error']);
      console.log('OK');
      ok++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    } finally {
      await rm(wavPath, { force: true });
    }
  }
  console.log(`\n${ok} succeeded, ${failed} failed.`);
  if (failed === 0) {
    console.log(`Wrote ${ok} files to ${OUT_DIR}`);
    console.log('Rebuild the app (npm run build) so dist/audio/sidebar picks up the new clips too.');
  } else {
    process.exitCode = 1;
  }
}

main();
