# 界面局部放大串接动画: 镜头在画面主要区域间平滑推拉
# 用法: python3 make-kenburns.py <src.png> <out.gif> [fps] [outwidth]
import sys
import os
from PIL import Image, ImageDraw

src = sys.argv[1]
out = sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 6
outw = int(sys.argv[4]) if len(sys.argv) > 4 else 560

img = Image.open(src).convert('RGB')
W, H = img.size
OUTH = int(H * outw / W)

# 定义焦点区域（相对坐标 x0,y0,x1,y1 0-1）：左、中、右三个主要区域
regions = [
    (0.00, 0.00, 0.60, 1.00),  # 左区
    (0.20, 0.00, 0.80, 1.00),  # 中区
    (0.40, 0.00, 1.00, 1.00),  # 右区
]
# 竖图改上中下
if H > W:
    regions = [
        (0.00, 0.00, 1.00, 0.60),
        (0.00, 0.15, 1.00, 0.85),
        (0.00, 0.40, 1.00, 1.00),
    ]

# 每个区域作为一个"停留点"，镜头先全景 → 推入区域 → 停留 → 移向下一区域
FRAMES_PER_REGION = 3  # 每区域帧数（含过渡）

def crop_region(region, zoom=1.0):
    x0, y0, x1, y1 = region
    # 区域内再微缩放大（zoom>1 表示更放大，让镜头有推入感）
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

# 全景开场
add_frame((0.0, 0.0, 1.0, 1.0), 1.0)
# 依次推入每个区域：zoom 从 1.0 渐变到 1.35（推近），再淡出到下一区
for i, reg in enumerate(regions):
    # 推入：放大镜头
    for z in range(0, FRAMES_PER_REGION):
        zoom = 1.0 + 0.35 * (z / FRAMES_PER_REGION)
        add_frame(reg, zoom)
    # 在区域内微移（左右扫动），增强动态感
    for z in range(FRAMES_PER_REGION):
        shift = (z / FRAMES_PER_REGION) * 0.08
        sx0 = max(0, reg[0] + shift * 0.5)
        sx1 = min(1, reg[2] + shift * 0.5)
        add_frame((sx0, reg[1], sx1, reg[3]), 1.35)
    # 淡出：拉回全景（用 zoom 递减过渡）
    for z in range(FRAMES_PER_REGION):
        zoom = 1.35 - 0.35 * (z / FRAMES_PER_REGION)
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
