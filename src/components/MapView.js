import React, { useEffect, useRef, useState } from 'react';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import { initMap, addMarker, drawRoute, setCenterAndZoom, clearMap, destroyMap, isAmapLoaded } from '../api/mapService';
import '../styles/MapView.css';

function MapView({ activities, destination }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 检查Amap是否加载
    if (!isAmapLoaded()) {
      console.error('Amap未加载');
      setError(true);
      setLoading(false);
      return;
    }

    // 过滤有坐标的活动
    const validActivities = activities.filter(
      a => a.lat && a.lng && !isNaN(a.lat) && !isNaN(a.lng)
    );

    if (validActivities.length === 0) {
      setError(true);
      setLoading(false);
      return;
    }

    // 初始化地图
    try {
      const firstActivity = validActivities[0];
      const map = initMap('map-container', {
        center: [firstActivity.lng, firstActivity.lat],
        zoom: 12
      });

      if (!map) {
        setError(true);
        setLoading(false);
        return;
      }

      mapRef.current = map;

      // 添加标记点
      validActivities.forEach((activity, index) => {
        addMarker(map, { lng: activity.lng, lat: activity.lat }, {
          title: activity.name,
          label: {
            content: (index + 1).toString(),
            direction: 'top'
          }
        });
      });

      // 绘制路线（如果有多个点）
      if (validActivities.length > 1) {
        const points = validActivities.map(a => ({ lng: a.lng, lat: a.lat }));
        drawRoute(map, points);
      }

      setLoading(false);
      setError(false);
    } catch (err) {
      console.error('地图初始化失败:', err);
      setError(true);
      setLoading(false);
    }

    // 清理函数
    return () => {
      if (mapRef.current) {
        destroyMap(mapRef.current);
        mapRef.current = null;
      }
    };
  }, [activities]);

  if (loading) {
    return (
      <div className="map-view loading">
        <LoadingOutlined /> 加载地图中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-view error">
        <div className="map-fallback">
          <EnvironmentOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
          <p>地图暂不可用</p>
          <div className="location-list">
            <h4>行程地点列表：</h4>
            <ul>
              {activities.map((activity, index) => (
                <li key={index}>
                  <EnvironmentOutlined /> {activity.name} {activity.address && `- ${activity.address}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view">
      <div id="map-container" ref={containerRef} className="map-container"></div>
      <div className="map-legend">
        <span>🔵 按行程顺序标记</span>
        <span>━━ 推荐路线</span>
      </div>
    </div>
  );
}

export default MapView;
