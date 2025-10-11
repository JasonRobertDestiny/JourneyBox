import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Tag,
  Slider,
  Row,
  Col,
  Space,
  Typography,
  Tooltip,
  Progress,
  Divider,
  message
} from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  WalletOutlined,
  HeartOutlined,
  CompassOutlined,
  RocketOutlined,
  HomeOutlined,
  CarOutlined,
  CoffeeOutlined,
  CameraOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Header from '../components/Header';
import { createTrip } from '../api/tripService';
import '../styles/CreateTripEnhanced.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { CheckableTag } = Tag;

function CreateTripEnhanced() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // 表单数据
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [budget, setBudget] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [participants, setParticipants] = useState([]);

  // 预定义选项
  const popularDestinations = [
    { name: '北京', icon: '🏛️', desc: '历史文化' },
    { name: '上海', icon: '🌃', desc: '现代都市' },
    { name: '杭州', icon: '🌸', desc: '江南风情' },
    { name: '成都', icon: '🐼', desc: '美食天堂' },
    { name: '西安', icon: '⚔️', desc: '古都风韵' },
    { name: '三亚', icon: '🏖️', desc: '海滨度假' },
    { name: '厦门', icon: '🌊', desc: '海上花园' },
    { name: '丽江', icon: '🏔️', desc: '雪山古城' },
    { name: '重庆', icon: '🌶️', desc: '山城火锅' },
    { name: '青岛', icon: '🍺', desc: '海滨啤酒' },
    { name: '大理', icon: '🦋', desc: '风花雪月' },
    { name: '苏州', icon: '🏮', desc: '园林古镇' }
  ];

  const interests = [
    { tag: '历史文化', icon: <HomeOutlined />, color: 'gold' },
    { tag: '自然风光', icon: <CompassOutlined />, color: 'green' },
    { tag: '美食探索', icon: <CoffeeOutlined />, color: 'orange' },
    { tag: '购物血拼', icon: <ShoppingOutlined />, color: 'magenta' },
    { tag: '摄影打卡', icon: <CameraOutlined />, color: 'cyan' },
    { tag: '休闲度假', icon: <SafetyCertificateOutlined />, color: 'blue' },
    { tag: '冒险刺激', icon: <RocketOutlined />, color: 'red' },
    { tag: '亲子游玩', icon: <TeamOutlined />, color: 'purple' }
  ];

  const travelStyles = [
    {
      value: 'relaxed',
      label: '轻松悠闲',
      icon: <CoffeeOutlined />,
      desc: '充足休息，慢节奏体验'
    },
    {
      value: 'balanced',
      label: '平衡适中',
      icon: <ClockCircleOutlined />,
      desc: '合理安排，劳逸结合'
    },
    {
      value: 'intensive',
      label: '紧凑充实',
      icon: <ThunderboltOutlined />,
      desc: '高效游览，体验最大化'
    }
  ];

  const participantOptions = [
    { value: 'solo', label: '独自旅行', icon: '🚶' },
    { value: 'couple', label: '情侣出行', icon: '💑' },
    { value: 'family', label: '家庭旅游', icon: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: '朋友结伴', icon: '👥' },
    { value: 'business', label: '商务出差', icon: '💼' }
  ];

  const budgetLabels = {
    1: '经济型',
    2: '舒适型',
    3: '品质型',
    4: '豪华型',
    5: '奢华型'
  };

  const budgetDescriptions = {
    1: '背包客，青旅民宿',
    2: '快捷酒店，经济餐饮',
    3: '星级酒店，特色美食',
    4: '高档酒店，精品餐厅',
    5: '奢华酒店，米其林餐厅'
  };

  // 步骤配置
  const steps = [
    {
      title: '选择目的地',
      icon: <EnvironmentOutlined />,
      description: '您想去哪里？'
    },
    {
      title: '选择日期',
      icon: <CalendarOutlined />,
      description: '什么时候出发？'
    },
    {
      title: '兴趣偏好',
      icon: <HeartOutlined />,
      description: '您喜欢什么？'
    },
    {
      title: '行程风格',
      icon: <CompassOutlined />,
      description: '如何安排行程？'
    }
  ];

  // 处理下一步
  const handleNext = () => {
    // 验证当前步骤
    if (currentStep === 0 && !destination) {
      message.warning('请选择或输入目的地');
      return;
    }
    if (currentStep === 1 && (!dateRange || dateRange.length === 0)) {
      message.warning('请选择出行日期');
      return;
    }
    if (currentStep === 2 && selectedInterests.length === 0) {
      message.warning('请至少选择一个兴趣偏好');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // 处理上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const tripData = {
        destination,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        budget: budgetLabels[budget],
        interests: selectedInterests,
        travelStyle,
        participants,
        title: `${destination}之旅`,
        notes: `预算：${budgetLabels[budget]}，风格：${travelStyles.find(s => s.value === travelStyle)?.label}`
      };

      const result = await createTrip(tripData);

      if (result && result.id) {
        message.success('行程创建成功！正在为您生成智能行程...');

        // 设置生成标记
        localStorage.setItem('startAiGeneration', 'true');

        // 跳转到行程页面
        setTimeout(() => {
          navigate(`/itinerary/${result.id}?generate=true`);
        }, 1000);
      }
    } catch (error) {
      console.error('创建行程失败:', error);
      message.error('创建行程失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 选择目的地
        return (
          <div className="step-content">
            <Title level={3}>选择您的目的地</Title>
            <Paragraph type="secondary">选择热门目的地或输入自定义地点</Paragraph>

            {/* 热门目的地 */}
            <div className="destination-grid">
              {popularDestinations.map(dest => (
                <Card
                  key={dest.name}
                  hoverable
                  className={`destination-card ${destination === dest.name ? 'selected' : ''}`}
                  onClick={() => setDestination(dest.name)}
                >
                  <div className="destination-icon">{dest.icon}</div>
                  <div className="destination-name">{dest.name}</div>
                  <div className="destination-desc">{dest.desc}</div>
                </Card>
              ))}
            </div>

            <Divider>或</Divider>

            {/* 自定义输入 */}
            <Input
              size="large"
              placeholder="输入其他目的地..."
              prefix={<EnvironmentOutlined />}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{ maxWidth: 400, margin: '0 auto', display: 'block' }}
            />
          </div>
        );

      case 1: // 选择日期
        return (
          <div className="step-content">
            <Title level={3}>选择出行日期</Title>
            <Paragraph type="secondary">选择您的出发和返回日期</Paragraph>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <RangePicker
                size="large"
                format="YYYY-MM-DD"
                value={dateRange}
                onChange={setDateRange}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                style={{ width: 400 }}
                placeholder={['出发日期', '返回日期']}
              />

              {dateRange && dateRange.length === 2 && (
                <div className="date-summary">
                  <Card style={{ marginTop: 30, maxWidth: 400, margin: '30px auto' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text type="secondary">行程天数</Text>
                        <Title level={4}>
                          {dateRange[1].diff(dateRange[0], 'days') + 1} 天
                        </Title>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">预计花费</Text>
                        <Title level={4}>
                          ¥{(dateRange[1].diff(dateRange[0], 'days') + 1) * budget * 1000}
                        </Title>
                      </Col>
                    </Row>
                  </Card>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // 兴趣偏好
        return (
          <div className="step-content">
            <Title level={3}>选择您的兴趣偏好</Title>
            <Paragraph type="secondary">告诉我们您喜欢什么，我们将为您定制行程</Paragraph>

            <div className="interests-container">
              {interests.map(interest => (
                <CheckableTag
                  key={interest.tag}
                  checked={selectedInterests.includes(interest.tag)}
                  onChange={checked => {
                    if (checked) {
                      setSelectedInterests([...selectedInterests, interest.tag]);
                    } else {
                      setSelectedInterests(selectedInterests.filter(t => t !== interest.tag));
                    }
                  }}
                  className="interest-tag"
                >
                  <Space>
                    {interest.icon}
                    {interest.tag}
                  </Space>
                </CheckableTag>
              ))}
            </div>

            <Divider />

            {/* 预算滑块 */}
            <div className="budget-section">
              <Title level={4}>
                <WalletOutlined /> 预算水平
              </Title>
              <div style={{ maxWidth: 500, margin: '20px auto' }}>
                <Slider
                  min={1}
                  max={5}
                  value={budget}
                  onChange={setBudget}
                  marks={budgetLabels}
                  tooltip={{ formatter: (value) => budgetLabels[value] }}
                />
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Title level={4}>{budgetLabels[budget]}</Title>
                  <Text type="secondary">{budgetDescriptions[budget]}</Text>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // 行程风格
        return (
          <div className="step-content">
            <Title level={3}>选择行程风格</Title>
            <Paragraph type="secondary">根据您的偏好安排每日行程</Paragraph>

            <Row gutter={16} style={{ marginTop: 40 }}>
              {travelStyles.map(style => (
                <Col span={8} key={style.value}>
                  <Card
                    hoverable
                    className={`style-card ${travelStyle === style.value ? 'selected' : ''}`}
                    onClick={() => setTravelStyle(style.value)}
                  >
                    <div className="style-icon">{style.icon}</div>
                    <Title level={4}>{style.label}</Title>
                    <Text type="secondary">{style.desc}</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider />

            {/* 出行人员 */}
            <div className="participants-section">
              <Title level={4}>
                <TeamOutlined /> 出行人员
              </Title>
              <Select
                mode="multiple"
                size="large"
                placeholder="选择出行人员类型"
                value={participants}
                onChange={setParticipants}
                style={{ width: '100%', maxWidth: 500, display: 'block', margin: '20px auto' }}
              >
                {participantOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <Space>
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-trip-enhanced">
      <Header title="创建新行程" showBackButton />

      <div className="container">
        {/* 进度条 */}
        <div className="steps-progress">
          <Progress
            percent={((currentStep + 1) / steps.length) * 100}
            showInfo={false}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div className="steps-indicators">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`step-indicator ${
                  index < currentStep ? 'completed' :
                  index === currentStep ? 'active' : ''
                }`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 主内容区 */}
        <Card className="main-card">
          {renderStepContent()}

          {/* 操作按钮 */}
          <div className="action-buttons">
            <Button
              size="large"
              disabled={currentStep === 0}
              onClick={handlePrev}
            >
              上一步
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleNext}
              icon={currentStep === steps.length - 1 ? <RocketOutlined /> : null}
            >
              {currentStep === steps.length - 1 ? '开始生成行程' : '下一步'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CreateTripEnhanced;