import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Row, Col, Progress, Card } from 'antd';
import {
  CompassOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import '../styles/GeneratingTripPage.css';

const GeneratingTripPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <EnvironmentOutlined />,
      title: '收集目的地信息',
      description: '分析城市特色与旅游资源',
      duration: 2000,
      color: '#1890ff'
    },
    {
      icon: <CompassOutlined />,
      title: '分析最佳景点组合',
      description: '智能匹配您的兴趣偏好',
      duration: 2500,
      color: '#52c41a'
    },
    {
      icon: <FileTextOutlined />,
      title: '优化行程路线',
      description: '确保时间安排合理高效',
      duration: 2000,
      color: '#faad14'
    },
    {
      icon: <RocketOutlined />,
      title: '生成详细行程计划',
      description: '包含景点、美食、交通建议',
      duration: 1500,
      color: '#722ed1'
    }
  ];

  useEffect(() => {
    const tripId = location.state?.tripId;

    if (!tripId) {
      console.warn('缺少 tripId,返回首页');
      navigate('/');
      return;
    }

    let progressTimer;
    let stepTimer;
    let isActive = true;

    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    // 进度条平滑增长
    const startTime = Date.now();
    progressTimer = setInterval(() => {
      if (!isActive) return;

      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 99);
      setProgress(newProgress);
    }, 50);

    // 步骤切换逻辑
    let currentStepIndex = 0;

    const advanceStep = () => {
      if (!isActive) return;

      if (currentStepIndex < steps.length) {
        setCurrentStep(currentStepIndex);

        stepTimer = setTimeout(() => {
          currentStepIndex++;
          if (currentStepIndex < steps.length) {
            advanceStep();
          } else {
            // 所有步骤完成
            if (isActive) {
              setProgress(100);
              setTimeout(() => {
                if (isActive) {
                  navigate(`/itinerary/${tripId}`, { replace: true });
                }
              }, 800);
            }
          }
        }, steps[currentStepIndex].duration);
      }
    };

    advanceStep();

    return () => {
      isActive = false;
      clearInterval(progressTimer);
      clearTimeout(stepTimer);
    };
  }, [navigate, location.state?.tripId, steps]);

  return (
    <div className="generating-trip-page">
      {/* 动态背景 */}
      <div className="animated-background">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <div className="generating-content">
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={20} md={18} lg={16} xl={14} xxl={12}>
            {/* 主标题区 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="title-section"
            >
              <div className="main-icon-wrapper">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <CompassOutlined className="main-icon" />
                </motion.div>
              </div>
              <h1 className="generating-title">正在生成您的专属旅行计划</h1>
              <p className="generating-subtitle">AI 智能规划师正在为您量身定制完美行程</p>
            </motion.div>

            {/* 进度条 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="progress-section"
            >
              <Progress
                percent={Math.round(progress)}
                strokeColor={{
                  '0%': '#1890ff',
                  '50%': '#52c41a',
                  '100%': '#722ed1'
                }}
                strokeWidth={14}
                trailColor="rgba(255, 255, 255, 0.12)"
                showInfo={true}
                format={percent => (
                  <span className="progress-text">
                    {percent}%
                  </span>
                )}
              />
            </motion.div>

            {/* 步骤卡片列表 */}
            <div className="steps-container">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isPending = index > currentStep;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{
                      opacity: isPending ? 0.3 : 1,
                      x: 0,
                      scale: isActive ? 1.02 : 0.98
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`step-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <Card
                      bordered={false}
                      className="step-card-inner"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${step.color}25 0%, ${step.color}08 100%)`
                          : isCompleted
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 0.04)',
                        borderLeft: isActive ? `4px solid ${step.color}` : '4px solid transparent',
                        boxShadow: isActive ? `0 8px 24px ${step.color}30` : '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Row align="middle" gutter={20}>
                        {/* 图标 */}
                        <Col flex="none">
                          <div
                            className="step-icon-wrapper"
                            style={{
                              background: isCompleted || isActive ? step.color : 'rgba(255, 255, 255, 0.15)',
                              boxShadow: isActive ? `0 0 24px ${step.color}60` : 'none'
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircleOutlined className="step-icon completed-icon" />
                            ) : (
                              <motion.div
                                animate={isActive ? {
                                  scale: [1, 1.15, 1],
                                  rotate: [0, 8, -8, 0]
                                } : {}}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {React.cloneElement(step.icon, { className: 'step-icon' })}
                              </motion.div>
                            )}
                          </div>
                        </Col>

                        {/* 文本内容 */}
                        <Col flex="auto">
                          <div className="step-text">
                            <h3 className="step-title" style={{ opacity: isPending ? 0.5 : 1 }}>
                              {step.title}
                            </h3>
                            <p className="step-description" style={{ opacity: isPending ? 0.4 : 0.85 }}>
                              {step.description}
                            </p>
                          </div>
                        </Col>

                        {/* 加载指示器 */}
                        {isActive && (
                          <Col flex="none">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                              className="step-loading-spinner"
                              style={{ borderTopColor: step.color }}
                            />
                          </Col>
                        )}
                      </Row>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* 底部提示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="tips-section"
            >
              <LoadingOutlined className="tips-icon" />
              <p className="tips-text">
                生成过程需要 30-60 秒,请耐心等待...
              </p>
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default GeneratingTripPage;
