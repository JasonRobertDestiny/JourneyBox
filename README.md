# 🌍 JourneyBox - AI智能旅行规划助手

一个基于React和AI驱动的智能旅行规划应用，帮助用户快速生成个性化的精品旅行行程。

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.x-0170FE?style=flat&logo=ant-design&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ 核心功能

### 🎯 智能行程生成
- **AI驱动规划**: 使用硅基流动API（Qwen/Qwen2.5-72B-Instruct模型）生成高质量的旅行计划
- **真实地点推荐**: 自动推荐真实存在的景点、餐厅和酒店，包含详细地址和介绍
- **个性化定制**: 根据用户的兴趣、预算和旅行风格定制专属行程
- **动态优化**: 智能优化路线，合理安排时间，提升旅行体验

### 🎨 优雅的用户体验
- **分步式创建流程**: 简洁直观的向导式界面，轻松完成行程规划
- **丰富的目的地选择**: 12+热门城市快速选择，支持自定义目的地输入
- **实时生成动画**: 精美的loading动画，飞机云朵效果，提升等待体验
- **响应式设计**: 完美适配桌面、平板和移动设备

### 🖼️ 多媒体支持
- **Unsplash图片集成**: 自动为景点匹配高质量图片
- **可视化展示**: 时间轴形式展示每日行程
- **详细信息卡片**: 包含景点介绍、游览时长、费用预估等

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/journey-box.git
cd journey-box
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
复制 `.env.example` 文件并重命名为 `.env`，然后填入你的API密钥：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# AI Service (SiliconFlow)
REACT_APP_SILICONFLOW_API_KEY=你的硅基流动API密钥
REACT_APP_SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
REACT_APP_SILICONFLOW_MODEL=Qwen/Qwen2.5-72B-Instruct

# Image Service (Unsplash)
REACT_APP_UNSPLASH_API_KEY=你的Unsplash API密钥
```

4. **启动应用**
```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行

## 🛠️ 技术栈

### 前端框架
- **React 18** - 现代化的前端框架
- **React Router v6** - 客户端路由管理
- **Ant Design 5.x** - 企业级UI组件库
- **Axios** - HTTP客户端

### AI与服务
- **硅基流动 (SiliconFlow)** - Qwen/Qwen2.5-72B-Instruct大模型
- **Unsplash API** - 高质量图片服务

### 开发工具
- **Create React App** - 项目脚手架
- **CSS3** - 样式设计
- **dayjs** - 日期处理

## 📱 核心页面

### 首页 (`HomePage`)
- 展示精选行程卡片
- 快速创建入口
- 优雅的动画效果

### 创建行程 (`CreateTripEnhanced`)
**分步式向导界面**：
1. **选择目的地**: 12个热门城市快速选择 + 自定义输入
   - 北京、上海、杭州、成都、西安、三亚
   - 厦门、丽江、重庆、青岛、大理、苏州

2. **选择日期**: 灵活的日期范围选择
   - 自动计算行程天数
   - 预估总花费

3. **兴趣偏好**:
   - 历史文化、自然风光、美食探索
   - 购物血拼、摄影打卡、休闲度假
   - 冒险刺激、亲子游玩
   - 预算水平：经济型、舒适型、品质型、豪华型、奢华型

4. **行程风格**:
   - 轻松悠闲：充足休息，慢节奏体验
   - 平衡适中：合理安排，劳逸结合
   - 紧凑充实：高效游览，体验最大化

### 行程详情 (`ItineraryPage`)
- **时间轴视图**: 清晰展示每日行程安排
- **景点卡片**: 包含时间、地点、描述、费用等详细信息
- **AI优化建议**: 智能提供行程优化建议
- **实时编辑**: 支持调整和自定义行程

### 生成动画 (`GeneratingAnimation`)
- 飞机穿越云层动画
- 实时进度显示
- 步骤状态跟踪：
  1. 收集目的地信息
  2. 分析最佳景点组合
  3. 优化行程路线
  4. 生成详细行程计划

