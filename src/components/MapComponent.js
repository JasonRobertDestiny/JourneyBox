import React, { useEffect, useRef } from 'react';
import { Card, Button, message } from 'antd';
import { EnvironmentOutlined, AimOutlined } from '@ant-design/icons';

const MapComponent = ({ locations = [], center = [116.397428, 39.90923], zoom = 13 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // 确保高德地图API已加载
    if (window.AMap && mapRef.current && !mapInstanceRef.current) {
      try {
        // 创建地图实例
        mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
          viewMode: '2D',
          zoom: zoom,
          center: center,
          resizeEnable: true,
        });

        // 添加控件
        window.AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.Geolocation'], function() {
          // 添加工具条
          const toolbar = new window.AMap.ToolBar({
            position: 'RT'
          });
          mapInstanceRef.current.addControl(toolbar);

          // 添加比例尺
          const scale = new window.AMap.Scale();
          mapInstanceRef.current.addControl(scale);

          // 添加定位控件
          const geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            position: 'RB',
            showButton: true,
            showMarker: true,
            showCircle: true,
            panToLocation: false,
            zoomToAccuracy: false
          });
          mapInstanceRef.current.addControl(geolocation);
        });

        message.success('地图加载成功！');
      } catch (error) {
        console.error('地图初始化失败:', error);
        message.error('地图加载失败，请检查网络连接');
      }
    }
  }, [center, zoom]);

  // 添加标记点
  useEffect(() => {
    if (mapInstanceRef.current && locations.length > 0) {
      // 清除现有标记
      mapInstanceRef.current.clearMap();

      const markers = [];
      locations.forEach((location, index) => {
        const marker = new window.AMap.Marker({
          position: [location.lng, location.lat],
          title: location.name,
          content: `<div style="background: #1890ff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${index + 1}</div>`,
          offset: new window.AMap.Pixel(-15, -30)
        });

        // 添加点击事件
        marker.on('click', () => {
          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3>${location.name}</h3>
                <p>${location.description || '暂无描述'}</p>
                <p>地址：${location.address || '暂无地址'}</p>
              </div>
            `,
            offset: new window.AMap.Pixel(0, -30)
          });
          infoWindow.open(mapInstanceRef.current, marker.getPosition());
        });

        markers.push(marker);
      });

      // 添加所有标记到地图
      mapInstanceRef.current.add(markers);

      // 自适应显示所有标记
      if (markers.length > 0) {
        mapInstanceRef.current.setFitView(markers);
      }
    }
  }, [locations]);

  // 处理跳转到高德地图
  const openInAmap = () => {
    let url;
    if (locations.length > 0) {
      const firstLocation = locations[0];
      // 使用高德地图URI协议
      url = `https://uri.amap.com/marker?position=${firstLocation.lng},${firstLocation.lat}&name=${encodeURIComponent(firstLocation.name)}&coordinate=gaode&callnative=1`;
    } else {
      // 默认打开高德地图首页
      url = 'https://ditu.amap.com/';
    }
    window.open(url, '_blank');
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><EnvironmentOutlined /> 地图展示</span>
          <Button
            type="primary"
            size="small"
            icon={<AimOutlined />}
            onClick={openInAmap}
          >
            在高德地图中查看
          </Button>
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
    >
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px'
        }}
      >
        {!window.AMap && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#999'
          }}>
            地图加载中...
          </div>
        )}
      </div>
    </Card>
  );
};

export default MapComponent;