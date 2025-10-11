import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getCurrentUserPosts, getUserLikedPosts } from '../api/userService';
import { getAllTrips } from '../api/tripService';
import { getAllPosts } from '../api/communityService';
import { getDestinationImage, handleImageError, getCommunityPostImage, handleCommunityImageError } from '../utils/imageUtils';
import '../styles/ProfilePage.css';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function ProfilePage() {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedTab, setSelectedTab] = useState('myPosts'); // 'myPosts' or 'likedPosts'
  const [activeTab] = useState('profile');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const navigate = useNavigate();
  
  // 自定义返回按钮的处理函数
  const handleBack = () => {
    // 直接导航到首页
    navigate('/');
  };
  
  // 处理头像上传
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    
    // 创建一个FileReader对象来读取文件
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // reader.result包含Base64编码的图片数据
      const avatarData = reader.result;
      
      // 更新用户个人资料，包括新头像
      updateUserProfile({
        ...formData,
        avatar: avatarData
      })
        .then(updatedUser => {
          updateUser(updatedUser);
          setUploadingAvatar(false);
        })
        .catch(err => {
          setError('上传头像失败: ' + (err.message || '未知错误'));
          setUploadingAvatar(false);
        });
    };
    
    reader.onerror = () => {
      setError('读取文件失败');
      setUploadingAvatar(false);
    };
    
    // 开始读取文件
    reader.readAsDataURL(file);
  };
  
  // 加载用户数据和行程
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      
      const fetchUserTrips = async () => {
        try {
          setLoading(true);
          const allTrips = await getAllTrips();
          
          // 筛选用户收藏和已完成的行程
          const favoriteTrips = allTrips.filter(trip => 
            user.favoriteTrips && user.favoriteTrips.includes(trip.id)
          );
          
          const completedTrips = allTrips.filter(trip => 
            user.completedTrips && user.completedTrips.includes(trip.id)
          );
          
          setUserTrips({
            favoriteTrips,
            completedTrips
          });
        } catch (err) {
          console.error('获取用户行程失败', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserTrips();
    }
  }, [user]);
  
  // 获取用户发布的帖子和点赞的帖子
  useEffect(() => {
    const fetchUserContent = async () => {
      if (isAuthenticated && user) {
        try {
          setLoadingPosts(true);
          
          // 并行请求用户的帖子和点赞的帖子
          const [posts, liked] = await Promise.all([
            getCurrentUserPosts(),
            getUserLikedPosts(user.id)
          ]);
          
          setUserPosts(posts);
          setLikedPosts(liked);
        } catch (error) {
          console.error('获取用户内容失败', error);
          // 不使用toast，使用普通错误处理
          setError('获取用户内容失败');
        } finally {
          setLoadingPosts(false);
        }
      }
    };
    
    fetchUserContent();
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const currentUser = user;
        
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          bio: currentUser.bio || ''
        });
        
        // 移除获取用户收藏的旅行
        // const userFavorites = await getUserFavorites();
        // setFavorites(userFavorites);
        
      } catch (error) {
        console.error('加载用户数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate, user]);
  
  useEffect(() => {
    if (activeTab === 'posts') {
      loadUserPosts();
    } else if (activeTab === 'liked') {
      loadLikedPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  const loadUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const posts = await getCurrentUserPosts();
      setUserPosts(posts);
    } catch (error) {
      console.error('加载用户帖子失败:', error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const loadLikedPosts = async () => {
    try {
      setLoadingPosts(true);
      const posts = await getUserLikedPosts(user.id);
      setLikedPosts(posts);
    } catch (error) {
      console.error('加载点赞帖子失败:', error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // 取消编辑，重置表单数据
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
    setIsEditing(!isEditing);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const updatedUser = await updateUserProfile(formData);
      updateUser(updatedUser);
      
      setIsEditing(false);
    } catch (err) {
      setError(err.message || '更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('退出登录失败', err);
    }
  };
  
  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  // 渲染用户帖子卡片 - 增强版，支持点赞状态显示
  const renderPostCard = (post, isLiked = false) => (
    <motion.div 
      key={post.id}
      className={`user-post-card ${isLiked ? 'liked-post' : ''}`}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      onClick={() => navigate(`/community/post/${post.id}`)}
    >
      <div className="post-card-image">
        <img 
          src={getCommunityPostImage(post, 0)} 
          alt={post.title} 
          onError={(e) => handleCommunityImageError(e, post, 0)}
        />
      </div>
      <div className="post-card-content">
        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-excerpt">
          {post.content.length > 60 
            ? post.content.substring(0, 60) + '...' 
            : post.content}
        </p>
        <div className="post-card-stats">
          <span className="post-stat">
            <i className={`icon-heart ${isLiked ? 'liked' : ''}`}></i> {post.likes}
          </span>
          <span className="post-stat">
            <i className="icon-comment"></i> {post.comments}
          </span>
          <span className="post-date">{post.publishDate}</span>
        </div>
      </div>
      {isLiked && <div className="liked-badge">已点赞</div>}
    </motion.div>
  );
  
  // 如果用户数据未加载
  if (!user) {
    return (
      <div className="profile-page">
        <Header title="个人中心" showBackButton onBack={handleBack} />
        <div className="not-logged-in-container" style={{ padding: '30px', textAlign: 'center' }}>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            您尚未登录
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ margin: '20px 0' }}
          >
            登录后可以查看和管理您的个人信息与旅行计划
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.button 
              className="action-button"
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                backgroundColor: '#007AFF', 
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                margin: '10px'
              }}
            >
              前往登录
            </motion.button>
            <motion.button 
              className="action-button"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                backgroundColor: '#F5F5F7', 
                color: '#007AFF',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #007AFF',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                margin: '10px'
              }}
            >
              返回首页
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <Header title="个人中心" showBackButton onBack={handleBack} />
      
      <main className="profile-content">
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="profile-avatar-container">
            <img 
              src={user.avatar || '/image/cat.jpg'} 
              alt={user.name} 
              className="profile-avatar" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/image/cat.jpg';
              }}
            />
            <div className="avatar-upload-overlay">
              <label htmlFor="avatar-upload" className="avatar-upload-label">
                {uploadingAvatar ? '上传中...' : '更换头像'}
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                className="avatar-upload-input"
                disabled={uploadingAvatar}
              />
            </div>
          </div>
          
          <div className="profile-header-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-username">@{user.username}</p>
          </div>
          
          <div className="profile-actions">
            <motion.button 
              className="edit-profile-button"
              onClick={handleEditToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? '取消编辑' : '编辑资料'}
            </motion.button>
            
            <motion.button 
              className="logout-button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              退出登录
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {error && <div className="error-message">{error}</div>}
          
          {isEditing ? (
            <div className="edit-profile-form-container">
              <h2 className="section-title">编辑个人资料</h2>
              
              <form className="edit-profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">姓名</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="请输入您的姓名"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">邮箱</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="请输入您的邮箱"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">个人简介</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="请输入您的个人简介"
                    disabled={loading}
                    rows={4}
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <motion.button 
                    type="submit" 
                    className="save-button"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? '保存中...' : '保存修改'}
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            <div className="user-info">
              <h2 className="section-title">个人资料</h2>
              
              <div className="info-item">
                <span className="info-label">用户名:</span>
                <span className="info-value">{user.username}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">姓名:</span>
                <span className="info-value">{user.name || '-'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">邮箱:</span>
                <span className="info-value">{user.email}</span>
              </div>
              
              {user.bio && (
                <div className="info-item">
                  <span className="info-label">个人简介:</span>
                  <p className="info-value bio">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
        
        {/* 收藏的行程 */}
        <motion.div 
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="section-title">收藏的行程</h2>
          
          {loading ? (
            <div className="loading-container mini">
              <motion.div 
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          ) : userTrips.favoriteTrips && userTrips.favoriteTrips.length > 0 ? (
            <div className="trips-grid">
              {userTrips.favoriteTrips.map((trip, index) => (
                <motion.div 
                  key={trip.id}
                  className="trip-card"
                  onClick={() => handleTripClick(trip.id)}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="trip-image-container">
                    <img 
                      src={getDestinationImage(trip.destination, trip.coverImage)}
                      alt={trip.title}
                      className="trip-image"
                      onError={(e) => handleImageError(e, trip.destination)}
                    />
                  </div>
                  <div className="trip-info">
                    <h3 className="trip-title">{trip.title}</h3>
                    <p className="trip-destination">{trip.destination}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>您还没有收藏任何行程</p>
              <motion.button 
                className="action-button"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                浏览行程
              </motion.button>
            </div>
          )}
        </motion.div>
        
        {/* 已完成的行程 */}
        <motion.div 
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="section-title">已完成的行程</h2>
          
          {loading ? (
            <div className="loading-container mini">
              <motion.div 
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          ) : userTrips.completedTrips && userTrips.completedTrips.length > 0 ? (
            <div className="trips-grid">
              {userTrips.completedTrips.map((trip, index) => (
                <motion.div 
                  key={trip.id}
                  className="trip-card completed"
                  onClick={() => handleTripClick(trip.id)}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="trip-image-container">
                    <img 
                      src={getDestinationImage(trip.destination, trip.coverImage)}
                      alt={trip.title}
                      className="trip-image"
                      onError={(e) => handleImageError(e, trip.destination)}
                    />
                    <div className="completed-badge">已完成</div>
                  </div>
                  <div className="trip-info">
                    <h3 className="trip-title">{trip.title}</h3>
                    <p className="trip-destination">{trip.destination}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>您还没有完成任何行程</p>
              <motion.button 
                className="action-button"
                onClick={() => navigate('/create-trip')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                创建行程
              </motion.button>
            </div>
          )}
        </motion.div>
        
        {/* 用户的内容部分 - 帖子和点赞 */}
        <motion.div
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <h2 className="section-title">我的社区内容</h2>
            <button 
              className="btn-create-post"
              onClick={() => navigate('/community/create')}
            >
              发布新帖
            </button>
          </div>
          
          {/* 内容选项卡 */}
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${selectedTab === 'myPosts' ? 'active' : ''}`}
              onClick={() => setSelectedTab('myPosts')}
            >
              我的帖子
            </button>
            <button 
              className={`profile-tab ${selectedTab === 'likedPosts' ? 'active' : ''}`}
              onClick={() => setSelectedTab('likedPosts')}
            >
              我的点赞
            </button>
          </div>
          
          {isAuthenticated ? (
            loadingPosts ? (
              <div className="loading-container">
                <LoadingSpinner />
              </div>
            ) : selectedTab === 'myPosts' ? (
              // 我的帖子内容
              userPosts.length > 0 ? (
                <div className="user-posts-grid">
                  {userPosts.map(post => renderPostCard(post))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>您还没有发布任何帖子</p>
                  <Link to="/community/create" className="create-post-btn">发布第一篇帖子</Link>
                </div>
              )
            ) : (
              // 我的点赞内容
              likedPosts.length > 0 ? (
                <div className="user-posts-grid">
                  {likedPosts.map(post => renderPostCard(post, true))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>您还没有点赞任何帖子</p>
                  <Link to="/community" className="browse-posts-btn">去浏览社区</Link>
                </div>
              )
            )
          ) : (
            <div className="login-prompt">
              <p>登录后查看您的帖子</p>
              <Link to="/auth" className="login-btn" state={{ from: '/profile' }}>去登录</Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default ProfilePage;