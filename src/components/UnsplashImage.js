import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { trackPhotoDownload } from '../api/unsplashService';

/**
 * 用于显示Unsplash图片的组件，自动包含必要的归属信息
 */
const UnsplashImage = ({ image, alt, size = 'regular', borderRadius = '8px', aspectRatio = '16/9', showAttribution = true, onLoad, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDownloadTracked, setIsDownloadTracked] = useState(false);
  const [isLocalImage, setIsLocalImage] = useState(false);
  
  // 检查是否是本地图片
  useEffect(() => {
    if (image) {
      setIsLocalImage(image.isLocal === true || image.id?.startsWith('local-'));
    }
  }, [image]);
  
  // 根据尺寸选择URL
  const getImageUrl = () => {
    if (!image) return '';
    
    if (isLocalImage) {
      return image.url || image.small || image.thumb;
    }
    
    switch (size) {
      case 'small':
        return image.small;
      case 'thumb':
        return image.thumb;
      case 'regular':
      default:
        return image.url;
    }
  };
  
  // 图片加载完成处理
  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    
    // 仅对非本地图片记录下载
    if (!isDownloadTracked && !isLocalImage && image && image.id) {
      // 记录下载统计（按照Unsplash要求）
      trackPhotoDownload(image.id)
        .then(() => setIsDownloadTracked(true))
        .catch(err => console.error('跟踪图片下载失败:', err));
    }
    
    // 调用外部onLoad回调
    if (onLoad) onLoad();
  };
  
  // 图片加载失败处理
  const handleImageError = () => {
    setHasError(true);
    
    // 尝试使用本地备用图片
    setIsLocalImage(true);
  };
  
  // 处理图片点击
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };
  
  // 图片容器样式
  const containerStyle = {
    position: 'relative',
    borderRadius,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    aspectRatio,
    cursor: onClick ? 'pointer' : 'default',
  };
  
  // 图片样式
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
  };
  
  // 加载中显示样式
  const loadingStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  };
  
  // 备用图片 URL
  const getFallbackImageUrl = () => {
    const destinations = ['beijing', 'shanghai', 'guangzhou', 'hangzhou', 'chengdu'];
    const randomIndex = Math.floor(Math.random() * destinations.length);
    return `/image/${destinations[randomIndex]}.jpg`;
  };
  
  // 如果没有图片数据，显示备用图片
  if (!image) {
    return (
      <div style={containerStyle} onClick={handleClick}>
        <img 
          src={getFallbackImageUrl()}
          alt={alt || '旅行图片'} 
          style={imageStyle}
          onLoad={handleImageLoad}
        />
        <div style={loadingStyle}>加载中...</div>
      </div>
    );
  }
  
  return (
    <div style={containerStyle} onClick={handleClick}>
      <img 
        src={getImageUrl()}
        alt={alt || image.alt || '旅行图片'} 
        style={imageStyle}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <div style={loadingStyle}>加载中...</div>
      
      {showAttribution && !isLocalImage && isLoaded && image.photographer && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: '4px 8px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          fontSize: '10px',
          borderTopLeftRadius: '4px',
        }}>
          Photo by <a 
            href={`${image.photographer.link}?utm_source=travel_assistant&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            {image.photographer.name}
          </a> on <a 
            href="https://unsplash.com/?utm_source=travel_assistant&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
};

UnsplashImage.propTypes = {
  // 图片信息，可以是URL字符串或包含url属性的对象
  image: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      photographer: PropTypes.shape({
        name: PropTypes.string,
        username: PropTypes.string,
        link: PropTypes.string
      })
    })
  ]).isRequired,
  // 图片的替代文本
  alt: PropTypes.string,
  // 图片宽度
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // 图片高度
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // 额外的样式
  style: PropTypes.object,
  // 额外的信用信息
  credit: PropTypes.shape({
    photographer: PropTypes.string,
    username: PropTypes.string,
    link: PropTypes.string
  }),
  // 图片尺寸
  size: PropTypes.oneOf(['small', 'thumb', 'regular']),
  // 图片边框圆角
  borderRadius: PropTypes.string,
  // 图片比例
  aspectRatio: PropTypes.string,
  // 是否显示归属信息
  showAttribution: PropTypes.bool,
  // 图片加载完成回调
  onLoad: PropTypes.func,
  // 图片点击回调
  onClick: PropTypes.func
};

export default UnsplashImage; 