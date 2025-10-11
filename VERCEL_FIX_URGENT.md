# ⚠️ 紧急修复：Vercel环境变量错误

## 问题描述
错误信息：`"REACT_APP_SILICONFLOW_API_KEY" references Secret "siliconflow_api_key", which does not exist.`

这表示环境变量被配置为引用一个名为 `siliconflow_api_key` 的Secret，但这个Secret不存在。

## 🔧 解决方案（必须在Vercel网页控制台操作）

### 步骤 1：删除所有相关环境变量

1. 访问 https://vercel.com/dashboard
2. 点击您的项目 **JourneyBox**
3. 点击顶部的 **Settings** 标签
4. 左侧菜单选择 **Environment Variables**
5. 找到以下所有变量并删除：
   - `REACT_APP_SILICONFLOW_API_KEY` ❌ 删除
   - `REACT_APP_SILICONFLOW_BASE_URL` ❌ 删除
   - `REACT_APP_SILICONFLOW_MODEL` ❌ 删除

### 步骤 2：重新添加环境变量（正确方式）

⚠️ **重要**：添加时选择 **"Plaintext"** 而不是 "Secret"！

1. 点击 **"Add New"** 按钮
2. 在弹出的对话框中：

#### 变量 1：
- **Key (Name)**: `REACT_APP_SILICONFLOW_API_KEY`
- **Value**:
  - 确保选择 **Plaintext** 选项（不是 Sensitive/Secret）
  - 粘贴: `sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga`
- **Environments**: 全选 (Production ✓, Preview ✓, Development ✓)
- 点击 **Add**

#### 变量 2：
- **Key (Name)**: `REACT_APP_SILICONFLOW_BASE_URL`
- **Value**: `https://api.siliconflow.cn/v1`
- **Environments**: 全选
- 点击 **Add**

#### 变量 3：
- **Key (Name)**: `REACT_APP_SILICONFLOW_MODEL`
- **Value**: `Qwen/Qwen2.5-72B-Instruct`
- **Environments**: 全选
- 点击 **Add**

### 步骤 3：触发重新部署

1. 返回项目主页
2. 点击 **Deployments** 标签
3. 找到最新的失败部署
4. 点击右侧的三个点 **⋮**
5. 选择 **Redeploy**
6. 在弹出框中点击 **Redeploy**

## 📸 关键点截图说明

### 添加环境变量时的正确界面：
```
┌─────────────────────────────────────┐
│ Add Environment Variable            │
├─────────────────────────────────────┤
│ Key:                                │
│ [REACT_APP_SILICONFLOW_API_KEY    ] │
│                                     │
│ Value:                              │
│ ○ Plaintext  ← 选这个！             │
│ ○ Secret                            │
│ ○ Reference to Secret               │
│                                     │
│ [sk-dmboumrbe...]                   │
│                                     │
│ □ Production                        │
│ □ Preview                           │
│ □ Development                       │
│                                     │
│ [Cancel]  [Add]                     │
└─────────────────────────────────────┘
```

## ❌ 常见错误

如果您看到这样的界面，说明选错了：
```
Value: @siliconflow_api_key  ← 这是错误的！
```

正确的应该是直接显示值：
```
Value: sk-dmboumrbe...  ← 这是正确的！
```

## 🚀 快速验证

添加完成后，在环境变量列表中应该看到：

| Key | Value | Environment |
|-----|-------|-------------|
| REACT_APP_SILICONFLOW_API_KEY | sk-dmb... (显示部分) | All |
| REACT_APP_SILICONFLOW_BASE_URL | https://api... | All |
| REACT_APP_SILICONFLOW_MODEL | Qwen/Qwen2.5... | All |

⚠️ 如果Value列显示 `@secret_name` 格式，说明配置错误！

## 💡 提示

- Vercel有两种存储敏感信息的方式：
  1. **Plaintext**: 直接存储值（我们需要用这个）
  2. **Secret**: 创建可重用的加密值（不要用这个）

- React应用需要使用Plaintext方式，因为构建时需要访问这些值

## 🆘 如果还是不行

1. 清除浏览器缓存并刷新Vercel页面
2. 确认没有其他同名的环境变量
3. 检查是否有多个Vercel项目使用同一个GitHub仓库

---
最后更新：2024年10月