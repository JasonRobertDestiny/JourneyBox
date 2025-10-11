import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Button, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import TimelineView from '../components/TimelineView';
import WeatherWidget from '../components/WeatherWidget';
import MapView from '../components/MapView';
import { getTripDetailsById } from '../api/tripService';
import '../styles/ItineraryPage.css';

const { TabPane } = Tabs;

function ItineraryPageSimple() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  // 加载行程数据
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const details = await getTripDetailsById(parseInt(id, 10));

        if (!details) {
          message.error('行程不存在');
          navigate('/');
          return;
        }

        setTripDetails(details);
      } catch (error) {
        console.error('加载行程失败:', error);
        message.error('加载行程失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTripDetails();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="itinerary-container">
        <Header title="加载中..." />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>正在加载行程数据...</p>
        </div>
      </div>
    );
  }

  if (!tripDetails) {
    return (
      <div className="itinerary-container">
        <Header title="行程不存在" />
        <div className="error-container">
          <p>未找到该行程</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  const { tripInfo, itinerary } = tripDetails;

  // 准备地图数据 - 从itinerary.days提取活动
  const allActivities = [];
  if (itinerary && itinerary.days) {
    itinerary.days.forEach(day => {
      if (day.places) {
        day.places.forEach(place => {
          allActivities.push({
            name: place.name,
            location: place.address,
            lat: place.location?.lat,
            lng: place.location?.lng,
            type: place.type
          });
        });
      }
    });
  }

  // 准备时间轴数据 - 转换为新组件的格式
  const timelineDays = itinerary && itinerary.days ? itinerary.days.map((day, index) => ({
    date: tripInfo.startDate ? new Date(new Date(tripInfo.startDate).getTime() + index * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN') : `第${index + 1}天`,
    dayOverview: `行程安排: ${day.places ? day.places.length : 0} 个地点`,
    activities: day.places ? day.places.map(place => ({
      time: place.timeStart || '09:00',
      duration: place.timeEnd ? calculateDuration(place.timeStart, place.timeEnd) : '2小时',
      name: place.name,
      type: mapPlaceTypeToActivity(place.type),
      location: place.address,
      description: place.description,
      cost: '待定'
    })) : []
  })) : [];

  return (
    <div className="itinerary-container">
      <Header title={tripInfo.title} showBackButton={true} />

      <div className="itinerary-content">
        {/* 行程基本信息 */}
        <div className="trip-info-card">
          <h2>{tripInfo.title}</h2>
          <div className="trip-meta">
            <span>
              <CalendarOutlined /> {tripInfo.startDate} 至 {tripInfo.endDate}
            </span>
            <span> · </span>
            <span>{tripInfo.destination}</span>
          </div>
          {tripInfo.notes && (
            <p className="trip-notes">{tripInfo.notes}</p>
          )}
        </div>

        {/* 天气预报 */}
        <div className="weather-section">
          <WeatherWidget
            city={tripInfo.destination}
            dates={timelineDays.map(d => d.date)}
          />
        </div>

        {/* 标签页 - 时间轴和地图 */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="itinerary-tabs"
        >
          <TabPane tab="时间轴" key="timeline">
            <TimelineView days={timelineDays} />
          </TabPane>

          <TabPane tab="地图" key="map">
            <MapView
              activities={allActivities}
              destination={tripInfo.destination}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

// 辅助函数 - 映射地点类型到活动类型
function mapPlaceTypeToActivity(placeType) {
  const typeMap = {
    'attraction': 'attraction',
    'scenic_spot': 'attraction',
    'restaurant': 'restaurant',
    'cafe': 'restaurant',
    'shopping': 'attraction',
    'accommodation': 'accommodation',
    'hotel': 'accommodation',
    'default': 'attraction'
  };
  return typeMap[placeType] || typeMap.default;
}

// 辅助函数 - 计算时长
function calculateDuration(start, end) {
  if (!start || !end) return '2小时';

  try {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startTotalMin = startHour * 60 + (startMin || 0);
    const endTotalMin = endHour * 60 + (endMin || 0);

    const durationMin = endTotalMin - startTotalMin;

    if (durationMin < 60) {
      return `${durationMin}分钟`;
    } else {
      const hours = Math.floor(durationMin / 60);
      const mins = durationMin % 60;
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }
  } catch {
    return '2小时';
  }
}

export default ItineraryPageSimple;
