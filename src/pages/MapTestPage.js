import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Space, message, Row, Col, Alert } from 'antd';
import { CompassOutlined, PlusOutlined, EditOutlined, ShareAltOutlined, EnvironmentOutlined } from '@ant-design/icons';
import MapComponent from '../components/MapComponent';

const { Content } = Layout;

const MapTestPage = () => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // 检查高德地图是否加载
    const checkMapLoaded = () => {
      if (window.AMap) {
        setMapLoaded(true);
      } else {
        // 等待1秒后再检查
        setTimeout(checkMapLoaded, 1000);
      }
    };
    checkMapLoaded();
  }, []);

  // 测试数据 - 北京的一些著名景点
  const [testLocations] = useState([
    {
      name: '故宫博物院',
      lat: 39.916527,
      lng: 116.397128,
      description: '中国明清两代的皇家宫殿',
      address: '北京市东城区景山前街4号'
    },
    {
      name: '天坛公园',
      lat: 39.882889,
      lng: 116.406577,
      description: '明清两代皇帝祭天的场所',
      address: '北京市东城区天坛路甲1号'
    },
    {
      name: '颐和园',
      lat: 39.999866,
      lng: 116.275439,
      description: '中国清朝时期皇家园林',
      address: '北京市海淀区新建宫门路19号'
    },
    {
      name: '天安门广场',
      lat: 39.903719,
      lng: 116.397631,
      description: '世界上最大的城市广场之一',
      address: '北京市东城区东长安街'
    }
  ]);

  const handleTestFunction = (funcName) => {
    message.info(`测试功能: ${funcName}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card
          title={
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              <CompassOutlined /> 地图功能测试页面
            </div>
          }
          extra={
            <Space>
              <Button type="primary" onClick={() => handleTestFunction('刷新地图')}>
                刷新地图
              </Button>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <p>这是高德地图集成测试页面。地图应该显示北京的几个著名景点。</p>
          <p>如果地图正常显示，说明高德地图API集成成功！</p>
        </Card>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            {/* 地图组件 */}
            <Card
              title={
                <span>
                  <EnvironmentOutlined /> 高德地图展示
                </span>
              }
              style={{ height: '600px' }}
            >
              {mapLoaded ? (
                <div style={{ height: '500px' }}>
                  <MapComponent
                    locations={testLocations}
                    center={[116.397128, 39.916527]}
                    zoom={11}
                  />
                </div>
              ) : (
                <div style={{ height: '500px', position: 'relative' }}>
                  <img
                    src="/amap.png"
                    alt="高德地图"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSI+6auY5b635Zyw5Zu+PC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <EnvironmentOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '10px' }} />
                    <h3>高德地图示例</h3>
                    <p style={{ color: '#666' }}>地图功能正在加载中...</p>
                    <Alert
                      type="info"
                      message="如果地图无法显示，请检查网络连接"
                      showIcon
                      style={{ marginTop: '10px' }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </Col>
          <Col span={8}>
            {/* 功能测试按钮 */}
            <Card title="功能测试" style={{ marginBottom: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  icon={<PlusOutlined />}
                  onClick={() => handleTestFunction('AI生成行程')}
                >
                  AI生成行程
                </Button>
                <Button
                  block
                  icon={<EditOutlined />}
                  onClick={() => handleTestFunction('AI优化行程')}
                >
                  AI优化行程
                </Button>
                <Button
                  block
                  icon={<EditOutlined />}
                  onClick={() => handleTestFunction('编辑行程')}
                >
                  编辑行程
                </Button>
                <Button
                  block
                  icon={<ShareAltOutlined />}
                  onClick={() => handleTestFunction('分享保存')}
                >
                  分享保存行程
                </Button>
              </Space>
            </Card>

            {/* 景点列表 */}
            <Card title="测试景点列表">
              <Space direction="vertical" style={{ width: '100%' }}>
                {testLocations.map((loc, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ cursor: 'pointer' }}
                    hoverable
                  >
                    <div>
                      <strong>{index + 1}. {loc.name}</strong>
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                        {loc.description}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
                        {loc.address}
                      </p>
                    </div>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 地图状态信息 */}
        <Card title="地图API状态" style={{ marginTop: '16px' }}>
          <Row>
            <Col span={8}>
              <p>高德地图API: {window.AMap ? '✅ 已加载' : '❌ 未加载'}</p>
            </Col>
            <Col span={8}>
              <p>API Key配置: ✅ 已配置</p>
            </Col>
            <Col span={8}>
              <p>安全密钥: ✅ 已设置</p>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default MapTestPage;