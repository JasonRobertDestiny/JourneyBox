import React from 'react';
import { Progress, Spin } from 'antd';
import { LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import '../styles/GeneratingAnimation.css';

const GeneratingAnimation = ({
  steps,
  currentStep,
  destination,
  title = "正在为您规划完美行程"
}) => {
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="generating-animation-wrapper">
      {/* 背景动画 */}
      <div className="animated-background">
        <div className="plane-animation">✈️</div>
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">☁️</div>
      </div>

      <div className="generating-content">
        {/* 主标题 */}
        <div className="main-title">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} />}
            spinning={true}
          />
          <h1>{title}</h1>
          <p className="destination-text">
            {destination && `目的地：${destination}`}
          </p>
        </div>

        {/* 进度条 */}
        <div className="progress-section">
          <Progress
            percent={progressPercent}
            strokeColor={{
              '0%': '#667eea',
              '100%': '#764ba2',
            }}
            strokeWidth={12}
            showInfo={false}
          />
        </div>

        {/* 步骤列表 */}
        <div className="steps-list">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-item ${
                index < currentStep ? 'completed' :
                index === currentStep ? 'active' : 'pending'
              }`}
            >
              <div className="step-icon">
                {index < currentStep ? (
                  <CheckCircleFilled style={{ color: '#52c41a' }} />
                ) : index === currentStep ? (
                  <LoadingOutlined style={{ color: '#1890ff' }} />
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <div className="step-content">
                <span className="step-text">{step}</span>
                {index === currentStep && (
                  <div className="step-progress">
                    <div className="progress-dot"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="tips-section">
          <div className="tips-carousel">
            <div className="tip-item">
              💡 AI正在分析数千个景点和餐厅数据
            </div>
            <div className="tip-item">
              🗺️ 优化路线规划，减少交通时间
            </div>
            <div className="tip-item">
              🎯 根据您的喜好定制专属行程
            </div>
          </div>
        </div>

        {/* 预计时间 */}
        <div className="estimate-time">
          <span className="time-label">预计剩余时间：</span>
          <span className="time-value">
            {Math.max(0, (steps.length - currentStep - 1) * 2)} 秒
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeneratingAnimation;