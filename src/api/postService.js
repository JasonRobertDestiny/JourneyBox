/**
 * 帖子服务 - 提供与社区帖子相关的API功能
 */

import { userService } from './userService';

// 默认头像路径
const DEFAULT_AVATAR = '/image/cat.jpg';

// 模拟数据库中的帖子数据
let posts = [
  {
    id: '1',
    title: '探索云南秘境：一场心灵的旅行',
    content: '去年十月，我踏上了云南的土地，开始了一段难忘的旅程。从昆明出发，经过大理、丽江，最终到达香格里拉。沿途的风景如画，少数民族的文化底蕴深厚，让我流连忘返。特别是在梅里雪山脚下的小村庄，我度过了最宁静的时光，看云卷云舒，体验最纯粹的生活。推荐大家一定要去体验一次！',
    authorId: '1',
    destination: '云南',
    createdAt: '2023-05-10T08:30:00Z',
    updatedAt: '2023-05-10T08:30:00Z',
    imageUrl: null,
    tags: ['自然风光', '民族文化', '徒步旅行'],
    likes: ['2', '3'],
    comments: [
      { id: '101', authorId: '2', content: '太美了！我也想去！', createdAt: '2023-05-10T10:15:00Z' },
      { id: '102', authorId: '3', content: '请问去香格里拉需要注意什么？', createdAt: '2023-05-10T14:22:00Z' }
    ],
    viewCount: 358
  },
  {
    id: '2',
    title: '日本关西五日游：寻找传统与现代的平衡',
    content: '刚从日本关西地区回来，这次旅行主要集中在京都和大阪两地。京都的寺庙和庭园保存了日本最传统的一面，而大阪则充满了现代都市的活力。秋天的京都尤其美丽，红叶将古寺点缀得分外妖娆。我在岚山的竹林中漫步，在伏见稻荷大社的千本鸟居间穿行，每一刻都是难忘的体验。美食方面，一定不要错过大阪的章鱼烧和京都的怀石料理！',
    authorId: '2',
    destination: '日本',
    createdAt: '2023-06-15T14:45:00Z',
    updatedAt: '2023-06-16T09:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    tags: ['城市探索', '美食', '文化遗产'],
    likes: ['1', '4'],
    comments: [
      { id: '201', authorId: '1', content: '伏见稻荷大社人多吗？有什么参观建议？', createdAt: '2023-06-15T16:30:00Z' }
    ],
    viewCount: 267
  },
  {
    id: '3',
    title: '泰国清迈：数字游民的天堂',
    content: '作为一名自由职业者，我在清迈待了整整两个月。这里不仅有丰富的文化体验，还有完善的数字游民基础设施。城市里遍布各种咖啡馆和共享工作空间，WiFi信号强劲，生活成本又相对较低。周末可以参加周六夜市或周日步行街，品尝各种街头美食；或者去周边的自然景点，如素贴山和清道湖放松心情。如果你也是远程工作者，强烈推荐你来清迈体验一段时间！',
    authorId: '3',
    destination: '泰国',
    createdAt: '2023-07-20T11:20:00Z',
    updatedAt: '2023-07-20T11:20:00Z',
    imageUrl: null,
    tags: ['数字游民', '长期旅行', '工作旅行'],
    likes: ['1', '2', '4'],
    comments: [],
    viewCount: 189
  },
  {
    id: '4',
    title: '新西兰南岛自驾：与大自然的亲密接触',
    content: '上个月完成了新西兰南岛的自驾之旅，这里的自然风光令人叹为观止。从基督城出发，经过蒂卡波湖、库克山、皇后镇、米尔福德峡湾，最后到达但尼丁。路上几乎没有什么交通，开车非常舒适。米尔福德峡湾的游船之旅绝对是此行亮点，峡湾两侧的瀑布和海豹让人难以忘怀。住宿方面，建议提前预订，特别是在旅游旺季。自驾对于喜欢自由行的旅行者来说是最佳选择！',
    authorId: '4',
    destination: '新西兰',
    createdAt: '2023-08-05T19:50:00Z',
    updatedAt: '2023-08-06T10:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1469521669194-babb45599def',
    tags: ['自驾', '自然风光', '户外活动'],
    likes: ['1'],
    comments: [
      { id: '401', authorId: '1', content: '自驾需要国际驾照吗？', createdAt: '2023-08-05T21:10:00Z' },
      { id: '402', authorId: '3', content: '米尔福德峡湾的天气如何？需要提前几天预订游船？', createdAt: '2023-08-06T08:45:00Z' }
    ],
    viewCount: 145
  },
  {
    id: '5',
    title: '摩洛哥撒哈拉沙漠之旅：星空下的梦幻体验',
    content: '摩洛哥之行中，撒哈拉沙漠露营是最难忘的体验。从菲斯乘坐越野车前往梅尔祖卡，然后骑骆驼深入沙漠腹地。白天，金色的沙丘连绵起伏；夜晚，满天繁星近在咫尺。贝都因人的营地非常舒适，晚上有篝火晚会和传统鼓乐表演。虽然沙漠气温昼夜温差大，但这种独特的体验绝对值得。如果你想要一次与众不同的旅行，撒哈拉沙漠一定不会让你失望！',
    authorId: '5',
    destination: '摩洛哥',
    createdAt: '2023-09-12T16:05:00Z',
    updatedAt: '2023-09-12T16:05:00Z',
    imageUrl: null,
    tags: ['沙漠', '星空', '文化体验'],
    likes: ['2', '3', '4'],
    comments: [
      { id: '501', authorId: '2', content: '请问什么季节去最合适？', createdAt: '2023-09-12T18:20:00Z' }
    ],
    viewCount: 213
  }
];

