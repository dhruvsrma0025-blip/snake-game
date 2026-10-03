import math
import struct
import wave
import subprocess
import os

SAMPLE_RATE = 44100
BPM = 90
BEAT = 60.0 / BPM  # 0.6667 seconds per beat
BAR = BEAT * 4.0   # 2.6667 seconds per bar
TOTAL_BARS = 16    # 16 bars ~ 42.67 seconds loop
TOTAL_SECS = BAR * TOTAL_BARS
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_SECS)

print(f"Generating {TOTAL_SECS:.2f}s audio at {SAMPLE_RATE}Hz...")

NOTE_FREQ = {
    'A1': 55.00, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00,
    'B2': 123.47, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00,
    'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00,
    'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00,
    'B5': 987.77, 'C6': 1046.50
}

left_channel = [0.0] * TOTAL_SAMPLES
right_channel = [0.0] * TOTAL_SAMPLES

def add_sample(idx, l_val, r_val):
    if 0 <= idx < TOTAL_SAMPLES:
        left_channel[idx] += l_val
        right_channel[idx] += r_val

# 1. DRUMS (Kick, Snare, HiHats)
for bar in range(TOTAL_BARS):
    bar_start = bar * BAR
    # Kick pattern: beat 0, beat 1.75, beat 2.5
    kick_beats = [0.0, 1.75, 2.5]
    for kb in kick_beats:
        start_t = bar_start + kb * BEAT
        start_idx = int(start_t * SAMPLE_RATE)
        kick_dur = 0.35
        kick_samples = int(kick_dur * SAMPLE_RATE)
        for i in range(kick_samples):
            t = i / SAMPLE_RATE
            freq = 45.0 + 95.0 * math.exp(-t * 22.0)
            amp = math.exp(-t * 10.0)
            s = math.sin(2.0 * math.pi * freq * t) * amp * 0.75
            punch = math.sin(2.0 * math.pi * 90.0 * t) * math.exp(-t * 40.0) * 0.25
            val = (s + punch) * 0.65
            add_sample(start_idx + i, val, val)

    # Snare / Clap: beat 1.0 and beat 3.0
    snare_beats = [1.0, 3.0]
    for sb in snare_beats:
        start_t = bar_start + sb * BEAT
        start_idx = int(start_t * SAMPLE_RATE)
        snare_dur = 0.25
        snare_samples = int(snare_dur * SAMPLE_RATE)
        rand_seed = (bar * 17 + int(sb * 13)) & 0xFFFF
        for i in range(snare_samples):
            t = i / SAMPLE_RATE
            rand_seed = (rand_seed * 1103515245 + 12345) & 0x7FFFFFFF
            noise = (rand_seed / 0x7FFFFFFF) * 2.0 - 1.0
            noise_env = math.exp(-t * 20.0)
            tone = math.sin(2.0 * math.pi * 180.0 * t) * math.exp(-t * 25.0)
            val = (noise * noise_env * 0.4 + tone * 0.35) * 0.45
            add_sample(start_idx + i, val * 0.95, val * 1.05)

    # Hi-hats: 8th notes
    for eighth in range(8):
        start_t = bar_start + eighth * (BEAT / 2.0)
        start_idx = int(start_t * SAMPLE_RATE)
        hh_dur = 0.06
        hh_samples = int(hh_dur * SAMPLE_RATE)
        hh_seed = (bar * 31 + eighth * 7) & 0xFFFF
        hh_vol = 0.18 if eighth % 2 == 0 else 0.12
        for i in range(hh_samples):
            t = i / SAMPLE_RATE
            hh_seed = (hh_seed * 1103515245 + 12345) & 0x7FFFFFFF
            noise = (hh_seed / 0x7FFFFFFF) * 2.0 - 1.0
            env = math.exp(-t * 70.0)
            val = noise * env * hh_vol
            add_sample(start_idx + i, val * 1.1, val * 0.9)

# 2. CHORD HARMONIES & 808 BASS (Am -> F -> C -> G)
CHORDS = [
    ('A1', ['A3', 'C4', 'E4']),
    ('F2', ['F3', 'A3', 'C4']),
    ('C2', ['C3', 'E3', 'G3', 'C4']),
    ('G2', ['G2', 'B3', 'D4', 'G3']),
]

