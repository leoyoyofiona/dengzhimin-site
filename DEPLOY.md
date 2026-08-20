# 部署指南 · 腾讯云轻量服务器

本文档把网站部署到你的腾讯云轻量服务器（Ubuntu 20.04，公网 IP `150.158.41.97`），
通过 **Nginx** 提供静态站点，并配置域名 `www.dengzhimin.cn` 与 **HTTPS**。

> 全程假定你在**本机（Mac）**操作，服务器通过 SSH 连接。示例命令里的 IP、域名请按需替换。

---

## 0. 上线前的安全提醒 ⚠️

1. **立刻修改服务器密码**：你之前把密码发在了聊天里，请登录腾讯云控制台重置登录密码。
2. **改用 SSH 密钥登录**（更安全，推荐）：
   ```bash
   # 本机生成密钥（如已有可跳过）
   ssh-keygen -t ed25519 -C "leooelcn@gmail.com"
   # 把公钥传到服务器（会让你输一次密码）
   ssh-copy-id ubuntu@150.158.41.97
   ```
   之后即可免密登录：`ssh ubuntu@150.158.41.97`

---

## 1. 本地构建

```bash
cd dengzhimin-site
npm install
npm run build        # 产物在 dist/ 目录
```

`dist/` 里的内容就是最终要上传的整个网站。

---

## 2. 上传到服务器

**方式 A：一次性上传（scp）**

```bash
# 先登录服务器创建目录
ssh ubuntu@150.158.41.97 "mkdir -p /var/www/dengzhimin"

# 本机上传 dist 内容到服务器
scp -r dist/* ubuntu@150.158.41.97:/var/www/dengzhimin/
```

**方式 B：rsync（推荐，增量更新快，macOS 自带）**

```bash
rsync -avz --delete dist/ ubuntu@150.158.41.97:/var/www/dengzhimin/
```

> `--delete` 会删除服务器上多余的文件，保持与本地 `dist/` 完全一致。

---

## 3. 服务器安装并配置 Nginx

SSH 登录服务器后执行：

```bash
sudo apt update
sudo apt install -y nginx

# 创建站点配置文件
sudo tee /etc/nginx/sites-available/dengzhimin > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name dengzhimin.cn www.dengzhimin.cn;

    root /var/www/dengzhimin;
    index index.html;

    # 纯静态，直接返回文件
    location / {
        try_files $uri $uri/ =404;
    }

    # 静态资源缓存
    location ~* \.(css|js|svg|png|jpg|jpeg|webp|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 自定义 404 页
    error_page 404 /404.html;
}
EOF

# 启用站点并重载
sudo ln -sf /etc/nginx/sites-available/dengzhimin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. 域名解析（DNS）

登录你的**域名服务商控制台**（或腾讯云 DNSPod），添加两条 A 记录，指向 `150.158.41.97`：

| 主机记录 | 记录类型 | 记录值 | 说明 |
| --- | --- | --- | --- |
| `www` | A | `150.158.41.97` | 主站 www.dengzhimin.cn |
| `@` | A | `150.158.41.97` | 裸域 dengzhimin.cn（也指向主站） |

解析生效后（通常几分钟到几小时），访问 `http://www.dengzhimin.cn` 应能看到网站。

---

## 5. 开放端口（防火墙）

**腾讯云控制台**：轻量服务器 → 防火墙 → 放行 `80`（HTTP）和 `443`（HTTPS）。

**服务器内（可选）**：如果启用了 ufw：

```bash
sudo ufw allow 'Nginx Full'   # 放行 80 + 443
```

---

## 6. 配置 HTTPS（免费证书）

用 Certbot 自动申请并续期 Let's Encrypt 证书：

```bash
sudo apt install -y certbot python3-certbot-nginx

# 为两个域名签发证书并自动改写 Nginx 配置
sudo certbot --nginx -d dengzhimin.cn -d www.dengzhimin.cn
```

按提示填写邮箱、同意条款即可。Certbot 会自动：

- 申请证书
- 把 Nginx 配置改为监听 443 并提供证书
- 添加 80 → 443 的跳转

验证自动续期（可选）：

```bash
sudo certbot renew --dry-run
```

完成后访问 `https://www.dengzhimin.cn`，应出现绿色锁。

---

## 7. 日常更新流程

每次改了文章或样式，只需三步：

```bash
# 1. 本地重新构建
npm run build

# 2. 增量上传
rsync -avz --delete dist/ ubuntu@150.158.41.97:/var/www/dengzhimin/

# 3. （静态文件，无需重启 Nginx）
```

可以把这三步写成一个脚本 `deploy.sh`（见下），以后一条命令完成：

```bash
#!/usr/bin/env bash
set -e
npm run build
rsync -avz --delete dist/ ubuntu@150.158.41.97:/var/www/dengzhimin/
echo "✅ 已部署到 https://www.dengzhimin.cn"
```

---

## 8. 进阶：GitHub Actions 自动部署（可选）

如果想把源码推到 GitHub、推送即自动部署，可以把以下流程加进 `.github/workflows/deploy.yml`：

1. `npm ci && npm run build`
2. 用 `rsync`/`scp` 把 `dist/` 传到服务器（用 GitHub Secrets 保存 `SSH_PRIVATE_KEY`）

需要的话可以再帮你写。当前手工 `deploy.sh` 方案已足够轻量、可控。

---

## 常见问题

- **访问还是打不开？** 依次检查：DNS 是否生效（`dig www.dengzhimin.cn`）→ 腾讯云防火墙是否放行 80/443 → `nginx -t` 是否报错 → 服务器 `curl localhost` 是否有输出。
- **中文显示乱码？** Nginx 默认 UTF-8，一般不会；如遇到在 server 块加 `charset utf-8;`。
- **改了文章没更新？** 浏览器强刷（Cmd+Shift+R）；或检查是否用了缓存过长的旧配置。
