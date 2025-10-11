// 模拟的用户数据
// 默认头像路径
const DEFAULT_AVATAR = '/image/cat.jpg';

let mockUsers = JSON.parse(localStorage.getItem('users')) || [
  {
    id: 1,
    username: 'test',
    password: 'password',
    email: 'test@example.com',
    name: '测试用户',
    avatar: DEFAULT_AVATAR,
    bio: '热爱旅行的摄影师',
    favoriteTrips: [1, 3],
    completedTrips: [2]
  }
];

// 当前登录用户信息，从localStorage获取
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// 保存用户数据到localStorage
const saveUsersToStorage = () => {
  localStorage.setItem('users', JSON.stringify(mockUsers));
};

// 保存当前用户到localStorage
const saveCurrentUserToStorage = () => {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
};

// 生成唯一ID
const generateId = () => {
  return Math.max(0, ...mockUsers.map(user => user.id)) + 1;
};

// 检查用户名是否已存在
const isUsernameTaken = (username) => {
  return mockUsers.some(user => user.username.toLowerCase() === username.toLowerCase());
};

// 检查邮箱是否已存在
const isEmailTaken = (email) => {
  return mockUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// 微信OAuth配置参数
const WECHAT_CONFIG = {
  appId: 'wx123456789abcdef', // 替换为您的微信应用ID
  redirectUri: encodeURIComponent(window.location.origin + '/auth/wechat-callback'),
  scope: 'snsapi_userinfo', // 申请用户信息权限
  state: Math.random().toString(36).substr(2, 15) // 随机字符串，防止CSRF攻击
};

// 用户注册
export const register = (userData) => {
  return new Promise((resolve, reject) => {
    // 模拟服务器延迟
    setTimeout(() => {
      try {
        // 验证必填字段
        if (!userData.username || !userData.password || !userData.email) {
          throw new Error("用户名、密码和邮箱为必填项");
        }
        
        // 验证用户名长度
        if (userData.username.length < 3) {
          throw new Error("用户名长度至少为3个字符");
        }
        
        // 验证密码长度
        if (userData.password.length < 6) {
          throw new Error("密码长度至少为6个字符");
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          throw new Error("邮箱格式不正确");
        }
        
        // 检查用户名是否已存在
        if (isUsernameTaken(userData.username)) {
          throw new Error("用户名已被注册");
        }
        
        // 检查邮箱是否已存在
        if (isEmailTaken(userData.email)) {
          throw new Error("邮箱已被注册");
        }
        
        // 创建新用户
        const newUser = {
          id: generateId(),
          username: userData.username,
          password: userData.password, // 实际项目中应当加密处理
          email: userData.email,
          name: userData.name || userData.username,
          avatar: userData.avatar || DEFAULT_AVATAR,
          bio: userData.bio || '',
          favoriteTrips: [],
          completedTrips: []
        };
        
        // 添加到模拟数据库
        mockUsers.push(newUser);
        saveUsersToStorage(); // 保存用户数据到localStorage
        
        // 自动登录
        currentUser = {...newUser};
        delete currentUser.password; // 不返回密码
        saveCurrentUserToStorage(); // 保存当前用户到localStorage
        
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    }, 600);
  });
};

// 用户登录
export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    // 模拟服务器延迟
    setTimeout(() => {
      try {
        // 查找用户
        const user = mockUsers.find(
          user => (user.username === username || user.email === username) && user.password === password
        );
        
        // 验证用户是否存在
        if (!user) {
          throw new Error("用户名或密码不正确");
        }
        
        // 设置当前登录用户
        currentUser = {...user};
        delete currentUser.password; // 不返回密码
        saveCurrentUserToStorage(); // 保存当前用户到localStorage
        
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    }, 600);
  });
};

// 用户登出
export const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem('currentUser'); // 从localStorage中移除当前用户
      resolve({ success: true });
    }, 300);
  });
};

// 获取当前登录用户信息
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentUser);
    }, 300);
  });
};

// 更新用户信息
export const updateUserProfile = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!currentUser) {
          throw new Error("用户未登录");
        }
        
        // 找到当前用户
        const userIndex = mockUsers.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
          throw new Error("用户不存在");
        }
        
        // 验证邮箱格式
        if (userData.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(userData.email)) {
            throw new Error("邮箱格式不正确");
          }
          
          // 如果邮箱已更改，检查是否已被使用
          if (userData.email !== mockUsers[userIndex].email && isEmailTaken(userData.email)) {
            throw new Error("邮箱已被注册");
          }
        }
        
        // 更新用户数据
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          name: userData.name || mockUsers[userIndex].name,
          email: userData.email || mockUsers[userIndex].email,
          avatar: userData.avatar || mockUsers[userIndex].avatar,
          bio: userData.bio !== undefined ? userData.bio : mockUsers[userIndex].bio
        };
        
        saveUsersToStorage(); // 保存用户数据到localStorage
        
        // 更新当前用户
        currentUser = {...mockUsers[userIndex]};
        delete currentUser.password; // 不返回密码
        saveCurrentUserToStorage(); // 保存当前用户到localStorage
        
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    }, 600);
  });
};

