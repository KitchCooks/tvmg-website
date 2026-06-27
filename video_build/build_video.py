# -*- coding: utf-8 -*-
"""
Generate narration (ElevenLabs) + render each sample into an MP4 (ffmpeg).
Idempotent: existing audio_##.mp3 are reused so re-runs do NOT re-spend the
10k-character free-tier budget. Delete a clip's mp3s to regenerate it.

Usage:
  export ELEVEN_API_KEY=sk_...
  python3 build_video.py            # audio + video for all
  python3 build_video.py --count    # just print the character budget
"""
import os, sys, json, subprocess, urllib.request, urllib.error
from scripts import SCRIPTS, VOICES

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
SITE_VID = os.path.join(HERE, "..", "Site", "assets", "videos")
KEY = os.environ.get("ELEVEN_API_KEY", "")
MODEL = "eleven_multilingual_v2"
FPS = 30
LEAD = 0.18    # silence before narration on each slide
TAIL = 0.65    # breathing room after narration

def total_chars():
    n = 0
    for v in SCRIPTS:
        for s in v["slides"]:
            n += len(s["narration"])
    return n

def tts(voice_id, text, path):
    # Use system curl (system root certs) to avoid python.org SSL cert issues.
    body = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.8,
                            "style": 0.0, "use_speaker_boost": True},
    })
    r = subprocess.run([
        "curl", "-sS", "-X", "POST",
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        "-H", f"xi-api-key: {KEY}",
        "-H", "Content-Type: application/json",
        "-H", "Accept: audio/mpeg",
        "-o", path, "--data-binary", body,
    ], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("curl failed: " + r.stderr)
    # ElevenLabs returns JSON (not audio) on error; detect and surface it.
    with open(path, "rb") as f:
        head = f.read(1)
    if head == b"{":
        with open(path) as f:
            msg = f.read()
        os.remove(path)
        raise RuntimeError("TTS error: " + msg[:300])

def dur(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())

def gen_audio():
    spent = 0
    for v in SCRIPTS:
        d = os.path.join(OUT, v["id"]); os.makedirs(d, exist_ok=True)
        vid = VOICES[v["voice"]]
        for i, s in enumerate(v["slides"]):
            mp3 = os.path.join(d, f"audio_{i:02d}.mp3")
            if os.path.exists(mp3) and os.path.getsize(mp3) > 0:
                print(f"  [skip] {v['id']} {i:02d} (exists)")
                continue
            print(f"  [tts ] {v['id']} {i:02d} ({len(s['narration'])} chars) voice={v['voice']}")
            tts(vid, s["narration"], mp3)
            spent += len(s["narration"])
    print(f"  characters generated this run: {spent}")

def make_clip(png, mp3, out_mp4, idx, fade_in, fade_out):
    a = dur(mp3)
    total = LEAD + a + TAIL
    frames = max(1, int(round(total * FPS)))
    # subtle alternating Ken Burns: slow zoom-in with gentle pan
    if idx % 2 == 0:
        zexpr = "min(zoom+0.0006,1.10)"
        xexpr = "iw/2-(iw/zoom/2)"; yexpr = "ih/2-(ih/zoom/2)"
    else:
        zexpr = "min(zoom+0.0006,1.10)"
        xexpr = "(iw-iw/zoom)*0.0+ (in/{f})*40".format(f=frames)  # slight left->right drift
        yexpr = "ih/2-(ih/zoom/2)"
    vf = (f"scale=3840:2160,zoompan=z='{zexpr}':d={frames}:x='{xexpr}':y='{yexpr}'"
          f":s=1920x1080:fps={FPS},format=yuv420p")
    fades = []
    if fade_in:  fades.append("fade=t=in:st=0:d=0.5")
    if fade_out: fades.append(f"fade=t=out:st={max(0,total-0.6):.3f}:d=0.6")
    if fades:
        vf += "," + ",".join(fades)
    af = f"adelay={int(LEAD*1000)}|{int(LEAD*1000)},apad"
    cmd = ["ffmpeg", "-y", "-loop", "1", "-i", png, "-i", mp3,
           "-filter_complex", f"[0:v]{vf}[v];[1:a]{af}[a]",
           "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
           "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
           "-movflags", "+faststart", out_mp4]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return total

def build_videos():
    os.makedirs(SITE_VID, exist_ok=True)
    for v in SCRIPTS:
        d = os.path.join(OUT, v["id"])
        clips = []
        n = len(v["slides"])
        total_len = 0
        for i in range(n):
            png = os.path.join(d, f"slide_{i:02d}.png")
            mp3 = os.path.join(d, f"audio_{i:02d}.mp3")
            clip = os.path.join(d, f"clip_{i:02d}.mp4")
            t = make_clip(png, mp3, clip, i, fade_in=(i == 0), fade_out=(i == n - 1))
            total_len += t
            clips.append(clip)
            print(f"  clip {v['id']} {i:02d}  {t:.2f}s")
        # concat (same codec params -> stream copy, lossless & fast)
        listf = os.path.join(d, "concat.txt")
        with open(listf, "w") as f:
            for c in clips:
                f.write(f"file '{c}'\n")
        final = os.path.join(SITE_VID, f"tvmg_sample_{v['id']}.mp4")
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listf,
                        "-c", "copy", "-movflags", "+faststart", final],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # poster = cover slide
        poster = os.path.join(SITE_VID, f"tvmg_sample_{v['id']}.jpg")
        subprocess.run(["ffmpeg", "-y", "-i", os.path.join(d, "slide_00.png"),
                        "-vf", "scale=1280:-1", "-q:v", "3", poster],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"==> {final}  (~{total_len:.0f}s)")

if __name__ == "__main__":
    print(f"Total narration characters across all 3 videos: {total_chars()} (free-tier cap 10000)")
    if "--count" in sys.argv:
        sys.exit(0)
    if not KEY:
        print("ERROR: set ELEVEN_API_KEY"); sys.exit(1)
    print("Generating audio...")
    gen_audio()
    print("Rendering videos...")
    build_videos()
    print("Done.")