for bar in range(TOTAL_BARS):
    bar_start = bar * BAR
    chord_idx = bar % 4
    bass_note, chord_notes = CHORDS[chord_idx]
    bass_freq = NOTE_FREQ[bass_note]

    # 808 Sub-Bass
    for b_sub in [0.0, 1.75, 2.5]:
        start_t = bar_start + b_sub * BEAT
        dur = BEAT * 1.5 if b_sub == 2.5 else BEAT * 0.9
        start_idx = int(start_t * SAMPLE_RATE)
        samples = int(dur * SAMPLE_RATE)
        for i in range(samples):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 1.8) * (1.0 - math.exp(-t * 60.0))
            s = math.sin(2.0 * math.pi * bass_freq * t)
            h2 = math.sin(2.0 * math.pi * bass_freq * 2.0 * t) * 0.25
            sig = math.tanh((s + h2) * 1.3) * env * 0.38
            add_sample(start_idx + i, sig, sig)

    # Warm Pluck Chords
    for step in range(8):
        start_t = bar_start + step * (BEAT / 2.0)
        start_idx = int(start_t * SAMPLE_RATE)
        dur = 0.45
        samples = int(dur * SAMPLE_RATE)
        for cn in chord_notes:
            cfreq = NOTE_FREQ[cn]
            pan_offset = 0.15 if cn == chord_notes[0] else -0.15
            for i in range(samples):
                t = i / SAMPLE_RATE
                env = math.exp(-t * 6.5) * (1.0 - math.exp(-t * 80.0))
                s1 = math.sin(2.0 * math.pi * cfreq * t)
                s2 = math.sin(2.0 * math.pi * cfreq * 2.0 * t) * 0.3
                sig = (s1 + s2) * env * 0.08
                add_sample(start_idx + i, sig * (1.0 - pan_offset), sig * (1.0 + pan_offset))

# 3. SIGNATURE "HAYE MERA DIL" MELODY
MELODY_EVENTS = [
    # Bar 0: Ro ro ke arajja gujarda ae dil
    (0, 0.0, 0.8, 'E5'),
    (0, 0.8, 0.4, 'D5'),
    (0, 1.2, 0.8, 'C5'),
    (0, 2.0, 0.4, 'C5'),
    (0, 2.4, 0.4, 'D5'),
    (0, 2.8, 0.4, 'E5'),
    (0, 3.2, 0.4, 'F5'),
    (0, 3.6, 0.4, 'D5'),

    # Bar 1: Haye mera dil, haye mera dil
    (1, 0.0, 0.7, 'G5'),
    (1, 0.7, 0.3, 'F5'),
    (1, 1.0, 0.4, 'E5'),
    (1, 1.4, 0.4, 'D5'),
    (1, 1.8, 1.0, 'C5'),
    (1, 2.0, 0.7, 'G5'),
    (1, 2.7, 0.3, 'F5'),
    (1, 3.0, 0.4, 'E5'),
    (1, 3.4, 0.4, 'D5'),
    (1, 3.8, 0.8, 'C5'),

    # Bar 2: Teri yaadan di sandookdi da
    (2, 0.0, 0.4, 'C5'),
    (2, 0.4, 0.4, 'D5'),
    (2, 0.8, 0.7, 'E5'),
    (2, 1.5, 0.4, 'E5'),
    (2, 1.9, 0.4, 'E5'),
    (2, 2.3, 0.4, 'F5'),
    (2, 2.7, 0.4, 'E5'),
    (2, 3.1, 0.4, 'D5'),
    (2, 3.5, 0.7, 'C5'),

    # Bar 3: Dil sadda khure kehde rahe pe geya
    (3, 0.0, 0.4, 'C5'),
    (3, 0.4, 0.4, 'D5'),
    (3, 0.8, 0.7, 'E5'),
    (3, 1.5, 0.4, 'E5'),
    (3, 1.9, 0.4, 'E5'),
    (3, 2.3, 0.4, 'F5'),
    (3, 2.7, 0.4, 'E5'),
    (3, 3.1, 0.4, 'D5'),
    (3, 3.5, 0.7, 'C5'),

    # Bar 4: Kehnda tuhi sadda rah te tuhi manzil
    (4, 0.0, 0.4, 'C5'),
    (4, 0.4, 0.4, 'D5'),
    (4, 0.8, 0.7, 'E5'),
    (4, 1.5, 0.7, 'G5'),
    (4, 2.2, 0.4, 'F5'),
    (4, 2.6, 0.4, 'E5'),
    (4, 3.0, 0.4, 'D5'),
    (4, 3.4, 0.8, 'C5'),

    # Bar 5: Haye mera dil, haye mera dil
    (5, 0.0, 0.7, 'G5'),
    (5, 0.7, 0.3, 'F5'),
    (5, 1.0, 0.4, 'E5'),
    (5, 1.4, 0.4, 'D5'),
    (5, 1.8, 1.0, 'C5'),
    (5, 2.0, 0.7, 'G5'),
    (5, 2.7, 0.3, 'F5'),
    (5, 3.0, 0.4, 'E5'),
    (5, 3.4, 0.4, 'D5'),
    (5, 3.8, 0.8, 'C5'),

    # Bar 6: Honey Singh rap flow
    (6, 0.0, 0.5, 'A4'),
    (6, 0.5, 0.5, 'C5'),
    (6, 1.0, 0.5, 'D5'),
    (6, 1.5, 0.8, 'E5'),
    (6, 2.5, 0.4, 'D5'),
    (6, 3.0, 0.4, 'C5'),
    (6, 3.5, 0.6, 'A4'),

    # Bar 7: Turnaround
    (7, 0.0, 0.6, 'E5'),
    (7, 0.6, 0.6, 'G5'),
    (7, 1.2, 0.6, 'A5'),
    (7, 2.0, 0.8, 'G5'),
    (7, 2.8, 0.6, 'E5'),
    (7, 3.4, 0.8, 'D5'),
]

