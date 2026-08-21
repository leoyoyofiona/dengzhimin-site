# 界面局部放大串接动画: 镜头在画面主要区域间平滑推拉（更大聚焦）
# 用法: python3 make-kenburns.py <src.png> <out.gif> [fps] [outwidth]
import sys
import os
from PIL import Image

src = sys.argv[1]
out = sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 6
outw = int(sys.argv[4]) if len(sys.argv) > 4 else 560

img = Image.open(src).convert('RGB')
W, H = img.size
OUTH = int(H * outw / W)

# 焦点区域（相对坐标 0-1）：更聚焦的局部，横向三区
regions = [
    (0.00, 0.05, 0.48, 0.95),  # 左区（窄、聚焦）
    (0.26, 0.05, 0.74, 0.95),  # 中区
    (0.52, 0.05, 1.00, 0.95),  # 右区
]
# 竖图改上中下
if H > W:
    regions = [
        (0.05, 0.00, 0.95, 0.45),
        (0.05, 0.28, 0.95, 0.72),
        (0.05, 0.55, 0.95, 1.00),
    ]

# 放大参数：镜头推近到 2.0 倍，让局部界面元素更大更清楚
MAX_ZOOM = 2.0
FRAMES_PER_REGION = 3

def crop_region(region, zoom=1.0):
    x0, y0, x1, y1 = region
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    w = (x1 - x0) / zoom
    h = (y1 - y0) / zoom
    bx0 = max(0, cx - w / 2)
    bx1 = min(1, cx + w / 2)
    by0 = max(0, cy - h / 2)
    by1 = min(1, cy + h / 2)
    box = (int(bx0 * W), int(by0 * H), int(bx1 * W), int(by1 * H))
    return box

frames = []

def add_frame(region, zoom):
    box = crop_region(region, zoom)
    c = img.crop(box)
    frames.append(c.resize((outw, OUTH), Image.LANCZOS))

# 全景开场（短暂）
add_frame((0.0, 0.0, 1.0, 1.0), 1.0)
# 依次推入每个区域：zoom 1.0 → 2.0（大幅推近），区域内微扫，再拉回
for reg in regions:
    # 推入
    for z in range(FRAMES_PER_REGION):
        zoom = 1.0 + (MAX_ZOOM - 1.0) * (z / FRAMES_PER_REGION)
        add_frame(reg, zoom)
    # 区域内横向微扫，增强动态感
    for z in range(FRAMES_PER_REGION):
        shift = (z / FRAMES_PER_REGION) * 0.06
        sx0 = max(0, reg[0] + shift * 0.5)
        sx1 = min(1, reg[2] + shift * 0.5)
        add_frame((sx0, reg[1], sx1, reg[3]), MAX_ZOOM)
    # 拉回
    for z in range(FRAMES_PER_REGION):
        zoom = MAX_ZOOM - (MAX_ZOOM - 1.0) * (z / FRAMES_PER_REGION)
        add_frame(reg, zoom)

# 结束回到全景
add_frame((0.0, 0.0, 1.0, 1.0), 1.0)

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
