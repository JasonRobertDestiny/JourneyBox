import axios from 'axios';

const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_API_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// 节流控制 - 记录最后请求时间和请求计数
let lastRequestTime = 0;
const minRequestInterval = 1000; // 最小请求间隔1秒
const maxRequestsPerHour = 40; // 限制每小时请求次数
let requestTimestamps = []; // 记录请求时间戳

// 检查是否可以发送请求
const canMakeRequest = async () => {
  const now = Date.now();
  
  // 清理一小时前的请求记录
  requestTimestamps = requestTimestamps.filter(time => now - time < 3600000);
  
  // 检查是否达到小时限制
  if (requestTimestamps.length >= maxRequestsPerHour) {
    console.log(`已达到每小时最大请求限制(${maxRequestsPerHour}次)，当前无法发送请求`);
    return false;
  }
  
  // 检查距离上次请求时间
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < minRequestInterval) {
    // 如果间隔太短，等待合适的时间
    await new Promise(resolve => setTimeout(resolve, minRequestInterval - timeSinceLastRequest));
  }
  
  // 更新最后请求时间和记录
  lastRequestTime = Date.now();
  requestTimestamps.push(lastRequestTime);
  return true;
};

// 添加重试函数
const retryRequest = async (requestFn, maxRetries = 2, baseDelay = 2000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 首先检查是否可以发送请求
      const canProceed = await canMakeRequest();
      if (!canProceed) {
        throw new Error('请求频率超限，无法发送新请求');
      }
      
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 检查是否是限流错误
      if (error.response && error.response.status === 429) {
        // 获取Retry-After头，如果存在则使用它
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 
                           (Math.pow(2, attempt) * baseDelay); // 指数退避
                           
        console.log(`Unsplash API限流，${retryAfter}ms后重试，尝试次数: ${attempt + 1}/${maxRetries}`);
        
        // 等待指定时间
        await new Promise(resolve => setTimeout(resolve, retryAfter));
      } else {
        // 非限流错误，使用指数退避策略
        const delay = Math.pow(2, attempt) * baseDelay;
        console.log(`请求失败，${delay}ms后重试，尝试次数: ${attempt + 1}/${maxRetries}`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 所有重试都失败了
  throw lastError;
};

// 根据景点名称搜索图片
export const searchPlaceImages = async (placeName, count = 1) => {
  try {
    // 默认先使用本地图片，减少API请求
    // 如果用户明确要求使用在线图片，则使用localStorage中的forceOnlineImages标志
    const forceOnlineImages = localStorage.getItem('forceOnlineImages') === 'true';
    const useLocalCache = localStorage.getItem('useLocalImages') === 'true' || !forceOnlineImages;
    
    if (useLocalCache) {
      console.log(`使用本地图片，跳过Unsplash API请求: ${placeName}`);
      return getLocalMockImages(placeName, count);
    }
    
    // 使用重试函数发送请求
    const response = await retryRequest(async () => {
      return await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
        params: {
          query: `${placeName} travel`,
          per_page: count,
          orientation: 'landscape'
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`
        }
      });
    });
    
    // 处理响应数据
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || `Travel photo of ${placeName}`,
        photographer: {
          name: photo.user.name,
          username: photo.user.username,
          link: photo.user.links.html
        }
      }));
    }
    
    // 如果没有找到图片，使用本地图片
    console.log(`未找到与 "${placeName}" 相关的图片，使用本地图片`);
    return getLocalMockImages(placeName, count);
  } catch (error) {
    console.error('获取Unsplash图片失败:', error);
    
    // 设置标记，临时禁用API请求
    localStorage.setItem('useLocalImages', 'true');
    // 3小时后自动清除标记
    setTimeout(() => {
      localStorage.removeItem('useLocalImages');
    }, 3 * 60 * 60 * 1000);
    
    // 返回本地图片
    return getLocalMockImages(placeName, count);
  }
};

// 获取本地模拟图片
const getLocalMockImages = (placeName, count = 1) => {
  // 根据景点名称选择合适的本地图片
  const destinationMap = {
    '北京': 'beijing',
    '故宫': 'beijing',
    '长城': 'beijing',
    '天安门': 'beijing',
    '上海': 'shanghai',
    '外滩': 'shanghai',
    '广州': 'guangzhou',
    '广州塔': 'guangzhou',
    '杭州': 'hangzhou',
    '西湖': 'hangzhou',
    '成都': 'chengdu',
    '熊猫': 'chengdu',
  };
  
  // 查找匹配的目的地
  let imageKey = 'beijing'; // 默认使用北京图片
  for (const [keyword, destination] of Object.entries(destinationMap)) {
    if (placeName.includes(keyword)) {
      imageKey = destination;
      break;
    }
  }
  
  return Array(count).fill(null).map((_, index) => ({
    id: `local-${imageKey}-${index}`,
    url: `/image/${imageKey}.jpg`,
    small: `/image/${imageKey}.jpg`,
    thumb: `/image/${imageKey}.jpg`,
    alt: `${placeName} 旅游图片`,
    photographer: {
      name: '本地图片',
      username: 'local',
      link: '#'
    },
    isLocal: true
  }));
};

// 获取随机旅行相关图片
export const getRandomTravelImages = async (count = 5) => {
  try {
    // 检查是否应该使用本地缓存的图片
    const useLocalCache = localStorage.getItem('useLocalImages') === 'true';
    if (useLocalCache) {
      console.log('使用本地图片，跳过Unsplash API请求');
      return getRandomLocalImages(count);
    }
    
    const response = await retryRequest(async () => {
      return await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
        params: {
          query: 'travel',
          count: Math.min(count, 3), // 限制最大请求数量为3，减少API负担
          orientation: 'landscape'
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`
        }
      });
    });
    
    if (response.data && response.data.length > 0) {
      return response.data.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || 'Travel inspiration photo',
        photographer: {
          name: photo.user.name,
          username: photo.user.username,
          link: photo.user.links.html
        }
      }));
    }
    
    // 如果API没有返回数据，使用本地图片
    return getRandomLocalImages(count);
  } catch (error) {
    console.error('获取随机Unsplash图片失败:', error);
    
    // 设置标记，临时禁用API请求
    localStorage.setItem('useLocalImages', 'true');
    // 3小时后自动清除标记
    setTimeout(() => {
      localStorage.removeItem('useLocalImages');
    }, 3 * 60 * 60 * 1000);
    
    // 返回本地图片
    return getRandomLocalImages(count);
  }
};

