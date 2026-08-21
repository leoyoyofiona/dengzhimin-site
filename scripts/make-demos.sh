#!/bin/bash
# 批量生成作品动态演示（Ken Burns 局部放大串接 → WebP 动画）
cd /Users/leo/Downloads/deepseek-harness/dengzhimin-site
for pair in \
  "public/images/works/poster-lotto.png|demo-lotto" \
  "public/images/works/poster-welfare.png|demo-welfare" \
  "public/images/works/poster-football.png|demo-football" \
  "public/images/works/poster-stephen.jpg|demo-stephen"; do
  src="${pair%%|*}"
  name="${pair##*|}"
  echo "=== $name ==="
  .pdfvenv/bin/python3 scripts/make-kenburns.py "$src" "/tmp/$name.gif" 4 480 2>&1 | tail -1
  .pdfvenv/bin/python3 - "$name" << PYEOF
import sys
from PIL import Image
name = sys.argv[1]
img = Image.open(f'/tmp/{name}.gif')
frames = []
for i in range(img.n_frames):
    img.seek(i)
    frames.append(img.convert('RGB'))
frames[0].save(
    f'public/images/works/{name}.webp',
    save_all=True,
    append_images=frames[1:],
    duration=250,
    loop=0,
    format='WEBP',
    quality=72,
    method=6,
)
import os
print(f'{name}.webp: {os.path.getsize(f"public/images/works/{name}.webp")//1024} KB')
PYEOF
done
echo "全部完成"
