# 阿里云 VPS AI 助手 提示词整合包

> 在你的阿里云 VPS 控制台 / 终端里激活 AI 助手后，逐段粘贴下面的提示词。每段任务独立完成。
>
> AI 助手会执行命令并把结果反馈给你 → 你把"AI 反馈结果"用截图或文本回传给我（Claude），我帮你做下一步决策。

---

## 提示词 1 · VPS 基础环境探测（让阿里云 AI 给我反馈这台机器的全部信息）

⬇️ 复制下面三反引号内的全部内容到阿里云 AI ⬇️

```
我是 SaaS 项目"同乾方略·建筑 AI 经营管家"的运营方，刚购买这台 ECS。
请你执行以下命令并把每条的输出原文反馈给我（不要解读，只要原始输出）：

# 1. 系统信息
hostname
hostname -I
cat /etc/os-release | head -10
uname -a
uptime

# 2. 硬件
lscpu | head -20
free -h
df -h
nproc

# 3. 网络
curl -s ifconfig.me ; echo
ss -tlnp 2>/dev/null | head -20

# 4. 已安装关键软件检查
which docker || echo "Docker NOT installed"
docker --version 2>/dev/null
which docker-compose || echo "docker-compose NOT installed"
which nginx || echo "Nginx NOT installed"
nginx -v 2>&1
which git
git --version
which node || echo "Node NOT installed"
node --version 2>/dev/null
which pnpm || echo "pnpm NOT installed"
pnpm --version 2>/dev/null

# 5. 当前用户与权限
whoami
id
groups

# 6. 防火墙状态
ufw status 2>/dev/null || iptables -L -n | head -20

# 7. 时区与语言
date
timedatectl 2>/dev/null
locale

# 8. 阿里云 ECS 元数据
curl -s http://100.100.100.200/latest/meta-data/region-id ; echo
curl -s http://100.100.100.200/latest/meta-data/instance-id ; echo

请把每条命令的"命令 + 输出"按顺序整理成一份清单返回给我。
不需要执行任何修改，仅查询。
```

⬆️ 复制到此为止 ⬆️

把 AI 给你的反馈结果**截图或文本**发给我（Claude），我会基于真实环境给下一步指令。

---

## 提示词 2 · 安装基础环境（提示词 1 反馈给我后我会调整下面的内容）

⬇️ 暂时占位，等提示词 1 结果出来后我重写 ⬇️

```
（待定 - 等收到 VPS 真实环境后定制）
```

---

## 提示词 3 · 创建项目目录骨架（环境装完后用）

⬇️ 等环境装完后用 ⬇️

```
为同乾方略项目创建标准目录结构，每步完成后给我反馈：

1. 创建项目根目录与子目录：
sudo mkdir -p /opt/tongqian/{app,data/postgres,data/redis,data/oss-cache,logs/api,logs/worker,logs/nginx,backups/postgres,backups/oss-snapshots,certs,scripts}

2. 创建部署用户（如果还没有 deploy 用户）：
sudo useradd -m -s /bin/bash deploy 2>/dev/null
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

3. 设置目录所有权：
sudo chown -R deploy:deploy /opt/tongqian

4. 设置目录权限：
sudo chmod 750 /opt/tongqian/data /opt/tongqian/backups /opt/tongqian/certs
sudo chmod 755 /opt/tongqian/logs /opt/tongqian/scripts /opt/tongqian/app

5. 验证目录结构：
sudo apt install -y tree
tree -L 2 /opt/tongqian

6. 创建初始 README：
sudo tee /opt/tongqian/README.md > /dev/null << 'EOF'
# 同乾方略 · 建筑 AI 经营管家
GitHub: https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai
本目录由 GitHub Actions 自动部署管理，请勿手动修改 app/ 目录。
EOF

把每步的命令和输出反馈给我。
```

---

## 提示词 4 · 配置 SSH 公钥免密登录（GitHub Actions 部署用）

⬇️ 第 3 步完成后用 ⬇️

```
为 GitHub Actions 自动部署生成 SSH 部署密钥：

1. 切换到 deploy 用户：
sudo su - deploy

2. 生成密钥对（不设密码，因为是部署用的）：
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "github-actions-deploy@tongqian"

3. 把公钥加到 authorized_keys：
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

4. 显示私钥（一次性，用完后从你 VPS 删除）：
echo "===== PRIVATE KEY (复制到 GitHub Secrets) ====="
cat ~/.ssh/github_deploy
echo "===== END ====="

5. 显示公钥（用于验证）：
echo "===== PUBLIC KEY ====="
cat ~/.ssh/github_deploy.pub
echo "===== END ====="

把整个输出（含私钥）发给我，我会指导你配置 GitHub Secrets。
配置完成后立即从 VPS 删除私钥（保留公钥在 authorized_keys）。
```

---

## 提示词 5 · 配置 ufw 防火墙（最后做）

⬇️ 部署链路打通后做 ⬇️

```
配置 VPS 防火墙：

1. 安装 ufw（Ubuntu 一般已装）：
sudo apt install -y ufw

2. 默认策略：
sudo ufw default deny incoming
sudo ufw default allow outgoing

3. 开放必要端口：
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 如果开发期 IP 直连访问，加这几条（备案后删除）：
sudo ufw allow 3000/tcp comment 'dev:web'
sudo ufw allow 3001/tcp comment 'dev:admin'
sudo ufw allow 3002/tcp comment 'dev:agent'
sudo ufw allow 3003/tcp comment 'dev:gov'
sudo ufw allow 4000/tcp comment 'dev:api'

4. 启用：
sudo ufw --force enable

5. 验证：
sudo ufw status verbose

把输出发给我。
```

---

## 你的执行顺序

```
今天：
  Step 1（5 分钟）：粘贴提示词 1 → 反馈给我
  Step 2（等我）：我看完反馈给你定制提示词 2

明天：
  Step 3：跑提示词 2 装环境
  Step 4：跑提示词 3 建目录
  Step 5：跑提示词 4 生成 SSH 密钥（私钥发我）
  Step 6：跑提示词 5 配防火墙

W4 后：
  Step 7：让 Codex 跑 VPS 部署链路（用 .kiro/state/CODEX-PROMPTS.md 段 3）
```

---

## 关键提醒

- **私钥发我没问题**（开发期 deploy 私钥不接触你的真实账号）
- **VPS 当前公网 IP 也发我**（明文即可，不是密码）
- **不要在阿里云 AI 那边粘贴你的 .env 内容**（敏感，仅本地保存）

---

## 域名最终选择（更新版）

你确认了 **tongqian.xin**，所有 spec 已统一。

```
✅ 备案使用：tongqian.xin（阿里云万网买，与 ECS 同主体备案最快 5-10 天）
✅ 品牌备用：tongqian.io（已购，不备案，仅做营销物料 logo / 二维码 / 海报展示）

子域名规划：
  www.tongqian.xin     → 建筑老板前台
  api.tongqian.xin     → 后端 API
  agents.tongqian.xin  → 智能管家工作台
  gov.tongqian.xin     → 政企版前台
  admin.tongqian.xin   → 平台后台
  mp.tongqian.xin      → 公众号 H5（备用）
```

域名买完立即去阿里云 → 备案管理 → 提交 ICP 备案。
