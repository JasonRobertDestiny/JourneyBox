import axios from 'axios';

// 硅基流动 API 配置 - 使用环境变量或默认值
// 注意：生产环境应该使用环境变量，这里的硬编码仅作为临时后备方案
const SILICONFLOW_API_KEY = process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga';
const SILICONFLOW_BASE_URL = process.env.REACT_APP_SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const SILICONFLOW_MODEL = process.env.REACT_APP_SILICONFLOW_MODEL || 'Qwen/Qwen2.5-72B-Instruct';
// SiliconFlow chat/completions currently caps max_tokens at 4096, keep a buffer to avoid 400 errors
const SILICONFLOW_COMPLETION_TOKEN_LIMIT = 3500;
const SILICONFLOW_OPTIMIZATION_TOKEN_LIMIT = 3000;

// 调试：打印环境变量 - 立即执行
console.log('【环境变量调试】', {
  hasEnvKey: !!process.env.REACT_APP_SILICONFLOW_API_KEY,
  envKey: process.env.REACT_APP_SILICONFLOW_API_KEY ? 'sk-...' + process.env.REACT_APP_SILICONFLOW_API_KEY.slice(-10) : 'undefined',
  actualKey: 'sk-...' + SILICONFLOW_API_KEY.slice(-10),
  model: SILICONFLOW_MODEL,
  baseUrl: SILICONFLOW_BASE_URL,
  allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

// 创建硅基流动客户端配置 - 修改为更明确的配置
const openaiClient = axios.create({
  baseURL: SILICONFLOW_BASE_URL,
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
    'Accept': 'application/json'
  }
});

// 节流函数 - 限制请求频率
let lastRequestTime = 0;
const minRequestInterval = 5000; // 增加到5秒的最小请求间隔时间，避免频率限制

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

    // 1. 修复中文标点符号 (最优先处理,因为这是最常见的问题)
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
        return jsonMatch[0];
      }

      return str; // 返回原始字符串
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
      apiKey: SILICONFLOW_API_KEY ? 'sk-...' + SILICONFLOW_API_KEY.slice(-10) : '未设置',
      baseUrl: SILICONFLOW_BASE_URL,
      model: SILICONFLOW_MODEL
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

    // 生成高质量的旅行计划提示词 - 优化版
    const prompt = `你是一位专业旅行规划师,请为${destination}制定${days}天真实可行的旅行计划。

【核心要求】
1. 所有景点、餐厅必须是${destination}真实存在的知名场所
2. 提供准确的地址、开放时间、门票价格
3. 行程安排要符合实际交通和时间逻辑
4. 每天4-5个活动,包含景点、餐饮、休息

【用户需求】
- 目的地: ${destination}
- 日期: ${startDate}到${endDate}(${days}天)
- 预算: ${budget || '中等'}
- 兴趣: ${Array.isArray(interests) ? interests.join('、') : interests || '文化历史美食'}
- 风格: ${travelStyle || '轻松休闲'}
- 人员: ${Array.isArray(participants) ? participants.join('、') : participants || '成人'}

【必须包含】
- 第1天: ${destination}标志性景点(故宫/外滩/西湖等地标)
- 中间天: 特色景点+当地美食体验
- 最后天: 轻松购物+返程准备

【重要】必须严格返回标准JSON格式，所有属性名和字符串值都必须用双引号包围！

示例格式:
{
  "overview": "${destination}${days}日游,深度体验历史文化与地道美食",
  "tips": "最佳季节建议、穿着提示、交通卡办理、预约提醒等实用信息",
  "days": [
    {
      "date": "${startDate}",
      "dayOverview": "抵达${destination},开启文化探索之旅",
      "activities": [
        {
          "time": "09:00",
          "duration": "120",
          "name": "真实景点名称",
          "type": "景点",
          "location": "完整地址",
          "description": "景点历史背景、特色看点、游玩建议",
          "cost": "60元,需预约"
        },
        {
          "time": "12:00",
          "duration": "90",
          "name": "当地特色餐厅",
          "type": "餐厅",
          "location": "餐厅地址",
          "description": "招牌菜品、就餐体验、人均消费",
          "cost": "人均150-200元"
        }
      ]
    }
  ],
  "accommodation": "推荐3家酒店说明",
  "transportation": "交通建议说明"
}`;

    // 使用重试机制发送请求
    const response = await retryWithDelay(async () => {
      // 构建请求体
      const requestBody = {
        model: SILICONFLOW_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是专业旅行规划师,熟悉中国各城市真实旅游资源。你必须:\n1.只推荐真实存在的知名景点和餐厅\n2.提供准确的地址、价格、开放时间\n3.返回标准JSON格式,不加任何markdown标记\n4.确保行程时间合理,交通便利\n5.景点描述要具体实用,包含历史背景和游玩建议'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,  // 降低随机性,提高准确性
        max_tokens: SILICONFLOW_COMPLETION_TOKEN_LIMIT,  // 留出缓冲避免超出4096上限
        top_p: 0.9,
        frequency_penalty: 0.3,  // 减少重复
        presence_penalty: 0.2,   // 鼓励多样性
        stream: false
      };

      // 调试：打印完整请求体
      console.log('【调试】完整请求体:', JSON.stringify(requestBody, null, 2));
      console.log('【调试】请求URL:', SILICONFLOW_BASE_URL + '/chat/completions');
      console.log('【调试】Authorization头:', `Bearer sk-...${SILICONFLOW_API_KEY.slice(-10)}`);

      // 使用直接的axios调用而不是预配置的客户端
      return await axios.post(
        `${SILICONFLOW_BASE_URL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
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

      // 核心修复: 移除字段名中的下划线包裹
      content = content
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
            errorDetails: '缺少每日行程安排'
          };
        }

        // 验证每天的活动
        for (let i = 0; i < parsed.days.length; i++) {
          const day = parsed.days[i];
          if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
            console.error(`【验证失败】第${i+1}天缺少活动安排`);
            return {
              error: 'AI生成的行程数据不完整',
              errorDetails: `第${i+1}天缺少活动安排`
            };
          }
        }

        console.log('【验证成功】行程数据格式正确,共' + parsed.days.length + '天');
        return parsed;
      } catch (parseError) {
        console.error('【JSON解析失败】', parseError.message);
        console.error('【原始内容】', content.substring(0, 500));
        console.error('【修复后内容】', fixedContent.substring(0, 500));

        // 尝试返回一个默认的结构
        console.log('【尝试使用模拟数据】');
        return generateMockTravelPlan(tripData.destination, tripData.startDate, tripData.endDate, days);
      }
    }

    console.error('【响应错误】API响应格式异常');
    return { error: 'API响应格式错误', errorDetails: '未收到有效的AI响应' };
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
      const hasApiKey = SILICONFLOW_API_KEY && SILICONFLOW_API_KEY !== '';
      console.error('【API密钥检查】', hasApiKey ? `存在 (sk-...${SILICONFLOW_API_KEY.slice(-10)})` : '缺失');

      // 根据错误类型提供更具体的提示
      let specificError = '请求格式错误';
      let specificDetails = typeof apiError === 'string' ? apiError : JSON.stringify(apiError);

      // 检查是否是API密钥问题
      if (specificDetails.includes('API key') || specificDetails.includes('authentication') ||
          specificDetails.includes('unauthorized') || specificDetails.includes('Invalid API key') ||
          specificDetails.includes('Incorrect API key')) {
        specificError = 'API认证失败';
        specificDetails = 'API密钥无效或格式不正确。请确保已正确配置 REACT_APP_SILICONFLOW_API_KEY 环境变量。';
      } else if (specificDetails.includes('model') || specificDetails.includes('Model')) {
        specificError = '模型配置错误';
        specificDetails = `模型名称"${SILICONFLOW_MODEL}"可能不正确或暂不可用。`;
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
        model: SILICONFLOW_MODEL,
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
      model: SILICONFLOW_MODEL,
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
      max_tokens: SILICONFLOW_OPTIMIZATION_TOKEN_LIMIT,  // 避免超过4096服务上限
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
      model: SILICONFLOW_MODEL,
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

// 生成模拟的旅行计划数据（演示模式）
const generateMockTravelPlan = (destination, startDate, endDate, days) => {
  const mockActivities = [
    { name: '故宫博物院', type: '景点', description: '世界文化遗产，明清两代皇家宫殿', cost: '60元' },
    { name: '天坛公园', type: '景点', description: '明清皇帝祭天祈谷的场所', cost: '35元' },
    { name: '颐和园', type: '景点', description: '皇家园林博物馆', cost: '30元' },
    { name: '长城', type: '景点', description: '世界文化遗产，中国古代军事防御工程', cost: '45元' },
    { name: '全聚德烤鸭', type: '餐厅', description: '北京烤鸭百年老字号', cost: '200元/人' },
    { name: '老北京炸酱面', type: '餐厅', description: '地道北京传统美食', cost: '30元/人' },
    { name: '南锣鼓巷', type: '景点', description: '北京最古老的街区之一', cost: '免费' },
    { name: '798艺术区', type: '景点', description: '当代艺术文化创意产业集聚区', cost: '免费' }
  ];

  const result = {
    overview: `${destination}${days}天精品游，涵盖主要景点、特色美食和文化体验`,
    tips: '建议穿着舒适的鞋子，准备好防晒用品。景点可能需要提前预约，请关注官方公众号。',
    days: []
  };

  // 为每一天生成活动
  for (let i = 0; i < days; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + i);

    const dayActivities = [];
    const activitiesPerDay = 4 + Math.floor(Math.random() * 2); // 每天4-5个活动

    for (let j = 0; j < activitiesPerDay; j++) {
      const activity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      const hour = 9 + j * 2; // 从9点开始，每2小时一个活动

      dayActivities.push({
        time: `${hour < 10 ? '0' : ''}${hour}:00`,
        duration: '120',
        name: activity.name,
        type: activity.type,
        location: `${destination}市区`,
        description: activity.description,
        cost: activity.cost
      });
    }

    result.days.push({
      date: dayDate.toISOString().split('T')[0],
      dayOverview: `第${i + 1}天: 探索${destination}的精彩景点`,
      activities: dayActivities
    });
  }

  result.accommodation = `推荐住宿：1. 五星级酒店（800-1200元/晚） 2. 精品民宿（300-500元/晚） 3. 经济型酒店（150-250元/晚）`;
  result.transportation = `交通建议：机场/火车站可乘坐地铁或出租车到市区。市内建议使用地铁、公交或打车，日均交通费约50-100元。`;

  return result;
}; 
