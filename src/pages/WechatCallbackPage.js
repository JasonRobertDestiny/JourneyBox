import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { handleWechatCallback } from '../api/userService';
import Header from '../components/Header';

function WechatCallbackPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const processWechatCallback = async () => {
      try {
        setLoading(true);
        // 从URL查询参数中获取code和state
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('未收到授权码，请重新登录');
        }

        // 处理微信回调
        const userData = await handleWechatCallback(code, state);
        updateUser(userData);
        
        // 登录成功，跳转到个人中心
        navigate('/profile');
      } catch (err) {
        console.error('微信登录处理失败：', err);
        setError(err.message || '微信登录失败，请重试');
        // 5秒后跳转回登录页
        setTimeout(() => {
          navigate('/auth');
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    processWechatCallback();
  }, [location, navigate, updateUser]);

  return (
    <div className="wechat-callback-page">
      <Header title="微信登录" showBackButton onBack={() => navigate('/auth')} />
      
      <motion.div 
        className="callback-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '50px 20px',
          textAlign: 'center',
          height: 'calc(100vh - 60px)'
        }}
      >
        {loading ? (
          <>
            <motion.div 
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(0, 0, 0, 0.1)',
                borderTopColor: '#07C160',
                borderRadius: '50%',
                marginBottom: '20px'
              }}
            />
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              处理微信登录中...
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              style={{ color: '#666', marginTop: '10px' }}
            >
              请稍候，正在验证您的微信授权
            </motion.p>
          </>
        ) : error ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5L5 19M5 5L19 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              登录失败
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ 
                color: '#FF3B30', 
                margin: '10px 0 20px', 
                background: 'rgba(255, 59, 48, 0.1)',
                padding: '10px 15px',
                borderRadius: '8px'
              }}
            >
              {error}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ color: '#666' }}
            >
              5秒后将自动返回登录页...
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              style={{ 
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontWeight: '600',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            >
              立即返回
            </motion.button>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}

export default WechatCallbackPage; 