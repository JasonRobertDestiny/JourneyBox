import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Input, Tabs } from 'antd';
import { EnvironmentOutlined, StarOutlined, FireOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import '../styles/DiscoverPage.css';

const { Search } = Input;
const { TabPane } = Tabs;

function DiscoverPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('热门');

  // 热门目的地数据
  const destinations = [
    {
      id: 1,
      name: '北京',
      description: '千年古都，文化名城',
      image: '/image/beijing.jpg',
      tags: ['历史', '文化', '美食'],
      rating: 4.8,
      attractions: 156,
      popular: true
    },
    {
      id: 2,
      name: '上海',
      description: '东方明珠，时尚之都',
      image: '/image/shanghai.jpg',
      tags: ['现代', '购物', '夜生活'],
      rating: 4.7,
      attractions: 132,
      popular: true
    },
    {
      id: 3,
      name: '广州',
      description: '美食之都，岭南文化',
      image: '/image/guangzhou.jpg',
      tags: ['美食', '文化', '现代'],
      rating: 4.6,
      attractions: 98,
      popular: true
    },
    {
      id: 4,
      name: '杭州',
      description: '人间天堂，西湖美景',
      image: '/image/hangzhou.jpg',
      tags: ['自然', '历史', '茶文化'],
      rating: 4.9,
      attractions: 87,
      popular: true
    },
    {
      id: 5,
      name: '成都',
      description: '休闲之都，熊猫故乡',
      image: '/image/chengdu.jpg',
      tags: ['美食', '自然', '休闲'],
      rating: 4.8,
      attractions: 76,
      popular: true
    },
    {
      id: 6,
      name: '西安',
      description: '十三朝古都，兵马俑',
      image: '/image/beijing.jpg',
      tags: ['历史', '文化', '美食'],
      rating: 4.7,
      attractions: 94
    },
    {
      id: 7,
      name: '重庆',
      description: '山城火锅，网红景点',
      image: '/image/shanghai.jpg',
      tags: ['美食', '夜景', '现代'],
      rating: 4.6,
      attractions: 73
    },
    {
      id: 8,
      name: '三亚',
      description: '热带天堂，海滨度假',
      image: '/image/guangzhou.jpg',
      tags: ['海滩', '度假', '自然'],
      rating: 4.8,
      attractions: 52
    }
  ];

  // 主题推荐
  const themes = [
    {
      id: 1,
      title: '历史文化之旅',
      description: '探索中国五千年历史',
      destinations: ['北京', '西安', '洛阳'],
      image: '/image/beijing.jpg'
    },
    {
      id: 2,
      title: '美食探索',
      description: '品尝地道中国美食',
      destinations: ['广州', '成都', '重庆'],
      image: '/image/guangzhou.jpg'
    },
    {
      id: 3,
      title: '自然风光',
      description: '领略祖国大好河山',
      destinations: ['杭州', '桂林', '张家界'],
      image: '/image/hangzhou.jpg'
    },
    {
      id: 4,
      title: '现代都市',
      description: '感受城市繁华魅力',
      destinations: ['上海', '深圳', '香港'],
      image: '/image/shanghai.jpg'
    }
  ];

  // 过滤目的地
  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationClick = (destination) => {
    // Navigate to create trip page with pre-filled destination
    navigate('/create-trip', { state: { destination: destination.name } });
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="container">
      <Header title="发现" />

      <main className="discover-content" style={{ padding: '20px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <Search
            placeholder="搜索目的地..."
            allowClear
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '600px' }}
          />
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="热门目的地" key="热门">
            <Row gutter={[16, 16]}>
              {filteredDestinations.map((dest) => (
                <Col xs={24} sm={12} md={8} lg={6} key={dest.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: '200px', overflow: 'hidden' }}>
                        <img
                          alt={dest.name}
                          src={dest.image}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    }
                    onClick={() => handleDestinationClick(dest)}
                  >
                    <div style={{ position: 'relative' }}>
                      {dest.popular && (
                        <FireOutlined style={{ position: 'absolute', top: '-10px', right: '0', color: '#ff4d4f', fontSize: '20px' }} />
                      )}
                      <h3 style={{ marginBottom: '8px' }}>{dest.name}</h3>
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                        {dest.description}
                      </p>
                      <div style={{ marginBottom: '12px' }}>
                        {dest.tags.map((tag, index) => (
                          <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888' }}>
                        <span>
                          <StarOutlined style={{ color: '#faad14' }} /> {dest.rating}
                        </span>
                        <span>
                          <EnvironmentOutlined /> {dest.attractions} 景点
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="主题推荐" key="主题">
            <Row gutter={[16, 16]}>
              {themes.map((theme) => (
                <Col xs={24} sm={12} md={12} lg={12} key={theme.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    cover={
                      <div style={{ height: '250px', overflow: 'hidden' }}>
                        <img
                          alt={theme.title}
                          src={theme.image}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    }
                  >
                    <h3 style={{ marginBottom: '8px' }}>{theme.title}</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                      {theme.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {theme.destinations.map((dest, index) => (
                        <Tag key={index} color="geekblue">
                          {dest}
                        </Tag>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="季节推荐" key="季节">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="当季热门推荐" bordered={false}>
                  <Row gutter={[16, 16]}>
                    {destinations.slice(0, 4).map((dest) => (
                      <Col xs={24} sm={12} md={6} key={dest.id}>
                        <Card
                          hoverable
                          size="small"
                          cover={
                            <div style={{ height: '150px', overflow: 'hidden' }}>
                              <img
                                alt={dest.name}
                                src={dest.image}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          }
                          onClick={() => handleDestinationClick(dest)}
                        >
                          <h4 style={{ marginBottom: '4px' }}>{dest.name}</h4>
                          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                            {dest.description}
                          </p>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </main>
    </div>
  );
}

export default DiscoverPage;
