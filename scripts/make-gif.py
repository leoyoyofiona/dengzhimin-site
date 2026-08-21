# 将连续截图合成 GIF: python3 make-gif.py <shotdir> <out.gif> <fps> <maxwidth>
import sys
import os
from PIL import Image

shotdir = sys.argv[1]
out = sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 3
maxw = int(sys.argv[4]) if len(sys.argv) > 4 else 640

files = sorted([f for f in os.listdir(shotdir) if f.endswith('.png')])
if not files:
    print('no frames')
    sys.exit(1)

frames = []
for f in files:
    img = Image.open(os.path.join(shotdir, f)).convert('RGB')
    w, h = img.size
    if w > maxw:
        img = img.resize((maxw, int(h * maxw / w)), Image.LANCZOS)
    frames.append(img)

duration = int(1000 / fps)
frames[0].save(
    out,
    save_all=True,
    append_images=frames[1:],
    duration=duration,
    loop=0,
    optimize=True,
)
print('GIF done: %d frames -> %s (%d KB)' % (len(frames), out, os.path.getsize(out) // 1024))
