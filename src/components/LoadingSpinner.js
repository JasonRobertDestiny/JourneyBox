import React from 'react';

/**
 * 简单的加载指示器组件
 * 显示一个旋转的圆形加载动画
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-text">加载中...</p>
    </div>
  );
};

export default LoadingSpinner; 