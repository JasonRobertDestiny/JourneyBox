# Codex开发Prompt - 修复AI JSON解析问题

## 任务概述

修复 `src/api/aiService.js` 中的JSON解析失败问题。当AI返回行程数据时，`generateTravelPlan` 函数的JSON解析逻辑存在bug，导致用户看到"AI返回的数据格式异常"错误。

## 核心问题

### 问题1: 正则表达式bug (第170行)

```javascript
// 当前代码 - 有bug
fixed = fixed.replace(/([}\]])(\s*")/g, '$1,$2');
```

这行代码会在所有 `}]` 后面添加逗号，破坏原本正确的JSON。

**修复**: 删除这行代码及第172行的后续修复。

### 问题2: 截断修复不完整 (第43-122行)

`repairTruncatedJson` 函数无法正确处理各种截断场景。

**修复**: 重写该函数，使用从后向前扫描找配对括号的方式。

### 问题3: 调试信息不足

只打印前200字符，无法调试。

**修复**: 添加完整响应日志，并保存到localStorage供调试。

## 具体修改任务

### 任务1: 删除问题正则 (aiService.js:169-172)

找到并删除：
```javascript
// 6. 修复缺失的逗号（在 "}" 或 "]" 后面跟 """ 的情况）
fixed = fixed.replace(/([}\]])(\s*")/g, '$1,$2');
// 但不要在最外层添加逗号
fixed = fixed.replace(/\},$/, '}');
```

### 任务2: 重写repairTruncatedJson函数

替换第43-122行的 `repairTruncatedJson` 函数为：

```javascript
const repairTruncatedJson = (str) => {
  console.log('【截断修复】开始修复截断的JSON，原始长度:', str.length);

  let result = str.trim();

  // 计算未闭合的括号
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < result.length; i++) {
    const char = result[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
    }
  }

  // 如果在字符串中截断，关闭字符串
  if (inString) {
    result += '"';
  }

  // 移除末尾不完整的属性定义
  // 匹配: ,"key": 或 ,"key":"value 或 ,"key":[ 等不完整模式
  result = result.replace(/,?\s*"[^"]*"\s*:\s*"?[^"{}[\],]*$/g, '');

  // 移除末尾的逗号
  result = result.replace(/,\s*$/, '');

  // 关闭所有未关闭的括号 - 先关闭数组再关闭对象
  while (bracketCount > 0) {
    result += ']';
    bracketCount--;
  }
  while (braceCount > 0) {
    result += '}';
    braceCount--;
  }

  console.log('【截断修复】修复后的JSON末尾100字:', result.slice(-100));

  // 验证修复是否成功
  try {
    JSON.parse(result);
    console.log('【截断修复】修复成功！');
    return result;
  } catch (e) {
    console.error('【截断修复】修复后仍然无效:', e.message);
    // 尝试更激进的修复：移除最后一个不完整的对象
    const lastCompleteObject = result.lastIndexOf('},');
    if (lastCompleteObject > 0) {
      const truncated = result.substring(0, lastCompleteObject + 1);
      // 重新计算并关闭括号
      let bc = 0, brc = 0, ins = false, esc = false;
      for (let i = 0; i < truncated.length; i++) {
        const c = truncated[i];
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === '"') { ins = !ins; continue; }
        if (!ins) {
          if (c === '{') bc++;
          else if (c === '}') bc--;
          else if (c === '[') brc++;
          else if (c === ']') brc--;
        }
      }
      let finalResult = truncated;
      while (brc > 0) { finalResult += ']'; brc--; }
      while (bc > 0) { finalResult += '}'; bc--; }
      try {
        JSON.parse(finalResult);
        console.log('【截断修复】激进修复成功！');
        return finalResult;
      } catch (e2) {
        console.error('【截断修复】激进修复也失败:', e2.message);
      }
    }
    return result;
  }
};
```

### 任务3: 删除破坏字符串的代码 (aiService.js:195-199)

在 `fixJsonString` 函数中，找到并删除：
```javascript
extracted = extracted
  .replace(/\n/g, ' ')
  .replace(/\r/g, '')
  .replace(/\t/g, ' ')
  .replace(/\s+/g, ' ');
```

### 任务4: 增强调试日志 (aiService.js:348附近)

在 `console.log('【AI响应】原始内容前200字:', content.substring(0, 200));` 后添加：

```javascript
// 开发调试：记录完整响应
if (process.env.NODE_ENV === 'development') {
  console.log('【AI响应】完整内容:', content);
}
```

在catch块 (第411行附近) 中添加：
```javascript
// 保存失败的响应供调试
try {
  localStorage.setItem('_debug_lastFailedAiResponse', content);
  localStorage.setItem('_debug_lastFailedTime', new Date().toISOString());
} catch (storageError) {
  // 忽略storage错误
}
```

### 任务5: 优化Prompt (aiService.js:285-298)

替换现有的prompt为：

```javascript
const prompt = `为${destination}制定${days}天旅行计划。

需求: ${destination}, ${startDate}到${endDate}, ${budget || '中等'}预算, ${Array.isArray(interests) ? interests.join('/') : interests || '文化'}

【严格JSON格式要求】
1. 直接输出JSON，以{开头以}结尾
2. 不要添加markdown代码块标记
3. 不要添加任何解释文字
4. 每天最多3个活动，description最多30字
5. 确保JSON完整闭合

格式:
{"overview":"概述","tips":"提示","days":[{"date":"${startDate}","dayOverview":"主题","activities":[{"time":"09:00","duration":"120","name":"名称","type":"景点","location":"地址","description":"描述","cost":"费用"}]}],"accommodation":"住宿","transportation":"交通"}`;
```

## 验证方法

修改完成后：

1. 运行 `npm run build` 确保无编译错误
2. 运行 `npm start` 启动开发服务器
3. 访问 http://localhost:3000/create-trip 创建新行程
4. 观察控制台日志，确认：
   - 【AI响应】显示完整内容
   - 【JSON解析成功】或详细的失败信息
   - 不应该出现"AI返回的数据格式异常"错误（除非AI确实返回了无法修复的内容）

## 文件路径

```
/mnt/d/VibeCoding_pgm/JourneyBox/src/api/aiService.js
```

## 注意事项

1. 保持现有的错误处理逻辑不变（429、400、401等错误码处理）
2. 不要修改 `generateTravelPlan` 函数的输入输出接口
3. 保留所有中文日志，方便调试
4. 确保 `fixJsonString` 和 `repairTruncatedJson` 的函数签名不变
