import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getTripById, getTripDetailsById } from '../api/tripService';
import { motion } from 'framer-motion';
import { getDestinationImage, handleImageError } from '../utils/imageUtils';

function TripDetailPage() {
  const [trip, setTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const data = await getTripById(parseInt(id));
        setTrip(data);
        
        // 获取行程详情
        const details = await getTripDetailsById(parseInt(id));
        setTripDetails(details);
      } catch (error) {
        console.error('获取行程详情失败', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewItinerary = () => {
    navigate(`/itinerary/${id}`);
  };

  // 动画变体定义
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      }
    }
  };

  const imageVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 20, 
        duration: 0.4 
      }
    }
  };

  const listItemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.05 * i
      }
    })
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      }
    },
    hover: { 
      scale: 1.03, 
      boxShadow: '0 6px 20px rgba(0, 122, 255, 0.35)',
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.97 }
  };

  if (loading) {
    return (
      <div className="container">
        <Header title="行程详情" showBackButton onBack={handleBack} />
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh'
        }}>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 122, 255, 0.2)',
              borderTop: '3px solid rgba(0, 122, 255, 1)',
              borderRadius: '50%'
            }}
          />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container">
        <Header title="行程详情" showBackButton onBack={handleBack} />
        <div className="error-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
          color: '#FF3B30'
        }}>
          <p>未找到行程</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container" 
      style={{
        backgroundColor: '#F5F5F7',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Header title={trip.title} showBackButton onBack={handleBack} />
      
      <main className="content" style={{ padding: '0 20px' }}>
        <motion.div 
          className="trip-detail"
          variants={itemVariants}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            marginTop: '20px'
          }}
        >
          <motion.div 
            className="trip-detail-header"
            variants={itemVariants}
            style={{ 
              position: 'relative',
              height: '240px',
              overflow: 'hidden'
            }}
          >
            <motion.img 
              variants={imageVariants}
              src={getDestinationImage(trip.destination, trip.coverImage)}
              alt={trip.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => handleImageError(e, trip.destination)}
            />
            <motion.div 
              variants={itemVariants}
              style={{ 
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                padding: '30px 20px 20px',
                color: 'white',
              }}
            >
              <motion.h2 
                variants={itemVariants}
                style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: '600' }}
              >
                {trip.destination}
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: '0.9' }}
              >
                {trip.startDate} - {trip.endDate}
              </motion.p>
              <motion.span 
                variants={itemVariants}
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: 'rgba(0, 122, 255, 0.9)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {
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
                }
              </motion.span>
            </motion.div>
          </motion.div>
          
          <div className="trip-detail-content" style={{ padding: '24px' }}>
            {trip.notes && (
              <motion.div 
                className="trip-detail-notes"
                variants={itemVariants}
                style={{ marginBottom: '24px' }}
              >
                <motion.h3 
                  variants={itemVariants}
                  style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', marginBottom: '12px' }}
                >
                  旅行笔记
                </motion.h3>
                <motion.p 
                  variants={itemVariants}
                  style={{ fontSize: '16px', lineHeight: '1.5', color: '#494949' }}
                >
                  {trip.notes}
                </motion.p>
              </motion.div>
            )}
            
            <motion.div 
              className="trip-detail-itinerary"
              variants={itemVariants}
            >
              <motion.h3 
                variants={itemVariants}
                style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', marginBottom: '16px' }}
              >
                行程概览
              </motion.h3>
              {tripDetails && tripDetails.itinerary && tripDetails.itinerary.days ? (
                <motion.div 
                  className="itinerary-overview"
                  variants={itemVariants} 
                  style={{ backgroundColor: '#F5F5F7', padding: '20px', borderRadius: '12px' }}
                >
                  <motion.p 
                    variants={itemVariants}
                    style={{ fontSize: '16px', color: '#494949', marginBottom: '16px' }}
                  >
                    共 <span style={{ fontWeight: '600', color: '#007AFF' }}>{tripDetails.itinerary.days.length}</span> 天行程，涵盖 
                    <span style={{ fontWeight: '600', color: '#007AFF' }}> {
                      tripDetails.itinerary.days.reduce((acc, day) => acc + day.places.length, 0)
                    } </span>个景点/活动。
                  </motion.p>
                  
                  <motion.div 
                    className="trip-highlights"
                    variants={itemVariants}
                    style={{ margin: '20px 0' }}
                  >
                    <motion.h4 
                      variants={itemVariants}
                      style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F', marginBottom: '12px' }}
                    >
                      行程亮点
                    </motion.h4>
                    <motion.ul 
                      variants={itemVariants}
                      style={{ paddingLeft: '0', listStyleType: 'none' }}
                    >
                      {tripDetails.itinerary.days.slice(0, 2).map((day, index) => (
                        <motion.li 
                          key={day.day}
                          custom={index}
                          variants={listItemVariants}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            marginBottom: '10px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                          }}
                        >
                          <strong style={{ color: '#007AFF' }}>第{day.day}天: </strong>
                          {day.places.slice(0, 2).map(place => place.name).join('、')}
                          {day.places.length > 2 ? ' 等' : ''}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                  
                  <motion.button 
                    onClick={handleViewItinerary}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    style={{
                      backgroundColor: '#007AFF',
                      color: 'white',
                      border: 'none',
                      padding: '14px 20px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'block',
                      width: '100%',
                      marginTop: '20px',
                      boxShadow: '0 4px 12px rgba(0, 122, 255, 0.25)'
                    }}
                  >
                    查看详细行程安排
                  </motion.button>
                </motion.div>
              ) : (
                <motion.p 
                  variants={itemVariants}
                  style={{ color: '#8E8E93', textAlign: 'center', padding: '30px 0' }}
                >
                  暂无行程安排
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default TripDetailPage; 