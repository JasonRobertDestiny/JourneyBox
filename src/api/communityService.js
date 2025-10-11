// 模拟社区帖子数据
const mockPosts = [
  {
    id: 1,
    title: "北京胡同深度游，寻觅老北京的市井生活",
    content: `今天终于有机会探索了北京最有特色的胡同文化！
    
南锣鼓巷真的超级文艺，每一家店都藏着不同的故事。我特别喜欢那家老式茶馆，老板是个70多岁的老爷爷，泡的茶香气扑鼻，还给我讲了很多老北京的故事。

胡同里的居民特别热情，有个大妈看我拍照，主动邀请我进她家的四合院参观，那个院子至少有200年历史了！屋内的老物件每一样都是活历史。

如果你想体验真正的北京文化，一定要走进胡同，感受最地道的市井生活。下次我打算去什刹海，听说那边的四合院更多！

#北京旅行 #胡同文化 #人文探索`,
    images: [
      "/image/community/hutong1.jpg",
      "/image/community/hutong2.jpg",
      "/image/community/hutong3.jpg"
    ],
    author: {
      id: 2,
      username: "旅行小狮子",
      avatar: "/image/avatar2.jpg"
    },
    publishDate: "2023-09-15",
    likes: 157,
    comments: 23,
    views: 562,
    commentsData: [
      {
        id: '101',
        authorId: 3,
        authorName: '吃货小分队',
        authorAvatar: '/image/avatar3.jpg',
        content: '南锣鼓巷的烤肉季我每次去北京都必吃！你有去尝试吗？',
        time: '2023-09-15 15:30',
        likes: 12
      },
      {
        id: '102',
        authorId: 5,
        authorName: '旅行的意义',
        authorAvatar: '/image/avatar5.jpg',
        content: '最爱胡同里的烟火气息，感觉才是真正的北京。下次计划去北京，一定要请教你有什么好玩的地方～',
        time: '2023-09-15 16:45',
        likes: 8
      },
      {
        id: '103',
        authorId: 6,
        authorName: '北方小厨娘',
        authorAvatar: '/image/avatar6.jpg',
        content: '老北京的四合院真的很有魅力！那位大妈真热情，感觉北京人民都很友善呢',
        time: '2023-09-16 09:10',
        likes: 5
      },
      {
        id: '104',
        authorId: 4,
        authorName: '独行者小K',
        authorAvatar: '/image/avatar4.jpg',
        content: '这些照片拍得真棒！用什么相机拍的？色调很舒服',
        time: '2023-09-16 12:22',
        likes: 7
      },
      {
        id: '105',
        authorId: 7,
        authorName: '城市漫步者',
        authorAvatar: '/image/cat.jpg',
        content: '胡同文化是北京最吸引人的地方之一，感谢分享！',
        time: '2023-09-16 14:35',
        likes: 3
      }
    ]
  },
  {
    id: 2,
    title: "成都美食一日游，从早吃到晚的幸福指南",
    content: `成都，一座来了就不想走的城市，最大的原因就是——太好吃啦！

早上7点就出发，第一站直奔春熙路的"赖汤圆"，刚出锅的黑芝麻汤圆，一口下去满嘴香甜！接着去了"三大炮"，看老板那个打炮手势，太有趣了，味道也很赞。

中午的午餐选择了"陈麻婆豆腐"，正宗的麻婆豆腐麻辣鲜香，配上一碗米饭，完美！下午茶时间在宽窄巷子的茶馆休息，点了茉莉花茶和三大炮，看着人来人往，感觉生活真美好。

晚餐在锦里古街，串串香、冒菜、兔头、钵钵鸡...天呐，我的胃太小了，根本吃不完！但是真的每一样都想尝试！

吃货们，成都真的是天堂，下次我要再来一周，把所有美食都吃个遍！

#成都旅行 #美食之旅 #吃货日记`,
    images: [
      "/image/community/chengdu_food1.jpg",
      "/image/community/chengdu_food2.jpg",
      "/image/community/chengdu_food3.jpg",
      "/image/community/chengdu_food4.jpg"
    ],
    author: {
      id: 3,
      username: "吃货小分队",
      avatar: "/image/avatar3.jpg"
    },
    publishDate: "2023-09-10",
    likes: 328,
    comments: 45,
    views: 1203,
    commentsData: [
      {
        id: '201',
        authorId: 2,
        authorName: '旅行小狮子',
        authorAvatar: '/image/avatar2.jpg',
        content: '看完你的帖子，我决定下个月去成都！这些美食看起来太诱人了！',
        time: '2023-09-10 11:20',
        likes: 23
      },
      {
        id: '202',
        authorId: 4,
        authorName: '独行者小K',
        authorAvatar: '/image/avatar4.jpg',
        content: '成都的火锅是我的最爱，你有什么火锅店推荐吗？',
        time: '2023-09-10 14:05',
        likes: 18
      },
      {
        id: '203',
        authorId: 5,
        authorName: '旅行的意义',
        authorAvatar: '/image/avatar5.jpg',
        content: '宽窄巷子真的很有味道，每次去成都都会去那里坐坐~',
        time: '2023-09-11 09:30',
        likes: 15
      },
      {
        id: '204',
        authorId: 6,
        authorName: '北方小厨娘',
        authorAvatar: '/image/avatar6.jpg',
        content: '作为一个北方人，我一直想学做川菜，陈麻婆豆腐真的是太经典了！',
        time: '2023-09-11 16:48',
        likes: 12
      },
      {
        id: '205',
        authorId: 8,
        authorName: '美食猎人',
        authorAvatar: '/image/cat.jpg',
        content: '看完照片已经流口水了，下周就去成都！请问春熙路的赖汤圆具体在哪个位置啊？',
        time: '2023-09-12 10:15',
        likes: 10
      }
    ]
  },
  {
    id: 3,
    title: "杭州西湖边的一场说走就走的独行",
    content: `周五下班后，突然很想看看西湖，于是收拾行囊，一个人坐上了去杭州的高铁。

住在了湖边的青旅，早上5点爬起来看日出，西湖的晨雾中，断桥若隐若现，远处的雷峰塔伫立在朝霞中，美得像一幅画。清晨的湖边几乎没有游客，偶尔有晨练的当地人，和我一样静静欣赏这份难得的宁静。

沿着苏堤漫步，柳树垂丝，与湖水相映，拍了无数张照片也无法表达我当时的心情。中午在知味观吃了正宗的西湖醋鱼和龙井虾仁，下午去灵隐寺听了一下午的钟声。

一个人的旅行有时候更能感受到内心的声音。回程的高铁上，看着窗外飞逝的风景，突然觉得心灵被净化了。

有时候，最美的风景就在我们身边，只是缺少一份说走就走的勇气。

#杭州西湖 #独自旅行 #心灵之旅`,
    images: [
      "/image/community/hangzhou1.jpg",
      "/image/community/hangzhou2.jpg"
    ],
    author: {
      id: 4,
      username: "独行者小K",
      avatar: "/image/avatar4.jpg"
    },
    publishDate: "2023-09-05",
    likes: 256,
    comments: 38,
    views: 879,
    commentsData: [
      {
        id: '301',
        authorId: 2,
        authorName: '旅行小狮子',
        authorAvatar: '/image/avatar2.jpg',
        content: '独自旅行真的很享受那种自由感，西湖的清晨真的太美了！',
        time: '2023-09-05 13:28',
        likes: 16
      },
      {
        id: '302',
        authorId: 3,
        authorName: '吃货小分队',
        authorAvatar: '/image/avatar3.jpg',
        content: '知味观的西湖醋鱼是杭州必吃啊！我很喜欢那里的东坡肉，你试过吗？',
        time: '2023-09-05 15:40',
        likes: 14
      },
      {
        id: '303',
        authorId: 5,
        authorName: '旅行的意义',
        authorAvatar: '/image/avatar5.jpg',
        content: '听钟声、观湖景，你的旅行方式真的很有禅意。我也想一个人去一次西湖。',
        time: '2023-09-06 09:15',
        likes: 12
      },
      {
        id: '304',
        authorId: 7,
        authorName: '城市漫步者',
        authorAvatar: '/image/cat.jpg',
        content: '你住的青旅叫什么名字呀？环境看起来很不错！',
        time: '2023-09-06 18:22',
        likes: 8
      },
      {
        id: '305',
        authorId: 9,
        authorName: '摄影师阿诚',
        authorAvatar: '/image/cat.jpg',
        content: '这照片拍得太美了，尤其是晨雾中的断桥，有种梦幻感～',
        time: '2023-09-07 10:30',
        likes: 11
      }
    ]
  },
  {
    id: 4,
    title: "云南大理古城，遇见最美的风花雪月",
    content: `终于来到了梦寐以求的大理古城，这里的一切都像诗一样美好。

古城的青石板路，走在上面仿佛穿越回了古代。路边的白族老奶奶卖着手工银饰，每一件都是独一无二的艺术品。我买了一个银手镯，老奶奶还教我了几句白族话，虽然我马上就忘了，但那一刻的交流很温暖。

傍晚在洱海边骑行，夕阳把洱海染成了金色，远处的苍山在云雾中若隐若现。遇到一群当地的孩子在放风筝，他们邀请我一起玩，那种纯真的快乐真的很久没有体验过了。

晚上古城的酒吧很热闹，偶遇了一位会弹唱的白族小哥，他的民谣唱得很好听，我们一群旅行者围着他，唱了一晚上的歌。

大理真的是一个让人想留下来的地方，我已经在计划下次什么时候再来了！

#云南大理 #古城风情 #民族文化`,
    images: [
      "/image/community/dali1.jpg",
      "/image/community/dali2.jpg",
      "/image/community/dali3.jpg"
    ],
    author: {
      id: 5,
      username: "旅行的意义",
      avatar: "/image/avatar5.jpg"
    },
    publishDate: "2023-08-28",
    likes: 412,
    comments: 67,
    views: 1523,
    commentsData: [
      {
        id: '401',
        authorId: 2,
        authorName: '旅行小狮子',
        authorAvatar: '/image/avatar2.jpg',
        content: '大理真的是一个让人来了就不想走的地方，你的描述让我仿佛再次置身其中～',
        time: '2023-08-28 14:25',
        likes: 24
      },
      {
        id: '402',
        authorId: 3,
        authorName: '吃货小分队',
        authorAvatar: '/image/avatar3.jpg',
        content: '白族的饮食文化也很有特色，你有尝试过三道茶和生皮吗？',
        time: '2023-08-28 16:50',
        likes: 18
      },
      {
        id: '403',
        authorId: 4,
        authorName: '独行者小K',
        authorAvatar: '/image/avatar4.jpg',
        content: '你有去双廊吗？那里的湖景更加静谧美好，非常适合发呆～',
        time: '2023-08-29 09:15',
        likes: 20
      },
      {
        id: '404',
        authorId: 6,
        authorName: '北方小厨娘',
        authorAvatar: '/image/avatar6.jpg',
        content: '那个白族小哥还在吗？有Instagram账号吗？歌声一定很美妙！',
        time: '2023-08-29 12:30',
        likes: 15
      },
      {
        id: '405',
        authorId: 8,
        authorName: '美食猎人',
        authorAvatar: '/image/cat.jpg',
        content: '这些照片拍得太美了！想问下你住在哪家客栈？我下个月也打算去大理~',
        time: '2023-08-30 10:20',
        likes: 13
      }
    ]
  },
  {
    id: 5,
    title: "广州寻味之旅，探秘岭南美食文化",
    content: `作为一个北方人，第一次来到广州，被这里的美食文化深深震撼！

早茶真的是广州人的日常！早上7点，店里就已经人声鼎沸。虾饺、肠粉、叉烧包......每一样都让我惊艳，尤其是那个榴莲酥，虽然我以前不敢吃榴莲，但这个榴莲酥真的让我改变了看法！

最有趣的是去了一家百年老店学做糖水，店主是个和蔼的老爷爷，耐心地教我怎么煮出完美的杨枝甘露。他说："做好糖水，不仅要有好材料，还要有耐心和爱心。"这句话让我印象深刻。

晚上在沙面岛散步，灯光下的欧式建筑特别浪漫。在珠江夜游的船上，看着两岸的灯光，吃着刚买的双皮奶，那一刻我觉得生活真的很美好。

广州不仅有美食，还有很悠久的文化和热情的人。我已经爱上了这座城市，下次一定再来！

#广州美食 #早茶文化 #岭南风情`,
    images: [
      "/image/community/guangzhou1.jpg",
      "/image/community/guangzhou2.jpg",
      "/image/community/guangzhou3.jpg"
    ],
    author: {
      id: 6,
      username: "北方小厨娘",
      avatar: "/image/avatar6.jpg"
    },
    publishDate: "2023-08-20",
    likes: 289,
    comments: 52,
    views: 976,
    commentsData: [
      {
        id: '501',
        authorId: 2,
        authorName: '旅行小狮子',
        authorAvatar: '/image/avatar2.jpg',
        content: '广州的早茶文化真的很有魅力！我每次去都能吃两个小时！',
        time: '2023-08-20 11:35',
        likes: 21
      },
      {
        id: '502',
        authorId: 3,
        authorName: '吃货小分队',
        authorAvatar: '/image/avatar3.jpg',
        content: '作为一个吃货，我认为广州是中国最适合吃货的城市之一，没有之一！',
        time: '2023-08-20 13:40',
        likes: 25
      },
      {
        id: '503',
        authorId: 4,
        authorName: '独行者小K',
        authorAvatar: '/image/avatar4.jpg',
        content: '沙面岛真的很美，那些欧式建筑让人感觉不像是在中国。珠江夜游也很推荐！',
        time: '2023-08-21 09:25',
        likes: 18
      },
      {
        id: '504',
        authorId: 5,
        authorName: '旅行的意义',
        authorAvatar: '/image/avatar5.jpg',
        content: '你提到的杨枝甘露是在哪家店学做的呀？我也想去学习一下～',
        time: '2023-08-21 14:50',
        likes: 15
      },
      {
        id: '505',
        authorId: 9,
        authorName: '摄影师阿诚',
        authorAvatar: '/image/cat.jpg',
        content: '那个榴莲酥看起来好诱人！我一直不敢尝试榴莲，也许应该从榴莲酥开始挑战！',
        time: '2023-08-22 10:15',
        likes: 12
      }
    ]
  }
];