// 更改密码
export const changePassword = (oldPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!currentUser) {
          throw new Error("用户未登录");
        }
        
        // 找到当前用户
        const userIndex = mockUsers.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
          throw new Error("用户不存在");
        }
        
        // 验证旧密码
        if (mockUsers[userIndex].password !== oldPassword) {
          throw new Error("旧密码不正确");
        }
        
        // 验证新密码长度
        if (newPassword.length < 6) {
          throw new Error("新密码长度至少为6个字符");
        }
        
        // 更新密码
        mockUsers[userIndex].password = newPassword;
        
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    }, 600);
  });
};

// 添加收藏行程
export const addFavoriteTrip = (tripId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!currentUser) {
          throw new Error("用户未登录");
        }
        
        // 找到当前用户
        const userIndex = mockUsers.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
          throw new Error("用户不存在");
        }
        
        // 检查行程是否已收藏
        if (mockUsers[userIndex].favoriteTrips.includes(tripId)) {
          throw new Error("行程已收藏");
        }
        
        // 添加收藏
        mockUsers[userIndex].favoriteTrips.push(tripId);
        
        // 更新当前用户
        currentUser = {...mockUsers[userIndex]};
        delete currentUser.password; // 不返回密码
        
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    }, 400);
  });
};

// 移除收藏行程
export const removeFavoriteTrip = (tripId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!currentUser) {
          throw new Error("用户未登录");
        }
        
        // 找到当前用户
        const userIndex = mockUsers.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
          throw new Error("用户不存在");
        }
        
        // 检查行程是否已收藏
        const tripIndex = mockUsers[userIndex].favoriteTrips.indexOf(tripId);
        if (tripIndex === -1) {
          throw new Error("行程未收藏");
        }
        
        // 移除收藏
        mockUsers[userIndex].favoriteTrips.splice(tripIndex, 1);
        
        // 更新当前用户
        currentUser = {...mockUsers[userIndex]};
        delete currentUser.password; // 不返回密码
        
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    }, 400);
  });
};

// 添加已完成行程
export const addCompletedTrip = (tripId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!currentUser) {
          throw new Error("用户未登录");
        }
        
        // 找到当前用户
        const userIndex = mockUsers.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
          throw new Error("用户不存在");
        }
        
        // 检查行程是否已完成
        if (mockUsers[userIndex].completedTrips.includes(tripId)) {
          throw new Error("行程已标记为完成");
        }
        
        // 添加已完成行程
        mockUsers[userIndex].completedTrips.push(tripId);
        
        // 更新当前用户
        currentUser = {...mockUsers[userIndex]};
        delete currentUser.password; // 不返回密码
        
        resolve(currentUser);
      } catch (error) {
        reject(error);
      }
    }, 400);
  });
};

// 微信登录功能
export const loginWithWechat = () => {
  return new Promise((resolve, reject) => {
    try {
      // 构建微信授权URL
      const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_CONFIG.appId}&redirect_uri=${WECHAT_CONFIG.redirectUri}&response_type=code&scope=${WECHAT_CONFIG.scope}&state=${WECHAT_CONFIG.state}#wechat_redirect`;
      
      // 保存state到localStorage，以便在回调页面验证
      localStorage.setItem('wechatAuthState', WECHAT_CONFIG.state);
      
      // 跳转到微信授权页面
      window.location.href = authUrl;
      
      // 由于页面跳转，这里不会立即返回用户数据
      // 实际的用户数据会在回调页面中获取并保存
      resolve({ pending: true });
    } catch (error) {
      reject(new Error("微信登录初始化失败，请稍后重试"));
    }
  });
};