full_melody = []
for m in MELODY_EVENTS:
    full_melody.append(m)
    full_melody.append((m[0] + 8, m[1], m[2], m[3]))

for bar, beat, dur_beats, note in full_melody:
    start_t = bar * BAR + beat * BEAT
    dur_sec = dur_beats * BEAT
    start_idx = int(start_t * SAMPLE_RATE)
    samples = int(dur_sec * SAMPLE_RATE)
    freq = NOTE_FREQ[note]

    for i in range(samples):
        t = i / SAMPLE_RATE
        attack = min(1.0, t / 0.025)
        release = min(1.0, (dur_sec - t) / 0.04) if (dur_sec - t) < 0.04 else 1.0
        env = attack * release * math.exp(-t * 0.85)

        vibrato = math.sin(2.0 * math.pi * 5.5 * t) * 4.0 if t > 0.15 else 0.0
        cur_freq = freq + vibrato

        s1 = math.sin(2.0 * math.pi * cur_freq * t)
        s2 = math.sin(2.0 * math.pi * (cur_freq * 2.0) * t) * 0.28
        s3 = math.sin(2.0 * math.pi * (cur_freq * 3.0) * t) * 0.12
        sig = (s1 + s2 + s3) * env * 0.26

        add_sample(start_idx + i, sig * 0.95, sig * 1.05)
        echo_idx = start_idx + i + int(0.18 * SAMPLE_RATE)
        add_sample(echo_idx, sig * 0.25 * 1.1, sig * 0.25 * 0.9)

max_val = 0.001
for i in range(TOTAL_SAMPLES):
    max_val = max(max_val, abs(left_channel[i]), abs(right_channel[i]))

norm_factor = 0.92 / max_val

os.makedirs("/app/applet/public", exist_ok=True)
wav_filename = "/app/applet/public/haye-mera-dil.wav"
with wave.open(wav_filename, 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    packed_frames = bytearray()
    for i in range(TOTAL_SAMPLES):
        l_s = int(max(-32767, min(32767, left_channel[i] * norm_factor * 32767)))
        r_s = int(max(-32767, min(32767, right_channel[i] * norm_factor * 32767)))
        packed_frames.extend(struct.pack('<hh', l_s, r_s))
    wf.writeframes(packed_frames)

print(f"Saved WAV to {wav_filename}. Converting to MP3...")
mp3_out = "/app/applet/public/haye-mera-dil.mp3"
subprocess.run([
    "ffmpeg", "-y", "-i", wav_filename,
    "-codec:a", "libmp3lame", "-b:a", "192k",
    mp3_out
], check=True)

# Also create bgm.mp3
subprocess.run(["cp", "-f", mp3_out, "/app/applet/public/bgm.mp3"], check=True)
# Clean up wav
try:
    os.remove(wav_filename)
except Exception:
    pass

print(f"SUCCESS: Created {mp3_out} and /app/applet/public/bgm.mp3!")
