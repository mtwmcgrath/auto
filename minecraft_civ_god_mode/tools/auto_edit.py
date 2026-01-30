import argparse, json, subprocess
from pathlib import Path

def run(cmd):
    print(">", " ".join(cmd))
    subprocess.check_call(cmd)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--markers", required=True)
    ap.add_argument("--outdir", default="outputs")
    args = ap.parse_args()

    inp = Path(args.input)
    mk = json.loads(Path(args.markers).read_text(encoding="utf-8"))
    outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)

    ms = mk.get("markers", [])
    hi = [x for x in ms if x.get("label") == "HIGHLIGHT"]
    if not hi: hi = ms[1:6]

    clips = []
    for idx, h in enumerate(hi[:8], 1):
        t = h["t_ms"]/1000.0
        start = max(0.0, t-6.0)
        dur = 14.0
        out = outdir / f"clip_{idx:02d}.mp4"
        run(["ffmpeg","-y","-ss",f"{start:.3f}","-i",str(inp),"-t",f"{dur:.3f}",
             "-vf","scale=1280:720","-c:v","libx264","-preset","veryfast","-crf","20","-c:a","aac",str(out)])
        clips.append(out)

    listfile = outdir/"concat.txt"
    listfile.write_text("\n".join([f"file '{c.as_posix()}'" for c in clips]), encoding="utf-8")
    highlights = outdir/"highlights.mp4"
    run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(listfile),"-c","copy",str(highlights)])
    final = outdir/"final_youtube.mp4"
    if final.exists(): final.unlink()
    highlights.replace(final)
    print("DONE:", final)

if __name__ == "__main__":
    main()
