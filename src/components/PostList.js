import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import { postService } from '../api/postService';
import '../styles/PostList.css';

const PostList = ({ filter, limit, showPagination = true }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit || 10,
    total: 0,
    totalPages: 0
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchPosts();
  }, [filter, pagination.page, pagination.limit]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // 构建查询参数
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filter
      };

      // 如果提供了搜索查询
      if (filter?.searchQuery) {
        const result = await postService.searchPosts(filter.searchQuery, params);
        setPosts(result.posts);
        setPagination(result.pagination);
      } else {
        // 否则获取所有帖子（带筛选）
        const result = await postService.getAllPosts(params);
        setPosts(result.posts);
        setPagination(result.pagination);
      }
    } catch (err) {
      console.error('获取帖子失败:', err);
      setError('无法加载帖子，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // 点赞更新处理函数
  const handleLikeUpdate = (postId, isLiked) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentLikes = [...(post.likes || [])];
          return {
            ...post,
            likes: currentLikes
          };
        }
        return post;
      })
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="post-list-loading">
        <div className="post-list-loading-spinner"></div>
        <p>加载帖子中...</p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="post-list-error">
        <p>{error}</p>
        <button onClick={fetchPosts}>重试</button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="post-list-empty">
        <p>暂无帖子</p>
        <button onClick={() => navigate('/create-post')}>发布新帖子</button>
      </div>
    );
  }

  return (
    <div className="post-list-container">
      <motion.div 
        className="post-list"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map((post, index) => (
          <PostCard 
            key={post.id} 
            post={post} 
            index={index}
            onLikeUpdate={handleLikeUpdate}
          />
        ))}
      </motion.div>

      {showPagination && pagination.totalPages > 1 && (
        <div className="post-list-pagination">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-button"
          >
            上一页
          </button>
          
          <div className="pagination-info">
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </div>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="pagination-button"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList; 