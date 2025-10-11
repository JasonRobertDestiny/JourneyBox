#!/bin/bash

echo "设置Vercel环境变量..."

# 删除旧的环境变量（如果存在）
vercel env rm REACT_APP_SILICONFLOW_API_KEY production --yes 2>/dev/null
vercel env rm REACT_APP_SILICONFLOW_API_KEY preview --yes 2>/dev/null
vercel env rm REACT_APP_SILICONFLOW_API_KEY development --yes 2>/dev/null

# 添加新的环境变量
echo "sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga" | vercel env add REACT_APP_SILICONFLOW_API_KEY production
echo "sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga" | vercel env add REACT_APP_SILICONFLOW_API_KEY preview
echo "sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga" | vercel env add REACT_APP_SILICONFLOW_API_KEY development

echo "环境变量设置完成！"
echo "现在运行: vercel --prod 来重新部署"
