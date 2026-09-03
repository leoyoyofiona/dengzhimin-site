# 建议弹幕后端（scf-api）

2026-09-03 起，站点 API 从 Cloudflare Workers 迁移至**腾讯云 SCF（上海 ap-shanghai）**，大陆可直连。

## 在线地址

- 函数 URL（公网）：`https://1303737693-hqp1nw586s.ap-shanghai.tencentscf.com`
- 旧 Cloudflare Workers（停用）：`https://dengzhimin-guestbook-api.leooelcn.workers.dev`

## 部署形态

- 服务：腾讯云云函数 SCF，运行时 Nodejs16.13，入口 `index.main_handler`，128MB / 30s
- 触发器：函数 URL（`CreateTrigger` Type=`http`，AuthType=NONE，公网+CORS 开启）
- 存储：腾讯云 COS `dengzhimin-api-data-1303737693`（ap-shanghai），键 `kv/<name>.json`
- 管理密码：`xz123`（代码内默认，也可经环境变量 `SCF_ADMIN_PASS` 覆盖）

## 接口

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/api/health` | GET | 健康检查（含留言/弹幕计数） |
| `/api/guestbook` | GET/POST | 留言板（旧→新存，GET 倒序返回） |
| `/api/visits` | GET/POST | 全站访问统计 |
| `/api/favorites` | GET/POST | 按访客 uid 的收藏/足迹 |
| `/api/suggestions` | GET/POST | 建议弹幕（公开；POST 走敏感词过滤） |
| `/api/suggestions/admin` | POST | 管理：`{password, action:'auth'|'delete'|'clear'}` |

## 部署步骤（已执行，备用）

1. `npm install --omit=dev`（安装 cos-nodejs-sdk-v5）
2. `zip -qr dengzhimin-api.zip index.js node_modules`
3. 用腾讯云 Python SDK（ap-shanghai）：
   - `CreateFunction`（Role=`SCF_QCSRole`，需先建角色并附 AdministratorAccess；CLS 需开通日志集）
   - `CreateTrigger`（Type=`http`，TriggerDesc 开启公网 + CORS `*`）
   - 更新代码用 `UpdateFunctionCode`
4. 数据迁移：`node local/migrate.js`（从旧 CF API 拉取写入 COS；收藏按 uid 由访客浏览器自动同步回云端）

## 注意

- 敏感词库在 `index.js` 顶部 `BANNED_WORDS`，命中返回 422。
- 留言/弹幕长度限制：正文 500、昵称 20。
- COS 密钥与站点 COS 相同（`/tmp/cosok.yaml` 同源）。
