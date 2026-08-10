#!/bin/bash

# 部署脚本 - 将 dist 文件夹内容推送到 GitHub 仓库
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 目标仓库
TARGET_REPO="https://github.com/auenger/ImCorders.git"

# 需要排除的目录
EXCLUDE_DIR="agentzone-ai"
TEMP_DIR="/tmp/personal-site-exclude"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    开始部署到 GitHub Pages${NC}"
echo -e "${BLUE}========================================${NC}"

# 0. 临时移除排除目录
if [ -d "$EXCLUDE_DIR" ]; then
  echo -e "\n${YELLOW}📂 步骤 0/6: 临时移除 ${EXCLUDE_DIR}...${NC}"
  mkdir -p "$TEMP_DIR"
  mv "$EXCLUDE_DIR" "$TEMP_DIR/"
fi

# 1. 构建项目
echo -e "\n${YELLOW}📦 步骤 1/6: 构建项目...${NC}"
npm run build

# 把微信签名函数带进 dist（Cloudflare Pages Functions 会把 functions/ 目录识别为边缘函数）
if [ -d "functions" ]; then
  cp -r functions dist/
fi

# 2. 进入 dist 目录
echo -e "\n${YELLOW}📂 步骤 2/6: 进入 dist 目录...${NC}"
cd dist

# 3. 初始化 Git 仓库
echo -e "\n${YELLOW}🔧 步骤 3/6: 初始化 Git 仓库...${NC}"
if [ -d ".git" ]; then
    echo "Git 仓库已存在，重新初始化..."
    rm -rf .git
fi
git init
git branch -M main

# 4. 提交所有文件
echo -e "\n${YELLOW}📝 步骤 4/6: 提交文件...${NC}"
git add -A
DEPLOY_TIME=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Deploy site - ${DEPLOY_TIME}"

# 5. 推送到远程仓库
echo -e "\n${YELLOW}🚀 步骤 5/6: 推送到 GitHub...${NC}"
git remote add origin ${TARGET_REPO}
git push -u origin main --force

# 返回项目根目录
cd ..

# 6. 恢复排除目录
if [ -d "$TEMP_DIR/$EXCLUDE_DIR" ]; then
  echo -e "\n${YELLOW}📂 步骤 6/6: 恢复 ${EXCLUDE_DIR}...${NC}"
  mv "$TEMP_DIR/$EXCLUDE_DIR" ./
  rmdir "$TEMP_DIR" 2>/dev/null || true
fi

echo -e "\n${GREEN}✅ 部署成功！${NC}"
echo -e "${GREEN}🌐 访问: https://auenger.github.io/ImCorders/${NC}"
echo -e "${BLUE}========================================${NC}"
