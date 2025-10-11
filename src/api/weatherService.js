import axios from 'axios';

// 高德地图天气API配置
const AMAP_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';
const AMAP_KEY = process.env.REACT_APP_AMAP_WEATHER_KEY || process.env.REACT_APP_AMAP_API_KEY;

// 心知天气API配置（备用）
const SENIVERSE_URL = 'https://api.seniverse.com/v3';
const SENIVERSE_KEY = process.env.REACT_APP_SENIVERSE_PUBLIC_KEY;

// 简单的内存缓存 - 1小时过期
const weatherCache = new Map();
const CACHE_DURATION = 3600000; // 1小时

// 城市名称到高德adcode映射
const CITY_ADCODE_MAP = {
  '北京': '110101',
  '上海': '310101',
  '广州': '440103',
  '深圳': '440303',
  '杭州': '330102',
  '南京': '320102',
  '成都': '510104',
  '武汉': '420102',
  '西安': '610102',
  '重庆': '500103',
  '苏州': '320505',
  '天津': '120101',
  '青岛': '370202',
  '厦门': '350203',
  '大连': '210202',
  '长沙': '430102',
  '济南': '370102',
  '郑州': '410102',
  '合肥': '340102',
  '昆明': '530102'
};

// 生成模拟天气数据
function generateMockWeather(city, days = 7) {
  console.log(`使用模拟天气数据: ${city}`);

  const weatherConditions = ['晴', '多云', '阴', '小雨', '中雨', '大雨'];
  const baseTemp = 20 + Math.floor(Math.random() * 10);

  const mockData = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const high = baseTemp + Math.floor(Math.random() * 10);
    const low = high - Math.floor(Math.random() * 8 + 3);
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    mockData.push({
      date: date.toISOString().split('T')[0],
      high,
      low,
      condition,
      conditionNight: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      code: '1',
      windDirection: '东南风',
      windSpeed: Math.floor(Math.random() * 20 + 5).toString()
    });
  }

  return mockData;
}

// 获取城市的adcode
function getCityAdcode(city) {
  // 先尝试直接匹配
  if (CITY_ADCODE_MAP[city]) {
    return CITY_ADCODE_MAP[city];
  }

  // 尝试去掉"市"后缀再匹配
  const cityWithoutSuffix = city.replace(/市$/, '');
  if (CITY_ADCODE_MAP[cityWithoutSuffix]) {
    return CITY_ADCODE_MAP[cityWithoutSuffix];
  }

  // 如果都没有匹配，返回null（将使用模拟数据）
  return null;
}

// 尝试使用高德地图API获取天气
async function tryAmapWeather(city, days) {
  const adcode = getCityAdcode(city);
  if (!adcode) {
    console.log(`未找到 ${city} 的adcode，使用模拟数据`);
    return null;
  }

  try {
    const response = await axios.get(AMAP_URL, {
      params: {
        key: AMAP_KEY,
        city: adcode,
        extensions: 'all'
      },
      timeout: 5000
    });

    if (response.data.status === '1' && response.data.forecasts && response.data.forecasts[0]) {
      const forecast = response.data.forecasts[0];
      const weatherData = forecast.casts.slice(0, days).map(day => ({
        date: day.date,
        high: parseInt(day.daytemp, 10),
        low: parseInt(day.nighttemp, 10),
        condition: day.dayweather,
        conditionNight: day.nightweather,
        code: '1',
        windDirection: day.daywind,
        windSpeed: day.daypower
      }));

      console.log(`成功获取高德天气数据: ${city}`);
      return weatherData;
    }
  } catch (error) {
    console.error('高德天气API调用失败:', error.message);
  }

  return null;
}

// 尝试使用心知天气API获取天气
async function trySeniverseWeather(city, days) {
  if (!SENIVERSE_KEY) {
    return null;
  }

  try {
    const response = await axios.get(`${SENIVERSE_URL}/weather/daily.json`, {
      params: {
        key: SENIVERSE_KEY,
        location: city,
        language: 'zh-Hans',
        unit: 'c',
        start: 0,
        days: Math.min(days, 3)
      },
      timeout: 5000
    });

    if (response.data && response.data.results && response.data.results[0]) {
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

      console.log(`成功获取心知天气数据: ${city}`);
      return weatherData;
    }
  } catch (error) {
    console.error('心知天气API调用失败:', error.message);
  }

  return null;
}

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

    // 尝试高德地图天气API
    let weatherData = await tryAmapWeather(city, days);

    // 如果高德失败，尝试心知天气
    if (!weatherData) {
      weatherData = await trySeniverseWeather(city, days);
    }

    // 如果都失败，使用模拟数据
    if (!weatherData) {
      weatherData = generateMockWeather(city, days);
    }

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
    // 发生错误时返回模拟数据
    return generateMockWeather(city, days);
  }
};

// 获取实时天气
export const getCurrentWeather = async (city) => {
  try {
    const adcode = getCityAdcode(city);
    if (adcode && AMAP_KEY) {
      const response = await axios.get(AMAP_URL, {
        params: {
          key: AMAP_KEY,
          city: adcode,
          extensions: 'base'
        },
        timeout: 5000
      });

      if (response.data.status === '1' && response.data.lives && response.data.lives[0]) {
        const live = response.data.lives[0];
        return {
          temperature: parseInt(live.temperature, 10),
          condition: live.weather,
          code: '1',
          feelsLike: parseInt(live.temperature, 10),
          humidity: parseInt(live.humidity, 10),
          visibility: '10',
          windDirection: live.winddirection,
          windSpeed: live.windpower,
          lastUpdate: live.reporttime
        };
      }
    }
  } catch (error) {
    console.error('获取实时天气失败:', error.message);
  }

  // 返回模拟的实时天气
  const conditions = ['晴', '多云', '阴'];
  return {
    temperature: 20 + Math.floor(Math.random() * 10),
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    code: '1',
    feelsLike: 22,
    humidity: 60,
    visibility: '10',
    windDirection: '东南风',
    windSpeed: '3-4',
    lastUpdate: new Date().toISOString()
  };
};

// 清除缓存
export const clearWeatherCache = () => {
  weatherCache.clear();
  console.log('天气缓存已清除');
};