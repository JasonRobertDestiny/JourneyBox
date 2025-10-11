import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { createPost } from '../api/communityService';
import { useAuth } from '../contexts/AuthContext';
import { getCommunityPostImage } from '../utils/imageUtils';
import '../styles/CreatePostPage.css';

function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // 检查用户是否已登录
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/community/create' } });
    }
  }, [isAuthenticated, navigate]);

  // 根据标题和内容更新推荐图片
  useEffect(() => {
    if (title || content) {
      // 创建临时帖子对象用于获取推荐图片
      const tempPost = {
        title,
        content,
        author: user
      };

      // 获取三张推荐图片
      const recommendations = [
        getCommunityPostImage(tempPost, 0),
        getCommunityPostImage(tempPost, 1),
        getCommunityPostImage(tempPost, 2)
      ];

      setSuggestedImages(recommendations);
    }
  }, [title, content, user]);

  // 处理图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // 限制最多上传9张图片
    if (previewImages.length + files.length > 9) {
      setError('最多只能上传9张图片');
      return;
    }

    // 处理图片预览
    const newPreviewImages = [...previewImages];
    const newImages = [...images];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewImages.push(reader.result);
        setPreviewImages([...newPreviewImages]);
      };
      reader.readAsDataURL(file);
      
      // 存储文件对象（在实际应用中，这些文件会被上传到服务器）
      newImages.push(file);
    });
    
    setImages(newImages);
  };

  // 移除图片
  const handleRemoveImage = (index) => {
    const newPreviewImages = [...previewImages];
    const newImages = [...images];
    
    newPreviewImages.splice(index, 1);
    newImages.splice(index, 1);
    
    setPreviewImages(newPreviewImages);
    setImages(newImages);
  };

  // 添加推荐图片
  const handleAddSuggestedImage = (imageUrl) => {
    // 限制最多上传9张图片
    if (previewImages.length >= 9) {
      setError('最多只能上传9张图片');
      return;
    }

    setPreviewImages([...previewImages, imageUrl]);
    // 这里我们直接使用URL字符串，而不是文件对象
    setImages([...images, imageUrl]);
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }
    
    if (!content.trim()) {
      setError('请输入内容');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 在实际应用中，这里会先上传图片到服务器，然后获取图片URL
      // 这里我们使用预览图片作为最终图片URL
      const imageUrls = previewImages;
      
      const postData = {
        title,
        content,
        images: imageUrls,
        author: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      };
      
      const newPost = await createPost(postData);
      
      // 提交成功后跳转到帖子详情页
      navigate(`/community/post/${newPost.id}`);
    } catch (error) {
      console.error('发布帖子失败', error);
      setError('发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消发布
  const handleCancel = () => {
    navigate(-1);
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <motion.div 
      className="container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header title="发布帖子" showBackButton onBack={handleCancel} />
      
      <main className="create-post-content">
        <motion.form 
          className="create-post-form"
          variants={itemVariants}
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="title">标题</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="添加引人注目的标题 (最多50字)"
              maxLength={50}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">内容</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的旅行体验、美食推荐或旅游攻略..."
              rows={10}
              required
            />
            <div className="content-tips">
              <p>小贴士：</p>
              <ul>
                <li>使用 # 添加话题标签，例如：#北京旅行</li>
                <li>详细描述景点、美食或住宿体验</li>
                <li>添加实用的旅行建议和小技巧</li>
              </ul>
            </div>
          </div>
          
          <div className="form-group">
            <label>图片</label>
            
            {/* 推荐图片部分 */}
            {suggestedImages.length > 0 && previewImages.length === 0 && (
              <div className="suggested-images">
                <p className="suggestion-title">根据您的内容，我们推荐以下图片：</p>
                <div className="suggested-images-grid">
                  {suggestedImages.map((imgUrl, index) => (
                    <div 
                      key={`suggested-${index}`}
                      className="suggested-image-item"
                      onClick={() => handleAddSuggestedImage(imgUrl)}
                    >
                      <img src={imgUrl} alt={`推荐图片 ${index + 1}`} />
                      <div className="suggested-image-overlay">
                        <span>添加</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 上传和预览图片 */}
            <div className="image-upload-container">
              {previewImages.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`预览图 ${index + 1}`} />
                  <button 
                    type="button" 
                    className="btn-remove-image"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <i className="icon-times"></i>
                  </button>
                </div>
              ))}
              
              {previewImages.length < 9 && (
                <label className="image-upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-icon">
                    <i className="icon-plus"></i>
                    <span>{previewImages.length === 0 ? '添加图片' : '添加更多'}</span>
                    <span className="upload-count">{previewImages.length}/9</span>
                  </div>
                </label>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn-publish"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? '发布中...' : '发布'}
            </button>
          </div>
        </motion.form>
      </main>
    </motion.div>
  );
}

export default CreatePostPage; 