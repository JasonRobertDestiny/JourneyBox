import React, { useEffect, useState } from 'react';
import { CloudOutlined, LoadingOutlined } from '@ant-design/icons';
import { getWeatherForecast } from '../api/weatherService';
import '../styles/WeatherWidget.css';

// 天气状况对应的表情图标
const weatherIcons = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌦️',
  '中雨': '🌧️',
  '大雨': '⛈️',
  '雷阵雨': '⛈️',
  '雪': '❄️',
  '雾': '🌫️',
  'default': '🌤️'
};

function WeatherWidget({ city, dates }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!city) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    const daysCount = dates ? dates.length : 7;

    getWeatherForecast(city, daysCount)
      .then(data => {
        setWeather(data);
        setError(!data); // 如果data为null表示失败
      })
      .catch(() => {
        setError(true);
        setWeather(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [city, dates]);

  if (loading) {
    return (
      <div className="weather-widget loading">
        <LoadingOutlined /> 加载天气数据...
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-widget error">
        <CloudOutlined /> 天气数据暂不可用
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <h3 className="weather-title">
        <CloudOutlined /> {city} 天气预报
      </h3>
      <div className="weather-list">
        {weather.map((day, index) => {
          const icon = weatherIcons[day.condition] || weatherIcons.default;
          return (
            <div key={index} className="weather-day">
              <div className="weather-date">
                {index === 0 ? '今天' : new Date(day.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
              </div>
              <div className="weather-icon">{icon}</div>
              <div className="weather-condition">{day.condition}</div>
              <div className="weather-temp">
                <span className="temp-high">{day.high}°</span>
                <span className="temp-divider">/</span>
                <span className="temp-low">{day.low}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherWidget;
