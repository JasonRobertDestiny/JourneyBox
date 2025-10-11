import React from 'react';
import {
  CarOutlined,
  TeamOutlined,
  RocketOutlined,
  DashboardOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import '../styles/TransportFilter.css';

function TransportFilter({ activeMode, onModeChange }) {
  const transportModes = [
    { key: 'walking', label: '步行', icon: <TeamOutlined /> },
    { key: 'public', label: '公共交通', icon: <RocketOutlined /> },
    { key: 'taxi', label: '打车', icon: <CarOutlined /> },
    { key: 'driving', label: '开车', icon: <DashboardOutlined /> },
    { key: 'biking', label: '骑行', icon: <EnvironmentOutlined /> }
  ];

  return (
    <div className="transport-filter">
      {transportModes.map(mode => (
        <button
          key={mode.key}
          className={`filter-button ${activeMode === mode.key ? 'active' : ''}`}
          onClick={() => onModeChange(mode.key)}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

export default TransportFilter;