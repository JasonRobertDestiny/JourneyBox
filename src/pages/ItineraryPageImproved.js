import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { message, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import DaySidebar from '../components/DaySidebar';
import ActivityCard from '../components/ActivityCard';
import TransportFilter from '../components/TransportFilter';
import MapView from '../components/MapView';
import { getTripDetailsById } from '../api/tripService';
import { generateTravelPlan } from '../api/aiService';
import '../styles/ItineraryPageImproved.css';

function ItineraryPageImproved() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tripDetails, setTripDetails] = useState(null);
  const [pageState, setPageState] = useState('loading');
  const [generationStep, setGenerationStep] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [transportMode, setTransportMode] = useState('public');
  const [chatInput, setChatInput] = useState('');

  // 生成步骤消息
  const generationSteps = [
    '正在为您规划完美行程...',
    '收集目的地信息',
    '分析最佳景点组合',
    '优化行程路线',
    '生成详细行程计划',
    '正在为您的旅程寻找最佳体验...'
  ];

  // 加载行程数据
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setPageState('loading');
        const details = await getTripDetailsById(parseInt(id, 10));

        if (!details) {
          message.error('行程不存在');
          navigate('/');
          return;
        }

        setTripDetails(details);

        // 检查是否需要AI生成
        const shouldGenerate = searchParams.get('generate') === 'true';

        if (shouldGenerate) {
          setSearchParams({});
          setPageState('generating');
          await handleAiGeneration(details.tripInfo);
        } else {
          setPageState('ready');
        }
      } catch (error) {
        console.error('加载行程失败:', error);
        message.error('加载行程失败');
        setPageState('error');
      }
    };

    if (id) {
      fetchTripDetails();
    }
  }, [id, navigate, searchParams, setSearchParams]);

  // AI生成行程
  const handleAiGeneration = async (tripInfo) => {
    let stepInterval = null;
    try {
      setGenerationStep(0);

      stepInterval = setInterval(() => {
        setGenerationStep(prev => {
          const nextStep = prev < generationSteps.length - 1 ? prev + 1 : prev;
          return nextStep;
        });
      }, 2500);

      const aiRequestData = {
        destination: tripInfo.destination,
        startDate: tripInfo.startDate,
        endDate: tripInfo.endDate,
        budget: tripInfo.budget || 'medium',
        interests: tripInfo.interests || [],
        travelStyle: tripInfo.travelStyle || 'relaxed',
        participants: tripInfo.participants || []
      };

      const aiResult = await generateTravelPlan(aiRequestData);

      if (stepInterval) {
        clearInterval(stepInterval);
        stepInterval = null;
      }

      if (aiResult && aiResult.error) {
        console.error('AI生成失败:', aiResult.error);
        message.warning({
          content: `AI生成失败，已使用默认行程规划。${aiResult.errorDetails || ''}`,
          duration: 5
        });
      } else if (aiResult && aiResult.days) {
        message.success('行程规划生成成功！');

        const updatedDetails = await getTripDetailsById(parseInt(id, 10));
        if (updatedDetails && aiResult.days) {
          // 增强活动数据，添加图片等信息
          updatedDetails.itinerary.days = aiResult.days.map((aiDay, index) => ({
            day: index + 1,
            date: aiDay.date,
            dayOverview: aiDay.dayOverview,
            activities: (aiDay.activities || []).map(activity => ({
              ...activity,
              images: generatePlaceholderImages(activity.name), // 生成占位图片
              bookingUrl: generateBookingUrl(activity.name, activity.type),
              learnMoreUrl: generateLearnMoreUrl(activity.name)
            }))
          }));

          setTripDetails(updatedDetails);
        }
      }
    } catch (error) {
      console.error('AI生成过程出错:', error);
      message.warning('AI生成遇到问题，已使用默认行程规划');
    } finally {
      if (stepInterval) {
        clearInterval(stepInterval);
      }
      setPageState('ready');
      setGenerationStep(0);
    }
  };

  // 生成占位图片URL
  const generatePlaceholderImages = (name) => {
    const keywords = name.replace(/[\s]/g, '+');
    return [
      `https://source.unsplash.com/400x225/?${keywords},travel`,
      `https://source.unsplash.com/401x225/?${keywords},tourism`,
      `https://source.unsplash.com/402x225/?${keywords},landmark`
    ];
  };

  // 生成预约链接
  const generateBookingUrl = (name, type) => {
    if (type === 'restaurant') {
      return `https://www.dianping.com/search/keyword/2/0_${encodeURIComponent(name)}`;
    }
    return `https://www.mafengwo.cn/search/q.php?q=${encodeURIComponent(name)}`;
  };

  // 生成了解更多链接
  const generateLearnMoreUrl = (name) => {
    return `https://baike.baidu.com/item/${encodeURIComponent(name)}`;
  };

  // 处理聊天输入
  const handleChatSend = () => {
    if (chatInput.trim()) {
      console.log('发送消息:', chatInput);
      setChatInput('');
      // TODO: 实现AI助手对话功能
      message.info('AI助手功能即将上线');
    }
  };

  // Loading状态
  if (pageState === 'loading' || pageState === 'generating') {
    const isGenerating = pageState === 'generating';
    return (
      <div className="itinerary-improved">
        <Header title={isGenerating ? "生成行程中" : "加载中..."} />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{isGenerating ? generationSteps[generationStep] : '正在加载行程数据...'}</p>
          {isGenerating && (
            <div className="generation-tips">
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
      <div className="itinerary-improved">
        <Header title="行程不存在" />
        <div className="error-container">
          <p>未找到该行程</p>
        </div>
      </div>
    );
  }

  const { tripInfo, itinerary } = tripDetails;

  // 准备时间轴数据
  const timelineDays = itinerary && itinerary.days ? itinerary.days : [];
  const currentDayActivities = timelineDays[activeDay]?.activities || timelineDays[activeDay]?.places || [];

  // 准备地图数据
  const mapActivities = currentDayActivities.map(activity => ({
    name: activity.name,
    address: activity.address || '未知地址',  // 使用address字段
    lat: activity.lat || activity.location?.lat,
    lng: activity.lng || activity.location?.lng,
    type: activity.type
  }));

  return (
    <div className="itinerary-improved">
      <Header title={tripInfo.title} showBackButton={true} />

      <div className="itinerary-layout">
        {/* 左侧边栏 - 天数导航 */}
        <aside className="layout-sidebar">
          <DaySidebar
            days={timelineDays}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            tripInfo={tripInfo}
          />
        </aside>

        {/* 中间内容区 - 活动卡片 */}
        <main className="layout-content">
          <div className="content-header">
            <h2>第{activeDay + 1}天行程</h2>
            <TransportFilter
              activeMode={transportMode}
              onModeChange={setTransportMode}
            />
          </div>

          <div className="activities-container">
            {currentDayActivities.length > 0 ? (
              currentDayActivities.map((activity, index) => (
                <ActivityCard
                  key={index}
                  activity={activity}
                  index={index}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>该天暂无行程安排</p>
              </div>
            )}
          </div>
        </main>

        {/* 右侧地图 */}
        <aside className="layout-map">
          <div className="map-container">
            <MapView
              activities={mapActivities}
              destination={tripInfo.destination}
              transportMode={transportMode}
            />
          </div>

          {/* 底部聊天输入框 */}
          <div className="chat-input-container">
            <Input
              placeholder="询问行程相关问题..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPressEnter={handleChatSend}
              suffix={
                <SendOutlined
                  onClick={handleChatSend}
                  style={{ cursor: 'pointer', color: '#1890ff' }}
                />
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ItineraryPageImproved;