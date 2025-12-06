// 城市中心坐标映射，用于地理编码失败时的降级处理
// 关键逻辑：提供常见目的地的默认经纬度，确保地图始终有可用坐标
const CITY_COORDS = {
  '北京': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '西安': { lat: 34.2658, lng: 108.9541 },
  '三亚': { lat: 18.2528, lng: 109.5117 },
  '厦门': { lat: 24.4798, lng: 118.0894 },
  '丽江': { lat: 26.8559, lng: 100.2271 },
  '重庆': { lat: 29.563, lng: 106.5516 },
  '青岛': { lat: 36.0671, lng: 120.3826 },
  '大理': { lat: 25.6064, lng: 100.2671 },
  '苏州': { lat: 31.2989, lng: 120.5853 }
};

export const getCityDefaultCoords = (cityName = '') => {
  const normalized = cityName.replace(/[市省区县]/g, '');
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  // 兜底返回北京
  return CITY_COORDS['北京'];
};

export default CITY_COORDS;
