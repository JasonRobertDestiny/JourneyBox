import axios from 'axios';

// 硅基流动 API 配置 - 使用环境变量
const SILICONFLOW_API_KEY = process.env.REACT_APP_SILICONFLOW_API_KEY;
const SILICONFLOW_BASE_URL = process.env.REACT_APP_SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const SILICONFLOW_MODEL = process.env.REACT_APP_SILICONFLOW_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct';

// 创建硅基流动客户端配置
const openaiClient = axios.create({
  baseURL: SILICONFLOW_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
  }
});

// 节流函数 - 限制请求频率
let lastRequestTime = 0;
const minRequestInterval = 15000; // 增加到15秒的最小请求间隔时间

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
    
    // 简化提示词，减少token量
    const prompt = `
    请为我生成一个简洁的旅行计划，目的地: ${destination}，时间: ${startDate} 至 ${endDate}
    预算: ${budget || '中等'}，兴趣: ${interests?.join(', ') || '文化、历史'}
    风格: ${travelStyle || '轻松'}，人员: ${participants || '成人'}
    
    请按照以下格式返回JSON：
    {
      "overview": "行程总览",
      "tips": "旅行建议",
      "days": [
        {
          "date": "日期",
          "dayOverview": "当天概览",
          "activities": [
            {
              "time": "开始时间",
              "duration": "持续时间",
              "name": "活动名称",
              "type": "景点/餐厅/交通/住宿",
              "location": "地点",
              "description": "简短描述",
              "cost": "预估费用"
            }
          ]
        }
      ],
      "accommodation": "住宿建议",
      "transportation": "交通建议"
    }
    尽量精简内容，减少token用量。
    `;
    
    // 使用重试机制发送请求
    const response = await retryWithDelay(async () => {
      return await openaiClient.post('/chat/completions', {
        model: SILICONFLOW_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
    });
    
    // 解析API响应
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content;
      try {
        // 将返回的JSON字符串解析为对象
        return JSON.parse(content);
      } catch (parseError) {
        console.error('解析AI返回的JSON失败:', parseError);
        return { error: 'AI返回的数据格式有误' };
      }
    }
    
    return { error: 'AI响应格式错误' };
  } catch (error) {
    console.error('生成旅行计划失败:', error);
    
    // 如果是429错误，给出更明确的错误信息
    if (error.response?.status === 429) {
      return { 
        error: 'API请求频率超限，请稍后再试',
        errorDetails: '服务器正在处理太多请求，需要一段时间来恢复。这是正常的限流机制，保护API不被过度使用。'
      };
    }
    
    return { error: error.message || '生成旅行计划时发生错误' };
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
            role: 'user',
            content: `简要描述${location || ''}的${attractionName}，包括历史背景和开放时间。请以精简的JSON格式返回，控制在200字以内。`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000, // 减少token使用量
        response_format: { type: 'json_object' }
      });
    });
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('解析AI返回的景点JSON失败:', parseError);
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
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000, // 减少token上限
      response_format: { type: 'json_object' }
    });
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('解析AI返回的优化JSON失败:', parseError);
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
      max_tokens: 800
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