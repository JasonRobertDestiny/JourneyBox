import axios from 'axios';

// 硅基流动 API 配置 - 使用环境变量或默认值
// 注意：生产环境应该使用环境变量，这里的硬编码仅作为临时后备方案
const SILICONFLOW_API_KEY = process.env.REACT_APP_SILICONFLOW_API_KEY || 'sk-dmboumrbewxcexhzeegupvakiunvwsirrxabnpkcamnvogga';
const SILICONFLOW_BASE_URL = process.env.REACT_APP_SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const SILICONFLOW_MODEL = process.env.REACT_APP_SILICONFLOW_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

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
const minRequestInterval = 5000; // 增加到5秒的最小请求间隔时间，避免频率限制

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

    // 计算天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    // 生成高质量的旅行计划提示词
    const prompt = `作为专业的旅行规划师，请为我生成一个${destination}的${days}天精品旅行计划。

    【用户信息】
    - 目的地: ${destination}
    - 时间: ${startDate} 至 ${endDate} (共${days}天)
    - 预算水平: ${budget || '中等'}
    - 兴趣爱好: ${Array.isArray(interests) ? interests.join('、') : interests || '文化、历史、美食'}
    - 旅行风格: ${travelStyle || '轻松舒适'}
    - 出行人员: ${Array.isArray(participants) ? participants.join('、') : participants || '成人'}

    【要求】
    1. 必须使用${destination}真实存在的景点、餐厅、酒店
    2. 景点需包含：
       - 著名地标和必去景点
       - 符合用户兴趣的特色地点
       - 当地文化体验项目
    3. 餐饮安排：
       - 推荐当地特色美食餐厅
       - 包含正餐和小吃体验
       - 提供不同价位选择
    4. 时间安排：
       - 每天安排4-6个活动
       - 考虑景点开放时间和游览时长
       - 预留休息和自由活动时间
       - 合理规划交通路线，避免往返奔波
    5. 描述要求：
       - 每个景点需要详细介绍（历史背景、特色亮点、游玩建议）
       - 餐厅需说明特色菜品和人均消费
       - 提供实用的游玩贴士

    【JSON格式要求】
    请严格按照以下格式返回，确保是有效的JSON（不要包含markdown标记）：
    {
      "overview": "行程总览，50-100字，突出行程特色和亮点",
      "tips": "实用建议，包括最佳游玩季节、穿着建议、注意事项等，100-150字",
      "days": [
        {
          "date": "${startDate}",
          "dayOverview": "第1天的主题，如：探索历史古迹、品味地道美食等",
          "activities": [
            {
              "time": "09:00",
              "duration": "120",
              "name": "具体景点或餐厅名称",
              "type": "景点/餐厅/交通/休息",
              "location": "详细地址",
              "description": "100-150字的详细介绍，包括历史背景、特色亮点、游玩建议、推荐菜品等",
              "cost": "门票价格或人均消费"
            }
          ]
        }
      ],
      "accommodation": "推荐2-3家不同档次的酒店，包含名称、位置、价格区间、特色",
      "transportation": "详细的交通建议，包括机场/火车站往返、市内交通方式、打车参考价格等"
    }`;

    // 使用重试机制发送请求
    const response = await retryWithDelay(async () => {
      return await openaiClient.post('/chat/completions', {
        model: SILICONFLOW_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一位经验丰富的旅行规划专家，熟悉中国各地的旅游资源，能够根据用户需求制定个性化的旅行计划。请直接返回JSON格式的数据，不要添加任何额外的文字说明或markdown标记。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.85,  // 提高创造性
        max_tokens: 12000, // 大幅增加token以生成更高质量和详细的内容
        top_p: 0.95,
        stream: false
      });
    });
    
    // 解析API响应
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      let content = response.data.choices[0].message.content;

      // 清理AI返回的内容 - 移除markdown代码块标记
      console.log('【DEBUG】原始AI响应内容（前200字符）:', content.substring(0, 200));
      content = content.trim();

      // 处理各种markdown格式
      if (content.startsWith('```json') && content.endsWith('```')) {
        // 移除开头的```json和结尾的```
        content = content.slice(7, -3).trim();
      } else if (content.startsWith('```') && content.endsWith('```')) {
        // 移除开头和结尾的```
        content = content.slice(3, -3).trim();
      } else if (content.includes('```json')) {
        // 使用正则提取
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          content = jsonMatch[1].trim();
        }
      } else if (content.includes('```')) {
        // 使用正则提取任何代码块
        const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          content = codeMatch[1].trim();
        }
      }

      console.log('【DEBUG】清理后的内容（前200字符）:', content.substring(0, 200));

      try {
        // 将返回的JSON字符串解析为对象
        return JSON.parse(content);
      } catch (parseError) {
        console.error('解析AI返回的JSON失败:', parseError);
        console.error('原始内容:', content);
        return { error: 'AI返回的数据格式有误' };
      }
    }
    
    return { error: 'AI响应格式错误' };
  } catch (error) {
    console.error('生成旅行计划失败:', error);
    console.error('【DEBUG】错误详情:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    // 如果是429错误，给出更明确的错误信息
    if (error.response?.status === 429) {
      return {
        error: 'API请求频率超限，请稍后再试',
        errorDetails: '服务器正在处理太多请求，需要一段时间来恢复。这是正常的限流机制，保护API不被过度使用。'
      };
    }

    // 如果是400错误，返回API的具体错误信息
    if (error.response?.status === 400) {
      return {
        error: 'API请求格式错误',
        errorDetails: error.response?.data?.error?.message || JSON.stringify(error.response?.data)
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
      max_tokens: 6000,  // 增加token限制以生成完整优化行程
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