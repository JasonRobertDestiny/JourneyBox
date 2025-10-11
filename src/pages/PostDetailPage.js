import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { getPostById, likePost, addComment, getPostComments, sharePost, likeComment } from '../api/communityService';
import { useAuth } from '../contexts/AuthContext';
import { getCommunityPostImage, handleCommunityImageError } from '../utils/imageUtils';
import '../styles/PostDetailPage.css';

function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [shareNotification, setShareNotification] = useState(false);
  
  const commentsRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // 获取帖子和评论数据
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        // 获取帖子详情
        const postData = await getPostById(parseInt(id));
        setPost(postData);
        
        // 获取评论
        const commentsData = await getPostComments(parseInt(id));
        setCommentsList(commentsData);
      } catch (error) {
        console.error('获取帖子详情失败', error);
        setError('获取帖子详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  // 处理点赞
  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/community/post/${id}` } });
      return;
    }

    try {
      const userId = user.id;
      const result = await likePost(parseInt(id), userId);
      setPost(prev => ({ ...prev, likes: result.likes }));
      setIsLiked(result.isLiked);
    } catch (error) {
      console.error('点赞失败', error);
    }
  };

  // 处理评论点赞
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/community/post/${id}` } });
      return;
    }

    try {
      const result = await likeComment(parseInt(id), commentId);
      
      // 更新评论列表中的点赞数
      setCommentsList(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: result.likes } 
            : comment
        )
      );
    } catch (error) {
      console.error('评论点赞失败', error);
    }
  };

  // 提交评论
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/community/post/${id}` } });
      return;
    }

    if (!comment.trim()) return;

    try {
      const commentData = {
        content: comment
      };
      
      const result = await addComment(parseInt(id), commentData);
      
      // 更新帖子的评论计数
      setPost(prev => ({ ...prev, comments: result.totalComments }));
      
      // 将新评论添加到评论列表的开头
      setCommentsList(prevComments => [result.comment, ...prevComments]);
      
      // 清空评论输入框
      setComment('');
    } catch (error) {
      console.error('评论失败', error);
    }
  };

  // 处理分享
  const handleShare = async () => {
    try {
      const result = await sharePost(parseInt(id));
      
      // 复制链接到剪贴板
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result.url);
      } else {
        // 兼容方案
        const textArea = document.createElement("textarea");
        textArea.value = result.url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // 显示通知
      setShareNotification(true);
      
      // 3秒后隐藏通知
      setTimeout(() => {
        setShareNotification(false);
      }, 3000);
    } catch (error) {
      console.error('分享失败', error);
    }
  };

  // 切换评论区显示状态
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
    // 如果要打开评论区，等动画完成后滚动到评论区
    if (!isCommentsOpen) {
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  // 图片轮播控制
  const handleNextImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === post.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? post.images.length - 1 : prevIndex - 1
      );
    }
  };

  // 获取图片URL
  const getImageUrl = (index) => {
    if (post.images && post.images.length > index) {
      return post.images[index];
    }
    return getCommunityPostImage(post, index);
  };

  // 返回按钮
  const handleBack = () => {
    navigate(-1);
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
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
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      }
    }
  };

  const commentsVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Header title="帖子详情" showBackButton onBack={handleBack} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container">
        <Header title="帖子详情" showBackButton onBack={handleBack} />
        <div className="error-container">
          <p>{error || '未找到该帖子'}</p>
          <button className="btn-back-to-community" onClick={() => navigate('/community')}>
            返回社区
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="post-detail-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Header title="帖子详情" showBackButton onBack={handleBack} />
      
      <main className="post-detail-content">
        <motion.div className="post-detail" variants={itemVariants}>
          {/* 帖子头部 */}
          <div className="post-header">
            <div className="post-author">
              <img 
                src={post.author.avatar} 
                alt={post.author.username} 
                className="author-avatar" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/image/cat.jpg';
                }}
              />
              <div className="author-info">
                <h3 className="author-name">{post.author.username}</h3>
                <p className="post-date">{post.publishDate}</p>
              </div>
            </div>
            <div className="post-actions">
              <button className="btn-follow">关注</button>
            </div>
          </div>
          
          {/* 帖子标题和内容 */}
          <h1 className="post-title">{post.title}</h1>
          <div className="post-content">
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() ? 
                <p key={index}>{paragraph}</p> : 
                <br key={index} />
            ))}
          </div>
          
          {/* 帖子图片 */}
          {post.images && post.images.length > 0 && (
            <motion.div className="post-images" variants={itemVariants}>
              <div className="image-gallery">
                <div className="main-image-container">
                  <img 
                    src={getImageUrl(currentImageIndex)}
                    alt={`${post.title} - 图片 ${currentImageIndex + 1}`} 
                    className="main-image"
                    onError={(e) => handleCommunityImageError(e, post, currentImageIndex)}
                  />
                  
                  {post.images.length > 1 && (
                    <>
                      <button 
                        className="gallery-nav prev" 
                        onClick={handlePrevImage}
                      >
                        <i className="icon-chevron-left"></i>
                      </button>
                      <button 
                        className="gallery-nav next" 
                        onClick={handleNextImage}
                      >
                        <i className="icon-chevron-right"></i>
                      </button>
                      
                      <div className="image-counter">
                        {currentImageIndex + 1} / {post.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {post.images.length > 1 && (
                  <div className="thumbnail-container">
                    {post.images.map((_, index) => (
                      <div 
                        key={index} 
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img 
                          src={getImageUrl(index)} 
                          alt={`缩略图 ${index + 1}`}
                          onError={(e) => handleCommunityImageError(e, post, index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* 帖子标签 */}
          {post.content.includes('#') && (
            <motion.div className="post-tags" variants={itemVariants}>
              {post.content
                .split('\n')
                .join(' ')
                .match(/#[^\s#]+/g)
                ?.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
            </motion.div>
          )}
          
          {/* 帖子操作栏 - 小红书风格 */}
          <motion.div className="post-actions-bar" variants={itemVariants}>
            <div className={`action-button ${isLiked ? 'active' : ''}`} onClick={handleLike}>
              <div className="icon-wrapper">
                <i className={`icon-heart ${isLiked ? 'filled' : ''}`}></i>
              </div>
              <span>{post.likes || 0}</span>
            </div>
            <div className="action-button" onClick={toggleComments}>
              <div className="icon-wrapper">
                <i className="icon-comment"></i>
              </div>
              <span>{post.comments || 0}</span>
            </div>
            <div className="action-button" onClick={handleShare}>
              <div className="icon-wrapper">
                <i className="icon-share"></i>
              </div>
              <span>分享</span>
            </div>
            <div className="action-button">
              <div className="icon-wrapper">
                <i className="icon-bookmark"></i>
              </div>
              <span>收藏</span>
            </div>
          </motion.div>
          
          {/* 分享成功通知 */}
          <AnimatePresence>
            {shareNotification && (
              <motion.div 
                className="share-notification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                链接已复制到剪贴板
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 评论区域 - 可折叠 */}
          <div className="comments-container" ref={commentsRef}>
            <div className="comments-header" onClick={toggleComments}>
              <h3 className="section-title">评论 ({post.comments || 0})</h3>
              <i className={`icon-chevron-${isCommentsOpen ? 'up' : 'down'}`}></i>
            </div>
            
            <AnimatePresence>
              {isCommentsOpen && (
                <motion.div 
                  className="comments-content"
                  variants={commentsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* 评论表单 */}
                  <form className="comment-form" onSubmit={handleSubmitComment}>
                    <div className="comment-form-content">
                      {isAuthenticated && (
                        <img 
                          src={user?.avatar || '/image/cat.jpg'} 
                          alt="您的头像" 
                          className="user-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/image/cat.jpg';
                          }}
                        />
                      )}
                      <div className="comment-input-wrapper">
                        <textarea 
                          placeholder={isAuthenticated ? "说点什么吧..." : "登录后发表评论"}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          disabled={!isAuthenticated}
                        />
                        <button 
                          type="submit" 
                          className="btn-submit-comment"
                          disabled={!isAuthenticated || !comment.trim()}
                        >
                          发布
                        </button>
                      </div>
                    </div>
                  </form>
                  
                  {/* 评论列表 */}
                  <div className="comments-list">
                    {commentsList.length > 0 ? (
                      commentsList.map((commentItem) => (
                        <div className="comment-item" key={commentItem.id}>
                          <div className="comment-author">
                            <img 
                              src={commentItem.authorAvatar} 
                              alt={commentItem.authorName} 
                              className="comment-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/image/cat.jpg';
                              }}
                            />
                            <div className="comment-author-info">
                              <h4>{commentItem.authorName}</h4>
                              <span className="comment-time">{commentItem.time}</span>
                            </div>
                          </div>
                          <p className="comment-content">{commentItem.content}</p>
                          <div className="comment-actions">
                            <button 
                              className="btn-like-comment"
                              onClick={() => handleLikeComment(commentItem.id)}
                            >
                              <i className="icon-heart-small"></i>
                              <span>{commentItem.likes || 0}</span>
                            </button>
                            <button className="btn-reply-comment">
                              <i className="icon-reply"></i>
                              <span>回复</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-comments">
                        <p>暂无评论，快来发表第一条评论吧！</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* 推荐阅读 */}
        <motion.div className="related-posts" variants={itemVariants}>
          <h3 className="section-title">推荐阅读</h3>
          <div className="related-posts-list">
            <p className="related-placeholder">此处将展示相关推荐内容</p>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default PostDetailPage; 