import axios from 'axios';

// DeepWisdom API 配置 - 必须通过环境变量提供，禁止硬编码密钥
const DEEPWISDOM_API_KEY = process.env.REACT_APP_DEEPWISDOM_API_KEY || '';
const DEEPWISDOM_BASE_URL = process.env.REACT_APP_DEEPWISDOM_BASE_URL || 'https://newapi.deepwisdom.ai/v1';
const DEEPWISDOM_MODEL = process.env.REACT_APP_DEEPWISDOM_MODEL || 'gpt-4o';
// 限制token数量确保响应完整
const DEEPWISDOM_COMPLETION_TOKEN_LIMIT = 2000;
const DEEPWISDOM_OPTIMIZATION_TOKEN_LIMIT = 4000;

// 运行时校验环境变量，避免在构建产物中泄露密钥
if (!DEEPWISDOM_API_KEY) {
  console.error('【API密钥检查】缺少 REACT_APP_DEEPWISDOM_API_KEY 环境变量');
}

// 调试：打印环境变量 - 立即执行
console.log('【环境变量调试】', {
  hasEnvKey: !!process.env.REACT_APP_DEEPWISDOM_API_KEY,
  envKey: process.env.REACT_APP_DEEPWISDOM_API_KEY ? 'sk-...' + process.env.REACT_APP_DEEPWISDOM_API_KEY.slice(-10) : 'undefined',
  actualKey: DEEPWISDOM_API_KEY ? 'sk-...' + DEEPWISDOM_API_KEY.slice(-10) : 'undefined',
  model: DEEPWISDOM_MODEL,
  baseUrl: DEEPWISDOM_BASE_URL,
  allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

// 创建 DeepWisdom 客户端配置
const openaiClient = axios.create({
  baseURL: DEEPWISDOM_BASE_URL,
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPWISDOM_API_KEY}`,
    'Accept': 'application/json'
  }
});

// 节流函数 - 限制请求频率
let lastRequestTime = 0;
const minRequestInterval = 5000; // 增加到5秒的最小请求间隔时间，避免频率限制

// 修复截断的JSON - 尝试关闭所有未关闭的括号和字符串
const repairTruncatedJson = (str) => {
  console.log('【截断修复】开始修复截断的JSON...');

  let result = str.trim();

  // 移除末尾的不完整部分 (如 "name": " 或 "description": "xxx)
  // 找到最后一个完整的属性值
  const lastCompletePattern = /,?\s*"[^"]*"\s*:\s*"[^"]*"?\s*$/;
  const incompleteMatch = result.match(lastCompletePattern);
  if (incompleteMatch && !result.endsWith('"')) {
    // 如果末尾有不完整的字符串值，尝试关闭它
    result = result + '"';
  }

  // 移除末尾不完整的属性定义 (如 { "name":  或 "time": )
  result = result.replace(/,?\s*"[^"]*"\s*:\s*$/g, '');

  // 计算需要关闭的括号
  let braceCount = 0;  // {}
  let bracketCount = 0; // []
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

  // 移除末尾的逗号
  result = result.replace(/,\s*$/, '');

  // 关闭所有未关闭的括号
  while (bracketCount > 0) {
    result += ']';
    bracketCount--;
  }
  while (braceCount > 0) {
    result += '}';
    braceCount--;
  }

  console.log('【截断修复】修复后的JSON末尾:', result.slice(-100));

  // 验证修复是否成功
  try {
    JSON.parse(result);
    console.log('【截断修复】修复成功！');
    return result;
  } catch (e) {
    console.error('【截断修复】修复后仍然无效:', e.message);
    // 返回修复后的结果，让后续的默认数据填充处理
    return result;
  }
};

// JSON修复函数 - 尝试修复常见的JSON格式问题
const fixJsonString = (str) => {
  try {
    // 先尝试直接解析，如果成功就直接返回
    JSON.parse(str);
    return str;
  } catch (e) {
    console.log('【JSON修复】开始修复格式问题...');

    // 修复常见的JSON格式问题
    let fixed = str;

    // 0. 修复AI生成的畸形属性名 (最高优先级，因为这会破坏整个JSON结构)
    // 修复 "-description-:" 或 "-cost-:" 这种格式 -> "description": 或 "cost":
    fixed = fixed.replace(/"-([a-zA-Z_][a-zA-Z0-9_]*)-:"\s*/g, '"$1": "');
    fixed = fixed.replace(/"-([a-zA-Z_][a-zA-Z0-9_]*)-:"([^"]*)/g, '"$1": "$2');
    // 修复 "-date-": 或 "-time-": 这种格式
    fixed = fixed.replace(/"-([a-zA-Z_][a-zA-Z0-9_]*)-"\s*:/g, '"$1":');
    // 修复 "__property__": 或 "_property_": 格式
    fixed = fixed.replace(/"__([a-zA-Z_][a-zA-Z0-9_]*)__"\s*:/g, '"$1":');
    fixed = fixed.replace(/"_([a-zA-Z_][a-zA-Z0-9_]*)_"\s*:/g, '"$1":');

    // 1. 修复中文标点符号 (因为这是最常见的问题)
    fixed = fixed.replace(/：/g, ':');        // 中文冒号
    fixed = fixed.replace(/，/g, ',');        // 中文逗号
    fixed = fixed.replace(/"/g, '"');         // 中文左引号
    fixed = fixed.replace(/"/g, '"');         // 中文右引号
    fixed = fixed.replace(/'/g, "'");         // 中文左单引号
    fixed = fixed.replace(/'/g, "'");         // 中文右单引号
    fixed = fixed.replace(/（/g, '(');        // 中文左括号
    fixed = fixed.replace(/）/g, ')');        // 中文右括号

    // 2. 修复缺少引号的属性名
    fixed = fixed.replace(/([,{]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

    // 3. 修复尾部逗号
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 4. 修复连续逗号
    fixed = fixed.replace(/,,+/g, ',');

    // 5. 修复特定字段格式
    fixed = fixed.replace(/"time"\s*:\s*(\d+:\d+)/g, '"time": "$1"');
    fixed = fixed.replace(/"duration"\s*:\s*(\d+)/g, '"duration": "$1"');

    // 6. 修复缺失的逗号（在 "}" 或 "]" 后面跟 """ 的情况）
    fixed = fixed.replace(/([}\]])(\s*")/g, '$1,$2');
    // 但不要在最外层添加逗号
    fixed = fixed.replace(/\},$/, '}');

    console.log('【JSON修复】修复后内容前500字:', fixed.substring(0, 500));

    // 尝试解析修复后的JSON
    try {
      JSON.parse(fixed);
      console.log('【JSON修复】修复成功！');
      return fixed;
    } catch (e2) {
      console.error('【JSON修复】修复失败，尝试其他方法...', e2.message);

      // 如果还是失败，尝试更激进的修复
      // 提取JSON主体部分
      const jsonMatch = fixed.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let extracted = jsonMatch[0];
        // 再次尝试修复
        try {
          JSON.parse(extracted);
          return extracted;
        } catch (e3) {
          // 最后尝试：移除可能破坏结构的字符
          extracted = extracted
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ');

          // 尝试修复截断的JSON - 关闭所有未关闭的括号
          try {
            JSON.parse(extracted);
            return extracted;
          } catch (e4) {
            console.log('【JSON修复】检测到截断的JSON，尝试自动补全...');
            extracted = repairTruncatedJson(extracted);
            return extracted;
          }
        }
      }

      // 尝试修复截断的JSON
      console.log('【JSON修复】尝试修复截断的JSON...');
      return repairTruncatedJson(fixed);
    }
  }
};

const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < minRequestInterval) {
    // 如果距离上次请求时间不足最小间隔，则等待剩余时间
    const waitTime = minRequestInterval - timeSinceLastRequest;
    console.log(`请求节流：等待 ${waitTime}ms 后发送请求`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // 更新最后请求时间
  lastRequestTime = Date.now();
};

// 添加重试机制函数 - 减少重试次数，增加基础延迟
const retryWithDelay = async (fn, retries = 1, delay = 10000) => {
  try {
    // 应用节流控制
    await throttleRequest();
    
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // 对于429错误，增加更长的延迟
    const waitTime = error.response?.status === 429 ? delay * 10 : delay * 3;
    console.log(`API请求失败，${waitTime}ms后重试，剩余重试次数: ${retries}`, error.message);
    
    // 等待指定时间
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // 递归重试，使用更长的延迟时间
    return retryWithDelay(fn, retries - 1, delay * 2);
  }
};

// 生成旅行计划
export const generateTravelPlan = async (tripData) => {
  try {
    const { destination, startDate, endDate, budget, interests, travelStyle, participants } = tripData;

    // 添加调试信息
    console.log('【调试】API配置:', {
      apiKey: DEEPWISDOM_API_KEY ? 'sk-...' + DEEPWISDOM_API_KEY.slice(-10) : '未设置',
      baseUrl: DEEPWISDOM_BASE_URL,
      model: DEEPWISDOM_MODEL
    });

    console.log('【调试】请求参数:', {
      destination,
      startDate,
      endDate,
      budget,
      interests,
      travelStyle,
      participants
    });

    // 计算天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    // 生成高质量的旅行计划提示词 - 简化版
    const prompt = `为${destination}制定${days}天旅行计划。

需求: ${destination}, ${startDate}到${endDate}, ${budget || '中等'}预算, ${Array.isArray(interests) ? interests.join('/') : interests || '文化'}

【重要】每天只安排3个活动，description最多30字！必须返回完整JSON！

返回格式:
{
  "overview": "简短概述",
  "tips": "实用提示",
  "days": [{"date": "${startDate}", "dayOverview": "当日主题", "activities": [{"time": "09:00", "duration": "120", "name": "景点名", "type": "景点", "location": "地址", "description": "30字内描述", "cost": "价格"}]}],
  "accommodation": "酒店建议",
  "transportation": "交通建议"
}`;

    // 使用重试机制发送请求
    const response = await retryWithDelay(async () => {
      // 构建请求体
      const requestBody = {
        model: DEEPWISDOM_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是专业旅行规划师。【关键要求】必须返回完整的JSON，不能截断！\n\n规则:\n1.只推荐真实景点餐厅\n2.返回标准JSON,无markdown\n3.description字段最多30字！\n4.每天最多3个活动\n5.必须包含完整的days数组和所有闭合括号\n\n【JSON格式】\n- 属性名标准格式: "name": "value"\n- 禁止装饰符号如 "-name-:"\n- 必须完整闭合所有括号'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,  // 降低随机性,提高准确性
        max_tokens: DEEPWISDOM_COMPLETION_TOKEN_LIMIT,  // 留出缓冲避免超出4096上限
        top_p: 0.9,
        frequency_penalty: 0.3,  // 减少重复
        presence_penalty: 0.2,   // 鼓励多样性
        stream: false
      };

      // 调试：打印完整请求体
      console.log('【调试】完整请求体:', JSON.stringify(requestBody, null, 2));
      console.log('【调试】请求URL:', DEEPWISDOM_BASE_URL + '/chat/completions');
      console.log('【调试】Authorization头:', `Bearer sk-...${DEEPWISDOM_API_KEY.slice(-10)}`);

      // 使用直接的axios调用而不是预配置的客户端
      return await axios.post(
        `${DEEPWISDOM_BASE_URL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPWISDOM_API_KEY}`,
            'Accept': 'application/json'
          },
          timeout: 60000
        }
      );
    });
    
    // 解析API响应 - 改进版
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      let content = response.data.choices[0].message.content;

      // 清理AI返回的内容 - 多种格式兼容
      console.log('【AI响应】原始内容前200字:', content.substring(0, 200));
      content = content.trim();

      // 移除各种markdown标记
      if (content.startsWith('```json') || content.startsWith('```JSON')) {
        content = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      }

      // 移除可能的说明文字,只保留JSON部分
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        content = content.substring(jsonStart, jsonEnd + 1);
      }

      // 预处理: 移除字段名中的畸形字符，在fixJsonString之前做一次初步清理
      content = content
        .replace(/"-([a-zA-Z_][a-zA-Z0-9_]*)-:"/g, '"$1": "')  // "-description-:" -> "description": "
        .replace(/"-([a-zA-Z_][a-zA-Z0-9_]*)-"\s*:/g, '"$1":') // "-time-": -> "time":
        .replace(/"__([^"]+)__"\s*:/g, '"$1":')   // "__time__" -> "time"
        .replace(/"_([^"]+)_"\s*:/g, '"$1":')     // "_time_" -> "time"
        // 修复多余逗号
        .replace(/,(\s*[}\]])/g, '$1')             // 移除对象/数组尾部逗号
        .replace(/([}\]]),\s*([}\]])/g, '$1$2');  // 移除对象间多余逗号

      console.log('【AI响应】清理后内容前200字:', content.substring(0, 200));

      // 尝试修复JSON格式问题
      const fixedContent = fixJsonString(content);

      try {
        // 先尝试直接解析
        const parsed = JSON.parse(fixedContent);
        console.log('【JSON解析成功】数据结构:', Object.keys(parsed));

        // 数据验证 - 确保必要字段存在
        if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
          console.error('【验证失败】缺少days数组或为空');
          return {
            error: 'AI生成的行程数据不完整',
            errorDetails: '缺少每日行程安排，请重试',
            canRetry: true
          };
        }

        // 验证每天的活动数据完整性
        for (let i = 0; i < parsed.days.length; i++) {
          const day = parsed.days[i];
          if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
            console.error(`【验证失败】第${i+1}天缺少活动数据`);
            return {
              error: 'AI生成的行程数据不完整',
              errorDetails: `第${i+1}天缺少活动安排，请重试`,
              canRetry: true
            };
          }
        }

        console.log('【验证成功】行程数据格式正确,共' + parsed.days.length + '天');
        return parsed;
      } catch (parseError) {
        console.error('【JSON解析失败】', parseError.message);
        console.error('【原始内容】', content.substring(0, 500));
        console.error('【修复后内容】', fixedContent.substring(0, 500));

        // 返回解析错误，让用户重试
        return {
          error: 'AI返回的数据格式异常',
          errorDetails: `JSON解析失败: ${parseError.message}。请重试。`,
          canRetry: true
        };
      }
    }

    console.error('【响应错误】API响应格式异常');
    return {
      error: 'API响应格式错误',
      errorDetails: '未收到有效的AI响应，请重试',
      canRetry: true
    };
  } catch (error) {
    console.error('【生成失败】', error.message);
    console.error('【错误详情】', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage: error.response?.data?.error?.message,
      errorCode: error.response?.data?.error?.code
    });

    // 429 频率限制
    if (error.response?.status === 429) {
      return {
        error: 'API调用频率受限',
        errorDetails: '请稍等片刻后重试。系统每5秒只能处理一个请求,这是为了确保服务稳定性。',
        canRetry: true
      };
    }

    // 400 请求格式错误
    if (error.response?.status === 400) {
      const errorData = error.response?.data;
      const apiError = errorData?.error?.message || errorData?.message || errorData || '请求参数格式不正确';

      // 详细的错误日志
      console.error('【API 400错误】完整错误信息:', JSON.stringify(errorData, null, 2));
      console.error('【API 400错误】错误消息:', apiError);
      console.error('【API 400错误】错误代码:', errorData?.error?.code || errorData?.code);
      console.error('【API 400错误】请求配置:', {
        url: error.config?.url,
        headers: {
          'Content-Type': error.config?.headers?.['Content-Type'],
          'Authorization': error.config?.headers?.['Authorization'] ? 'Bearer sk-...' : 'Missing'
        },
        model: error.config?.data ? JSON.parse(error.config.data).model : 'unknown',
        requestBody: error.config?.data ? JSON.parse(error.config.data) : null
      });

      // 检查API密钥
      const hasApiKey = DEEPWISDOM_API_KEY && DEEPWISDOM_API_KEY !== '';
      console.error('【API密钥检查】', hasApiKey ? `存在 (sk-...${DEEPWISDOM_API_KEY.slice(-10)})` : '缺失');

      // 根据错误类型提供更具体的提示
      let specificError = '请求格式错误';
      let specificDetails = typeof apiError === 'string' ? apiError : JSON.stringify(apiError);

      // 检查是否是API密钥问题
      if (specificDetails.includes('API key') || specificDetails.includes('authentication') ||
          specificDetails.includes('unauthorized') || specificDetails.includes('Invalid API key') ||
          specificDetails.includes('Incorrect API key')) {
        specificError = 'API认证失败';
        specificDetails = 'API密钥无效或格式不正确。请确保已正确配置 REACT_APP_DEEPWISDOM_API_KEY 环境变量。';
      } else if (specificDetails.includes('model') || specificDetails.includes('Model')) {
        specificError = '模型配置错误';
        specificDetails = `模型名称"${DEEPWISDOM_MODEL}"可能不正确或暂不可用。`;
      } else if (specificDetails.includes('Invalid request') || specificDetails.includes('invalid')) {
        specificError = 'API请求格式错误';
        specificDetails = `API请求格式不正确：${specificDetails}`;
      }

      return {
        error: specificError,
        errorDetails: `${specificDetails}\n\n详细错误：${JSON.stringify(errorData, null, 2)}\n\n请按F12打开开发者工具查看控制台获取更多信息。`,
        canRetry: false,
        originalError: errorData
      };
    }

    // 401/403 认证错误
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        error: 'API认证失败',
        errorDetails: 'API密钥无效或已过期,请联系管理员',
        canRetry: false
      };
    }

    // 500+ 服务器错误
    if (error.response?.status >= 500) {
      return {
        error: 'AI服务暂时不可用',
        errorDetails: '服务器正在维护中,请稍后重试',
        canRetry: true
      };
    }

    // 网络错误
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        error: '网络连接超时',
        errorDetails: '请检查网络连接后重试',
        canRetry: true
      };
    }

    // 其他错误
    return {
      error: '生成失败',
      errorDetails: error.message || '未知错误,请重试',
      canRetry: true
    };
  }
};

// AI搜索景点信息 - 简化请求
export const searchAttractionInfo = async (attractionName, location) => {
  try {
    const response = await retryWithDelay(async () => {
      return await openaiClient.post('/chat/completions', {
        model: DEEPWISDOM_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个旅游信息助手。请严格按照JSON格式返回数据。'
          },
          {
            role: 'user',
            content: `简要描述${location || ''}的${attractionName}，包括历史背景和开放时间。请以精简的JSON格式返回，控制在200字以内。`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,  // 增加token限制以确保完整响应
        top_p: 0.8,
        stream: false
      });
    });
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      let content = response.data.choices[0].message.content;

      // 清理内容 - 移除markdown代码块标记
      content = content.trim();
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          content = jsonMatch[1].trim();
        }
      } else if (content.includes('```')) {
        const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          content = codeMatch[1].trim();
        }
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('解析AI返回的景点JSON失败:', parseError);
        console.error('原始内容:', content);
        return { error: 'AI返回的数据格式有误' };
      }
    }
    
    return { error: 'AI响应格式错误' };
  } catch (error) {
    console.error('搜索景点信息失败:', error);
    if (error.response?.status === 429) {
      return { error: 'API请求频率超限，请稍后再试' };
    }
    return { error: error.message || '搜索景点信息时发生错误' };
  }
};

