import React from 'react';

/**
 * Unsplash Attribution 组件
 * 根据Unsplash API使用条款，应用需要提供适当的归属声明
 * 参考: https://help.unsplash.com/en/articles/2511315-guideline-attribution
 */
const UnsplashAttribution = () => {
  return (
    <div className="unsplash-attribution" style={{
      fontSize: '12px',
      color: '#666',
      textAlign: 'center',
      margin: '20px 0',
      padding: '10px'
    }}>
      景点图片由{' '}
      <a 
        href="https://unsplash.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#666',
          textDecoration: 'underline'
        }}
      >
        Unsplash
      </a>
      {' '}提供
    </div>
  );
};

export default UnsplashAttribution; 