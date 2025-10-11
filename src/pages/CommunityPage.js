import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { getAllPosts, likePost, getHotPosts } from '../api/communityService';
import { useAuth } from '../contexts/AuthContext';
import { getCommunityPostImage, handleCommunityImageError } from '../utils/imageUtils';
import '../styles/CommunityPage.css';

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 获取所有帖子
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getAllPosts(page, 10);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        
        // 获取热门帖子
        const hotPostsData = await getHotPosts(3);
        setHotPosts(hotPostsData);
      } catch (error) {
        console.error('获取帖子失败', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [page]);

  // 点赞帖子
  const handleLikePost = async (postId, event) => {
    event.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/community' } });
      return;
    }
    
    try {
      const result = await likePost(postId);
      // 更新帖子点赞数
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: result.likes } : post
      ));
      
      // 如果是热门帖子，也更新
      setHotPosts(hotPosts.map(post => 
        post.id === postId ? { ...post, likes: result.likes } : post
      ));
    } catch (error) {
      console.error('点赞失败', error);
    }
  };

  // 帖子详情页
  const handleViewPost = (postId) => {
    navigate(`/community/post/${postId}`);
  };

  // 创建新帖子
  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/community/create' } });
      return;
    }
    navigate('/community/create');
  };

  // 翻页
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // 帖子预览卡片
  const PostCard = ({ post, isHot }) => (
    <motion.div 
      className={`post-card ${isHot ? 'hot-post-card' : ''}`}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      onClick={() => handleViewPost(post.id)}
    >
      <div className="post-card-images">
        <img 
          src={getCommunityPostImage(post, 0)} 
          alt={post.title} 
          className="post-image"
          onError={(e) => handleCommunityImageError(e, post, 0)} 
        />
        {post.images && post.images.length > 1 && (
          <div className="image-count">+{post.images.length}</div>
        )}
      </div>
      <div className="post-card-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">
          {post.content.length > 100 
            ? post.content.substring(0, 100) + '...' 
            : post.content}
        </p>
        <div className="post-meta">
          <div className="post-author">
            <img src={post.author.avatar} alt={post.author.username} className="author-avatar" />
            <span>{post.author.username}</span>
          </div>
          <div className="post-stats">
            <div className="post-stat" onClick={(e) => handleLikePost(post.id, e)}>
              <i className="icon-heart"></i>
              <span>{post.likes}</span>
            </div>
            <div className="post-stat">
              <i className="icon-comment"></i>
              <span>{post.comments}</span>
            </div>
            <div className="post-stat">
              <i className="icon-eye"></i>
              <span>{post.views}</span>
            </div>
          </div>
        </div>
      </div>
      {isHot && <div className="hot-label">热门</div>}
    </motion.div>
  );

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className="container">
      <Header title="旅行社区" />
      
      <main className="community-content">
        {/* 搜索栏 */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索帖子..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-search">
            <i className="icon-search"></i>
          </button>
          <button className="btn-create-post" onClick={handleCreatePost}>
            <i className="icon-plus"></i>
            发布新帖
          </button>
        </div>
        
        {/* 热门帖子 */}
        {!loading && hotPosts.length > 0 && (
          <section className="hot-posts-section">
            <h2 className="section-title">热门推荐</h2>
            <motion.div 
              className="hot-posts-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {hotPosts.map(post => (
                <motion.div key={post.id} variants={itemVariants}>
                  <PostCard post={post} isHot={true} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}
        
        {/* 所有帖子 */}
        <section className="all-posts-section">
          <h2 className="section-title">最新帖子</h2>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>正在加载帖子...</p>
            </div>
          ) : posts.length > 0 ? (
            <motion.div 
              className="posts-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {posts.map(post => (
                <motion.div key={post.id} variants={itemVariants}>
                  <PostCard post={post} isHot={false} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="no-posts-message">
              <p>暂无帖子</p>
            </div>
          )}
          
          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i + 1}
                  className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className="pagination-btn" 
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default CommunityPage; 