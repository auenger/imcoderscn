#!/bin/bash

# 个人网站启动脚本

echo "🚀 启动个人网站服务器..."

# 进入网站目录
cd ~/personal-site

# 启动 HTTP 服务器（端口 8080）
echo "📡 服务器运行在: http://localhost:8080"
echo "📂 网站目录: ~/personal-site"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

# 使用 Python 启动服务器
python3 -m http.server 8080
