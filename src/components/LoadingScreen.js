import React from 'react';
import { Spin } from 'antd';
import { CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';

// 加载中屏幕组件，用于显示行程生成过程
const LoadingScreen = ({ currentStep, steps }) => {
  return (
    <div className="generating-trip-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#f5f7fa'
    }}>
      <div className="generating-animation" style={{
        maxWidth: '600px',
        width: '100%', 
        padding: '30px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}>
        <Spin size="large" />
        <h2 style={{ margin: '20px 0', fontSize: '24px', color: '#333' }}>正在为您规划完美行程</h2>
        
        <div className="generation-steps" style={{
          margin: '30px 0',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px'
        }}>
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step-item ${index < currentStep ? 'completed' : index === currentStep ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
                color: index < currentStep ? '#52c41a' : index === currentStep ? '#1890ff' : '#aaa'
              }}
            >
              {index < currentStep ? (
                <CheckCircleFilled style={{ fontSize: '20px', marginRight: '12px' }} />
              ) : index === currentStep ? (
                <LoadingOutlined style={{ fontSize: '20px', marginRight: '12px' }} />
              ) : (
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%',
                  border: '1px solid #aaa',
                  marginRight: '12px'
                }}></div>
              )}
              <span style={{ 
                fontSize: '16px', 
                fontWeight: index <= currentStep ? '500' : 'normal'
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>
        
        <p className="generation-tip" style={{ 
          color: '#888', 
          fontSize: '15px', 
          fontStyle: 'italic',
          margin: '20px 0' 
        }}>
          正在为您的旅行寻找最佳体验...
        </p>
          
        <div className="progress-bar" style={{ 
          height: '6px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '3px', 
          overflow: 'hidden',
          margin: '30px 0'
        }}>
          <div className="progress-bar-fill" style={{ 
            height: '100%', 
            backgroundColor: '#1890ff',
            width: `${(currentStep / steps.length) * 100}%`,
            transition: 'width 0.5s ease'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 