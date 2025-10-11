/**
 * 目的地图片工具函数
 */

// 使用稳定的图片服务
const PLACEHOLDER_BASE = 'https://picsum.photos/';

// 热门目的地和对应的高质量图片映射
const destinationImageMap = {
  '北京': 'https://picsum.photos/seed/beijing/800/500',
  '上海': 'https://picsum.photos/seed/shanghai/800/500',
  '广州': 'https://picsum.photos/seed/guangzhou/800/500',
  '深圳': 'https://picsum.photos/seed/shenzhen/800/500',
  '成都': 'https://picsum.photos/seed/chengdu/800/500',
  '杭州': 'https://picsum.photos/seed/hangzhou/800/500',
  '西安': 'https://picsum.photos/seed/xian/800/500',
  '重庆': 'https://picsum.photos/seed/chongqing/800/500',
  '厦门': 'https://picsum.photos/seed/xiamen/800/500',
  '三亚': 'https://picsum.photos/seed/sanya/800/500',
  '丽江': 'https://picsum.photos/seed/lijiang/800/500',
  '大理': 'https://picsum.photos/seed/dali/800/500',
  '香港': 'https://picsum.photos/seed/hongkong/800/500',
  '澳门': 'https://picsum.photos/seed/macau/800/500',
  '台北': 'https://picsum.photos/seed/taipei/800/500',
  '昆明': 'https://picsum.photos/seed/kunming/800/500',
  '青岛': 'https://picsum.photos/seed/qingdao/800/500',
  '苏州': 'https://picsum.photos/seed/suzhou/800/500',
  '南京': 'https://picsum.photos/seed/nanjing/800/500',
  '武汉': 'https://picsum.photos/seed/wuhan/800/500',
  // 国际目的地
  'Tokyo': 'https://picsum.photos/seed/tokyo/800/500',
  'Kyoto': 'https://picsum.photos/seed/kyoto/800/500',
  'Bangkok': 'https://picsum.photos/seed/bangkok/800/500',
  'Singapore': 'https://picsum.photos/seed/singapore/800/500',
  'Paris': 'https://picsum.photos/seed/paris/800/500',
  'London': 'https://picsum.photos/seed/london/800/500',
  'New York': 'https://picsum.photos/seed/newyork/800/500',
};

// 社区帖子高质量封面图片映射（小红书风格）
const communityImageMap = {
  // 城市旅行
  '北京': [
    'https://picsum.photos/seed/beijing1/800/600',
    'https://picsum.photos/seed/beijing2/800/600',
    'https://picsum.photos/seed/beijing3/800/600'
  ],
  '上海': [
    'https://picsum.photos/seed/shanghai1/800/600',
    'https://picsum.photos/seed/shanghai2/800/600',
    'https://picsum.photos/seed/shanghai3/800/600'
  ],
  '广州': [
    'https://picsum.photos/seed/guangzhou1/800/600',
    'https://picsum.photos/seed/guangzhou2/800/600',
    'https://picsum.photos/seed/guangzhou3/800/600'
  ],
  '成都': [
    'https://picsum.photos/seed/chengdu1/800/600',
    'https://picsum.photos/seed/chengdu2/800/600',
    'https://picsum.photos/seed/chengdu3/800/600'
  ],
  '杭州': [
    'https://picsum.photos/seed/hangzhou1/800/600',
    'https://picsum.photos/seed/hangzhou2/800/600',
    'https://picsum.photos/seed/hangzhou3/800/600'
  ],
  '大理': [
    'https://picsum.photos/seed/dali1/800/600',
    'https://picsum.photos/seed/dali2/800/600',
    'https://picsum.photos/seed/dali3/800/600'
  ],
  // 主题旅行
  '美食': [
    'https://picsum.photos/seed/food1/800/600',
    'https://picsum.photos/seed/food2/800/600',
    'https://picsum.photos/seed/food3/800/600'
  ],
  '人文': [
    'https://picsum.photos/seed/culture1/800/600',
    'https://picsum.photos/seed/culture2/800/600',
    'https://picsum.photos/seed/culture3/800/600'
  ],
  '自然': [
    'https://picsum.photos/seed/nature1/800/600',
    'https://picsum.photos/seed/nature2/800/600',
    'https://picsum.photos/seed/nature3/800/600'
  ],
  '城市': [
    'https://picsum.photos/seed/city1/800/600',
    'https://picsum.photos/seed/city2/800/600',
    'https://picsum.photos/seed/city3/800/600'
  ]
};

