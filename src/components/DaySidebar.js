import React from 'react';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import '../styles/DaySidebar.css';

function DaySidebar({ days, activeDay, onDayChange, tripInfo }) {
  const getDayDate = (index) => {
    if (!tripInfo.startDate) return '';
    const startDate = new Date(tripInfo.startDate);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return currentDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="day-sidebar">
      <div className="sidebar-header">
        <CalendarOutlined />
        <span>行程安排</span>
      </div>

      <div className="day-list">
        {days && days.map((day, index) => (
          <div
            key={index}
            className={`day-item ${activeDay === index ? 'active' : ''}`}
            onClick={() => onDayChange(index)}
          >
            <div className="day-header">
              <span className="day-number">第{index + 1}天</span>
              <span className="day-date">{getDayDate(index)}</span>
            </div>

            {activeDay === index && day.activities && (
              <div className="day-activities">
                {day.activities.slice(0, 3).map((activity, actIndex) => (
                  <div key={actIndex} className="activity-preview">
                    <ClockCircleOutlined />
                    <span className="activity-time">{activity.time || '09:00'}</span>
                    <span className="activity-name">{activity.name}</span>
                  </div>
                ))}
                {day.activities.length > 3 && (
                  <div className="more-activities">
                    +{day.activities.length - 3} 更多活动
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DaySidebar;