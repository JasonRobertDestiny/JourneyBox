import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { getAllTrips } from '../api/tripService';
import '../styles/HomePage.css';

function HomePage() {
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // 从API获取行程数据
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await getAllTrips();
        // 只取前5个行程作为精选
        setFeaturedTrips(data.slice(0, 5));
      } catch (error) {
        console.error('获取行程数据失败', error);
        setError('获取行程数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, []);
  
  // 处理创建新行程按钮点击
  const handleCreateTrip = () => {
    navigate('/create-trip');
  };
  
  // 处理行程卡片点击
  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  // 页面动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 10, delay: 0.3 }
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  const handleImageError = (e, destination) => {
    e.target.onerror = null;
    // 根据目的地名称加载对应的本地图片
    const destinationLower = destination.toLowerCase();
    const availableImages = ['beijing', 'shanghai', 'guangzhou', 'hangzhou', 'chengdu'];
    
    if (availableImages.includes(destinationLower)) {
      e.target.src = `/image/${destinationLower}.jpg`;
    } else {
      // 默认使用北京图片
      e.target.src = '/image/beijing.jpg';
    }
  };

  // 获取特定城市的图片
  const getImageByDestination = (destination) => {
    const destinationLower = destination.toLowerCase();
    const availableImages = ['beijing', 'shanghai', 'guangzhou', 'hangzhou', 'chengdu'];
    
    if (availableImages.includes(destinationLower)) {
      return `/image/${destinationLower}.jpg`;
    } else {
      // 默认使用北京图片
      return '/image/beijing.jpg';
    }
  };

  return (
    <motion.div 
      className="home-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Header title="旅行助手" />
      
      <div className="home-content">
        {/* 创建行程区域 */}
        <motion.div 
          className="create-trip-area"
          variants={itemVariants}
        >
          <div className="earth-container">
            <motion.div 
              className="static-earth"
            >
              <div className="create-trip-button-container">
                <motion.button 
                  className="btn-create-trip"
                  onClick={handleCreateTrip}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  创建新的行程
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* 行程精选区域 */}
        <div className="featured-trips-area">
          <motion.section 
            className="featured-trips-section"
            variants={itemVariants}
          >
            <motion.h2 
              className="section-title"
              variants={itemVariants}
            >
              行程精选
            </motion.h2>
            
            {loading ? (
              <motion.div 
                className="loading-container"
                variants={itemVariants}
              >
                <motion.div 
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </motion.div>
            ) : error ? (
              <motion.div 
                className="error-message"
                variants={itemVariants}
              >
                {error}
              </motion.div>
            ) : (
              <motion.div 
                className="featured-trips-grid"
                variants={containerVariants}
              >
                {featuredTrips.map((trip, index) => {
                  return (
                    <motion.div 
                      key={trip.id} 
                      className="featured-trip-card"
                      onClick={() => handleTripClick(trip.id)}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
                        transition: { type: "spring", stiffness: 300, damping: 15 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div 
                        className="trip-image-container"
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <img 
                          src={trip.coverImage ? (trip.coverImage.startsWith('/') ? trip.coverImage : `/${trip.coverImage}`) : getImageByDestination(trip.destination)}
                          alt={trip.title}
                          className="trip-image"
                          onError={(e) => handleImageError(e, trip.destination)}
                        />
                      </motion.div>
                      <div className="trip-card-content">
                        <h3>{trip.title}</h3>
                        <p className="trip-destination">{trip.destination}</p>
                        <p className="trip-date">{trip.startDate} - {trip.endDate}</p>
                        <div className="trip-tags">
                          <span className="trip-tag">{
                            trip.travelType === 'self' ? '自由行' :
                            trip.travelType === 'group' ? '跟团游' :
                            trip.travelType === 'business' ? '商务出行' :
                            trip.travelType === 'study' ? '学习考察' :
                            trip.travelType === 'drive' ? '自驾游' :
                            trip.travelType === 'bicycle' ? '骑行' :
                            trip.travelType === 'train' ? '火车' :
                            trip.travelType === 'cruise' ? '邮轮' :
                            trip.travelType === 'hiking' ? '徒步' :
                            trip.travelType === 'camping' ? '露营' : '其他'
                          }</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}

export default HomePage; 