// 特定关键词到图片的映射
const keywordImageMap = {
  '长城': 'https://picsum.photos/seed/greatwall/800/600',
  '故宫': 'https://picsum.photos/seed/forbiddencity/800/600',
  '兵马俑': 'https://picsum.photos/seed/terracotta/800/600',
  '西湖': 'https://picsum.photos/seed/westlake/800/600',
  '黄山': 'https://picsum.photos/seed/huangshan/800/600',
  '三亚': 'https://picsum.photos/seed/sanyabeach/800/600',
  '火锅': 'https://picsum.photos/seed/hotpot/800/600',
  '茶': 'https://picsum.photos/seed/tea/800/600',
  '功夫': 'https://picsum.photos/seed/kungfu/800/600',
  '熊猫': 'https://picsum.photos/seed/panda/800/600',
  '寺庙': 'https://picsum.photos/seed/temple/800/600',
  '长江': 'https://picsum.photos/seed/yangtze/800/600',
  '黄河': 'https://picsum.photos/seed/yellowriver/800/600'
};

// 分析帖子标题和内容，寻找适合的封面图片
const titleKeywords = {
  '美食': ['美食', '吃', '小吃', '餐厅', '饮食', '烧烤', '火锅', '特色菜', '菜', '饭', '面', '茶', '咖啡', '甜点', '早餐', '午餐', '晚餐'],
  '人文': ['文化', '历史', '古迹', '博物馆', '艺术', '寺庙', '古城', '传统', '宫殿', '民族', '习俗', '传统', '节日', '祭祀', '庙宇', '宗教'],
  '自然': ['自然', '山', '湖', '海', '风景', '日出', '日落', '森林', '沙滩', '岛', '峡谷', '公园', '花', '树', '瀑布', '河流', '峰'],
  '城市': ['城市', '都市', '街道', '建筑', '摩天大楼', '夜景', '市区', '广场', '商场', '酒店', '民宿', '地铁', '交通', '公交', '出行']
};

// 通用默认图片 - 使用稳定服务
const DEFAULT_IMAGE = 'https://picsum.photos/seed/china/800/600';
const DEFAULT_COMMUNITY_IMAGE = 'https://picsum.photos/seed/travelblog/800/600';

// 随机旅行图片集，确保有图可用
const randomTravelImages = [
  'https://picsum.photos/seed/travel1/800/600',
  'https://picsum.photos/seed/travel2/800/600',
  'https://picsum.photos/seed/travel3/800/600',
  'https://picsum.photos/seed/travel4/800/600',
  'https://picsum.photos/seed/travel5/800/600',
  'https://picsum.photos/seed/travel6/800/600',
  'https://picsum.photos/seed/travel7/800/600',
  'https://picsum.photos/seed/travel8/800/600',
  'https://picsum.photos/seed/travel9/800/600',
  'https://picsum.photos/seed/travel10/800/600'
];

// 已加载过的图片缓存，防止重复请求
const loadedImagesCache = new Map();

/**
 * 获取随机图片URL
 * @returns {string} 随机图片URL
 */
const getRandomTravelImage = () => {
  const randomIndex = Math.floor(Math.random() * randomTravelImages.length);
  return randomTravelImages[randomIndex];
};

/**
 * 获取目的地对应的图片路径
 * @param {string} destination 目的地名称
 * @param {string|null} coverImage 可选的封面图片
 * @returns {string} 图片路径
 */
