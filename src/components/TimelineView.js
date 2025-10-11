import React from 'react';
import { ClockCircleOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import '../styles/TimelineView.css';

// Activity类型对应的图标和颜色
const activityConfig = {
  attraction: { icon: '🏛️', color: '#1890ff', label: '景点' },
  restaurant: { icon: '🍽️', color: '#52c41a', label: '餐厅' },
  transportation: { icon: '🚗', color: '#faad14', label: '交通' },
  accommodation: { icon: '🏨', color: '#722ed1', label: '住宿' },
  default: { icon: '📍', color: '#8c8c8c', label: '活动' }
};

// 活动卡片组件
function ActivityCard({ activity }) {
  const config = activityConfig[activity.type] || activityConfig.default;

  return (
    <div className="activity-card" style={{ borderLeftColor: config.color }}>
      <div className="activity-header">
        <span className="activity-icon">{config.icon}</span>
        <span className="activity-type-label" style={{ color: config.color }}>
          {config.label}
        </span>
        <span className="activity-time">
          <ClockCircleOutlined /> {activity.time}
        </span>
        {activity.duration && (
          <span className="activity-duration">({activity.duration})</span>
        )}
      </div>
      <h4 className="activity-name">{activity.name}</h4>
      {activity.address && (
        <p className="activity-location">
          <EnvironmentOutlined /> {activity.address}
        </p>
      )}
      {activity.description && (
        <p className="activity-description">{activity.description}</p>
      )}
      {activity.cost && (
        <p className="activity-cost">
          <DollarOutlined /> 预计费用: {activity.cost}
        </p>
      )}
    </div>
  );
}

// 日期卡片组件
function DayCard({ day, dayNumber }) {
  return (
    <div className="day-column">
      <div className="day-header">
        <h3 className="day-title">第 {dayNumber} 天</h3>
        <p className="day-date">{day.date}</p>
        {day.dayOverview && <p className="day-overview">{day.dayOverview}</p>}
      </div>
      <div className="activities-list">
        {day.activities && day.activities.length > 0 ? (
          day.activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))
        ) : (
          <div className="no-activities">暂无活动安排</div>
        )}
      </div>
    </div>
  );
}

// 时间轴视图主组件
function TimelineView({ days }) {
  if (!days || days.length === 0) {
    return (
      <div className="timeline-empty">
        <p>暂无行程安排</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-grid">
        {days.map((day, index) => (
          <DayCard key={index} day={day} dayNumber={index + 1} />
        ))}
      </div>
    </div>
  );
}

export default TimelineView;
