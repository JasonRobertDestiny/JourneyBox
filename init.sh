#!/bin/bash
# JourneyBox 开发环境初始化脚本
# 用途：启动开发服务器、验证环境健康

set -e

echo "=== JourneyBox 环境检查 ==="

# 1. Node版本检查
echo -n "Node.js: "
node -v || { echo "ERROR: Node.js not installed"; exit 1; }

# 2. 依赖安装检查
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies: OK (node_modules exists)"
fi

# 3. 环境变量检查
echo -n "Environment: "
if [ -f ".env" ]; then
    # 检查关键变量
    if grep -q "REACT_APP_DEEPWISDOM_API_KEY" .env; then
        echo "OK (.env configured)"
    else
        echo "WARNING: REACT_APP_DEEPWISDOM_API_KEY not set in .env"
    fi
else
    echo "WARNING: .env not found"
    if [ -f ".env.example" ]; then
        echo "  Run: cp .env.example .env && edit .env"
    fi
fi

# 4. 构建测试
echo ""
echo "=== 构建测试 ==="
if npm run build 2>&1 | tail -3; then
    echo "Build: SUCCESS"
else
    echo "Build: FAILED"
    exit 1
fi

# 5. 端口检查
echo ""
echo "=== 端口检查 ==="
if lsof -i:3000 > /dev/null 2>&1; then
    echo "Port 3000: IN USE (dev server may already be running)"
else
    echo "Port 3000: AVAILABLE"
fi

echo ""
echo "=== 初始化完成 ==="
echo "启动开发服务器: npm start"
echo "访问地址: http://localhost:3000"
