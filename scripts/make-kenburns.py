# 界面局部放大串接动画: 连续镜头路径（推近/平移/拉回），高帧率丝滑
# 用法: python3 make-kenburns.py <src.png> <out.gif> [fps] [outwidth]
import sys
import os
from PIL import Image

src = sys.argv[1]
out = sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 10
outw = int(sys.argv[4]) if len(sys.argv) > 4 else 560

img = Image.open(src).convert('RGB')
W, H = img.size
OUTH = int(H * outw / W)

# 镜头关键帧序列 (cx, cy, zoom)：全景 → 各区推近 → 回全景
# zoom 3.2 = 镜头推得更远，界面元素更大
if H > W:
    # 竖图：上中下巡览
    keys = [
        (0.50, 0.50, 1.0),
        (0.50, 0.22, 3.2),
        (0.50, 0.50, 3.2),
        (0.50, 0.78, 3.2),
        (0.50, 0.50, 1.0),
    ]
else:
    # 横图：左中右巡览
    keys = [
        (0.50, 0.50, 1.0),
        (0.22, 0.50, 3.2),
        (0.50, 0.50, 3.2),
        (0.78, 0.50, 3.2),
        (0.50, 0.50, 1.0),
    ]

FRAMES_PER_SEG = 12  # 每段关键帧之间的插值帧数（越高越流畅）

def lerp(a, b, t):
    return a + (b - a) * t

def view_box(cx, cy, zoom):
    # 根据中心与缩放计算视图框（相对坐标），保持与输出一致的宽高比
    vw = 1.0 / zoom
    vh = vw
    # 限制中心范围，避免越界
    cx = max(vw / 2, min(1 - vw / 2, cx))
    cy = max(vh / 2, min(1 - vh / 2, cy))
    x0 = int((cx - vw / 2) * W)
    x1 = int((cx + vw / 2) * W)
    y0 = int((cy - vh / 2) * H)
    y1 = int((cy + vh / 2) * H)
    return (x0, y0, x1, y1)

frames = []

def add_frame(cx, cy, zoom):
    box = view_box(cx, cy, zoom)
    c = img.crop(box)
    frames.append(c.resize((outw, OUTH), Image.LANCZOS))

# 连续路径插值：镜头沿关键帧序列平滑移动
for seg in range(len(keys) - 1):
    k0 = keys[seg]
    k1 = keys[seg + 1]
    for i in range(FRAMES_PER_SEG):
        t = i / FRAMES_PER_SEG
        # 缓入缓出，让运动更丝滑
        ease = t * t * (3 - 2 * t)
        cx = lerp(k0[0], k1[0], ease)
        cy = lerp(k0[1], k1[1], ease)
        zoom = lerp(k0[2], k1[2], ease)
        add_frame(cx, cy, zoom)

# 结尾短暂停留全景
for _ in range(3):
    add_frame(0.5, 0.5, 1.0)

duration = int(1000 / fps)
frames[0].save(
    out,
    save_all=True,
    append_images=frames[1:],
    duration=duration,
    loop=0,
    optimize=True,
    palette=Image.ADAPTIVE,
)
print('KenBurns GIF done: %d frames -> %s (%d KB)' % (len(frames), out, os.path.getsize(out) // 1024))
