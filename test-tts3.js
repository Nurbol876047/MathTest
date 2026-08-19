import { Communicate } from 'edge-tts-universal';

async function run() {
  const comm = new Communicate("Сәлеметсіз бе, бұл тесттік хабарлама.", "kk-KZ-AigulNeural");
  console.log(Object.keys(comm));
  let audioData = [];
  try {
    for await (const chunk of comm.stream()) {
       if (chunk.type === 'audio') {
          audioData.push(chunk.data);
       }
    }
    const buf = Buffer.concat(audioData);
    console.log(buf.length);
  } catch(e) {
    console.error(e);
  }
}
run();
