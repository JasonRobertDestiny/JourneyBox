# JourneyBox 部署指南

## 🚀 Vercel 部署步骤

### 前置准备

1. **获取 API 密钥**
   - 硅基流动 API: https://siliconflow.cn
   - Unsplash API: https://unsplash.com/developers

2. **GitHub 账号**
   - 确保项目已推送到 GitHub

### 部署步骤

1. **Fork 或上传项目到 GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment of JourneyBox"
   git push origin main
   ```

2. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

3. **导入项目**
   - 点击 "New Project"
   - 选择 GitHub 仓库
   - 选择 journey-box 项目

4. **配置环境变量**

   在 Vercel 项目设置中添加以下环境变量：

   | 变量名 | 说明 | 示例值 |
   |--------|------|--------|
   | `REACT_APP_SILICONFLOW_API_KEY` | 硅基流动 API 密钥 | `sk-xxx...` |
   | `REACT_APP_SILICONFLOW_BASE_URL` | API 基础 URL | `https://api.siliconflow.cn/v1` |
   | `REACT_APP_SILICONFLOW_MODEL` | 使用的模型 | `Qwen/Qwen2.5-72B-Instruct` |
   | `REACT_APP_UNSPLASH_API_KEY` | Unsplash API 密钥 | `xxx...` |

5. **部署设置**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

6. **开始部署**
   - 点击 "Deploy"
   - 等待部署完成（约2-3分钟）

### 部署后配置

1. **自定义域名**（可选）
   - 在 Settings > Domains 中添加自定义域名
   - 按照提示配置 DNS

2. **性能优化**
   - 启用 Edge Functions
   - 配置缓存策略

### 常见问题

**Q: 部署失败，提示构建错误**
- 检查环境变量是否正确配置
- 确保所有依赖都在 package.json 中

**Q: API 调用失败**
- 验证 API 密钥是否有效
- 检查 API 配额是否充足

**Q: 图片加载失败**
- 确认 Unsplash API 密钥已配置
- 检查网络连接

### 本地测试部署

```bash
# 构建生产版本
npm run build

# 使用 serve 测试
npx serve -s build
```

### 更新部署

当代码更新后，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update: 新功能描述"
git push origin main
```

## 📊 监控和分析

部署成功后，可以在 Vercel Dashboard 中查看：
- 实时访问数据
- 性能指标
- 错误日志
- 函数调用统计

## 🔒 安全建议

1. **API 密钥管理**
   - 永远不要将密钥提交到代码仓库
   - 使用环境变量管理敏感信息

2. **访问控制**
   - 配置 CORS 策略
   - 设置 Rate Limiting

3. **定期更新**
   - 及时更新依赖包
   - 关注安全公告

## 📞 支持

如遇到问题，请提交 Issue 到 GitHub 仓库。

---

**Happy Deploying! 🎉**