// 当前用户的帖子ID集合（模拟数据）
let currentUserPosts = [1, 3]; // 假设当前用户发表了帖子1和3

// 用户点赞记录
let userLikes = new Map();

// 获取当前用户函数 (从localStorage中获取)
const getCurrentUser = () => {
  const currentUserData = localStorage.getItem('currentUser');
  return currentUserData ? JSON.parse(currentUserData) : null;
};

// 获取所有帖子列表（支持分页）
export const getAllPosts = (page = 1, limit = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedPosts = mockPosts.slice(startIndex, endIndex);
      
      resolve({
        posts: paginatedPosts,
        total: mockPosts.length,
        currentPage: page,
        totalPages: Math.ceil(mockPosts.length / limit)
      });
    }, 500);
  });
};

// 根据ID获取单个帖子详情
export const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.id === parseInt(id));
      if (post) {
        // 模拟增加帖子浏览量
        post.views += 1;
        resolve(post);
      } else {
        reject(new Error('未找到该帖子'));
      }
    }, 500);
  });
};

// 获取当前登录用户的帖子
export const getCurrentUserPosts = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    // 从本地存储中获取社区帖子
    const posts = await getAllPosts();
    
    // 筛选出当前用户发布的帖子
    return posts.filter(post => post.authorId === currentUser.id);
  } catch (error) {
    console.error('获取当前用户帖子失败', error);
    return [];
  }
};