export const getDestinationImage = (destination, coverImage = null) => {
  // 如果有封面图片，优先使用封面图片
  if (coverImage) {
    // 检查是否为http/https开头，如果是则直接返回
    if (/^https?:\/\//i.test(coverImage)) {
      return coverImage;
    }
    // 否则检查是否以/开头
    return coverImage.startsWith('/') ? coverImage : `/${coverImage}`;
  }
  
  // 尝试从映射表中获取目的地图片
  if (destination) {
    // 标准化目的地名称
    const normalizedName = destination.trim();
    
    // 检查映射表中是否有对应图片
    if (destinationImageMap[normalizedName]) {
      return destinationImageMap[normalizedName];
    }
    
    // 尝试生成随机图片
    return `${PLACEHOLDER_BASE}800/500?random=${encodeURIComponent(normalizedName)}`;
  }
  
  // 默认图片
  return DEFAULT_IMAGE;
};

/**
 * 图片加载失败时的处理函数 - 改进版，避免频闪
 * @param {Event} event 错误事件
 * @param {string} destination 目的地名称
 */
export const handleImageError = (event, destination) => {
  // 防止循环触发错误
  event.target.onerror = null;
  
  // 获取原始图片URL
  const originalSrc = event.target.src;
  
  // 如果已经尝试过fallback，不再尝试避免循环
  if (originalSrc === DEFAULT_IMAGE) {
    console.warn('默认图片也加载失败，使用备用随机图片');
    event.target.src = getRandomTravelImage();
    return;
  }
  
  // 尝试使用picsum图片服务
  if (destination) {
    const fallbackUrl = `${PLACEHOLDER_BASE}800/500?random=${Math.random()}`;
    console.log(`图片 ${originalSrc} 加载失败，尝试使用 ${fallbackUrl}`);
    event.target.src = fallbackUrl;
    
    // 为这个新图片添加错误处理，如果再次失败，直接使用随机图片
    event.target.onerror = (e) => {
      e.target.onerror = null;
      e.target.src = getRandomTravelImage();
    };
  } else {
    // 直接使用随机图片
    event.target.src = getRandomTravelImage();
  }
};

/**
 * 从关键词中查找最相关的图片URL
 * @param {string} content 文本内容
 * @returns {string|null} 图片URL或null
 */
const findImageByKeywords = (content) => {
  if (!content) return null;
  
  // 遍历关键词映射
  for (const [keyword, imageUrl] of Object.entries(keywordImageMap)) {
    if (content.includes(keyword)) {
      return imageUrl;
    }
  }
  
  return null;
};

/**
 * 根据帖子信息获取适合的封面图片 - 改进版，确保一定有图片
 * @param {Object} post 帖子对象，包含标题、内容等信息
 * @param {number} index 如果有多张图片，指定使用第几张（0-based）
 * @returns {string} 图片路径
 */
