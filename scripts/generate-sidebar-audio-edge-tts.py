"""
Regenerates public/audio/sidebar/*.mp3 with Microsoft Edge TTS's
kk-KZ-AigulNeural voice (female) — same engine/voice used for all audio in
the sibling "сандар сойлейды" project.

Replaces the robotic espeak-ng clips from scripts/generate-sidebar-audio-espeak.mjs,
used because no AZURE_SPEECH_KEY was configured for the official
scripts/generate-sidebar-audio.mjs. The JS edge-tts-universal package
(scripts/generate-sidebar-audio-edge-tts.mjs) hangs/fails on the synthesis
websocket in this environment; edge-tts>=7.3.1 for Python works here instead.

Requirements: edge-tts>=7.3.1 (pip install "edge-tts>=7.3.1")

    python3 scripts/generate-sidebar-audio-edge-tts.py
"""

import asyncio
import os

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "audio", "sidebar")

VOICE = "kk-KZ-AigulNeural"

# key -> text, matches the voiceKey/label pairs on each <SidebarItem> in src/App.jsx
CLIPS = {
    "dashboard": "Басты тақта",
    "tests": "Менің тесттерім",
    "bank": "Тапсырмалар банкі",
    "analytics": "Аналитика",
    "ai-ktj": "КТЖ",
    "ai-kmj": "КМЖ",
    "create": "Тест жасау",
    "topic-explain": "Тақырыпты түсіндіру",
    "ai-text": "Мәтін бойынша",
    "ai-photo": "Фото бойынша",
}


async def synthesize(text: str, out_path: str) -> None:
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(out_path)


async def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    ok = 0
    failed = 0
    for key, text in CLIPS.items():
        out_path = os.path.join(OUT_DIR, f"{key}.mp3")
        try:
            await synthesize(text, out_path)
            size = os.path.getsize(out_path)
            print(f"{key:<16} {text!r:<28} OK ({size} bytes)")
            ok += 1
        except Exception as err:  # noqa: BLE001
            print(f"{key:<16} {text!r:<28} FAILED: {err}")
            failed += 1

    print(f"\n{ok} succeeded, {failed} failed.")
    if failed == 0:
        print(f"Wrote {ok} files to {OUT_DIR}")
        print("Rebuild the app (npm run build) so dist/audio/sidebar picks up the new clips too.")


if __name__ == "__main__":
    asyncio.run(main())
