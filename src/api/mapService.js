// Amap (高德地图) 服务
// 直接使用官方JS API，不使用React包装库

// 检查Amap是否加载
export const isAmapLoaded = () => {
  return typeof window !== 'undefined' && window.AMap;
};

// 初始化地图
export const initMap = (containerId, options = {}) => {
  if (!isAmapLoaded()) {
    console.error('Amap脚本未加载，请检查index.html中的script标签');
    return null;
  }

  const defaultOptions = {
    zoom: 12,
    center: [116.397428, 39.90923], // 默认北京天安门
    mapStyle: 'amap://styles/normal',
    viewMode: '2D',
    lang: 'zh_cn'
  };

  try {
    const map = new window.AMap.Map(containerId, {
      ...defaultOptions,
      ...options
    });

    console.log('地图初始化成功');
    return map;
  } catch (error) {
    console.error('地图初始化失败:', error);
    return null;
  }
};

// 添加标记点
export const addMarker = (map, location, options = {}) => {
  if (!map || !location) {
    console.error('地图实例或位置信息无效');
    return null;
  }

  const defaultOptions = {
    icon: new window.AMap.Icon({
      size: new window.AMap.Size(25, 34),
      image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
      imageSize: new window.AMap.Size(25, 34)
    }),
    offset: new window.AMap.Pixel(-13, -30)
  };

  try {
    const marker = new window.AMap.Marker({
      position: [location.lng, location.lat],
      ...defaultOptions,
      ...options,
      map: map
    });

    return marker;
  } catch (error) {
    console.error('添加标记失败:', error);
    return null;
  }
};

// 绘制路线
export const drawRoute = (map, points, options = {}) => {
  if (!map || !points || points.length < 2) {
    console.error('地图实例或路线点无效');
    return null;
  }

  const defaultOptions = {
    strokeColor: '#1890ff',
    strokeWeight: 4,
    strokeOpacity: 0.8,
    lineJoin: 'round'
  };

  try {
    const path = points.map(p => [p.lng, p.lat]);
    const polyline = new window.AMap.Polyline({
      path: path,
      ...defaultOptions,
      ...options,
      map: map
    });

    // 自动调整视野以显示完整路线
    map.setFitView([polyline]);

    return polyline;
  } catch (error) {
    console.error('绘制路线失败:', error);
    return null;
  }
};

// 地理编码 - 地址转坐标
export const geocode = async (address, city = '') => {
  if (!isAmapLoaded()) {
    console.error('Amap脚本未加载');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const geocoder = new window.AMap.Geocoder({
        city: city
      });

      geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const location = result.geocodes[0].location;
          resolve({
            lng: location.lng,
            lat: location.lat,
            formattedAddress: result.geocodes[0].formattedAddress
          });
        } else {
          console.warn(`地理编码失败: ${address}`);
          resolve(null);
        }
      });
    } catch (error) {
      console.error('地理编码错误:', error);
      resolve(null);
    }
  });
};

// 批量地理编码
export const batchGeocode = async (addresses, city = '') => {
  const results = await Promise.all(
    addresses.map(addr => geocode(addr, city))
  );
  return results;
};

// 清除地图上的所有覆盖物
export const clearMap = (map) => {
  if (!map) return;

  try {
    map.clearMap();
  } catch (error) {
    console.error('清除地图失败:', error);
  }
};

// 销毁地图实例
export const destroyMap = (map) => {
  if (!map) return;

  try {
    map.destroy();
    console.log('地图实例已销毁');
  } catch (error) {
    console.error('销毁地图失败:', error);
  }
};

// 设置地图中心和缩放
export const setCenterAndZoom = (map, center, zoom = 12) => {
  if (!map || !center) return;

  try {
    map.setZoomAndCenter(zoom, [center.lng, center.lat]);
  } catch (error) {
    console.error('设置地图中心失败:', error);
  }
};