// 处理微信授权回调
export const handleWechatCallback = (code, state) => {
  return new Promise((resolve, reject) => {
    // 验证state，防止CSRF攻击
    const savedState = localStorage.getItem('wechatAuthState');
    if (!savedState || savedState !== state) {
      reject(new Error("安全验证失败，请重新登录"));
      return;
    }
    
    // 清除localStorage中的state
    localStorage.removeItem('wechatAuthState');
    
    // 实际项目中，这里需要向后端发送请求交换访问令牌
    // 由于这是前端模拟，我们直接模拟后端返回结果
    setTimeout(() => {
      try {
        // 模拟从微信服务器获取的用户信息
        const wechatUserInfo = {
          openid: 'wx_' + Math.random().toString(36).substr(2, 9),
          nickname: '微信用户' + Math.floor(Math.random() * 10000),
          headimgurl: '/image/wechat-avatar.jpg' || DEFAULT_AVATAR
        };
        
        // 检查是否已存在绑定此微信的用户
        let userIndex = mockUsers.findIndex(user => user.wechatOpenId === wechatUserInfo.openid);
        
        if (userIndex === -1) {
          // 创建新用户
          const newUser = {
            id: generateId(),
            username: 'wx_user_' + Math.floor(Math.random() * 10000),
            password: Math.random().toString(36).substr(2, 15), // 随机密码
            email: `wx_${Math.random().toString(36).substr(2, 6)}@example.com`,
            name: wechatUserInfo.nickname,
            avatar: wechatUserInfo.headimgurl || DEFAULT_AVATAR,
            bio: '',
            wechatOpenId: wechatUserInfo.openid,
            favoriteTrips: [],
            completedTrips: []
          };
          
          // 添加到模拟数据库
          mockUsers.push(newUser);
          saveUsersToStorage(); // 保存用户数据到localStorage
          
          userIndex = mockUsers.length - 1;
        }
        
        // 设置当前登录用户
        currentUser = {...mockUsers[userIndex]};
        delete currentUser.password; // 不返回密码
        saveCurrentUserToStorage(); // 保存当前用户到localStorage
        
        resolve(currentUser);
      } catch (error) {
        reject(new Error("处理微信登录响应失败"));
      }
    }, 1000);
  });
};

// 获取用户点赞的帖子
export const getUserLikedPosts = () => {
  return new Promise((resolve, reject) => {
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        return reject(new Error('用户未登录'));
      }
      
      // 模拟从后端获取用户点赞的帖子
      // 在实际应用中，这将是对后端API的调用
      setTimeout(() => {
        // 这里使用假数据模拟用户点赞的帖子
        const likedPosts = [
          {
            id: 'post-l1',
            title: '探秘九寨沟的自然奇观',
            content: '上周末我有幸前往九寨沟旅行，那里的自然风光让我震撼不已...',
            excerpt: '上周末我有幸前往九寨沟旅行，那里的自然风光让我震撼不已...',
            coverImage: '/images/destinations/jiuzhaigou.jpg',
            author: 'travel_lover',
            authorId: 'user123',
            likes: 86,
            views: 230,
            isLiked: true,
            date: '2023-08-15',
            destination: '九寨沟'
          },
          {
            id: 'post-l2',
            title: '东京美食指南：不可错过的日式料理',
            content: '作为一个美食爱好者，我整理了东京最值得品尝的十家餐厅...',
            excerpt: '作为一个美食爱好者，我整理了东京最值得品尝的十家餐厅...',
            coverImage: '/images/destinations/tokyo.jpg',
            author: 'foodie_traveler',
            authorId: 'user456',
            likes: 125,
            views: 412,
            isLiked: true,
            date: '2023-09-03',
            destination: '东京'
          },
          {
            id: 'post-l3',
            title: '巴厘岛度假攻略：如何度过完美的一周',
            content: '巴厘岛是度假天堂，本文分享我在巴厘岛的一周行程安排和实用建议...',
            excerpt: '巴厘岛是度假天堂，本文分享我在巴厘岛的一周行程安排和实用建议...',
            coverImage: '/images/destinations/bali.jpg',
            author: 'island_explorer',
            authorId: 'user789',
            likes: 94,
            views: 267,
            isLiked: true,
            date: '2023-07-22',
            destination: '巴厘岛'
          }
        ];
        
        resolve(likedPosts);
      }, 800); // 模拟网络延迟
    } catch (error) {
      reject(error);
    }
  });
};

// 获取当前用户发布的帖子
export const getCurrentUserPosts = () => {
  return new Promise((resolve, reject) => {
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        return reject(new Error('用户未登录'));
      }
      
      // 模拟从后端获取用户发布的帖子
      setTimeout(() => {
        // 这里使用假数据模拟用户发布的帖子
        const userPosts = [
          {
            id: 'post1',
            title: '我的巴黎一周游记',
            content: '刚从巴黎回来，这里分享我的旅行体验和实用建议...',
            excerpt: '刚从巴黎回来，这里分享我的旅行体验和实用建议...',
            coverImage: '/images/destinations/paris.jpg',
            author: currentUser.username,
            authorId: currentUser.id,
            likes: 24,
            views: 102,
            isLiked: false,
            date: '2023-10-05',
            destination: '巴黎'
          },
          {
            id: 'post2',
            title: '香港美食探店之旅',
            content: '上个月在香港品尝了各种地道美食，推荐以下餐厅...',
            excerpt: '上个月在香港品尝了各种地道美食，推荐以下餐厅...',
            coverImage: '/images/destinations/hongkong.jpg',
            author: currentUser.username,
            authorId: currentUser.id,
            likes: 18,
            views: 87,
            isLiked: false,
            date: '2023-09-15',
            destination: '香港'
          }
        ];
        
        resolve(userPosts);
      }, 600); // 模拟网络延迟
    } catch (error) {
      reject(error);
    }
  });
};