// 创建新帖子
export const createPost = (postData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPostId = mockPosts.length + 1;
      
      // 创建新帖子对象
      const newPost = {
        id: newPostId,
        ...postData,
        publishDate: new Date().toISOString().split('T')[0],
        likes: 0,
        comments: 0,
        views: 0
      };
      
      // 添加到模拟数据
      mockPosts.unshift(newPost);
      currentUserPosts.push(newPostId);
      
      resolve(newPost);
    }, 800);
  });
};

// 检查用户是否点赞了帖子
export const checkUserLiked = (userId, postId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `${userId}_${postId}`;
      const isLiked = userLikes.has(key);
      resolve({ isLiked });
    }, 200);
  });
};

// 点赞帖子
export const likePost = (postId, userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.id === parseInt(postId));
      if (!post) {
        reject(new Error('未找到该帖子'));
        return;
      }
      
      const key = `${userId}_${postId}`;
      const hasLiked = userLikes.has(key);
      
      if (hasLiked) {
        // 已点赞，取消点赞
        post.likes = Math.max(0, post.likes - 1);
        userLikes.delete(key);
        resolve({ success: true, likes: post.likes, isLiked: false });
      } else {
        // 未点赞，添加点赞
        post.likes += 1;
        userLikes.set(key, true);
        resolve({ success: true, likes: post.likes, isLiked: true });
      }
    }, 300);
  });
};

