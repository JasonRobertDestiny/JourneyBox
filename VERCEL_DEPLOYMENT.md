# Vercel部署配置指南

## 环境变量设置

在Vercel中部署此项目需要配置以下环境变量：

### 1. 硅基流动AI服务（必需）
```
REACT_APP_SILICONFLOW_API_KEY=sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga
REACT_APP_SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
REACT_APP_SILICONFLOW_MODEL=Qwen/Qwen2.5-72B-Instruct
```

### 2. 高德地图服务（可选）
```
REACT_APP_AMAP_API_KEY=46bb47dce29915526be75d06413ac5f6
REACT_APP_AMAP_SECURITY_KEY=c1148b993f8864bf80a64cedd915f989
REACT_APP_AMAP_WEB_KEY=c45c41f24f40ee717d440ef282599dfc
```

### 3. Unsplash图片服务（可选）
```
REACT_APP_UNSPLASH_API_KEY=PGkBLGHdVvlW_nfe7hYgve6SLuOYTLHcsis0BPXc8B8
```

## 在Vercel中配置环境变量

### 步骤1：登录Vercel
访问 [https://vercel.com](https://vercel.com) 并登录您的账户

### 步骤2：进入项目设置
1. 选择您的项目 (JourneyBox)
2. 点击顶部的 "Settings" 标签
3. 在左侧菜单中选择 "Environment Variables"

### 步骤3：添加环境变量
对于每个环境变量：
1. 点击 "Add New"
2. 输入 Key（变量名）
3. 输入 Value（变量值）- **直接粘贴值，不要选择"Add Secret"**
4. 选择环境：全选 (Production, Preview, Development)
5. 点击 "Save"

### 步骤4：重新部署
1. 返回项目主页
2. 点击 "Deployments" 标签
3. 找到最新的部署，点击右侧的三个点
4. 选择 "Redeploy"
5. 确认重新部署

## 常见问题

### Q: 出现 "references Secret which does not exist" 错误
**A:** 这表示环境变量被配置为引用Secret而不是直接值。删除该变量并重新添加，确保直接粘贴值。

### Q: 部署成功但AI功能不工作
**A:** 检查环境变量是否正确设置。可以在Vercel的Functions日志中查看错误信息。

### Q: 地图功能不显示
**A:** 高德地图API需要域名白名单。在高德地图控制台添加您的Vercel域名。

## 验证部署

部署成功后，访问以下页面测试功能：
- `/` - 主页
- `/create-trip` - 创建行程（测试AI生成）
- `/map-test` - 地图测试页面
- `/auth` - 登录页面

## 联系支持

如有问题，请在GitHub上创建Issue：
[https://github.com/JasonRobertDestiny/JourneyBox/issues](https://github.com/JasonRobertDestiny/JourneyBox/issues)