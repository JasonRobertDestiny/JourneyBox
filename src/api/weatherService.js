import axios from 'axios';

const BASE_URL = 'https://api.seniverse.com/v3';
const PUBLIC_KEY = process.env.REACT_APP_SENIVERSE_PUBLIC_KEY;

// 简单的内存缓存 - 1小时过期
const weatherCache = new Map();
const CACHE_DURATION = 3600000; // 1小时

// 获取天气预报
export const getWeatherForecast = async (city, days = 7) => {
  try {
    // 检查缓存
    const cacheKey = `${city}-${days}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`使用缓存的天气数据: ${city}`);
      return cached.data;
    }

    console.log(`获取天气数据: ${city}, ${days}天`);
    const response = await axios.get(`${BASE_URL}/weather/daily.json`, {
      params: {
        key: PUBLIC_KEY,
        location: city,
        language: 'zh-Hans',
        unit: 'c',
        start: 0,
        days: Math.min(days, 15) // API限制最多15天
      },
      timeout: 5000 // 5秒超时
    });

    if (!response.data || !response.data.results || !response.data.results[0]) {
      throw new Error('天气API返回数据格式错误');
    }

    const weatherData = response.data.results[0].daily.map(day => ({
      date: day.date,
      high: parseInt(day.high, 10),
      low: parseInt(day.low, 10),
      condition: day.text_day,
      conditionNight: day.text_night,
      code: day.code_day,
      windDirection: day.wind_direction,
      windSpeed: day.wind_speed
    }));

    // 更新缓存
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    // 1小时后清除缓存
    setTimeout(() => {
      weatherCache.delete(cacheKey);
    }, CACHE_DURATION);

    return weatherData;
  } catch (error) {
    console.error('获取天气数据失败:', error.message);

    // 返回null让组件自行处理 - 不抛出错误
    return null;
  }
};

// 获取实时天气
export const getCurrentWeather = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather/now.json`, {
      params: {
        key: PUBLIC_KEY,
        location: city,
        language: 'zh-Hans',
        unit: 'c'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.results || !response.data.results[0]) {
      throw new Error('实时天气API返回数据格式错误');
    }

    const now = response.data.results[0].now;
    return {
      temperature: parseInt(now.temperature, 10),
      condition: now.text,
      code: now.code,
      feelsLike: parseInt(now.feels_like, 10),
      humidity: now.humidity,
      visibility: now.visibility,
      windDirection: now.wind_direction,
      windSpeed: now.wind_speed,
      lastUpdate: response.data.results[0].last_update
    };
  } catch (error) {
    console.error('获取实时天气失败:', error.message);
    return null;
  }
};

// 清除缓存
export const clearWeatherCache = () => {
  weatherCache.clear();
  console.log('天气缓存已清除');
};