// 获取用户点赞的帖子
export const getUserLikedPosts = async (userId) => {
  try {
    if (!userId) {
      const currentUser = getCurrentUser();
      if (!currentUser) return [];
      userId = currentUser.id;
    }
    
    // 从本地存储中获取社区帖子
    const posts = await getAllPosts();
    
    // 筛选出用户点赞的帖子
    return posts.filter(post => {
      return post.likedBy && post.likedBy.includes(userId);
    });
  } catch (error) {
    console.error('获取用户点赞帖子失败', error);
    return [];
  }
};

// 获取帖子评论
export const getPostComments = (postId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.id === parseInt(postId));
      if (post) {
        resolve(post.commentsData || []);
      } else {
        reject(new Error('未找到该帖子'));
      }
    }, 300);
  });
};

// 分享帖子到剪贴板
export const sharePost = (postId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const post = mockPosts.find(post => post.id === parseInt(postId));
        if (!post) {
          reject(new Error('未找到该帖子'));
          return;
        }
        
        const shareUrl = `${window.location.origin}/community/post/${postId}`;
        
        // 在实际应用中，这里应该调用navigator.clipboard.writeText
        // 但由于是模拟，所以直接返回成功
        resolve({
          success: true,
          message: '链接已复制到剪贴板',
          url: shareUrl
        });
      } catch (error) {
        reject(new Error('分享失败，请稍后再试'));
      }
    }, 200);
  });
};

