import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import Header from '../components/Header';

function AuthPage() {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // 如果用户已登录，重定向到个人中心页面
  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }
  
  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="auth-page">
      <Header title={isLoginForm ? "用户登录" : "用户注册"} showBackButton onBack={handleBack} />
      
      <motion.div 
        className="auth-page-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '20px' 
        }}
      >
        <div className="auth-page-title">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoginForm ? '欢迎回来' : '创建新账号'}
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ 
              color: '#8E8E93', 
              marginTop: '10px', 
              fontSize: '16px',
              textAlign: 'center'
            }}
          >
            {isLoginForm ? '请登录您的账号继续旅程' : '加入我们，开始您的旅行计划'}
          </motion.p>
        </div>
        
        {isLoginForm ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} />
        )}
      </motion.div>
    </div>
  );
}

export default AuthPage; 