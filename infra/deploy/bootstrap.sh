#!/usr/bin/env bash
set -euo pipefail

source /etc/os-release
if [ "${VERSION_ID}" != "22.04" ]; then
  echo "Ubuntu 22.04 is required."
  exit 1
fi

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git jq curl ufw

sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

sudo mkdir -p /opt/tongqian
cd /opt/tongqian
if [ ! -d .git ]; then
  sudo git clone https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai.git .
fi

sudo mkdir -p /opt/tongqian/data/{pg,redis,backup,oss-cache,nginx-cache,uptime-kuma}
if [ ! -f .env.prod ]; then
  sudo cp .env.example .env.prod
fi

echo "Edit /opt/tongqian/.env.prod, then run: TAG=prod-latest ./infra/deploy/deploy.sh prod-latest"
