import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Modal,
  Checkbox,
  Tabs,
  Card,
  Timeline,
  List,
  Tag,
  Button,
  Radio,
  Select,
  Alert,
  Spin,
  Collapse,
  Rate,
  Image,
  Avatar,
  Result,
  Input,
  message
} from 'antd';
import {
  EditOutlined,
  ShareAltOutlined,
  SaveOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  DollarOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import { getTripDetailsById } from '../api/tripService';
import '../styles/ItineraryPage.css';
import { optimizeTripPlan, generateTravelPlan } from '../api/aiService';
import { searchPlaceImages } from '../api/unsplashService';
import UnsplashImage from '../components/UnsplashImage';
import UnsplashAttribution from '../components/UnsplashAttribution';
import LoadingScreen from '../components/LoadingScreen';
import GeneratingAnimation from '../components/GeneratingAnimation';
import MapView from '../components/MapView';
import AIChatDrawer from '../components/AIChatDrawer';
import { batchGeocode } from '../api/mapService';
import { getCityDefaultCoords } from '../utils/cityCoordinates';

const MAP_CONTAINER_HEIGHT = 420; // 地图容器固定高度，避免页面跳动

const { TabPane } = Tabs;
const { Option } = Select;

// 添加这个离线模式提示组件
const OfflineModeBanner = ({ isOfflineMode, reason, onSwitchMode }) => {
  if (!isOfflineMode) return null;
  
  return (
    <div style={{
      backgroundColor: '#fff9e6',
      padding: '10px 15px',
      borderRadius: '4px',
      marginBottom: '15px',
      border: '1px solid #ffe58f',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong>离线模式:</strong> {reason || 'API请求频率超限，使用本地生成的行程数据'}
      </div>
      <Button 
        type="link" 
        onClick={onSwitchMode}
        style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}
      >
        尝试切换到在线模式
      </Button>
    </div>
  );
};

function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // 状态管理
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // 默认显示总览
  const [dailyTimeRange, setDailyTimeRange] = useState({ start: 9, end: 19 }); // 默认9:00-19:00
  const [placeDetail, setPlaceDetail] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [transportMode, setTransportMode] = useState('walking');
  const [showTransportOptions, setShowTransportOptions] = useState(true);
  
  // AI生成行程相关状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationSteps] = useState([
    '收集目的地信息',
    '分析最佳景点组合',
    '优化行程路线',
    '生成详细行程计划'
  ]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);
  const [mapDisplayMode, setMapDisplayMode] = useState('daily');
  const [allAttractions, setAllAttractions] = useState([]);
  const [transportationOptions, setTransportationOptions] = useState([]);
  const [accommodationOptions, setAccommodationOptions] = useState([]);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [aiOptimizationModalVisible, setAiOptimizationModalVisible] = useState(false);
  const [optimizationOptions, setOptimizationOptions] = useState({
    reduceTravelTime: true,
    avoidCrowds: false,
    budgetFriendly: false,
    familyFriendly: false,
  });
  
  // 添加缺失的状态变量
  const [isInOfflineMode, setIsInOfflineMode] = useState(false);
  const [offlineReason, setOfflineReason] = useState('');
  const [_isError, setIsError] = useState(false); // eslint-disable-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  
  // 添加切换离线/在线模式的函数
  const handleSwitchMode = () => {
    if (isInOfflineMode) {
      // 询问用户是否要切换到在线模式
      Modal.confirm({
        title: '切换到在线模式?',
        content: '这将尝试重新连接API服务，可能需要几分钟时间。如果API仍然不可用，将自动回退到离线模式。',
        onOk: () => {
          // 清除离线模式标记
          localStorage.removeItem('forceOfflineMode');
          localStorage.removeItem('useLocalImages');
          
          // 重新生成行程
          generateAiTripPlan(tripDetails?.tripInfo);
        }
      });
    }
  };
  
  // 获取行程数据
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const data = await getTripDetailsById(parseInt(id));
        setTripDetails(data);
        
        // 设置第一天的时间范围
        if (data && data.itinerary && data.itinerary.days && data.itinerary.days.length > 0) {
          setDailyTimeRange(data.itinerary.days[0].dailyTimeRange || { start: 9, end: 19 });
        }
        
        // 检查是否需要启动AI生成
        const shouldStartGeneration = 
          // 检查localStorage中的标记
          localStorage.getItem('startAiGeneration') === 'true' ||
          // 检查URL中是否有generate=true参数
          new URLSearchParams(window.location.search).get('generate') === 'true';
        
        if (shouldStartGeneration) {
          // 清除标记，避免重复触发
          localStorage.removeItem('startAiGeneration');
          // 开始AI生成
          setTimeout(() => {
            setIsGenerating(true);
            setGenerationStep(0);
            console.log("【FIX-V2】开始生成行程 - 修复版本已应用", data);
          }, 500); // 短暂延迟以确保UI已渲染
        }
      } catch (error) {
        console.error('获取行程详情失败', error);
        Modal.error({
          title: '获取行程失败',
          content: '无法获取行程信息，请稍后重试。',
          onOk: () => navigate('/history')
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTripDetails();
  }, [id, navigate]);
  
  // 处理时间范围变化
  const handleTimeRangeChange = (type, value) => {
    setDailyTimeRange(prev => {
      const newRange = { ...prev };
      newRange[type] = value;
      
      // 确保开始时间小于结束时间
      if (type === 'start' && value >= newRange.end) {
        newRange.end = value + 1;
      } else if (type === 'end' && value <= newRange.start) {
        newRange.start = value - 1;
      }
      
      return newRange;
    });
    
    // 保存到当天数据中
    if (tripDetails && currentDayIndex > 0) {
      const updatedDays = [...tripDetails.itinerary.days];
      updatedDays[currentDayIndex - 1].dailyTimeRange = dailyTimeRange;
      
      setTripDetails({
        ...tripDetails,
        itinerary: {
          ...tripDetails.itinerary,
          days: updatedDays
        }
      });
    }
  };
  
  // 处理目的地顺序调整，支持跨天拖动
  const handlePlaceReorder = (draggedId, targetId, sourceDayIndex, targetDayIndex) => {
    if (!tripDetails || !tripDetails.itinerary || !tripDetails.itinerary.days) return;
    
    // 复制当前行程数据
    const newTripDetails = { ...tripDetails };
    const days = [...newTripDetails.itinerary.days];
    
    // 找到被拖动的地点
    let draggedPlace = null;
    let draggedPlaceIndex = -1;
    
    // 查找被拖动的地点及其位置
    for (let i = 0; i < days[sourceDayIndex - 1].places.length; i++) {
      if (days[sourceDayIndex - 1].places[i].id === draggedId) {
        draggedPlace = days[sourceDayIndex - 1].places[i];
        draggedPlaceIndex = i;
        break;
      }
    }
    
    if (!draggedPlace) return;
    
    // 从原位置移除
    days[sourceDayIndex - 1].places.splice(draggedPlaceIndex, 1);
    
    // 找到目标位置并插入
    let targetPlaceIndex = 0;
    for (let i = 0; i < days[targetDayIndex - 1].places.length; i++) {
      if (days[targetDayIndex - 1].places[i].id === targetId) {
        targetPlaceIndex = i;
        break;
      }
    }
    
    // 插入到新位置
    days[targetDayIndex - 1].places.splice(targetPlaceIndex, 0, draggedPlace);
    
    // 更新状态
    newTripDetails.itinerary.days = days;
    setTripDetails(newTripDetails);
  };
  
  // 处理目的地详情查看
  const handleViewPlaceDetail = (place) => {
    setPlaceDetail(place);
  };
  
  // 关闭目的地详情
  const handleClosePlaceDetail = () => {
    setPlaceDetail(null);
  };
  
  // 图片轮播引用
  const carouselRef = useRef(null);
  
  // 图片轮播翻页
  const handleGalleryScroll = (direction) => {
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    const scrollAmount = carousel.offsetWidth;
    
    if (direction === 'next') {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  
  // 处理预约功能
  const handleBookingOpen = () => {
    setSelectedPlaces([]);
    setShowBookingModal(true);
  };
  
  // 处理预约提交
  const handleBookingSubmit = () => {
    if (selectedPlaces.length === 0) {
      Modal.warning({
        title: '请选择至少一个预约地点',
        content: '您需要勾选想要预约的地点'
      });
      return;
    }
    
    // 模拟预约成功
    Modal.success({
      title: '预约成功',
      content: '您已成功预约所选地点的门票！'
    });
    
    setShowBookingModal(false);
  };
  
  // 返回按钮处理
  const handleBack = () => {
    navigate(-1);
  };
  
  // 切换出行方式选项显示/隐藏
  const toggleTransportOptions = () => {
    setShowTransportOptions(!showTransportOptions);
  };
  
  // 选择出行方式
  const handleTransportSelect = (mode) => {
    setTransportMode(mode);
  };
  
  // 格式化时间显示
  const formatTimeDisplay = (hour) => {
    return `${hour}:00${hour < 12 ? 'AM' : 'PM'}`;
  };
  
  // 获取当前显示的行程数据
  const getCurrentDayPlaces = () => {
    if (!tripDetails || !tripDetails.itinerary || !tripDetails.itinerary.days) {
      return [];
    }
    
    // 总览模式
    if (currentDayIndex === 0) {
      return tripDetails.itinerary.days;
    }
    
    // 单日模式
    const dayIndex = currentDayIndex - 1;
    if (dayIndex >= 0 && dayIndex < tripDetails.itinerary.days.length) {
      return [tripDetails.itinerary.days[dayIndex]];
    }
    
    return [];
  };

  // 获取地图展示所需的活动列表
  const getMapActivities = () => {
    if (!tripDetails?.itinerary?.days) return [];

    if (mapDisplayMode === 'daily') {
      const dayIdx = currentDayIndex > 0 ? currentDayIndex - 1 : 0;
      const day = tripDetails.itinerary.days[dayIdx];
      if (!day) return [];
      return day.places
        .filter(p => p.location?.lat && p.location?.lng)
        .map(p => ({
          name: p.name,
          lat: p.location.lat,
          lng: p.location.lng,
          address: p.address,
          description: p.description
        }));
    }

    // 全程总览模式
    return tripDetails.itinerary.days
      .flatMap(d => d.places || [])
      .filter(p => p.location?.lat && p.location?.lng)
      .map(p => ({
        name: p.name,
        lat: p.location.lat,
        lng: p.location.lng,
        address: p.address,
        description: p.description
      }));
  };
  
  // AI行程生成逻辑
  useEffect(() => {
    // 模拟AI生成行程的过程
    if (isGenerating) {
      // 如果正在生成中但还没开始真正的生成，则调用生成函数
      // 这样可以避免无限循环
      if (generationStep === 0 && tripDetails) {
        generateAiTripPlan(tripDetails.tripInfo);
      }
    }
  }, [isGenerating]);
  
  // 调用AI服务生成行程计划
  const generateAiTripPlan = async (tripInfo = null) => {
    try {
      setIsError(false);
      setIsLoading(true);
      setIsInOfflineMode(false);
      
      // 准备传给AI的数据 - 修复版本（使用传入的tripInfo参数或现有的tripDetails）
      const tripInfoData = tripInfo || tripDetails?.tripInfo;
      if (!tripInfoData) {
        console.error('【FIX-V2】没有行程信息可用');
        setIsError(true);
        setIsLoading(false);
        return;
      }

      const tripData = {
        destination: tripInfoData.destination,
        startDate: tripInfoData.startDate,
        endDate: tripInfoData.endDate,
        budget: tripInfoData.budget || 'medium',
        interests: tripInfoData.interests || ['文化', '历史', '美食'],
        travelStyle: tripInfoData.travelStyle || 'relaxed',
        participants: tripInfoData.participants || ['成人']
      };
      
      // 判断是否强制使用离线模式
      const forceOfflineMode = localStorage.getItem('forceOfflineMode') === 'true';

      // 先清除旧的离线模式标记（如果用户手动点击生成，说明想要真实数据）
      if (forceOfflineMode) {
        console.log('检测到离线模式标记，尝试清除并使用在线模式');
        localStorage.removeItem('forceOfflineMode');
      }

      // 先检查本地存储是否已有该目的地的离线数据
      const offlineKey = `offline_trip_${tripData.destination}_${tripData.startDate}_${tripData.endDate}`;
      const cachedData = localStorage.getItem(offlineKey);

      // 永远不自动使用离线模式，除非API真的失败了
      if (false) {
        console.log('使用离线模式生成行程数据');
        // 使用离线数据
        if (cachedData) {
          console.log('使用本地缓存的离线数据');
          setIsLoading(false);
          setItineraryData(JSON.parse(cachedData));
          setIsInOfflineMode(true);
          setOfflineReason('根据用户设置使用离线模式');
          return;
        }
        
        // 模拟生成步骤进度
        const stepInterval = setInterval(() => {
          setGenerationStep(prev => {
            if (prev < generationSteps.length - 1) {
              return prev + 1;
            }
            clearInterval(stepInterval);
            return prev;
          });
        }, 1500);
        
        // 使用模拟数据
        setTimeout(async () => {
          const mockData = getMockTravelPlan(tripData);
          localStorage.setItem(offlineKey, JSON.stringify(mockData));
          setItineraryData(mockData);
          setIsLoading(false);
          setIsInOfflineMode(true);
          setOfflineReason('根据用户设置使用离线模式');

          // Process the mock plan to update trip details
          await processGeneratedPlan(mockData);
        }, generationSteps.length * 1500);
        
        return;
      }
      
      // 模拟生成步骤进度
      const stepInterval = setInterval(() => {
        setGenerationStep(prev => {
          if (prev < generationSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(stepInterval);
          return prev;
        });
      }, 2000); // 增加到2秒，减少请求压力
      
      try {
        // 调用AI生成行程
        const aiResponse = await generateTravelPlan(tripData);

        clearInterval(stepInterval);
        setGenerationStep(generationSteps.length - 1);

        if (aiResponse && !aiResponse.error) {
          // 保存到本地存储，以备离线使用
          localStorage.setItem(offlineKey, JSON.stringify(aiResponse));
          setItineraryData(aiResponse);
          setIsLoading(false);

          // Process the generated plan to update trip details
          await processGeneratedPlan(aiResponse);
        } else {
          throw new Error(aiResponse?.error || 'AI返回的数据为空');
        }
      } catch (error) {
        console.error('AI行程生成失败:', error);
        clearInterval(stepInterval);

        // 不再自动设置离线模式，让用户可以重试
        // localStorage.setItem('forceOfflineMode', 'true');

        // 检查是否有错误信息
        let errorMessage = '生成行程时出错。';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;

          // 特殊错误处理
          if (errorMessage.includes('请求频率超限')) {
            errorMessage = 'API请求频率超限，请稍等几秒后再试。';

            // 只有在用户确认后才使用离线模式
            Modal.confirm({
              title: 'API请求频率超限',
              content: '当前请求过于频繁，是否使用离线模拟数据查看示例行程？您也可以稍后再试。',
              okText: '使用离线数据',
              cancelText: '稍后再试',
              onOk: async () => {
                // 用户选择使用离线模式
                console.log('用户选择使用离线模式');
                const mockData = getMockTravelPlan(tripData);
                localStorage.setItem(offlineKey, JSON.stringify(mockData));
                setItineraryData(mockData);
                setIsLoading(false);
                setIsInOfflineMode(true);
                setOfflineReason('API频率限制，使用模拟数据');
                await processGeneratedPlan(mockData);
              },
              onCancel: () => {
                // 用户选择稍后再试
                setIsGenerating(false);
                setIsLoading(false);
              }
            });
            return; // 提前返回，不自动使用离线模式
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        // 显示错误信息,让用户选择
        Modal.error({
          title: '生成失败',
          content: errorMessage + '\n\n您可以稍后点击"AI生成行程"按钮重试。',
          onOk: () => {
            // 确保生成状态被完全重置
            setIsGenerating(false);
            setIsLoading(false);
            setGenerationStep(0);
            // 不跳转,让用户留在当前页面重试
          }
        });
        return; // 立即返回,阻止执行后续代码
      }
    } catch (error) {
      console.error('整体行程生成过程失败:', error);
      setIsError(true);
      setOfflineReason('生成行程时发生意外错误,请重试或联系支持团队。');
      setIsLoading(false);
      setIsGenerating(false);
      setGenerationStep(0);

      // 显示错误信息
      Modal.error({
        title: '生成失败',
        content: '生成行程时发生意外错误。请检查网络连接后重试。',
        onOk: () => {
          // 留在当前页面,让用户可以重试
        }
      });
    }
  };
  
  // 添加一个获取模拟旅行计划的函数，当API调用失败时使用
  const getMockTravelPlan = (tripInfo) => {
    const { destination, startDate, endDate } = tripInfo;
    
    // 计算行程天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    
    // 根据目的地选择对应的景点数据
    const cityAttractions = getCityAttractions(destination);
    
    // 生成模拟的行程数据
    return {
      overview: `这是一个${days}天的${destination}旅行计划。您将体验当地的文化、美食和风景。`,
      tips: "由于API调用限制，这是一个模拟生成的行程。您可以稍后再试。",
      days: Array(days).fill(null).map((_, index) => {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + index);
        
        // 为每天选择2-4个景点，避免重复
        const dailyAttractions = selectRandomAttractions(
          cityAttractions.attractions, 
          Math.min(4, Math.max(2, cityAttractions.attractions.length / days))
        );
        
        // 为每天选择1-2个餐厅
        const dailyRestaurants = selectRandomAttractions(
          cityAttractions.restaurants,
          Math.min(2, Math.max(1, cityAttractions.restaurants.length / days))
        );
        
        // 组合当天的活动
        const dailyActivities = [];
        
        // 上午活动（通常是景点）
        if (dailyAttractions.length > 0) {
          dailyActivities.push({
            time: "09:00",
            duration: "2小时",
            name: dailyAttractions[0].name,
            type: "景点",
            location: dailyAttractions[0].location || destination,
            description: dailyAttractions[0].description || `这是${destination}的著名景点，您可以在这里体验当地文化。`,
            cost: dailyAttractions[0].cost || "¥100"
          });
        }
        
        // 午餐
        if (dailyRestaurants.length > 0) {
          dailyActivities.push({
            time: "12:00",
            duration: "1.5小时",
            name: dailyRestaurants[0].name,
            type: "餐厅",
            location: dailyRestaurants[0].location || `${destination}市中心`,
            description: dailyRestaurants[0].description || "品尝当地特色美食，享受美妙的用餐体验。",
            cost: dailyRestaurants[0].cost || "¥150"
          });
        }
        
        // 下午活动（景点）
        if (dailyAttractions.length > 1) {
          dailyActivities.push({
            time: "14:30",
            duration: "3小时",
            name: dailyAttractions[1].name,
            type: "景点",
            location: dailyAttractions[1].location || `${destination}历史区`,
            description: dailyAttractions[1].description || "深入了解当地文化和历史，参与互动体验。",
            cost: dailyAttractions[1].cost || "¥120"
          });
        }
        
        // 晚餐
        if (dailyRestaurants.length > 1) {
          dailyActivities.push({
            time: "18:30",
            duration: "2小时",
            name: dailyRestaurants[1].name,
            type: "餐厅",
            location: dailyRestaurants[1].location || `${destination}餐饮区`,
            description: dailyRestaurants[1].description || "享用当地特色晚餐，结束美好的一天。",
            cost: dailyRestaurants[1].cost || "¥180"
          });
        } 
        // 晚间活动（可选）
        else if (dailyAttractions.length > 2) {
          dailyActivities.push({
            time: "19:30",
            duration: "2小时",
            name: dailyAttractions[2].name,
            type: "景点",
            location: dailyAttractions[2].location || `${destination}夜景区`,
            description: dailyAttractions[2].description || "欣赏美丽的城市夜景，拍摄难忘的照片。",
            cost: dailyAttractions[2].cost || "¥80"
          });
        }
        
        return {
          date: dayDate.toISOString().split('T')[0],
          dayOverview: `第${index + 1}天：${cityAttractions.dayDescriptions[index % cityAttractions.dayDescriptions.length]}`,
          activities: dailyActivities
        };
      }),
      accommodation: cityAttractions.accommodation || "推荐入住当地四星级酒店或特色民宿，预算约为每晚¥300-600。",
      transportation: cityAttractions.transportation || "市内交通可以选择出租车、公交或地铁，也可以考虑租赁自行车游览。"
    };
  };
  
  // 随机选择景点，避免重复
  const selectRandomAttractions = (attractions, count) => {
    const selected = [];
    const availableAttractions = [...attractions];
    
    for (let i = 0; i < count && availableAttractions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableAttractions.length);
      selected.push(availableAttractions[randomIndex]);
      availableAttractions.splice(randomIndex, 1);
    }
    
    return selected;
  };
  
  // 根据城市名获取对应的景点数据
  const getCityAttractions = (cityName) => {
    // 标准化城市名称（去除"市"、"省"等后缀，转为小写）
    const normalizedCity = cityName.replace(/市|省|自治区|特别行政区/g, '').toLowerCase();
    
    // 城市景点数据库
    const cityData = {
      // 北京景点
      '北京': {
        attractions: [
          { name: '故宫博物院', location: '北京市东城区景山前街4号', description: '世界上现存规模最大、保存最为完整的木质结构古建筑之一，是中国明清两代的皇家宫殿。', cost: '¥60-100' },
          { name: '长城（八达岭段）', location: '北京市延庆区军都山关沟古道', description: '中国古代伟大的防御工程，被誉为世界七大奇迹之一。', cost: '¥35-40' },
          { name: '天安门广场', location: '北京市东城区东长安街', description: '世界上最大的城市中心广场，可以参观天安门城楼、人民英雄纪念碑等。', cost: '免费' },
          { name: '颐和园', location: '北京市海淀区新建宫门路19号', description: '中国现存规模最大、保存最完整的皇家园林，被誉为"皇家园林博物馆"。', cost: '¥20-30' },
          { name: '天坛公园', location: '北京市东城区天坛内东里7号', description: '中国古代帝王祭天的场所，是中国现存规模最大、最完整的古代祭祀建筑群。', cost: '¥15-30' },
          { name: '恭王府', location: '北京市西城区前海西街17号', description: '清代规模最大的一处王府，被誉为"北京紫禁城外唯一完整的清代王府"。', cost: '¥40' },
          { name: '798艺术区', location: '北京市朝阳区酒仙桥路4号', description: '由废弃的军工厂改造而成的艺术区，聚集了大量画廊、艺术工作室和设计公司。', cost: '免费' }
        ],
        restaurants: [
          { name: '全聚德烤鸭店', location: '北京市东城区前门大街30号', description: '始创于1864年的老字号，以其独特的挂炉烤鸭闻名。', cost: '¥200/人' },
          { name: '四季民福烤鸭', location: '北京市东城区王府井大街', description: '拥有70多年历史的老字号烤鸭店，肉质鲜嫩多汁。', cost: '¥150/人' },
          { name: '南锣鼓巷小吃街', location: '北京市东城区南锣鼓巷', description: '汇集了豆汁、炒肝、爆肚等北京传统小吃。', cost: '¥50-100/人' },
          { name: '老舍茶馆', location: '北京市西城区前门西大街3号楼', description: '可以品尝各种中国茶和传统小吃，还有京剧、相声等表演。', cost: '¥150-300/人' }
        ],
        dayDescriptions: [
          '探索紫禁城的皇家历史',
          '登长城，做真好汉',
          '体验现代与传统交融的北京',
          '漫步皇家园林和古典建筑',
          '感受北京小吃和地道美食'
        ],
        accommodation: '推荐入住王府井或前门附近的酒店，交通便利，周边设施齐全。豪华酒店价格在¥800-2000/晚，经济型酒店价格在¥300-600/晚。',
        transportation: '北京公共交通发达，地铁覆盖主要景点，单程票价¥3-9。出租车起步价¥13，景点间通常¥30-50。也可考虑共享单车短途代步。'
      },
      
      // 上海景点
      '上海': {
        attractions: [
          { name: '外滩', location: '上海市黄浦区中山东一路', description: '上海最著名的地标之一，可以欣赏到黄浦江两岸的美丽景色。', cost: '免费' },
          { name: '上海迪士尼乐园', location: '上海市浦东新区川沙新镇', description: '中国内地首个迪士尼主题乐园，拥有七大主题园区。', cost: '¥399-699' },
          { name: '豫园', location: '上海市黄浦区安仁街218号', description: '明代私家花园，是江南古典园林的代表作之一。', cost: '¥40-50' },
          { name: '上海科技馆', location: '上海市浦东新区世纪大道2000号', description: '中国规模最大的科技馆之一，展示丰富的科技成果。', cost: '¥45-60' },
          { name: '田子坊', location: '上海市黄浦区泰康路210号', description: '石库门建筑改造的创意园区，汇集了各种特色小店和艺术工作室。', cost: '免费' },
          { name: '南京路步行街', location: '上海市黄浦区南京东路', description: '中国第一条商业步行街，汇集了各种商场、专卖店和餐厅。', cost: '免费' }
        ],
        restaurants: [
          { name: '南翔馒头店', location: '上海市黄浦区豫园老街城隍庙内', description: '创建于1900年的老字号，以小笼包闻名。', cost: '¥60-100/人' },
          { name: '绿波廊', location: '上海市黄浦区豫园老街内', description: '创建于清代的老字号，以本帮菜闻名。', cost: '¥100-200/人' },
          { name: '外滩万国建筑群', location: '上海市黄浦区中山东一路', description: '可以欣赏到富有特色的西式建筑和黄浦江美景。', cost: '免费' },
          { name: '西郊国际农产品交易中心', location: '上海市长宁区虹桥路1000号', description: '亚洲最大的农产品交易市场之一，有各种海鲜和蔬果。', cost: '¥200-300/人' }
        ],
        dayDescriptions: [
          '感受魔都的现代与传统',
          '探索上海的历史街区和文化',
          '体验上海的时尚购物天堂',
          '品尝上海美食和本帮菜',
          '游览江南水乡风光'
        ],
        accommodation: '推荐入住外滩、南京路或淮海路附近的酒店，交通便利，周边设施齐全。豪华酒店价格在¥1000-3000/晚，经济型酒店价格在¥300-800/晚。',
        transportation: '上海公共交通发达，地铁覆盖主要景点，单程票价¥3-9。出租车起步价¥14，景点间通常¥30-60。也可考虑共享单车短途代步。'
      },
      
      // 广州景点
      '广州': {
        attractions: [
          { name: '广州塔', location: '广州市海珠区阅江西路222号', description: '广州的地标性建筑，是世界第四高塔，可以俯瞰整个广州城区。', cost: '¥150-220' },
          { name: '沙面岛', location: '广州市荔湾区沙面街道', description: '19世纪末期的欧洲风格建筑群，现为广州著名的旅游和婚纱摄影胜地。', cost: '免费' },
          { name: '陈家祠', location: '广州市荔湾区中山七路', description: '清代岭南古建筑的典范，精美的木雕、石雕、砖雕和陶塑闻名于世。', cost: '¥10-20' },
          { name: '白云山', location: '广州市白云区白云大道南', description: '广州市区内的一座著名山脉，是广州的"城市绿肺"。', cost: '¥5-20' },
          { name: '上下九步行街', location: '广州市荔湾区上下九路', description: '广州最古老的商业街之一，汇集了各种老字号和特色小吃。', cost: '免费' }
        ],
        restaurants: [
          { name: '广州酒家', location: '广州市越秀区文明路112号', description: '始创于1935年的老字号，以粤菜和点心闻名。', cost: '¥100-200/人' },
          { name: '陶陶居', location: '广州市荔湾区第十甫路20号', description: '创建于1880年的老字号，以早茶和点心闻名。', cost: '¥80-150/人' },
          { name: '莲香楼', location: '广州市荔湾区第十甫路67号', description: '始建于1889年的老字号，以传统粤式点心闻名。', cost: '¥80-150/人' },
          { name: '南园酒家', location: '广州市海珠区革新路', description: '创建于1935年的老字号，以粤菜和早茶闻名。', cost: '¥100-200/人' }
        ],
        dayDescriptions: [
          '体验广州现代都市魅力',
          '探索岭南文化与历史',
          '品尝地道广州早茶与美食',
          '感受花城绿色生态',
          '探索珠三角水乡风情'
        ],
        accommodation: '推荐入住越秀区或天河区的酒店，交通便利，周边设施齐全。豪华酒店价格在¥800-2000/晚，经济型酒店价格在¥200-500/晚。',
        transportation: '广州公共交通发达，地铁覆盖主要景点，单程票价¥2-8。出租车起步价¥10，景点间通常¥20-40。也可考虑共享单车短途代步。'
      },
      
      // 杭州景点
      '杭州': {
        attractions: [
          { name: '西湖', location: '杭州市西湖区', description: '中国十大风景名胜之一，以"西湖十景"闻名于世。', cost: '免费' },
          { name: '灵隐寺', location: '杭州市西湖区灵隐路法云弄1号', description: '中国佛教禅宗十大古刹之一，始建于东晋。', cost: '¥30-45' },
          { name: '千岛湖', location: '杭州市淳安县', description: '中国五大淡水湖之一，有1078个岛屿点缀其中。', cost: '¥150-180' },
          { name: '宋城景区', location: '杭州市西湖区之江路148号', description: '大型宋代文化主题公园，以《宋城千古情》表演闻名。', cost: '¥290' },
          { name: '西溪湿地', location: '杭州市西湖区天目山路518号', description: '中国首个国家级湿地公园，被誉为"城市中的绿肺"。', cost: '¥80' }
        ],
        restaurants: [
          { name: '楼外楼', location: '杭州市西湖区孤山路30号', description: '创建于1848年的老字号，以西湖醋鱼、东坡肉等杭帮菜闻名。', cost: '¥200-300/人' },
          { name: '知味观', location: '杭州市上城区河坊街92号', description: '创建于1913年的老字号，以小笼包、叫花鸡等特色菜闻名。', cost: '¥100-200/人' },
          { name: '外婆家', location: '杭州市西湖区黄龙路2号', description: '杭州本土连锁餐厅，提供平价杭帮家常菜。', cost: '¥80-150/人' },
          { name: '龙井茶室', location: '杭州市西湖区龙井路1号', description: '位于龙井村内，可以品尝正宗的龙井茶和当地小吃。', cost: '¥50-100/人' }
        ],
        dayDescriptions: [
          '漫步西湖，领略人间天堂美景',
          '探访古刹名胜与历史文化',
          '品味杭帮美食与龙井茶韵',
          '体验江南水乡风情',
          '探索杭州的现代与传统'
        ],
        accommodation: '推荐入住西湖周边的酒店，方便游览主要景点。豪华酒店价格在¥800-2000/晚，经济型酒店价格在¥300-600/晚。',
        transportation: '杭州公共交通便利，公交车和地铁可抵达主要景点。出租车起步价¥11，景点间通常¥20-40。西湖周边也可租赁自行车游览。'
      },
      
      // 成都景点
      '成都': {
        attractions: [
          { name: '成都大熊猫繁育研究基地', location: '成都市成华区熊猫大道1375号', description: '世界著名的大熊猫繁育和研究机构，可以近距离观看大熊猫。', cost: '¥58' },
          { name: '锦里古街', location: '成都市武侯区武侯祠大街231号', description: '成都最古老的商业街之一，有三国文化特色。', cost: '免费' },
          { name: '宽窄巷子', location: '成都市青羊区金河路口', description: '保存完好的清朝古街区，展示了成都的历史和文化。', cost: '免费' },
          { name: '武侯祠', location: '成都市武侯区武侯祠大街231号', description: '中国唯一的君臣合祀祠庙，祭祀刘备和诸葛亮。', cost: '¥60' },
          { name: '青城山', location: '成都市都江堰市青城山镇', description: '中国道教发源地之一，被誉为"青城天下幽"。', cost: '¥90' },
          { name: '都江堰', location: '成都市都江堰市公园路', description: '世界文化遗产，中国古代水利工程的杰出代表。', cost: '¥90' }
        ],
        restaurants: [
          { name: '陈麻婆豆腐', location: '成都市青羊区西玉龙街197号', description: '创建于1862年的老字号，以麻婆豆腐闻名。', cost: '¥80-150/人' },
          { name: '龙抄手', location: '成都市锦江区人民东路61号', description: '创建于1958年的老字号，以抄手（馄饨）闻名。', cost: '¥30-60/人' },
          { name: '夫妻肺片', location: '成都市锦江区盐市口顺城大街，', description: '成都特色小吃，以其麻辣鲜香的口味闻名。', cost: '¥40-80/人' },
          { name: '钟水饺', location: '成都市青羊区鼓楼街23号', description: '创建于1893年的老字号，以水饺和小吃闻名。', cost: '¥40-80/人' }
        ],
        dayDescriptions: [
          '萌趣熊猫与天府文化',
          '探索古蜀文明与三国遗迹',
          '品味成都麻辣美食与茶文化',
          '感受青城山道教文化与自然风光',
          '体验成都慢生活与休闲韵味'
        ],
        accommodation: '推荐入住春熙路、太古里或宽窄巷子附近的酒店，交通便利，周边设施齐全。豪华酒店价格在¥600-1500/晚，经济型酒店价格在¥200-500/晚。',
        transportation: '成都公共交通便利，地铁和公交车可抵达主要景点。出租车起步价¥8，景点间通常¥15-30。市区也可考虑共享单车短途代步。'
      }
    };
    
    // 如果找到城市数据，返回；否则返回默认数据
    for (const city in cityData) {
      if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
        return cityData[city];
      }
    }
    
    // 提供一个默认的数据结构
    return {
      attractions: [
        { name: `${cityName}著名景点1`, location: `${cityName}市中心`, description: '这是一个著名的旅游景点，您可以在这里体验当地文化。', cost: '¥100' },
        { name: `${cityName}历史博物馆`, location: `${cityName}文化区`, description: '了解当地历史和文化的重要场所。', cost: '¥80' },
        { name: `${cityName}公园`, location: `${cityName}休闲区`, description: '放松身心，欣赏美丽的自然风光的好去处。', cost: '¥50' },
        { name: `${cityName}古街`, location: `${cityName}老城区`, description: '充满历史韵味的古老街道，有许多特色店铺。', cost: '免费' }
      ],
      restaurants: [
        { name: `${cityName}特色餐厅`, location: `${cityName}市中心`, description: '提供当地特色美食，享受美妙的用餐体验。', cost: '¥150/人' },
        { name: `${cityName}美食广场`, location: `${cityName}商业区`, description: '汇集各种当地小吃和特色菜肴。', cost: '¥100/人' }
      ],
      dayDescriptions: [
        `探索${cityName}的主要景点`,
        `体验${cityName}的文化与历史`,
        `品味${cityName}的特色美食`,
        `感受${cityName}的自然风光`,
        `体验${cityName}的现代与传统`
      ],
      accommodation: `推荐入住${cityName}市中心附近的酒店，交通便利，周边设施齐全。`,
      transportation: `${cityName}公共交通便利，建议使用公交车、地铁或出租车前往各景点。`
    };
  };
  
  // 处理生成的行程数据
  const processGeneratedPlan = async (plan) => {
    try {
      // 模拟最后一步的进度
      setGenerationStep(generationSteps.length - 1);

      // 准备景点图片
      const attractions = [];

      // Convert AI-generated plan to tripDetails format
      const formattedDays = [];
      const destination = tripDetails?.tripInfo?.destination || '北京';
      if (plan.days && plan.days.length > 0) {
        for (const [dayIndex, day] of plan.days.entries()) {
          const places = [];

          if (day.activities) {
            const addresses = day.activities.map(act => act.location || act.name || destination);
            let coords = [];

            // 批量地理编码，失败时使用城市默认坐标
            try {
              coords = await batchGeocode(addresses, destination);
            } catch (geoError) {
              console.error('批量地理编码失败，使用城市默认坐标:', geoError);
              coords = [];
            }

            day.activities.forEach((activity, actIndex) => {
              const geocoded = coords[actIndex];
              const fallbackCoords = getCityDefaultCoords(destination);

              places.push({
                id: dayIndex * 100 + actIndex + 1,
                name: activity.name,
                type: activity.type === '景点' ? 'attraction' :
                      activity.type === '餐厅' ? 'restaurant' :
                      activity.type === '交通' ? 'transport' : 'other',
                timeStart: activity.time || '09:00',
                timeEnd: activity.time || '10:00',
                duration: activity.duration,
                description: activity.description || '',
                address: activity.location || '',
                openingHours: '9:00AM - 6:00PM',
                images: [],
                location: geocoded && geocoded.lat && geocoded.lng ? {
                  lat: geocoded.lat,
                  lng: geocoded.lng
                } : fallbackCoords
              });

              // Add to attractions list if it's a scenic spot
              if (activity.type === '景点' || activity.type === 'attraction') {
                attractions.push({
                  id: attractions.length + 101,
                  name: activity.name,
                  rating: 4.5 + Math.random() * 0.5,
                  reviewCount: Math.floor(Math.random() * 10000) + 500,
                  address: activity.location || tripDetails.tripInfo.destination,
                  suggestedDuration: activity.duration || '2-3小时',
                  isIncluded: true
                });
              }
            });
          }

          formattedDays.push({
            day: dayIndex + 1,
            date: day.date,
            dailyTimeRange: { start: 9, end: 19 },
            color: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'][dayIndex % 5],
            places: places
          });
        }
      }

      // Update trip details with generated itinerary
      setTripDetails(prev => ({
        ...prev,
        itinerary: {
          ...prev.itinerary,
          days: formattedDays,
          overview: plan.overview || '',
          tips: plan.tips || '',
          accommodation: plan.accommodation || '',
          transportation: plan.transportation || ''
        }
      }));

      // 更新景点列表
      setAllAttractions(attractions);

      // 延迟一段时间后结束生成过程
      setTimeout(() => {
        setIsGenerating(false);

        // 显示成功消息
        Modal.success({
          title: '行程已生成',
          content: '您的旅行计划已准备就绪，您可以查看并编辑详情。'
        });
      }, 2000);
    } catch (error) {
      console.error('处理生成的行程数据失败:', error);
      setIsGenerating(false);
      Modal.error({
        title: '行程生成失败',
        content: '处理AI生成的行程时出现错误，请重试。'
      });
    }
  };
  
  // 处理优化行程选项变更
  const handleOptimizationOptionChange = (option, checked) => {
    setOptimizationOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };
  
  // 执行AI行程优化
  const handleApplyAiOptimization = async () => {
    setAiOptimizationModalVisible(false);
    // 展示加载状态
    setIsGenerating(true);
    setGenerationStep(2); // 直接从优化路线步骤开始
    
    try {
      // 调用AI优化服务
      const optimizationResult = await optimizeTripPlan(tripDetails, optimizationOptions);
      
      // 这里需要处理优化结果，可能需要解析和应用到当前行程
      // 简单示例：显示优化建议
      setTimeout(() => {
        setIsGenerating(false);
        
        // 添加优化完成的反馈提示
        Modal.success({
          title: '行程优化完成',
          content: '您的行程已根据选择的偏好进行了优化',
          onOk: () => {
            // 可以在这里应用优化结果
          }
        });
      }, 3000);
    } catch (error) {
      setIsGenerating(false);
      Modal.error({
        title: '行程优化失败',
        content: error.message || '无法优化行程，请稍后重试'
      });
    }
  };
  
  // 处理地图显示模式变更
  const handleMapModeChange = e => {
    setMapDisplayMode(e.target.value);
  };
  
  // 处理日期选择变更
  const handleDaySelect = value => {
    setCurrentDayIndex(parseInt(value) + 1);
  };

  // 显示AI优化模态框
  const showAiOptimizationModal = () => {
    setAiOptimizationModalVisible(true);
  };
  
  // 添加手动开始生成函数
  // 开始AI生成行程 - 添加这个函数回来
  const handleStartAiGeneration = () => {
    setIsGenerating(true);
    setGenerationStep(0);
  };
  
  // 如果正在生成行程，显示生成进度界面
  if (isGenerating) {
    return (
      <GeneratingAnimation
        steps={generationSteps}
        currentStep={generationStep}
        destination={tripDetails?.tripInfo?.destination}
        title="正在为您规划完美行程"
      />
    );
  }

  if (loading) {
    return (
      <div className="container">
        <Header title="行程详情" showBackButton onBack={handleBack} />
        <div className="loading-container">
          <p>加载中...</p>
                  </div>
                  </div>
    );
  }
  
  if (!tripDetails) {
    return (
      <div className="container">
        <Header title="行程详情" showBackButton onBack={handleBack} />
        <div className="error-container">
          <p>未找到行程</p>
                </div>
              </div>
    );
  }
  
  return (
    <div className="itinerary-page" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#F5F5F7',
      minHeight: '100vh'
              }}>
      <Header title={tripDetails.tripInfo.title} showBackButton onBack={handleBack} />
      
      {/* 顶部操作栏 */}
      <div className="trip-action-bar" style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        boxShadow: '0 1px 10px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="trip-title">
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{tripDetails.tripInfo.title}</h1>
          <div style={{ marginTop: '5px' }}>
            <Tag color="blue">{tripDetails.tripInfo.startDate} - {tripDetails.tripInfo.endDate}</Tag>
            <Tag color="green">{tripDetails.tripInfo.destination}</Tag>
          </div>
        </div>
        <div className="trip-actions">
          <Button 
            type="primary"
            icon={<ThunderboltOutlined />} 
            onClick={handleStartAiGeneration}
            style={{ marginRight: '10px' }}
          >
            AI生成行程
          </Button>
          <Button 
            icon={<ThunderboltOutlined />} 
            onClick={showAiOptimizationModal}
            style={{ marginRight: '10px' }}
          >
            AI优化行程
          </Button>
          <Button 
            icon={<EditOutlined />} 
            style={{ marginRight: '10px' }}
          >
            编辑行程
          </Button>
          <Button 
            icon={<ShareAltOutlined />} 
            style={{ marginRight: '10px' }}
          >
            分享
          </Button>
          <Button 
            icon={<SaveOutlined />}
          >
            保存行程
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="trip-content" style={{
                  display: 'flex',
        height: 'calc(100vh - 120px)',
        padding: '20px'
                }}>
        {/* 左侧行程列表 */}
        <div className="trip-timeline" style={{
          width: '60%',
          marginRight: '20px'
        }}>
          <Tabs defaultActiveKey="itinerary" style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px' }}>
            <TabPane tab="行程安排" key="itinerary">
              {tripDetails.itinerary.days.map((day, index) => (
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>第 {index + 1} 天 ({day.date || '2023-06-0' + (index + 1)})</span>
                      <span style={{ fontSize: '14px', color: '#8c8c8c' }}>
                        {day.weather || (weatherInfo && weatherInfo.forecast[index] ? 
                          `${weatherInfo.forecast[index].condition} ${weatherInfo.forecast[index].low}°C - ${weatherInfo.forecast[index].high}°C` : 
                          '晴 18°C - 26°C')}
                  </span>
                      </div>
                  }
                  className="day-card"
                  key={index}
                  style={{ marginBottom: '15px' }}
                >
                  <Timeline>
                    {day.places.map((place, placeIndex) => (
                      <Timeline.Item 
                        key={placeIndex}
                        color={place.type === 'attraction' ? 'blue' : place.type === 'restaurant' ? 'green' : 'red'}
                      >
                        <div className="activity-item" style={{ marginBottom: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div className="activity-time" style={{ fontSize: '15px', color: '#1890ff', fontWeight: '500' }}>
                              {place.timeStart} - {place.timeEnd}
                  </div>
                            <div className="activity-duration" style={{ fontSize: '14px', color: '#8c8c8c' }}>
                              {place.duration || '约2小时'}
                </div>
                          </div>
                          
                          <div className="activity-title" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                            {place.name}
                    </div>
                          
                          <div className="activity-desc" style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                            {place.description || '这是一个著名的旅游景点，代表了中国的历史文化...'}
                      </div>
                          
                          {place.image && (
                            <UnsplashImage 
                              image={place.image} 
                              alt={`${place.name} photo`}
                              width={150} 
                              height={100} 
                              credit={place.imageCredit}
                            />
                          )}
                          
                          <div className="activity-actions" style={{ marginTop: '10px' }}>
                            <Button type="text" size="small" icon={<EditOutlined />} />
                            <Button type="text" size="small" icon={<DeleteOutlined />} />
                            <Button type="text" size="small" icon={<EnvironmentOutlined />}>在地图中显示</Button>
                </div>
              </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              ))}
            </TabPane>
            
            <TabPane tab="景点列表" key="attractions">
              <List
                itemLayout="horizontal"
                dataSource={allAttractions.length > 0 ? allAttractions : [
                  {
                    id: 101,
                    name: '故宫博物院',
                    image: '/image/beijing.jpg',
                    rating: 4.8,
                    reviewCount: 12564,
                    location: '北京市东城区景山前街4号',
                    suggestedDuration: '3-4小时',
                    isIncluded: true
                  },
                  {
                    id: 102,
                    name: '天安门广场',
                    image: '/image/beijing.jpg',
                    rating: 4.6,
                    reviewCount: 9876,
                    location: '北京市东城区东长安街',
                    suggestedDuration: '1-2小时',
                    isIncluded: true
                  }
                ]}
                renderItem={attraction => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<EnvironmentOutlined />}>查看位置</Button>,
                      <Button size="small" icon={attraction.isIncluded ? <CheckCircleFilled /> : <PlusOutlined />}>
                        {attraction.isIncluded ? '已添加' : '添加到行程'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        attraction.imageThumb ? (
                          <Avatar 
                            src={attraction.imageThumb} 
                            shape="square" 
                            size={64} 
                            alt={attraction.name}
                          />
                        ) : (
                          <Avatar 
                            src={attraction.image || '/image/beijing.jpg'} 
                            shape="square" 
                            size={64} 
                          />
                        )
                      }
                      title={attraction.name}
                      description={
                        <>
                          <Rate disabled defaultValue={attraction.rating || 4.5} /> {attraction.reviewCount || '暂无'}条评价
                          <br />
                          <EnvironmentOutlined /> {attraction.address || attraction.location || '未知位置'}
                          <br />
                          <ClockCircleOutlined /> 建议游览时间: {attraction.suggestedDuration || '2-3小时'}
                          {attraction.imageCredit && (
                            <div style={{ fontSize: '11px', marginTop: '4px' }}>
                              Photo: {attraction.imageCredit.photographer} / Unsplash
                            </div>
                          )}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
                      
            <TabPane tab="交通与住宿" key="logistics">
              <Collapse defaultActiveKey={['1']} ghost>
                <Collapse.Panel header="交通建议" key="1">
                  {(transportationOptions.length > 0 ? transportationOptions : [
                    {
                      id: 201,
                      type: '地铁',
                      from: '酒店',
                      to: '故宫博物院',
                      duration: '约25分钟',
                      cost: '¥5'
                    },
                    {
                      id: 202,
                      type: '出租车',
                      from: '故宫博物院',
                      to: '天安门广场',
                      duration: '约10分钟',
                      cost: '¥20'
                    }
                  ]).map((option, index) => (
                    <Card key={index} size="small" style={{ marginBottom: 10 }}>
                      <div className="transport-option" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="transport-type" style={{ fontWeight: '500' }}>
                          {option.type === '地铁' ? '🚇 ' : option.type === '出租车' ? '🚕 ' : '🚌 '}
                          {option.type}
                        </div>
                        <div className="transport-route">
                          {option.from} <ArrowRightOutlined /> {option.to}
                        </div>
                        <div className="transport-details">
                          <ClockCircleOutlined /> {option.duration}
                          <DollarOutlined style={{ marginLeft: '10px' }} /> {option.cost}
                      </div>
                        </div>
                    </Card>
                  ))}
                </Collapse.Panel>
                
                <Collapse.Panel header="住宿推荐" key="2">
                  {(accommodationOptions.length > 0 ? accommodationOptions : [
                    {
                      id: 301,
                      name: '北京王府井希尔顿酒店',
                      image: '/image/beijing.jpg',
                      rating: 4.6,
                      price: '¥880/晚',
                      location: '北京市东城区王府井东街8号'
                    },
                    {
                      id: 302,
                      name: '北京饭店诺金',
                      image: '/image/beijing.jpg',
                      rating: 4.5,
                      price: '¥960/晚',
                      location: '北京市东城区东长安街33号'
                    }
                  ]).map((hotel, index) => (
                    <Card key={index} size="small" style={{ marginBottom: 10 }}>
                      <div className="hotel-card" style={{ display: 'flex', alignItems: 'center' }}>
                        <Image src={hotel.image} width={100} height={70} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                        <div className="hotel-info" style={{ marginLeft: '15px', flex: 1 }}>
                          <div className="hotel-name" style={{ fontWeight: '500', fontSize: '16px' }}>{hotel.name}</div>
                          <div className="hotel-rating" style={{ margin: '5px 0' }}>
                            <Rate disabled defaultValue={hotel.rating} /> <span style={{ color: '#ff4d4f', fontWeight: '500' }}>{hotel.price}</span>
                        </div>
                          <div className="hotel-location" style={{ fontSize: '13px', color: '#8c8c8c' }}>
                            <EnvironmentOutlined /> {hotel.location || hotel.address || '未知位置'}
                        </div>
                      </div>
                        <Button size="small" type="primary">添加到行程</Button>
                        </div>
                    </Card>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </TabPane>
          </Tabs>
                      </div>
                      
        {/* 右侧地图区域 - 嵌入式可折叠地图 */}
        <div className="trip-map" style={{ width: '40%' }}>
          <Collapse defaultActiveKey={['map']} style={{ background: '#fff', borderRadius: 10 }}>
            <Collapse.Panel
              header="行程地图"
              key="map"
              extra={
                <Radio.Group value={mapDisplayMode} onChange={handleMapModeChange} size="small">
                  <Radio.Button value="daily">当日路线</Radio.Button>
                  <Radio.Button value="all">全程总览</Radio.Button>
                </Radio.Group>
              }
            >
              <div style={{ marginBottom: 12 }}>
                <Select
                  placeholder="选择日期查看"
                  style={{ width: 180 }}
                  value={Math.max(currentDayIndex - 1, 0)}
                  onChange={handleDaySelect}
                  disabled={!tripDetails.itinerary?.days?.length}
                >
                  {tripDetails.itinerary.days.map((day, index) => (
                    <Option key={index} value={index}>第 {index + 1} 天</Option>
                  ))}
                </Select>
              </div>
              <div style={{ height: MAP_CONTAINER_HEIGHT }}>
                <MapView
                  activities={getMapActivities()}
                  destination={tripDetails?.tripInfo?.destination}
                />
              </div>
            </Collapse.Panel>
          </Collapse>
        </div>
              </div>
              
      {/* 底部建议区域 */}
      {showAiSuggestions && (
        <div className="trip-suggestions" style={{ 
          padding: '0 20px 20px 20px'
        }}>
          <Card 
            title="AI个性化建议" 
            extra={<Button type="link" onClick={() => setShowAiSuggestions(false)}>隐藏</Button>}
            style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="ai-suggestions" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <Alert
                message="更佳体验建议"
                description={weatherInfo?.warning || "根据您的行程，建议将颐和园游玩安排在工作日，可以避开周末的人流高峰。"}
                type="info"
                showIcon
                style={{ flex: '1', minWidth: '300px' }}
              />
              <Alert
                message="当地美食推荐"
                description="您的行程经过王府井附近，推荐品尝老北京小吃如豆汁、炒肝等传统小吃。"
                type="success"
                showIcon
                style={{ flex: '1', minWidth: '300px' }}
              />
              <Alert
                message="天气提醒"
                description={`您出行期间${tripDetails.tripInfo.destination}可能有雨，建议携带雨具，并可考虑将室外活动调整至晴天。`}
                type="warning"
                showIcon
                style={{ flex: '1', minWidth: '300px' }}
              />
              </div>
          </Card>
          <UnsplashAttribution />
        </div>
      )}
      
      {/* AI 旅行助手 */}
      <AIChatDrawer tripDetails={tripDetails} />

      {/* AI优化行程模态框 */}
      <Modal
        title="AI行程优化"
        open={aiOptimizationModalVisible}
        onOk={handleApplyAiOptimization}
        onCancel={() => setAiOptimizationModalVisible(false)}
        okText="应用优化"
        cancelText="取消"
      >
        <p style={{ marginBottom: '20px' }}>请选择您希望AI优化的方向：</p>
        
        <div style={{ marginBottom: '15px' }}>
          <Checkbox 
            checked={optimizationOptions.reduceTravelTime}
            onChange={(e) => handleOptimizationOptionChange('reduceTravelTime', e.target.checked)}
          >
            优化游览顺序（减少交通时间）
          </Checkbox>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
                <Checkbox 
            checked={optimizationOptions.avoidCrowds}
            onChange={(e) => handleOptimizationOptionChange('avoidCrowds', e.target.checked)}
          >
            避开人流高峰（安排最佳游览时间）
          </Checkbox>
                    </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Checkbox 
            checked={optimizationOptions.budgetFriendly}
            onChange={(e) => handleOptimizationOptionChange('budgetFriendly', e.target.checked)}
          >
            降低行程成本（优化预算分配）
          </Checkbox>
                  </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Checkbox 
            checked={optimizationOptions.familyFriendly}
            onChange={(e) => handleOptimizationOptionChange('familyFriendly', e.target.checked)}
          >
            调整为亲子友好行程
                </Checkbox>
        </div>
      </Modal>
    </div>
  );
}

export default ItineraryPage; 
