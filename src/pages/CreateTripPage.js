import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Modal, Select, Slider, Radio, Tag, Divider } from 'antd';
import { createTrip } from '../api/tripService';
import '../styles/CreateTripPage.css';

const { CheckableTag } = Tag;

function CreateTripPage() {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelType: '',
    notes: '',
    // 添加AI生成所需的额外字段
    budget: 'medium', // 预算
    participants: [], // 出行人员
    interests: [], // 兴趣爱好
    travelStyle: 'relaxed', // 旅行风格
    accommodation: 'hotel', // 住宿偏好
    transportation: 'public', // 交通偏好
    mealPreferences: [], // 餐饮偏好
    activityLevel: 'moderate' // 活动强度
  });
  
  // 预定义选项
  const interestOptions = ['历史文化', '自然风光', '美食', '购物', '艺术', '户外活动', '博物馆', '古迹', '主题公园', '当地节庆'];
  const participantOptions = ['成人', '儿童', '老人', '情侣', '家庭', '朋友', '独自旅行', '商务'];
  const mealOptions = ['当地特色', '米其林', '街头小吃', '素食', '海鲜', '自助餐', '中餐', '西餐', '日料', '东南亚'];
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // 添加高级选项开关
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const { destination, startDate, endDate, travelType } = formData;
    const newErrors = {};
    let isValid = true;
    
    if (!destination.trim()) {
      newErrors.destination = '请输入目的地';
      isValid = false;
    }
    
    if (!startDate) {
      newErrors.startDate = '请选择出发日期';
      isValid = false;
    }
    
    if (!endDate) {
      newErrors.endDate = '请选择结束日期';
      isValid = false;
    } else if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = '结束日期不能早于出发日期';
      isValid = false;
    }
    
    if (!travelType) {
      newErrors.travelType = '请选择出行方式';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Modal.error({
        title: '请填完页面信息',
        content: '请确保您已填写所有必填字段（标记 * 的字段）并确保信息正确。',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // 自动生成行程名称
      const tripWithTitle = {
        ...formData,
        title: `${formData.destination}之旅 ${formData.startDate.substring(5).replace('-', '/')}-${formData.endDate.substring(5).replace('-', '/')}`
      };
      
      // 创建行程
      const createdTrip = await createTrip(tripWithTitle);
      
      // 将智能生成状态存储在localStorage中，以便行程详情页面可以检测到
      localStorage.setItem('startAiGeneration', 'true');
      
      // 导航到行程详情页面，添加generate=true查询参数用于触发AI生成
      // 即使localStorage的方式有问题，查询参数也能确保生成启动
      navigate(`/itinerary/${createdTrip.id}?generate=true`);
      
      console.log("已创建行程并设置生成标记", tripWithTitle);
    } catch (error) {
      console.error('行程创建失败', error);
      Modal.error({
        title: '行程创建失败',
        content: '很抱歉，行程创建过程中发生错误，请重试。'
      });
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  // 获取输入框的类名（普通/错误状态）
  const getInputClassName = (fieldName) => {
    return errors[fieldName] ? 'form-input error' : 'form-input';
  };
  
  // 处理选择兴趣爱好
  const handleInterestChange = (tag, checked) => {
    const nextInterests = checked
      ? [...formData.interests, tag]
      : formData.interests.filter(t => t !== tag);
    
    setFormData(prev => ({
      ...prev,
      interests: nextInterests
    }));
  };
  
  // 处理选择出行人员
  const handleParticipantChange = (tag, checked) => {
    const nextParticipants = checked
      ? [...formData.participants, tag]
      : formData.participants.filter(t => t !== tag);
    
    setFormData(prev => ({
      ...prev,
      participants: nextParticipants
    }));
  };
  
  // 处理餐饮偏好变更
  const handleMealChange = (tag, checked) => {
    const nextMeals = checked
      ? [...formData.mealPreferences, tag]
      : formData.mealPreferences.filter(t => t !== tag);
    
    setFormData(prev => ({
      ...prev,
      mealPreferences: nextMeals
    }));
  };
  
  return (
    <div className="container">
      <Header title="创建新的行程" showBackButton onBack={handleBack} />
      
      <main className="content">
        <form className="trip-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="destination">目的地 <span className="required">*</span></label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="您想去哪里旅行？"
              className={getInputClassName('destination')}
            />
            {errors.destination && <div className="error-message">{errors.destination}</div>}
          </div>
          
          <div className="form-group form-row">
            <div className="form-col">
              <label htmlFor="startDate">出发日期 <span className="required">*</span></label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={getInputClassName('startDate')}
              />
              {errors.startDate && <div className="error-message">{errors.startDate}</div>}
            </div>
            
            <div className="form-col">
              <label htmlFor="endDate">结束日期 <span className="required">*</span></label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={getInputClassName('endDate')}
              />
              {errors.endDate && <div className="error-message">{errors.endDate}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="travelType">出行方式 <span className="required">*</span></label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="travelType"
                  value="self"
                  checked={formData.travelType === 'self'}
                  onChange={handleInputChange}
                />
                <span>自由行</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="travelType"
                  value="group"
                  checked={formData.travelType === 'group'}
                  onChange={handleInputChange}
                />
                <span>跟团游</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="travelType"
                  value="business"
                  checked={formData.travelType === 'business'}
                  onChange={handleInputChange}
                />
                <span>商务旅行</span>
              </label>
            </div>
            {errors.travelType && <div className="error-message">{errors.travelType}</div>}
          </div>
          
          <div className="advanced-toggle">
            <button 
              type="button" 
              className="link-button"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '隐藏高级选项 ▲' : '显示高级选项 ▼'}
            </button>
          </div>
          
          {showAdvanced && (
            <div className="advanced-options">
              <Divider>高级选项</Divider>
              
              <div className="form-group">
                <label>兴趣爱好</label>
                <div className="tag-container">
                  {interestOptions.map(tag => (
                    <CheckableTag
                      key={tag}
                      checked={formData.interests.includes(tag)}
                      onChange={checked => handleInterestChange(tag, checked)}
                    >
                      {tag}
                    </CheckableTag>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>出行人员</label>
                <div className="tag-container">
                  {participantOptions.map(tag => (
                    <CheckableTag
                      key={tag}
                      checked={formData.participants.includes(tag)}
                      onChange={checked => handleParticipantChange(tag, checked)}
                    >
                      {tag}
                    </CheckableTag>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>旅行预算</label>
                <Radio.Group 
                  value={formData.budget} 
                  onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                >
                  <Radio.Button value="budget">经济实惠</Radio.Button>
                  <Radio.Button value="medium">中等消费</Radio.Button>
                  <Radio.Button value="luxury">高端享受</Radio.Button>
                </Radio.Group>
              </div>
              
              <div className="form-group">
                <label>旅行风格</label>
                <Radio.Group 
                  value={formData.travelStyle} 
                  onChange={e => setFormData(prev => ({ ...prev, travelStyle: e.target.value }))}
                >
                  <Radio.Button value="relaxed">轻松悠闲</Radio.Button>
                  <Radio.Button value="balanced">平衡适中</Radio.Button>
                  <Radio.Button value="intensive">紧凑高效</Radio.Button>
                </Radio.Group>
              </div>
              
              <div className="form-group">
                <label>餐饮偏好</label>
                <div className="tag-container">
                  {mealOptions.map(tag => (
                    <CheckableTag
                      key={tag}
                      checked={formData.mealPreferences.includes(tag)}
                      onChange={checked => handleMealChange(tag, checked)}
                    >
                      {tag}
                    </CheckableTag>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>住宿偏好</label>
                <Radio.Group 
                  value={formData.accommodation} 
                  onChange={e => setFormData(prev => ({ ...prev, accommodation: e.target.value }))}
                >
                  <Radio.Button value="hotel">酒店</Radio.Button>
                  <Radio.Button value="hostel">旅馆/青旅</Radio.Button>
                  <Radio.Button value="apartment">公寓</Radio.Button>
                  <Radio.Button value="homestay">民宿</Radio.Button>
                </Radio.Group>
              </div>
              
              <div className="form-group">
                <label>交通方式偏好</label>
                <Radio.Group 
                  value={formData.transportation} 
                  onChange={e => setFormData(prev => ({ ...prev, transportation: e.target.value }))}
                >
                  <Radio.Button value="public">公共交通</Radio.Button>
                  <Radio.Button value="car">自驾/租车</Radio.Button>
                  <Radio.Button value="taxi">出租车</Radio.Button>
                  <Radio.Button value="walking">步行为主</Radio.Button>
                </Radio.Group>
              </div>
              
              <div className="form-group">
                <label>活动强度</label>
                <Slider
                  marks={{
                    1: '轻度',
                    2: '适中',
                    3: '活跃',
                    4: '高强度',
                    5: '极限挑战'
                  }}
                  min={1}
                  max={5}
                  defaultValue={3}
                  onChange={value => setFormData(prev => ({ 
                    ...prev, 
                    activityLevel: value === 1 ? 'light' : value === 2 ? 'moderate' : value === 3 ? 'active' : value === 4 ? 'intense' : 'extreme'
                  }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">备注</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="有什么特别的要求或偏好吗？"
                  rows={4}
                  className="form-input"
                />
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleBack}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '创建中...' : '生成行程计划'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateTripPage; 