// 获取随机本地图片
const getRandomLocalImages = (count = 5) => {
  const destinations = ['beijing', 'shanghai', 'guangzhou', 'hangzhou', 'chengdu'];
  
  return Array(count).fill(null).map((_, index) => {
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    return {
      id: `local-random-${index}`,
      url: `/image/${randomDestination}.jpg`,
      small: `/image/${randomDestination}.jpg`,
      thumb: `/image/${randomDestination}.jpg`,
      alt: 'Travel inspiration photo (local)',
      photographer: {
        name: '本地图片',
        username: 'local',
        link: '#'
      },
      isLocal: true
    };
  });
};

// 记录下载统计（按照Unsplash要求，当用户下载图片时应该调用此API）
export const trackPhotoDownload = async (photoId) => {
  // 如果是本地图片ID，跳过API调用
  if (photoId.startsWith('local-')) {
    return true;
  }
  
  try {
    // 检查是否可以发送请求
    const canProceed = await canMakeRequest();
    if (!canProceed) {
      console.warn('请求频率超限，跳过下载统计');
      return false;
    }
    
    await axios.get(`${UNSPLASH_API_URL}/photos/${photoId}/download`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_API_KEY}`
      }
    });
    return true;
  } catch (error) {
    console.error('记录Unsplash图片下载失败:', error);
    return false;
  }
}; 