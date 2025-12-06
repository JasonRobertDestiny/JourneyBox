import React, { useEffect, useRef, useState } from 'react';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import { initMap, addMarker, drawRoute, destroyMap, isAmapLoaded } from '../api/mapService';
import '../styles/MapView.css';

function MapView({ activities, destination }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // 第一个 useEffect：等待 DOM 挂载
  useEffect(() => {
    // 确保 DOM 已挂载后再标记准备就绪
    if (containerRef.current) {
      setMapReady(true);
    }
  }, []);

  // 第二个 useEffect：初始化地图（依赖 mapReady）
  useEffect(() => {
    // 等待 DOM 准备就绪
    if (!mapReady || !containerRef.current) {
      return;
    }

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

    // 初始化地图 - 使用 ref 而不是 ID 字符串
    try {
      const firstActivity = validActivities[0];
      const map = initMap(containerRef.current, {
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
  }, [mapReady, activities]);

  // 始终渲染 map-container，通过 CSS 控制显示
  return (
    <div className="map-view">
      {/* 地图容器始终存在，确保 DOM 在 useEffect 执行前已挂载 */}
      <div
        id="map-container"
        ref={containerRef}
        className="map-container"
        style={{ display: error ? 'none' : 'block' }}
      ></div>

      {/* Loading 状态 */}
      {loading && !error && (
        <div className="map-loading-overlay">
          <LoadingOutlined /> 加载地图中...
        </div>
      )}

      {/* 错误/降级状态 */}
      {error && (
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
      )}

      {/* 图例 */}
      {!loading && !error && (
        <div className="map-legend">
          <span>按行程顺序标记</span>
          <span>推荐路线</span>
        </div>
      )}
    </div>
  );
}

export default MapView;
