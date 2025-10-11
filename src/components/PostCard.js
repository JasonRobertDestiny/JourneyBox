import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FaHeart, FaRegHeart, FaComment, FaEye } from 'react-icons/fa';
import { postService } from '../api/postService';
import { userService } from '../api/userService';
import { getDestinationImage, handleImageError } from '../utils/imageUtils';
import '../styles/PostCard.css';

/**
 * 帖子卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.post - 帖子数据
 * @param {number} props.index - 帖子索引（用于动画）
 * @param {Function} props.onLikeUpdate - 点赞更新回调（可选）
 */
const PostCard = ({ post, index, onLikeUpdate }) => {
  const [isLiked, setIsLiked] = useState(() => {
    const currentUser = userService.getCurrentUser();
    return currentUser && post.likes?.includes(currentUser.id);
  });
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const navigate = useNavigate();

  // 动画变体
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: index * 0.05
      }
    },
    hover: {
      y: -5,
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  // 格式化时间为友好显示
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: zhCN
    });
  };

  // 获取作者信息
  const getAuthorName = () => {
    const author = userService.getUserById(post.authorId);
    return author ? author.username : '未知用户';
  };

  // 处理帖子点击，导航到详情页
  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  // 处理点赞点击
  const handleLikeClick = async (e) => {
    e.stopPropagation(); // 阻止冒泡到卡片点击

    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      // 如果用户未登录，跳转到登录页面
      navigate('/login', { state: { from: `/post/${post.id}` } });
      return;
    }

    try {
      if (isLiked) {
        await postService.unlikePost(post.id);
        setLikeCount(prev => prev - 1);
      } else {
        await postService.likePost(post.id);
        setLikeCount(prev => prev + 1);
      }
      
      setIsLiked(!isLiked);
      
      // 通知父组件状态已更新
      if (onLikeUpdate) {
        onLikeUpdate(post.id, !isLiked);
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
    }
  };

  // 截取内容预览
  const getContentPreview = () => {
    return post.content.length > 100 
      ? `${post.content.substring(0, 100)}...` 
      : post.content;
  };

  return (
    <motion.div 
      className="post-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={handlePostClick}
    >
      {post.destination && (
        <div className="post-card-image-container">
          <img 
            src={getDestinationImage(post.destination, post.coverImage)}
            alt={post.destination}
            onError={(e) => handleImageError(e, post.destination)}
            className="post-card-image"
          />
          <div className="post-card-destination">{post.destination}</div>
        </div>
      )}
      
      <div className="post-card-content">
        <h3 className="post-card-title">{post.title}</h3>
        
        <div className="post-card-meta">
          <span className="post-card-author">作者: {getAuthorName()}</span>
          <span className="post-card-date">{formatTime(post.createdAt)}</span>
        </div>
        
        <p className="post-card-text">{getContentPreview()}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="post-card-tag">#{tag}</span>
            ))}
          </div>
        )}
        
        <div className="post-card-stats">
          <div 
            className={`post-card-like ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likeCount}</span>
          </div>
          
          <div className="post-card-comments">
            <FaComment />
            <span>{post.comments?.length || 0}</span>
          </div>
          
          <div className="post-card-views">
            <FaEye />
            <span>{post.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard; 