// 获取所有帖子（支持分页和筛选）
const getAllPosts = (params = {}) => {
  const { 
    page = 1, 
    limit = 10, 
    tags, 
    destination, 
    authorId, 
    sortBy = 'createdAt', 
    order = 'desc'
  } = params;

  let filteredPosts = [...posts];
  
  // 应用筛选条件
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filteredPosts = filteredPosts.filter(post => 
      post.tags && post.tags.some(tag => tagArray.includes(tag))
    );
  }
  
  if (destination) {
    filteredPosts = filteredPosts.filter(post => 
      post.destination && post.destination.toLowerCase().includes(destination.toLowerCase())
    );
  }
  
  if (authorId) {
    filteredPosts = filteredPosts.filter(post => post.authorId === authorId);
  }
  
  // 应用排序
  filteredPosts.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'likes') {
      aValue = a.likes?.length || 0;
      bValue = b.likes?.length || 0;
    } else if (sortBy === 'comments') {
      aValue = a.comments?.length || 0;
      bValue = b.comments?.length || 0;
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // 应用分页
  const startIndex = (page - 1) * limit;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);
  
  return {
    posts: paginatedPosts,
    pagination: {
      total: filteredPosts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPosts.length / limit)
    }
  };
};

// 获取单篇帖子
const getPostById = (id) => {
  const post = posts.find(post => post.id === id);
  
  if (!post) {
    throw new Error('帖子不存在');
  }
  
  // 增加浏览量
  post.viewCount = (post.viewCount || 0) + 1;
  
  return { ...post };
};

// 创建新帖子
const createPost = (postData) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  if (!postData.title || !postData.content) {
    throw new Error('标题和内容不能为空');
  }
  
  const newPost = {
    id: String(Date.now()),
    ...postData,
    authorId: currentUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: [],
    comments: [],
    viewCount: 0
  };
  
  posts.unshift(newPost);
  return newPost;
};

// 更新帖子
const updatePost = (id, postData) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    throw new Error('帖子不存在');
  }
  
  const post = posts[postIndex];
  
  // 检查是否是帖子作者
  if (post.authorId !== currentUser.id && !currentUser.isAdmin) {
    throw new Error('没有权限更新此帖子');
  }
  
  // 更新帖子内容
  const updatedPost = {
    ...post,
    ...postData,
    updatedAt: new Date().toISOString()
  };
  
  posts[postIndex] = updatedPost;
  
  return updatedPost;
};

// 删除帖子
const deletePost = (id) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    throw new Error('帖子不存在');
  }
  
  // 检查是否是帖子作者或管理员
  if (posts[postIndex].authorId !== currentUser.id && !currentUser.isAdmin) {
    throw new Error('没有权限删除此帖子');
  }
  
  // 删除帖子
  posts.splice(postIndex, 1);
  
  return { success: true, message: '帖子已删除' };
};