// 优化行程计划 - 使用节流机制并减少数据量
export const optimizeTripPlan = async (currentPlan, options) => {
  try {
    // 应用请求节流
    await throttleRequest();
    
    // 将当前行程和优化选项转换为提示词
    const optimizationInstructions = [];
    if (options.reduceTravelTime) optimizationInstructions.push('优化景点顺序');
    if (options.avoidCrowds) optimizationInstructions.push('避开人流高峰');
    if (options.budgetFriendly) optimizationInstructions.push('提供经济选择');
    if (options.familyFriendly) optimizationInstructions.push('适合家庭');
    
    // 简化当前行程数据，只保留必要信息
    const simplifiedPlan = JSON.stringify(currentPlan)
      .replace(/"description":"[^"]+"/g, '"description":"略"')
      .replace(/"tips":"[^"]+"/g, '"tips":"略"');
    
    const prompt = `
    优化旅行计划，注意：${optimizationInstructions.join('，')}。
    当前行程：${simplifiedPlan}
    请返回优化后的完整行程，保持相同格式，但内容尽量精简。
    `;
    
    const response = await openaiClient.post('/chat/completions', {
      model: DEEPWISDOM_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个旅行规划优化助手。请严格按照JSON格式返回数据。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: DEEPWISDOM_OPTIMIZATION_TOKEN_LIMIT,  // 避免超过4096服务上限
      top_p: 0.9,
      stream: false
    });
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      let content = response.data.choices[0].message.content;

      // 清理内容 - 移除markdown代码块标记
      content = content.trim();
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          content = jsonMatch[1].trim();
        }
      } else if (content.includes('```')) {
        const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          content = codeMatch[1].trim();
        }
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('解析AI返回的优化JSON失败:', parseError);
        console.error('原始内容:', content);
        return { error: 'AI返回的数据格式有误' };
      }
    }
    
    return { error: 'AI响应格式错误' };
  } catch (error) {
    console.error('优化行程计划失败:', error);
    return { error: error.message || '优化行程计划时发生错误' };
  }
};

// 旅行问答功能 - 添加节流控制
export const askTravelQuestion = async (question, tripContext) => {
  try {
    // 应用请求节流
    await throttleRequest();
    
    // 简化上下文数据
    const simplifiedContext = tripContext ? JSON.stringify({
      destination: tripContext.destination,
      dates: tripContext.dates,
      overview: "略"
    }) : "无";
    
    const response = await openaiClient.post('/chat/completions', {
      model: DEEPWISDOM_MODEL,
      messages: [
        {
          role: 'system',
          content: `你是一个旅游助手，请简洁地回答旅行相关问题。当前行程上下文：${simplifiedContext}`
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.5,
      max_tokens: 2000,  // 增加token限制
      top_p: 0.8,
      stream: false
    });
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        answer: response.data.choices[0].message.content
      };
    }
    
    return { error: 'AI响应格式错误' };
  } catch (error) {
    console.error('旅行问答失败:', error);
    if (error.response?.status === 429) {
      return { error: 'API请求频率超限，请稍后再试' };
    }
    return { error: error.message || '获取回答时发生错误' };
  }
};

 
