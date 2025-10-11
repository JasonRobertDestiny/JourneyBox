import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Button, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import TimelineView from '../components/TimelineView';
import WeatherWidget from '../components/WeatherWidget';
import MapView from '../components/MapView';
import { getTripDetailsById } from '../api/tripService';
import { generateTravelPlan } from '../api/aiService';
import '../styles/ItineraryPage.css';

const { TabPane } = Tabs;

function ItineraryPageSimple() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tripDetails, setTripDetails] = useState(null);
  const [pageState, setPageState] = useState('loading'); // 'loading' | 'generating' | 'ready' | 'error'
  const [generationStep, setGenerationStep] = useState(0);
  const [activeTab, setActiveTab] = useState('timeline');

  // 生成步骤消息
  const generationSteps = [
    '正在为您规划完美行程...',
    '收集目的地信息',
    '分析最佳景点组合',
    '优化行程路线',
    '生成详细行程计划',
    `正在为您的旅程寻找最佳体验...`
  ];

  // 加载行程数据并检查是否需要AI生成
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setPageState('loading');
        console.log('【DEBUG】开始加载行程数据');

        const details = await getTripDetailsById(parseInt(id, 10));

        if (!details) {
          message.error('行程不存在');
          navigate('/');
          return;
        }

        console.log('【DEBUG】行程数据加载成功:', details.tripInfo.title);
        setTripDetails(details);

        // 检查是否需要AI生成
        const shouldGenerate = searchParams.get('generate') === 'true';
        console.log('【DEBUG】是否需要AI生成:', shouldGenerate);

        if (shouldGenerate) {
          // 移除query参数
          setSearchParams({});
          // 切换到生成状态（保持loading界面）
          setPageState('generating');
          console.log('【DEBUG】切换到generating状态');
          // 触发AI生成
          await handleAiGeneration(details.tripInfo);
        } else {
          // 不需要生成，直接显示
          setPageState('ready');
          console.log('【DEBUG】切换到ready状态');
        }
      } catch (error) {
        console.error('【DEBUG】加载行程失败:', error);
        message.error('加载行程失败');
        setPageState('error');
      }
    };

    if (id) {
      fetchTripDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // AI生成行程
  const handleAiGeneration = async (tripInfo) => {
    console.log('【DEBUG】handleAiGeneration 开始执行');
    console.log('【DEBUG】tripInfo:', tripInfo);

    let stepInterval = null;
    try {
      // 状态已经在调用前设置为 'generating'
      setGenerationStep(0);
      console.log('【DEBUG】开始AI生成流程');

      // 显示生成步骤动画
      stepInterval = setInterval(() => {
        setGenerationStep(prev => {
          const nextStep = prev < generationSteps.length - 1 ? prev + 1 : prev;
          console.log('【DEBUG】生成步骤:', generationSteps[nextStep]);
          return nextStep;
        });
      }, 2500);

      // 准备AI请求数据
      const aiRequestData = {
        destination: tripInfo.destination,
        startDate: tripInfo.startDate,
        endDate: tripInfo.endDate,
        budget: tripInfo.budget || 'medium',
        interests: tripInfo.interests || [],
        travelStyle: tripInfo.travelStyle || 'relaxed',
        participants: tripInfo.participants || []
      };

      console.log('【DEBUG】AI请求数据:', aiRequestData);
      console.log('【DEBUG】开始调用 generateTravelPlan...');

      // 调用AI服务
      const aiResult = await generateTravelPlan(aiRequestData);

      console.log('【DEBUG】AI返回结果:', aiResult);

      // 清理定时器
      if (stepInterval) {
        clearInterval(stepInterval);
        stepInterval = null;
        console.log('【DEBUG】清除定时器');
      }

      if (aiResult && aiResult.error) {
        console.error('【DEBUG】AI生成失败:', aiResult.error, aiResult.errorDetails);
        message.warning({
          content: `AI生成失败，已使用默认行程规划。${aiResult.errorDetails || ''}`,
          duration: 5
        });
        // AI失败了也显示默认行程
        console.log('【DEBUG】AI失败，显示现有行程');
      } else if (aiResult && aiResult.days) {
        console.log('【DEBUG】AI生成成功，更新行程数据');
        message.success('行程规划生成成功！');

        // 更新行程数据（将AI返回的数据合并到现有行程中）
        const updatedDetails = await getTripDetailsById(parseInt(id, 10));
        console.log('【DEBUG】获取到的现有行程:', updatedDetails);

        if (updatedDetails && aiResult.days) {
          // 将AI生成的数据更新到tripDetails中
          updatedDetails.itinerary.days = aiResult.days.map((aiDay, index) => ({
            day: index + 1,
            dailyTimeRange: { start: 9, end: 19 },
            color: ['#FF5252', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'][index % 5],
            places: aiDay.activities || []
          }));
          console.log('【DEBUG】更新后的行程:', updatedDetails);
          setTripDetails(updatedDetails);
        }
      } else {
        console.log('【DEBUG】AI返回格式异常，显示现有行程');
        message.info('AI生成的数据格式异常，显示默认行程');
      }
    } catch (error) {
      console.error('【DEBUG】AI生成过程出错:', error);
      console.error('【DEBUG】错误堆栈:', error.stack);
      message.warning('AI生成遇到问题，已使用默认行程规划');
    } finally {
      // 清理定时器
      if (stepInterval) {
        clearInterval(stepInterval);
        console.log('【DEBUG】finally: 清除定时器');
      }
      console.log('【DEBUG】finally: 切换到ready状态');
      setPageState('ready');
      setGenerationStep(0);
    }
  };

  // 统一的loading状态处理
  if (pageState === 'loading' || pageState === 'generating') {
    const isGenerating = pageState === 'generating';
    return (
      <div className="itinerary-container">
        <Header title={isGenerating ? "生成行程中" : "加载中..."} />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{isGenerating ? generationSteps[generationStep] : '正在加载行程数据...'}</p>
          {isGenerating && (
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
              <p>我们正在为您精心设计一个完美的旅行体验</p>
              <p>这可能需要一点时间，请耐心等待...</p>
            </div>
          )}
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
            address: place.address,  // 使用address而不是location
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
      time: place.time || place.timeStart || '09:00',
      duration: place.duration ? formatDuration(place.duration) :
                place.timeEnd ? calculateDuration(place.timeStart, place.timeEnd) : '2小时',
      name: place.name,
      type: mapPlaceTypeToActivity(place.type || 'attraction'),
      address: place.address || '未知地址',  // 使用address字段而不是location
      description: place.description,
      cost: place.cost || '待定'
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

    let durationMin = endTotalMin - startTotalMin;

    // 如果结束时间早于开始时间，假设是跨天（加24小时）
    if (durationMin < 0) {
      durationMin += 24 * 60;
    }

    // 如果时长异常（超过12小时），返回默认值
    if (durationMin > 12 * 60) {
      return '2小时';
    }

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

// 辅助函数 - 格式化持续时间（从分钟数）
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '2小时';

  const mins = parseInt(minutes, 10);
  if (mins < 60) {
    return `${mins}分钟`;
  } else {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}小时${remainingMins}分钟` : `${hours}小时`;
  }
}

export default ItineraryPageSimple;