// 点赞帖子
const likePost = (id) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  const post = posts.find(post => post.id === id);
  
  if (!post) {
    throw new Error('帖子不存在');
  }
  
  // 确保likes数组存在
  if (!post.likes) {
    post.likes = [];
  }
  
  // 检查用户是否已点赞
  if (post.likes.includes(currentUser.id)) {
    return { liked: true, message: '已经点赞过此帖子' };
  }
  
  // 添加点赞
  post.likes.push(currentUser.id);
  
  return { liked: true, message: '点赞成功' };
};

// 取消点赞
const unlikePost = (id) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  const post = posts.find(post => post.id === id);
  
  if (!post) {
    throw new Error('帖子不存在');
  }
  
  // 确保likes数组存在
  if (!post.likes) {
    post.likes = [];
    return { liked: false, message: '未点赞此帖子' };
  }
  
  // 检查用户是否已点赞
  const likeIndex = post.likes.indexOf(currentUser.id);
  if (likeIndex === -1) {
    return { liked: false, message: '未点赞此帖子' };
  }
  
  // 移除点赞
  post.likes.splice(likeIndex, 1);
  
  return { liked: false, message: '取消点赞成功' };
};

// 添加评论
const addComment = (postId, content) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  if (!content || content.trim() === '') {
    throw new Error('评论内容不能为空');
  }
  
  const post = posts.find(post => post.id === postId);
  
  if (!post) {
    throw new Error('帖子不存在');
  }
  
  // 确保comments数组存在
  if (!post.comments) {
    post.comments = [];
  }
  
  // 创建新评论
  const newComment = {
    id: `comment_${Date.now()}`,
    authorId: currentUser.id,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };
  
  // 添加评论
  post.comments.push(newComment);
  
  return newComment;
};

// 删除评论
const deleteComment = (postId, commentId) => {
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('用户未登录');
  }
  
  const post = posts.find(post => post.id === postId);
  
  if (!post || !post.comments) {
    throw new Error('帖子或评论不存在');
  }
  
  const commentIndex = post.comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    throw new Error('评论不存在');
  }
  
  // 检查是否是评论作者或帖子作者或管理员
  const comment = post.comments[commentIndex];
  if (comment.authorId !== currentUser.id && post.authorId !== currentUser.id && !currentUser.isAdmin) {
    throw new Error('没有权限删除此评论');
  }
  
  // 删除评论
  post.comments.splice(commentIndex, 1);
  
  return { success: true, message: '评论已删除' };
};

// 搜索帖子
const searchPosts = (query, options = {}) => {
  if (!query || query.trim() === '') {
    return getAllPosts(options);
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  const matchingPosts = posts.filter(post => {
    // 在标题、内容、标签和目的地中搜索
    return (
      (post.title && post.title.toLowerCase().includes(searchTerm)) ||
      (post.content && post.content.toLowerCase().includes(searchTerm)) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
      (post.destination && post.destination.toLowerCase().includes(searchTerm))
    );
  });
  
  // 应用分页等选项
  const { page = 1, limit = 10 } = options;
  const startIndex = (page - 1) * limit;
  const paginatedResults = matchingPosts.slice(startIndex, startIndex + limit);
  
  return {
    posts: paginatedResults,
    pagination: {
      total: matchingPosts.length,
      page,
      limit,
      totalPages: Math.ceil(matchingPosts.length / limit)
    }
  };
};

// 获取热门帖子
const getHotPosts = (limit = 5) => {
  // 基于点赞数、评论数和浏览量计算热度分数
  const postsWithScore = posts.map(post => {
    const likeScore = (post.likes?.length || 0) * 3;  // 点赞权重高
    const commentScore = (post.comments?.length || 0) * 2;  // 评论权重中
    const viewScore = (post.viewCount || 0) * 0.1;  // 浏览权重低
    
    return {
      ...post,
      hotScore: likeScore + commentScore + viewScore
    };
  });
  
  // 按热度分数排序
  postsWithScore.sort((a, b) => b.hotScore - a.hotScore);
  
  // 返回前N个
  return postsWithScore.slice(0, limit);
};

// 导出API
export const postService = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  searchPosts,
  getHotPosts
}; 