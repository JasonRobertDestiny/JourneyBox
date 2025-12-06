import axios from 'axios';
import JSON5 from 'json5';

// DeepWisdom API 配置 - 必须通过环境变量提供，禁止硬编码密钥
const DEEPWISDOM_API_KEY = process.env.REACT_APP_DEEPWISDOM_API_KEY || '';
const DEEPWISDOM_BASE_URL = process.env.REACT_APP_DEEPWISDOM_BASE_URL || 'https://newapi.deepwisdom.ai/v1';
// 使用DeepSeek-V3.1模型 - 更快更便宜
const DEEPWISDOM_MODEL = process.env.REACT_APP_DEEPWISDOM_MODEL || 'DeepSeek-V3.1';
// DeepSeek-V3.1支持大token,增加限制确保完整响应
const DEEPWISDOM_COMPLETION_TOKEN_LIMIT = 16000;
const DEEPWISDOM_OPTIMIZATION_TOKEN_LIMIT = 16000;

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
  timeout: 120000, // 120秒超时 - DeepSeek需要更长时间
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPWISDOM_API_KEY}`,
    'Accept': 'application/json'
  }
});

// 节流函数 - 限制请求频率
let lastRequestTime = 0;
const minRequestInterval = 5000; // 增加到5秒的最小请求间隔时间，避免频率限制

// 修复截断的JSON - 多策略修复
const repairTruncatedJson = (str) => {
  console.log('【截断修复】开始修复，原始长度:', str.length);

  let result = str.trim();

  // 策略1: 找到最后一个完整的活动对象，截断到那里
  // 查找 "cost":"..." } 这样的完整活动结尾
  const activityEndPattern = /"cost"\s*:\s*"[^"]*"\s*\}/g;
  let lastCompleteActivity = -1;
  let match;
  while ((match = activityEndPattern.exec(result)) !== null) {
    lastCompleteActivity = match.index + match[0].length;
  }

  if (lastCompleteActivity > 0 && lastCompleteActivity < result.length - 10) {
    console.log('【截断修复】找到最后完整活动位置:', lastCompleteActivity);
    result = result.substring(0, lastCompleteActivity);
  }

  // 计算未闭合的括号
  const countBrackets = (s) => {
    let braces = 0, brackets = 0, inStr = false, esc = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (!inStr) {
        if (c === '{') braces++;
        else if (c === '}') braces--;
        else if (c === '[') brackets++;
        else if (c === ']') brackets--;
      }
    }
    return { braces, brackets, inStr };
  };

  let { braces, brackets, inStr } = countBrackets(result);

  // 如果在字符串中截断，关闭字符串
  if (inStr) {
    result += '"';
  }

  // 移除末尾不完整的属性定义
  result = result.replace(/,?\s*"[^"]*"\s*:\s*"?[^"{}[\],]*$/g, '');
  result = result.replace(/,\s*$/, '');

  // 重新计算
  ({ braces, brackets } = countBrackets(result));

  // 关闭所有未关闭的括号
  while (brackets > 0) { result += ']'; brackets--; }
  while (braces > 0) { result += '}'; braces--; }

  console.log('【截断修复】修复后末尾:', result.slice(-150));

  // 验证修复
  try {
    JSON.parse(result);
    console.log('【截断修复】策略1成功！');
    return result;
  } catch (e) {
    console.log('【截断修复】策略1失败，尝试策略2...');
  }

  // 策略2: 找到 }] 或 }, 模式并截断
  const patterns = [
    /\}\s*\]\s*\}\s*$/,  // 完整的day结尾
    /\}\s*,\s*$/,        // 对象后有逗号
    /\}\s*\]\s*$/,       // 数组结尾
  ];

  for (const pattern of patterns) {
    const testResult = str.trim();
    const matches = testResult.match(/\}\s*[\],]/g);
    if (matches && matches.length > 0) {
      // 找到最后几个 } 的位置
      let pos = testResult.length;
      for (let i = 0; i < 3 && pos > 0; i++) {
        pos = testResult.lastIndexOf('}', pos - 1);
      }
      if (pos > testResult.length * 0.5) {
        let truncated = testResult.substring(0, pos + 1);
        truncated = truncated.replace(/,\s*$/, '');
        let { braces: b, brackets: br } = countBrackets(truncated);
        while (br > 0) { truncated += ']'; br--; }
        while (b > 0) { truncated += '}'; b--; }
        try {
          JSON.parse(truncated);
          console.log('【截断修复】策略2成功！');
          return truncated;
        } catch (e2) {
          // 继续尝试
        }
      }
    }
  }

  // 策略3: 暴力截断到最后完整的 },
  const lastGoodEnd = str.lastIndexOf('},');
  if (lastGoodEnd > str.length * 0.3) {
    let truncated = str.substring(0, lastGoodEnd + 1);
    let { braces: b, brackets: br } = countBrackets(truncated);
    while (br > 0) { truncated += ']'; br--; }
    while (b > 0) { truncated += '}'; b--; }
    try {
      JSON.parse(truncated);
      console.log('【截断修复】策略3成功！');
      return truncated;
    } catch (e3) {
      console.error('【截断修复】策略3失败:', e3.message);
    }
  }

  console.error('【截断修复】所有策略都失败');
  return result;
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
    // 计算默认日期（从明天开始，3天行程）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultStartDate = tomorrow.toISOString().split('T')[0];
    const endDay = new Date(tomorrow);
    endDay.setDate(endDay.getDate() + 2);
    const defaultEndDate = endDay.toISOString().split('T')[0];

    // 解构并应用默认值
    const {
      destination,
      startDate = defaultStartDate,
      endDate = defaultEndDate,
      budget = 'medium',
      interests = ['文化', '历史', '美食'],
      travelStyle = 'relaxed',
      participants = ['成人']
    } = tripData;

    console.log('【调试】处理后的日期:', { startDate, endDate, defaultStartDate, defaultEndDate });

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

    // 生成高质量的旅行计划提示词 - 极简格式减少截断
    const prompt = `${destination}${days}天游。${startDate}到${endDate}，${budget || '中等'}预算。

