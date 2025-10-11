import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  register as apiRegister,
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser as apiGetCurrentUser,
  loginWithWechat as apiLoginWithWechat
} from '../api/userService';

// 创建认证上下文
const AuthContext = createContext(null);

// 提供认证上下文的组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 获取当前用户信息
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const currentUser = await apiGetCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("获取用户信息失败:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // 注册函数
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await apiRegister(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 登录函数
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await apiLogin(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 微信登录函数
  const loginWithWechat = async () => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await apiLoginWithWechat();
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 登出函数
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiLogout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 更新用户信息
  const updateUser = (userData) => {
    setUser(userData);
  };
  
  // 提供给上下文的值
  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithWechat,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子以方便使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};

export default AuthContext;