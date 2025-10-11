import React from 'react';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PictureOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Button } from 'antd';
import '../styles/ActivityCard.css';

function ActivityCard({ activity, index }) {
  const getActivityIcon = (type) => {
    const icons = {
      'attraction': '🏛️',
      'restaurant': '🍽️',
      'accommodation': '🏨',
      'transportation': '🚗',
      'shopping': '🛍️',
      'default': '📍'
    };
    return icons[type] || icons.default;
  };

  const handleBooking = () => {
    // 预约逻辑 - 可以打开外部链接或显示预约模态框
    if (activity.bookingUrl) {
      window.open(activity.bookingUrl, '_blank');
    } else {
      console.log('预约:', activity.name);
    }
  };

  const handleLearnMore = () => {
    // 了解更多逻辑
    if (activity.learnMoreUrl) {
      window.open(activity.learnMoreUrl, '_blank');
    } else {
      console.log('了解更多:', activity.name);
    }
  };

  return (
    <div className="enhanced-activity-card">
      <div className="card-header">
        <div className="card-title">
          <span className="activity-icon">{getActivityIcon(activity.type)}</span>
          <h3>{activity.name}</h3>
        </div>
        <div className="time-range">
          <ClockCircleOutlined />
          <span>{activity.time || '09:00'} - {activity.duration}</span>
        </div>
      </div>

      <div className="card-images">
        {activity.images && activity.images.length > 0 ? (
          activity.images.slice(0, 3).map((image, idx) => (
            <div key={idx} className="image-slot">
              <img src={image} alt={`${activity.name} ${idx + 1}`} />
            </div>
          ))
        ) : (
          // 占位图片
          [1, 2, 3].map((idx) => (
            <div key={idx} className="image-slot placeholder">
              <PictureOutlined />
            </div>
          ))
        )}
      </div>

      <div className="card-info">
        <div className="info-row">
          <EnvironmentOutlined />
          <span className="location">{activity.address || activity.location || '地址信息'}</span>
        </div>

        {activity.description && (
          <p className="description">{activity.description}</p>
        )}

        <div className="info-row">
          <DollarOutlined />
          <span className="cost">{activity.cost || '费用待定'}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="learn-more" onClick={handleLearnMore}>
          了解更多...
          <RightOutlined />
        </button>
      </div>

      <Button
        type="primary"
        size="large"
        block
        className="booking-button"
        onClick={handleBooking}
      >
        一键预约购票
      </Button>
    </div>
  );
}

export default ActivityCard;