// 添加评论
export const addComment = (postId, commentData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.id === parseInt(postId));
      if (post) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          reject(new Error('请先登录后再评论'));
          return;
        }

        const newComment = {
          id: `comment_${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.username,
          authorAvatar: currentUser.avatar || '/image/cat.jpg',
          content: commentData.content,
          time: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-'),
          likes: 0
        };

        // 如果帖子没有评论数据数组，创建一个
        if (!post.commentsData) {
          post.commentsData = [];
        }

        // 添加新评论到数组开头
        post.commentsData.unshift(newComment);
        
        // 增加评论计数
        post.comments += 1;
        
        resolve({ 
          success: true, 
          comment: newComment, 
          totalComments: post.comments
        });
      } else {
        reject(new Error('未找到该帖子'));
      }
    }, 300);
  });
};

// 点赞评论
export const likeComment = (postId, commentId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.id === parseInt(postId));
      if (!post || !post.commentsData) {
        reject(new Error('未找到该帖子或评论'));
        return;
      }

      const comment = post.commentsData.find(comment => comment.id === commentId);
      if (!comment) {
        reject(new Error('未找到该评论'));
        return;
      }

      // 增加评论点赞数
      comment.likes += 1;
      
      resolve({
        success: true,
        likes: comment.likes
      });
    }, 200);
  });
};

// 搜索帖子
export const searchPosts = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const searchResults = mockPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) || 
        post.content.toLowerCase().includes(query.toLowerCase())
      );
      
      resolve(searchResults);
    }, 500);
  });
};

// 获取热门帖子
export const getHotPosts = (limit = 5) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 按照点赞数排序
      const sortedPosts = [...mockPosts].sort((a, b) => b.likes - a.likes);
      resolve(sortedPosts.slice(0, limit));
    }, 500);
  });
}; 