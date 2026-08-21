#!/bin/bash
# 给所有作品生成 Ken Burns 动态演示 WebP
cd /Users/leo/Downloads/deepseek-harness/dengzhimin-site
for pair in \
  "poster-lotto.png|demo-lotto" \
  "poster-welfare.png|demo-welfare" \
  "poster-football.png|demo-football" \
  "poster-worldcup.png|demo-worldcup" \
  "poster-xiaohongshu.jpg|demo-xiaohongshu" \
  "poster-stephen.jpg|demo-stephen" \
  "poster-translate.png|demo-translate" \
  "poster-triple.png|demo-triple" \
  "poster-macos.png|demo-macos" \
  "poster-render.png|demo-render" \
  "poster-vlog.png|demo-vlog" \
  "poster-workbuddy.jpg|demo-workbuddy"; do
  src="${pair%%|*}"
  name="${pair##*|}"
  echo "=== $name ==="
  .pdfvenv/bin/python3 scripts/make-kenburns.py "public/images/works/hd/$src" "/tmp/$name.gif" 10 480 2>&1 | tail -1
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
    duration=100,
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
