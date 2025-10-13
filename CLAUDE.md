# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JourneyBox (旅迹盒子) - AI智能旅行规划助手。基于React的旅行规划应用,使用硅基流动(SiliconFlow)的Qwen大模型生成真实可行的旅行计划,集成Unsplash图片和高德地图服务。

**核心技术栈**:
- Frontend: React 18.2.0, React Router 6, Ant Design 5.x, Framer Motion
- AI: SiliconFlow API (Qwen/Qwen2.5-72B-Instruct模型)
- Services: Unsplash API, 高德地图API
- Build: Create React App 5.0.1

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm start

# 生产构建
npm run build

# 运行测试
npm test
```

## 环境变量配置

**必需配置** (.env文件):
```env
# 硅基流动AI服务 (必需)
REACT_APP_SILICONFLOW_API_KEY=your_siliconflow_api_key
REACT_APP_SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
REACT_APP_SILICONFLOW_MODEL=Qwen/Qwen2.5-72B-Instruct

# Unsplash图片服务 (可选)
REACT_APP_UNSPLASH_API_KEY=your_unsplash_access_key

# 高德地图服务 (可选)
REACT_APP_AMAP_KEY=your_amap_key
REACT_APP_AMAP_SECURITY_KEY=your_amap_security_key
```

**重要**:
- 获取硅基流动API密钥: https://siliconflow.cn
- 获取Unsplash密钥: https://unsplash.com/developers
- 获取高德地图密钥: https://lbs.amap.com
- aiService.js有硬编码后备密钥用于Vercel部署,生产环境应移除

## 核心架构

### AI服务集成 (src/api/aiService.js)

**关键特性**:
- **请求节流**: 5秒最小请求间隔 (minRequestInterval: 5000ms)
- **重试机制**: 429错误时延迟10倍基础时间后重试
- **提示工程**: 高度优化的prompt确保生成真实景点和准确信息
- **JSON清理**: 自动移除markdown标记,提取纯JSON内容

**核心函数**:
```javascript
// 生成旅行计划 - 最重要的函数
generateTravelPlan(tripData)
// 参数: {destination, startDate, endDate, budget, interests, travelStyle, participants}
// 返回: 包含days数组的JSON,每天包含4-5个activities

// 优化行程
optimizeTripPlan(currentPlan, options)

// AI问答
askTravelQuestion(question, tripContext)
```

**错误处理模式**:
- 429: 频率限制 → 提示用户等待,canRetry: true
- 400: 请求格式错误 → canRetry: false
- 401/403: 认证失败 → 提示检查API密钥
- 500+: 服务器错误 → canRetry: true

### 数据服务架构

**Mock数据模式** (所有服务):
- `tripService.js`: mockTrips数组 + mockTripDetails对象,完全模拟CRUD
- `userService.js`: mockUsers数组,模拟认证
- `postService.js`: mockPosts数组,社区内容
- `communityService.js`: 社交功能(关注/点赞/评论)

**重要**: 当前无真实后端,所有数据存在内存中,刷新页面后丢失

**添加真实后端的步骤**:
1. 替换service文件中的Promise.resolve为axios调用
2. 配置baseURL环境变量
3. 实现token持久化(localStorage → headers)
4. 处理网络错误和超时

### 路由架构 (src/App.js)

**主要路由**:
- `/` - HomePage: 行程列表展示
- `/create-trip` - CreateTripEnhanced: 分步向导式创建(主要入口)
- `/create-trip-old` - CreateTripPage: 旧版创建页面(已弃用)
- `/itinerary/:id` - ItineraryPage: 详细日程展示(最复杂页面,~63KB)
- `/generating-trip` - GeneratingTripPage: AI生成动画页面
- `/community` - CommunityPage: 社区分享
- `/auth` - AuthPage: 登录注册

**页面变体**:
- ItineraryPageSimple: 简化版行程页
- ItineraryPageImproved: 改进版行程页
- MapTestPage: 高德地图测试页

### 认证流程 (src/contexts/AuthContext.js)

**状态管理**:
```javascript
const { user, isAuthenticated, loading, login, logout } = useAuth();
```

**支持的认证方式**:
1. 用户名/密码登录
2. 微信OAuth (回调: /auth/wechat-callback)

**持久化**: 依赖userService.getCurrentUser()在应用加载时恢复状态

## 关键页面详解

### CreateTripEnhanced (主要创建流程)

**4步向导**:
1. **选择目的地**: 12个热门城市快选 + 自定义输入
   - 预设: 北京/上海/杭州/成都/西安/三亚/厦门/丽江/重庆/青岛/大理/苏州
2. **选择日期**: 日期范围选择器,自动计算天数和预估费用
3. **兴趣偏好**:
   - 兴趣标签: 历史文化/自然风光/美食探索/购物血拼/摄影打卡/休闲度假/冒险刺激/亲子游玩
   - 预算: 经济型/舒适型/品质型/豪华型/奢华型
4. **行程风格**: 轻松悠闲/平衡适中/紧凑充实

**数据流**:
```
CreateTripEnhanced → generateTravelPlan() → GeneratingTripPage → ItineraryPage
```

### ItineraryPage (最复杂组件)

**功能**:
- 时间轴方式展示每日行程
- 景点卡片: 时间/地点/描述/费用/图片
- Unsplash图片集成
- AI优化建议
- 实时编辑功能

**性能注意**:
- 文件约63KB,考虑拆分为子组件
- 大量Unsplash API调用,需要节流控制

### GeneratingTripPage (生成动画)

**动画步骤**:
1. 收集目的地信息
2. 分析最佳景点组合
3. 优化行程路线
4. 生成详细行程计划

**实现**: Framer Motion动画 + 飞机云朵效果

## 关键模式与约定

### Mock数据模式

**结构示例** (tripService.js:2-39):
```javascript
const mockTrips = [
  { id: 1, title: '北京三日游', destination: '北京', coverImage: '/image/beijing.jpg' }
];

