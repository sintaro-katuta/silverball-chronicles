"""Generate three original pachislot-inspired button confirmation sounds.

Run with: python3 prototype/audio/button_decision_sounds.py
Only Python's standard library is required. Tune the SOUND_PRESETS below.
"""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 48_000
OUTPUT_DIR = Path(__file__).resolve().parent / "button_decision"

# All audible design controls live here. Frequencies are Hz, durations seconds,
# amplitudes are relative layer gains. Keep peak_gain below 1.0 to avoid clipping.
SOUND_PRESETS = {
    "01_crisp_digital": {
        "description": "硬質クリック + 短い電子トーン",
        "duration": 0.34,
        "click_gain": 0.72,
        "click_decay": 0.012,
        "click_tone_hz": 2450,
        "tone_notes": [(1320, 0.000, 0.17, 0.42), (1980, 0.025, 0.12, 0.20)],
        "tone_attack": 0.002,
        "tone_decay": 0.055,
        "metal_gain": 0.02,
        "metal_hz": 4200,
        "metal_decay": 0.04,
        "noise_gain": 0.11,
        "noise_decay": 0.009,
        "peak_gain": 0.82,
        "seed": 11,
    },
    "02_bright_chime": {
        "description": "明るい二段階チャイム",
        "duration": 0.52,
        "click_gain": 0.28,
        "click_decay": 0.009,
        "click_tone_hz": 3100,
        "tone_notes": [(880, 0.012, 0.34, 0.48), (1320, 0.105, 0.36, 0.40)],
        "tone_attack": 0.008,
        "tone_decay": 0.15,
        "metal_gain": 0.17,
        "metal_hz": 2640,
        "metal_decay": 0.23,
        "noise_gain": 0.035,
        "noise_decay": 0.008,
        "peak_gain": 0.82,
        "seed": 22,
    },
    "03_mechanical_brass": {
        "description": "低い機械クリック + 真鍮の余韻",
        "duration": 0.48,
        "click_gain": 0.84,
        "click_decay": 0.018,
        "click_tone_hz": 980,
        "tone_notes": [(620, 0.018, 0.27, 0.31), (930, 0.055, 0.22, 0.19)],
        "tone_attack": 0.004,
        "tone_decay": 0.11,
        "metal_gain": 0.20,
        "metal_hz": 1860,
        "metal_decay": 0.19,
        "noise_gain": 0.15,
        "noise_decay": 0.014,
        "peak_gain": 0.82,
        "seed": 33,
    },
}


def envelope(t: float, attack: float, decay: float) -> float:
    if t < 0:
        return 0.0
    if attack > 0 and t < attack:
        return t / attack
    return math.exp(-max(0.0, t - attack) / max(0.001, decay))


def synthesize(params: dict) -> list[float]:
    count = round(params["duration"] * SAMPLE_RATE)
    rng = random.Random(params["seed"])
    noise = [rng.uniform(-1.0, 1.0) for _ in range(count)]
    samples = []
    for i in range(count):
        t = i / SAMPLE_RATE
        click = params["click_gain"] * envelope(t, 0, params["click_decay"]) * (
            0.72 * math.sin(2 * math.pi * params["click_tone_hz"] * t)
            + 0.28 * math.sin(2 * math.pi * params["click_tone_hz"] * 1.73 * t)
        )
        tone = 0.0
        for hz, start, length, gain in params["tone_notes"]:
            age = t - start
            if 0 <= age <= length:
                tone += gain * envelope(age, params["tone_attack"], min(length, params["tone_decay"])) * math.sin(2 * math.pi * hz * age)
        metal_age = t - 0.018
        metal = 0.0
        if metal_age >= 0:
            metal = params["metal_gain"] * math.exp(-metal_age / params["metal_decay"]) * (
                math.sin(2 * math.pi * params["metal_hz"] * metal_age)
                + 0.42 * math.sin(2 * math.pi * params["metal_hz"] * 2.71 * metal_age)
            )
        transient = params["noise_gain"] * noise[i] * math.exp(-t / params["noise_decay"])
        samples.append(click + tone + metal + transient)

    peak = max(max(abs(x) for x in samples), 1e-9)
    scale = params["peak_gain"] / peak
    return [max(-1.0, min(1.0, x * scale)) for x in samples]


def write_wav(path: Path, samples: list[float]) -> None:
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(b"".join(struct.pack("<h", round(x * 32767)) for x in samples))


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, params in SOUND_PRESETS.items():
        path = OUTPUT_DIR / f"{name}.wav"
        write_wav(path, synthesize(params))
        print(f"{path} — {params['description']} ({params['duration']:.2f}s)")


if __name__ == "__main__":
    main()
