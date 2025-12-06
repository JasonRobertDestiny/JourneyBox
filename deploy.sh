#!/bin/bash

# JourneyBox Docker 部署脚本
# 用法: ./deploy.sh

set -e

# 配置
IMAGE_NAME="journeybox"
CONTAINER_NAME="journeybox"
PORT=80

# API密钥（部署时会嵌入到构建中）
DEEPWISDOM_API_KEY="sk-KbOTM0XRoz5XLN26ExoVBj1R8TCkXIFEmzZkWVuddIyxmsVs"
DEEPWISDOM_BASE_URL="https://newapi.deepwisdom.ai/v1"
DEEPWISDOM_MODEL="gpt-4o"
UNSPLASH_KEY="PGkBLGHdVvlW_nfe7hYgve6SLuOYTLHcsis0BPXc8B8"
AMAP_API_KEY="46bb47dce29915526be75d06413ac5f6"
AMAP_SECURITY_KEY="c1148b993f8864bf80a64cedd915f989"
AMAP_WEB_KEY="c45c41f24f40ee717d440ef282599dfc"

echo "=== JourneyBox 部署开始 ==="

# 停止并删除旧容器
echo "停止旧容器..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 构建镜像
echo "构建Docker镜像..."
docker build \
  --build-arg REACT_APP_DEEPWISDOM_API_KEY="$DEEPWISDOM_API_KEY" \
  --build-arg REACT_APP_DEEPWISDOM_BASE_URL="$DEEPWISDOM_BASE_URL" \
  --build-arg REACT_APP_DEEPWISDOM_MODEL="$DEEPWISDOM_MODEL" \
  --build-arg REACT_APP_UNSPLASH_ACCESS_KEY="$UNSPLASH_KEY" \
  --build-arg REACT_APP_AMAP_API_KEY="$AMAP_API_KEY" \
  --build-arg REACT_APP_AMAP_SECURITY_KEY="$AMAP_SECURITY_KEY" \
  --build-arg REACT_APP_AMAP_WEB_KEY="$AMAP_WEB_KEY" \
  -t $IMAGE_NAME .

# 运行容器
echo "启动容器..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:80 \
  $IMAGE_NAME

echo "=== 部署完成 ==="
echo "访问地址: http://82.156.165.90"
docker ps | grep $CONTAINER_NAME