const mockTripDetails = {
  1: {
    tripInfo: { id, title, destination, ... },
    itinerary: {
      days: [
        { day: 1, places: [...] }
      ]
    }
  }
};
```

**添加新功能时**:
1. 先定义mock数据结构
2. 用setTimeout模拟异步(500-800ms)
3. 返回Promise包装的数据

### 图片路径约定

**规则**:
- 公共图片: `/image/filename.jpg` (注意无`/public`前缀)
- 城市封面: `/image/beijing.jpg`, `/image/shanghai.jpg`等
- 景点图片: `/image/attractions/故宫.jpg`

**Unsplash集成**:
- UnsplashImage组件自动处理归属标注
- 使用searchPhotos()搜索相关图片

### 错误处理模式

**服务层**:
```javascript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('描述性错误信息', error);
  throw new Error('用户友好的错误消息');
}
```

**组件层**:
```javascript
try {
  await serviceFunction();
  message.success('操作成功');
} catch (error) {
  message.error(error.message);
}
```

**认证错误**: 触发logout并重定向到/auth

## 重要技术细节

### AI生成质量保证 (aiService.js:60-123)

**Prompt工程策略**:
- 明确要求真实存在的景点/餐厅
- 要求准确的地址、价格、开放时间
- 每天4-5个活动,包含景点/餐饮/休息
- 强制JSON格式,禁止markdown包裹

**温度参数**: 0.7 (平衡准确性和创意性)
**Max tokens**: 8000 (确保完整生成多日行程)

### 请求节流机制 (aiService.js:18-35)

```javascript
let lastRequestTime = 0;
const minRequestInterval = 5000; // 5秒

const throttleRequest = async () => {
  const timeSinceLastRequest = Date.now() - lastRequestTime;
  if (timeSinceLastRequest < minRequestInterval) {
    await new Promise(resolve =>
      setTimeout(resolve, minRequestInterval - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
};
```

**原因**: SiliconFlow API有频率限制,违反会返回429错误

### 重试策略 (aiService.js:37-57)

- 默认重试1次
- 基础延迟10秒
- 429错误延迟10倍(100秒)
- 其他错误延迟3倍(30秒)
- 每次重试延迟翻倍

## 常见陷阱与注意事项

### API密钥安全

**当前状态**: aiService.js:5有硬编码后备密钥
```javascript
const SILICONFLOW_API_KEY = process.env.REACT_APP_SILICONFLOW_API_KEY
  || 'sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga';
```

**生产环境**:
1. 移除硬编码密钥
2. 仅使用环境变量
3. 在Vercel/服务器端配置环境变量
4. 添加密钥验证失败的友好提示

### AI服务节流

**问题**: 用户快速点击"生成行程"会触发频率限制
**解决方案**:
1. UI禁用生成按钮在请求期间
2. 显示倒计时或进度条
3. 考虑请求队列而非简单节流

### Mock数据持久化

**问题**: 刷新页面后数据丢失
**临时方案**: 使用localStorage存储关键数据
**最佳方案**: 实现真实后端API

### ItineraryPage性能

**问题**: 文件过大(63KB),大量Unsplash API调用
**优化方向**:
1. 拆分为DayCard/ActivityCard等子组件
2. 实现图片懒加载
3. Unsplash请求去重和缓存
4. 考虑虚拟滚动(react-window)

### 微信OAuth流程

**回调路由**: /auth/wechat-callback
**要求**: 需要在微信开放平台配置回调域名
**测试**: 本地开发无法测试,需要公网域名

## 部署配置

### Vercel部署

**关键步骤**:
1. 在Vercel项目设置添加环境变量
2. 确保.env.example已更新为模板
3. 注意: 硬编码后备密钥仅用于紧急情况

**环境变量必填**:
- REACT_APP_SILICONFLOW_API_KEY
- REACT_APP_SILICONFLOW_BASE_URL
- REACT_APP_SILICONFLOW_MODEL

### Build输出

```bash
npm run build
# 输出到 build/ 目录
# 可用任何静态服务器托管
```

## 开发最佳实践

### 添加新功能

1. **定义mock数据结构** (在对应service.js顶部)
2. **实现service函数** (返回Promise,模拟延迟)
3. **创建React组件** (使用Ant Design组件库)
4. **错误处理** (try-catch + message.error)
5. **测试多种场景** (空数据、错误状态、加载状态)

### 修改AI提示词

**位置**: aiService.js:70-123 (generateTravelPlan函数)
**测试流程**:
1. 修改prompt内容
2. 测试生成3个不同城市的行程
3. 验证JSON格式正确性
4. 检查内容真实性和完整性
5. 注意token消耗(max_tokens: 8000)

### 样式规范

- 使用Ant Design组件优先
- 自定义样式使用CSS Modules或styled-components
- 响应式设计: 考虑移动端(min-width: 320px)
- 色彩: 参考Ant Design色板

## 技术债务

1. **后端实现**: 所有service需要真实API替换mock
2. **状态管理**: 考虑Redux或Zustand替代多个Context
3. **代码分割**: ItineraryPage需要拆分
4. **测试覆盖**: 缺少单元测试和集成测试
5. **TypeScript**: 考虑迁移提升类型安全
6. **API密钥管理**: 移除硬编码,实现密钥轮转

## 相关文档

- README.md: 项目概览和快速开始
- .env.example: 环境变量模板
- package.json: 依赖和脚本命令