要求：返回纯JSON，每天2个活动，description限15字。

{"overview":"一句话","tips":"一句话","days":[{"date":"${startDate}","dayOverview":"主题","activities":[{"time":"09:00","duration":"120","name":"景点","type":"景点","location":"地址","description":"15字内","cost":"费用"}]}],"accommodation":"住宿","transportation":"交通"}`;

    // 使用重试机制发送请求
    const response = await retryWithDelay(async () => {
      // 构建请求体
      const requestBody = {
        model: DEEPWISDOM_MODEL,
        messages: [
          {
            role: 'system',
            content: '旅行规划师。返回纯JSON，无markdown。每天2个活动，description限15字。必须完整闭合所有括号。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,  // 降低随机性确保稳定输出
        max_tokens: DEEPWISDOM_COMPLETION_TOKEN_LIMIT,
        top_p: 0.85,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
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
          timeout: 90000  // 90秒超时
        }
      );
    });
    
    // 解析API响应 - 改进版
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      let content = response.data.choices[0].message.content;

      // 清理AI返回的内容 - 多种格式兼容
      console.log('【AI响应】原始内容前200字:', content.substring(0, 200));
      // 开发调试：记录完整响应
      if (process.env.NODE_ENV === 'development') {
        console.log('【AI响应】完整内容:', content);
      }
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
        // 使用JSON5解析，容忍尾部逗号、单引号等问题
        const parsed = JSON5.parse(fixedContent);
        console.log('【JSON5解析成功】数据结构:', Object.keys(parsed));
        console.log('【JSON解析成功】days数量:', parsed.days?.length || 0);

        // 数据验证 - 确保必要字段存在
        if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
          console.error('【验证失败】缺少days数组或为空');
          return {
            error: 'AI生成的行程数据不完整',
            errorDetails: '缺少每日行程安排，请重试',
            canRetry: true
          };
        }

        // 宽松验证：过滤掉不完整的天，只保留有活动的天
        const validDays = parsed.days.filter((day, i) => {
          if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
            console.warn(`【验证警告】第${i+1}天缺少活动，已跳过`);
            return false;
          }
          // 过滤掉不完整的活动
          day.activities = day.activities.filter(act => {
            const hasRequired = act.name && act.time;
            if (!hasRequired) {
              console.warn('【验证警告】跳过不完整的活动:', act);
            }
            return hasRequired;
          });
          return day.activities.length > 0;
        });

        if (validDays.length === 0) {
          console.error('【验证失败】没有有效的天数据');
          return {
            error: 'AI生成的行程数据不完整',
            errorDetails: '没有有效的行程安排，请重试',
            canRetry: true
          };
        }

        // 使用过滤后的数据
        parsed.days = validDays;
        console.log('【验证成功】行程数据格式正确,共' + parsed.days.length + '天(有效)');
        return parsed;
      } catch (parseError) {
        console.error('【JSON解析失败】', parseError.message);
        console.error('【原始内容长度】', content.length, '字符');
        console.error('【原始内容前500字】', content.substring(0, 500));
        console.error('【原始内容后500字】', content.substring(content.length - 500));
        console.error('【修复后内容前500字】', fixedContent.substring(0, 500));
        console.error('【修复后内容后500字】', fixedContent.substring(fixedContent.length - 500));

        // 检查是否是JSON被截断的问题
        const isTruncated = !fixedContent.trim().endsWith('}');
        console.error('【截断检测】JSON可能被截断:', isTruncated);

        // 保存失败的响应供调试
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('_debug_lastFailedAiResponse', content);
            localStorage.setItem('_debug_lastFailedTime', new Date().toISOString());
          }
        } catch (storageError) {
          // 忽略storage错误
        }

        // 返回解析错误，让用户重试
        return {
          error: 'AI返回的数据格式异常',
          errorDetails: `JSON解析失败: ${parseError.message}${isTruncated ? '（响应可能被截断）' : ''}。请重试。`,
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
        return JSON5.parse(content);
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
        return JSON5.parse(content);
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

 