export const getCommunityPostImage = (post, index = 0) => {
  // 生成缓存键
  const cacheKey = `post_${post?.id || 'new'}_image_${index}`;
  
  // 如果已经有缓存的图片URL，直接返回
  if (loadedImagesCache.has(cacheKey)) {
    return loadedImagesCache.get(cacheKey);
  }
  
  // 如果帖子已有图片，优先使用
  if (post?.images && post.images.length > index) {
    const imageUrl = post.images[index];
    loadedImagesCache.set(cacheKey, imageUrl);
    return imageUrl;
  }
  
  // 错误保护：如果没有post对象，返回随机图片
  if (!post) {
    const randomImage = getRandomTravelImage();
    loadedImagesCache.set(cacheKey, randomImage);
    return randomImage;
  }
  
  // 合并标题和内容用于分析
  const combinedContent = `${post.title || ''} ${post.content || ''}`;
  
  // 尝试通过关键词查找匹配的图片
  const keywordMatch = findImageByKeywords(combinedContent);
  if (keywordMatch) {
    loadedImagesCache.set(cacheKey, keywordMatch);
    return keywordMatch;
  }
  
  // 从标题和内容中提取城市名称
  const cityName = extractCityFromPost(post);
  if (cityName && communityImageMap[cityName]) {
    // 确保索引在有效范围内
    const imageIndex = index % communityImageMap[cityName].length;
    const imageUrl = communityImageMap[cityName][imageIndex];
    loadedImagesCache.set(cacheKey, imageUrl);
    return imageUrl;
  }
  
  // 从标题和内容中提取主题
  const theme = extractThemeFromPost(post);
  if (theme && communityImageMap[theme]) {
    // 确保索引在有效范围内
    const imageIndex = index % communityImageMap[theme].length;
    const imageUrl = communityImageMap[theme][imageIndex];
    loadedImagesCache.set(cacheKey, imageUrl);
    return imageUrl;
  }
  
  // 所有方法都失败，返回随机图片
  const randomImage = getRandomTravelImage();
  loadedImagesCache.set(cacheKey, randomImage);
  return randomImage;
};

/**
 * 从帖子中提取城市名称
 * @param {Object} post 帖子对象
 * @returns {string|null} 城市名称或null
 */
const extractCityFromPost = (post) => {
  if (!post) return null;
  const content = `${post.title || ''} ${post.content || ''}`;
  
  // 检查内容中是否包含已知的城市名称
  for (const city in communityImageMap) {
    // 跳过主题关键词
    if (['美食', '人文', '自然', '城市'].includes(city)) continue;
    
    if (content.includes(city)) {
      return city;
    }
  }
  
  return null;
};

/**
 * 从帖子中提取主题
 * @param {Object} post 帖子对象
 * @returns {string} 主题名称（美食/人文/自然/城市）
 */
const extractThemeFromPost = (post) => {
  if (!post) return '城市'; // 默认主题
  const content = `${post.title || ''} ${post.content || ''}`.toLowerCase();
  
  // 记录每个主题匹配的关键词数量
  const matchCounts = { '美食': 0, '人文': 0, '自然': 0, '城市': 0 };
  
  for (const theme in titleKeywords) {
    for (const keyword of titleKeywords[theme]) {
      if (content.includes(keyword)) {
        matchCounts[theme] += 1;
      }
    }
  }
  
  // 找出匹配关键词最多的主题
  let bestTheme = '城市'; // 默认主题
  let maxCount = 0;
  
  for (const [theme, count] of Object.entries(matchCounts)) {
    if (count > maxCount) {
      maxCount = count;
      bestTheme = theme;
    }
  }
  
  return bestTheme;
};

/**
 * 社区帖子图片加载失败时的处理函数 - 改进版，保证一定有图片显示
 * @param {Event} event 错误事件
 * @param {Object} post 帖子对象
 * @param {number} fallbackIndex 备用图片索引
 */
export const handleCommunityImageError = (event, post, fallbackIndex = 0) => {
  // 防止循环触发错误
  event.target.onerror = null;
  
  // 获取原始图片URL
  const originalSrc = event.target.src;
  
  // 如果已经尝试过默认图片，直接使用随机图片
  if (originalSrc === DEFAULT_COMMUNITY_IMAGE) {
    event.target.src = getRandomTravelImage();
    return;
  }
  
  // 使用简单的随机图片，确保能加载
  const randomIndex = Math.floor(Math.random() * 1000);
  const fallbackUrl = `${PLACEHOLDER_BASE}800/600?random=${randomIndex}`;
  
  console.log(`社区图片 ${originalSrc} 加载失败，尝试使用随机图片 ${fallbackUrl}`);
  event.target.src = fallbackUrl;
  
  // 为这个新图片添加错误处理，如果再次失败，使用随机备选图片
  event.target.onerror = (e) => {
    e.target.onerror = null;
    e.target.src = getRandomTravelImage();
  };
};