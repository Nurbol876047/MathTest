import { EdgeTTS } from 'edge-tts-universal';

async function run() {
  const tts = new EdgeTTS({
    voice: "kk-KZ-AigulNeural",
    text: "Сәлеметсіз бе, бұл тесттік хабарлама."
  });
  console.log('Generating TTS...');
  try {
    const audioData = await tts.toAudioBuffer();
    console.log(audioData.length);
  } catch(e) {
    console.error(e);
  }
}
run();