## 🌟 特色功能

### AI生成质量保证
- **详细的提示工程**: 确保生成真实、准确的景点信息
- **结构化输出**: 包含景点名称、地址、游览时长、费用等
- **智能排序**: 根据地理位置和游览顺序优化安排
- **本地化内容**: 推荐当地特色美食和体验

### 用户体验优化
- **渐进式表单**: 降低用户输入负担
- **实时验证**: 友好的错误提示
- **优雅动画**: 流畅的页面过渡效果
- **智能默认值**: 根据常见选择预设默认值

## 📝 API配置

### 硅基流动 (SiliconFlow)
1. 访问 [SiliconFlow官网](https://siliconflow.cn)
2. 注册账号并获取API密钥
3. 选择模型：Qwen/Qwen2.5-72B-Instruct
4. 将密钥添加到 `.env` 文件

### Unsplash
1. 访问 [Unsplash Developers](https://unsplash.com/developers)
2. 创建应用并获取Access Key
3. 将密钥添加到 `.env` 文件

## 🚢 部署

### Vercel部署（推荐）

1. **Fork本项目到你的GitHub**

2. **登录Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 使用GitHub账号登录

3. **导入项目**
   - 点击"New Project"
   - 选择你Fork的仓库
   - 点击"Import"

4. **配置环境变量**
   在Vercel项目设置中添加：
   ```
   REACT_APP_SILICONFLOW_API_KEY=你的API密钥
   REACT_APP_UNSPLASH_API_KEY=你的API密钥
   ```

5. **部署**
   - 点击"Deploy"
   - 等待构建完成

### 本地构建

```bash
# 构建生产版本
npm run build

# 构建完成后，build目录包含所有静态文件
# 可以使用任何静态文件服务器托管
```

## 🔧 项目结构

```
journey-box/
├── public/               # 静态资源
│   └── image/           # 城市图片
├── src/
│   ├── api/             # API服务
│   │   ├── aiService.js       # AI生成服务
│   │   ├── tripService.js     # 行程管理
│   │   └── unsplashService.js # 图片服务
│   ├── components/      # 通用组件
│   │   ├── Header.js          # 导航头
│   │   ├── GeneratingAnimation.js # 生成动画
│   │   └── UnsplashImage.js   # 图片组件
│   ├── pages/           # 页面组件
│   │   ├── HomePage.js        # 首页
│   │   ├── CreateTripEnhanced.js # 创建行程(增强版)
│   │   ├── ItineraryPage.js   # 行程详情
│   │   └── ...
│   ├── styles/          # 样式文件
│   └── App.js           # 应用入口
├── .env.example         # 环境变量示例
├── package.json         # 项目配置
└── README.md           # 项目文档
```

## 📊 性能优化

### 已实现
- ✅ API请求节流控制（5秒间隔）
- ✅ 图片懒加载
- ✅ 组件按需渲染
- ✅ 错误重试机制

### 优化策略
- 使用8000 tokens确保生成内容的完整性
- 智能缓存机制减少重复请求
- 优雅的降级方案处理API限制

## 🐛 问题排查

### 常见问题

**1. AI生成失败**
- 检查API密钥是否正确配置
- 确认模型名称：`Qwen/Qwen2.5-72B-Instruct`
- 注意API请求频率限制

**2. 图片无法加载**
- 验证Unsplash API密钥
- 检查网络连接

**3. 生成内容不完整**
- 确认max_tokens设置为8000
- 检查API余额是否充足

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [硅基流动](https://siliconflow.cn) - 提供强大的AI模型服务
- [Unsplash](https://unsplash.com) - 提供高质量的图片资源
- [Ant Design](https://ant.design) - 优秀的UI组件库
- [React](https://reactjs.org) - 强大的前端框架

---

**🚀 开始你的智能旅行规划之旅吧！**