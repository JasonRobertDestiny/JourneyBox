// localStorage持久化key
const STORAGE_KEY_TRIPS = 'journeybox_trips';
const STORAGE_KEY_TRIP_DETAILS = 'journeybox_trip_details';

// 从localStorage加载用户创建的行程
const loadUserTrips = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRIPS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('加载用户行程失败:', e);
    return [];
  }
};

const loadUserTripDetails = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRIP_DETAILS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('加载行程详情失败:', e);
    return {};
  }
};

// 保存用户行程到localStorage
const saveUserTrips = (trips) => {
  try {
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
  } catch (e) {
    console.error('保存用户行程失败:', e);
  }
};

const saveUserTripDetails = (details) => {
  try {
    localStorage.setItem(STORAGE_KEY_TRIP_DETAILS, JSON.stringify(details));
  } catch (e) {
    console.error('保存行程详情失败:', e);
  }
};

// 用户创建的行程(从localStorage加载)
let userTrips = loadUserTrips();
let userTripDetails = loadUserTripDetails();

// 预设的示例行程数据
const mockTrips = [
  { 
    id: 1, 
    title: '北京三日游', 
    destination: '北京', 
 
    travelType: 'self',
    coverImage: '/image/beijing.jpg'
  },
  { 
    id: 2, 
    title: '上海周末行', 
    destination: '上海',  
    travelType: 'self',
    coverImage: 'image/shanghai.jpg'
  },
  { 
    id: 3, 
    title: '广州美食之旅', 
    destination: '广州', 
    travelType: 'group',
    coverImage: 'image/guangzhou.jpg'
  },
  { 
    id: 4, 
    title: '杭州西湖游', 
    destination: '杭州', 
    travelType: 'self',
    coverImage: 'image/hangzhou.jpg'
  },
  { 
    id: 5, 
    title: '成都休闲游', 
    destination: '成都', 
    travelType: 'business',
    coverImage: 'image/chengdu.jpg'
  }
];

// 模拟详细行程数据
const mockTripDetails = {
  1: {
    // 行程基本信息
    tripInfo: {
      id: 1,
      title: '北京三日游',
      destination: '北京',
      travelType: 'self',
      notes: '这是一次北京文化之旅，主要参观北京的历史文化景点。'
    },
    
    // 行程详情
    itinerary: {
      days: [
        {
          day: 1,
          dailyTimeRange: { start: 9, end: 19 },
          color: '#FF5252', // 红色路线
          places: [
            { 
              id: 101, 
              name: '故宫', 
              type: 'attraction',
              timeStart: '9:00AM', 
              timeEnd: '11:30AM', 
              description: '故宫博物院，旧称为紫禁城，是中国明清两代的皇家宫殿，位于北京中轴线的中心，是中国古代宫廷建筑之精华。', 
              address: '北京市东城区景山前街4号',
              openingHours: '8:30AM - 5:00PM',
              images: ['/image/attractions/故宫.jpg'],
              location: {
                lat: 39.916345,
                lng: 116.397155
              }
            },
            { 
              id: 102, 
              name: '四季民福烤鸭店', 
              type: 'restaurant',
              timeStart: '12:00PM', 
              timeEnd: '1:30PM', 
              description: '四季民福烤鸭店是北京著名的老字号烤鸭店，以其正宗的北京烤鸭和优质的服务而闻名。', 
              address: '北京市东城区王府井大街枣林前街1-2号',
              openingHours: '11:00AM - 9:00PM',
              images: [
                '/image/attractions/四季民福.jpg'
              ],
              location: {
                lat: 39.914812,
                lng: 116.406177
              }
            },
            { 
              id: 103, 
              name: '天安门广场', 
              type: 'attraction',
              timeStart: '2:30PM', 
              timeEnd: '4:30PM', 
              description: '天安门广场是世界上最大的城市中心广场，位于北京市中心，可以观赏到天安门城楼、人民英雄纪念碑等标志性建筑。', 
              address: '北京市东城区东长安街',
              openingHours: '全天开放',
              images: ['/image/attractions/beijing.jpg'],
              location: {
                lat: 39.903524,
                lng: 116.397441
              }
            },
            { 
              id: 104, 
              name: '王府井步行街', 
              type: 'shopping',
              timeStart: '5:00PM', 
              timeEnd: '7:00PM', 
              description: '王府井是北京最著名的商业街之一，有着百年历史，汇集各类商场、专卖店和特色小吃。', 
              address: '北京市东城区王府井大街',
              openingHours: '9:00AM - 10:00PM',
              images: [
                '/image/attractions/王府井.jpg'
              ],
              location: {
                lat: 39.915706,
                lng: 116.41744
              }
            }
          ]
        },
        {
          day: 2,
          dailyTimeRange: { start: 8, end: 18 },
          color: '#2196F3', // 蓝色路线
          places: [
            { 
              id: 201, 
              name: '颐和园', 
              type: 'attraction',
              timeStart: '8:00AM', 
              timeEnd: '11:30AM', 
              description: '颐和园是中国清朝时期皇家园林，也是保存最完整的一座皇家行宫御苑，被誉为"皇家园林博物馆"。', 
              address: '北京市海淀区新建宫门路19号',
              openingHours: '6:30AM - 6:00PM',
              images: ['/image/attractions/颐和园.jpg'],
              location: {
                lat: 39.991632,
                lng: 116.273911
              }
            },
            { 
              id: 202, 
              name: '圆明园遗址公园', 
              type: 'attraction',
              timeStart: '12:30PM', 
              timeEnd: '2:30PM', 
              description: '圆明园原是清代大型皇家园林，被誉为"万园之园"，现为历史文化遗址公园，展示了当年被毁的皇家园林的壮观和历史悲剧。', 
              address: '北京市海淀区清华西路28号',
              openingHours: '7:00AM - 7:00PM',
              images: ['/image/attractions/圆明园.jpg'],
              location: {
                lat: 40.007763,
                lng: 116.303591
              }
            },
            { 
              id: 203, 
              name: '北京大学', 
              type: 'education',
              timeStart: '3:00PM', 
              timeEnd: '5:00PM', 
              description: '北京大学是中国最著名的高等学府之一，校园环境优美，有未名湖、博雅塔等著名景点，浓厚的学术氛围吸引许多游客前来参观。', 
              address: '北京市海淀区颐和园路5号',
              openingHours: '校园大门全天开放，未名湖景区9:00AM - 4:00PM',
              images: [
                '/image/attractions/北京大学.jpg'
              ],
              location: {
                lat: 39.992706,
                lng: 116.310504
              }
            }
          ]
        },
        {
          day: 3,
          dailyTimeRange: { start: 7, end: 17 },
          color: '#4CAF50', // 绿色路线
          places: [
            { 
              id: 301, 
              name: '长城（八达岭段）', 
              type: 'attraction',
              timeStart: '7:00AM', 
              timeEnd: '11:00AM', 
              description: '八达岭长城是明长城中保存最好的一段，也是最具代表性的一段，登上长城极目远望，感受"不到长城非好汉"的豪迈。', 
              address: '北京市延庆区八达岭特区',
              openingHours: '夏季7:30AM - 5:30PM，冬季8:00AM - 5:00PM',
              images: ['/image/attractions/长城.jpg'],
              location: {
                lat: 40.354346,
                lng: 116.019782
              }
            },
            { 
              id: 302, 
              name: '明十三陵', 
              timeStart: '1:30PM', 
              timeEnd: '4:00PM', 
              description: '明十三陵是明朝十三位皇帝的陵墓群，是中国规模最大、体系最完整、保存最好的皇家陵寝建筑群之一。', 
              address: '北京市昌平区十三陵特区',
              openingHours: '8:00AM - 5:30PM',
              images: [
                '/image/attractions/ming.jpg'
              ],
              location: {
                lat: 40.299854,
                lng: 116.248711
              }
            }
          ]
        }
      ]
    },
    
    // 交通选项
    transportOptions: {
      walking: true,
      publicTransit: true,
      taxi: true,
      driving: true
    }
  },
  
  // 上海周末行详情
  2: {
    // 行程基本信息
    tripInfo: {
      id: 2,
      title: '上海周末行',
      destination: '上海',
      startDate: '2023-06-10',
      endDate: '2023-06-12',
      travelType: 'self',
      notes: '这是一次上海城市休闲游，主要体验上海的都市风情和特色景点。'
    },
    
    // 行程详情
    itinerary: {
      days: [
        {
          day: 1,
          dailyTimeRange: { start: 9, end: 21 },
          color: '#FF9800', // 橙色路线
          places: [
            { 
              id: 201, 
              name: '外滩', 
              timeStart: '9:00AM', 
              timeEnd: '11:00AM', 
              description: '外滩是上海的地标之一，沿江一侧是具有殖民地特色的西式建筑群，被称为"万国建筑博览"，是欣赏上海天际线的最佳地点。', 
              address: '上海市黄浦区中山东一路',
              openingHours: '全天开放',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/05f7f27b0ef07cad3618a83c4142ed43.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/6d9227bdd03b28967a387e8a4feba90c.jpeg'
              ],
              location: {
                lat: 31.233519,
                lng: 121.490198
              }
            },
            { 
              id: 202, 
              name: '南京路步行街', 
              timeStart: '11:30AM', 
              timeEnd: '1:30PM', 
              description: '南京路是上海最著名、最繁华的商业街，拥有百年历史，汇集了各种商店、餐厅和娱乐场所。', 
              address: '上海市黄浦区南京东路',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/8844b2ccf0e963f51f3dfcb12fd13fb7.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/cfac8a0fb95eb9e7236c9715036ccd0f.jpeg'
              ],
              location: {
                lat: 31.235198,
                lng: 121.474992
              }
            },
            { 
              id: 203, 
              name: '上海博物馆', 
              timeStart: '2:30PM', 
              timeEnd: '5:00PM', 
              description: '上海博物馆是中国重要的古代艺术博物馆之一，馆藏丰富，包括青铜器、陶瓷、书画、雕塑等多种艺术珍品。', 
              address: '上海市黄浦区人民大道201号',
              openingHours: '9:00AM - 5:00PM（周一闭馆）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/a5b73c56aec8b721221ad2a345c7b5bf.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/b7cc6c97c550f3fb3c2160d0cb570ea0.jpeg'
              ],
              location: {
                lat: 31.228564,
                lng: 121.467459
              }
            },
            { 
              id: 204, 
              name: '新天地', 
              timeStart: '6:00PM', 
              timeEnd: '9:00PM', 
              description: '新天地是上海的时尚休闲娱乐区，以石库门建筑为特色，融合了中西文化，汇集了众多餐厅、酒吧和精品店。', 
              address: '上海市黄浦区马当路245号',
              openingHours: '10:00AM - 晚上',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/44d7f6e27c93b10a649c2394dd6a8e45.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/bec6ab39e2f65c969d7ee73ee252c6a7.jpeg'
              ],
              location: {
                lat: 31.219919,
                lng: 121.475458
              }
            }
          ]
        },
        {
          day: 2,
          dailyTimeRange: { start: 8, end: 20 },
          color: '#03A9F4', // 蓝色路线
          places: [
            { 
              id: 205, 
              name: '上海迪士尼乐园', 
              timeStart: '8:00AM', 
              timeEnd: '8:00PM', 
              description: '上海迪士尼度假区是中国内地首座迪士尼主题乐园，拥有迪士尼乐园、迪士尼小镇和星愿公园三大主题区域，是体验奇幻冒险的绝佳去处。', 
              address: '上海市浦东新区川沙新镇上海迪士尼度假区',
              openingHours: '8:00AM - 8:00PM（具体开放时间请查询官网）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/5db7ec3a29a3c45bde9b8485b0c0d6c2.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/0b3b33c61ea8a8759a17ed5ebca0ec8e.jpeg'
              ],
              location: {
                lat: 31.147431,
                lng: 121.667821
              }
            }
          ]
        },
        {
          day: 3,
          dailyTimeRange: { start: 9, end: 17 },
          color: '#9C27B0', // 紫色路线
          places: [
            { 
              id: 206, 
              name: '田子坊', 
              timeStart: '9:00AM', 
              timeEnd: '11:00AM', 
              description: '田子坊是上海的文创区，原本是上海传统的石库门里弄，现在成为了艺术家和设计师的聚集地，充满创意与惊喜。', 
              address: '上海市黄浦区泰康路210弄',
              openingHours: '9:00AM - 9:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/b5bfefdcc6ee8e4d803844539e723c3e.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/cfea5c01a2eca6f02cc36591cc71d4bd.jpeg'
              ],
              location: {
                lat: 31.215145,
                lng: 121.470236
              }
            },
            { 
              id: 207, 
              name: '上海科技馆', 
              timeStart: '12:00PM', 
              timeEnd: '3:00PM', 
              description: '上海科技馆是中国最大的科技馆之一，通过互动展示和实验，向公众传播科学知识和科学思想，是亲子游的理想之地。', 
              address: '上海市浦东新区世纪大道2000号',
              openingHours: '9:00AM - 5:00PM（周一闭馆）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/0b68c9c0f756f8668af267fa70899195.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/731c7518a22bc408b849c59b9c4a66c9.jpeg'
              ],
              location: {
                lat: 31.220836,
                lng: 121.543462
              }
            },
            { 
              id: 208, 
              name: '陆家嘴金融区', 
              timeStart: '3:30PM', 
              timeEnd: '5:00PM', 
              description: '陆家嘴是上海的金融中心，拥有东方明珠电视塔、上海中心、金茂大厦等标志性建筑，展示了上海现代化的一面。', 
              address: '上海市浦东新区陆家嘴',
              openingHours: '全天开放（各建筑观光层开放时间不同）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/5bbe21b20e00dfac0b71e45fe8a9989d.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/d7db0f7e64bd0afc493a9effa87f11c7.jpeg'
              ],
              location: {
                lat: 31.238911,
                lng: 121.501275
              }
            }
          ]
        }
      ]
    }
  },
  
  // 广州美食之旅详情
  3: {
    // 行程基本信息
    tripInfo: {
      id: 3,
      title: '广州美食之旅',
      destination: '广州',
      startDate: '2023-07-15',
      endDate: '2023-07-20',
      travelType: 'group',
      notes: '这是一次以品尝广州美食为主题的旅行，体验广州地道饮食文化和风土人情。'
    },
    
    // 行程详情
    itinerary: {
      days: [
        {
          day: 1,
          dailyTimeRange: { start: 9, end: 20 },
          color: '#E91E63', // 粉色路线
          places: [
            { 
              id: 301, 
              name: '陈家祠', 
              timeStart: '9:00AM', 
              timeEnd: '11:00AM', 
              description: '陈家祠是广州著名的古建筑群，也称"陈氏书院"，是清代广州传统建筑的杰出代表，体现了岭南建筑艺术的精华。', 
              address: '广州市荔湾区中山七路恩龙里34号',
              openingHours: '8:30AM - 5:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/f8a45a5510a0b52d21fcc8dc49210379.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/7b7c1a77b8a6239dcfd5376d7bd84122.jpeg'
              ],
              location: {
                lat: 23.135232,
                lng: 113.254734
              }
            },
            { 
              id: 302, 
              name: '广州酒家（文昌总店）', 
              timeStart: '12:00PM', 
              timeEnd: '2:00PM', 
              description: '广州酒家是百年老字号，以正宗粤菜和精致点心闻名，是品尝广州美食的首选之地。', 
              address: '广州市越秀区文昌南路2号',
              openingHours: '7:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/a8ebb5681d36e17d31b96293f2a551e3.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/4773ad6cf5172b6a1e44f1a4aa7325e7.jpeg'
              ],
              location: {
                lat: 23.122876,
                lng: 113.268881
              }
            },
            { 
              id: 303, 
              name: '上下九步行街', 
              timeStart: '3:00PM', 
              timeEnd: '6:00PM', 
              description: '上下九步行街是广州最著名的商业街之一，保存了许多民国时期的骑楼建筑，汇集了各种广州特色小吃和商铺。', 
              address: '广州市荔湾区上下九路',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/3c675d3ef9fb24e8598a4e55660a4f86.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/85978253bdfc63218f71a9334ba0c84c.jpeg'
              ],
              location: {
                lat: 23.122141,
                lng: 113.249493
              }
            },
            { 
              id: 304, 
              name: '南信牛杂', 
              timeStart: '7:00PM', 
              timeEnd: '8:30PM', 
              description: '南信牛杂是广州著名的地道小吃，以新鲜美味的牛杂和特色调味料而闻名，被誉为广州夜宵文化的代表之一。', 
              address: '广州市荔湾区第十甫路17号',
              openingHours: '6:00PM - 2:00AM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/a8cb8e65b4c671eb3a1f9c14dda1faef.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/d0c4e3f79ee6e40d7b716b69e33fac13.jpeg'
              ],
              location: {
                lat: 23.123486,
                lng: 113.246957
              }
            }
          ]
        },
        {
          day: 2,
          dailyTimeRange: { start: 8, end: 21 },
          color: '#4CAF50', // 绿色路线
          places: [
            { 
              id: 305, 
              name: '沙面岛', 
              timeStart: '8:30AM', 
              timeEnd: '10:30AM', 
              description: '沙面岛是广州的历史文化名胜，曾是外国租界，现在保存着大量欧式建筑，环境幽静，是广州城区中一片独特的风景线。', 
              address: '广州市荔湾区沙面大街',
              openingHours: '全天开放',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/6e1f615b70a31f5b7101c644957d4c57.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/c18a7178c4e87ade6dad01fc7d8dba60.jpeg'
              ],
              location: {
                lat: 23.109181,
                lng: 113.240312
              }
            },
            { 
              id: 306, 
              name: '点都德（总店）', 
              timeStart: '11:30AM', 
              timeEnd: '1:30PM', 
              description: '点都德是广州知名的茶餐厅，提供正宗的粤式点心和广式早茶，是体验广州饮茶文化的好去处。', 
              address: '广州市越秀区环市东路803号',
              openingHours: '7:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/bdb0f5afba953bf59e6b1bfb6eb6c9d9.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/d8bdc3dab7f9a3f01327c6cd106a0f5a.jpeg'
              ],
              location: {
                lat: 23.135435,
                lng: 113.280684
              }
            },
            { 
              id: 307, 
              name: '石室圣心大教堂', 
              timeStart: '2:00PM', 
              timeEnd: '3:30PM', 
              description: '石室圣心大教堂是中国最大的天主教堂之一，始建于1863年，哥特式的建筑风格与周围的广州城市景观形成鲜明对比。', 
              address: '广州市越秀区一德路外文书店街56号',
              openingHours: '8:30AM - 5:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/1d1d676ffbcc8d1a3a5cb554f0d332d1.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/be0fb5b70eb7c6e81a5a22f5dd68dc3a.jpeg'
              ],
              location: {
                lat: 23.130198,
                lng: 113.256588
              }
            },
            { 
              id: 308, 
              name: '广州塔', 
              timeStart: '4:30PM', 
              timeEnd: '7:30PM', 
              description: '广州塔，也称小蛮腰，是广州的标志性建筑，是世界上最高的电视观光塔之一，登塔可俯瞰珠江和广州全景。', 
              address: '广州市海珠区阅江西路222号',
              openingHours: '9:30AM - 10:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/ec43cc95b07b3c23c83fafd52292b2e2.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/2f84cd2e1f42516adead054dc9e0499b.jpeg'
              ],
              location: {
                lat: 23.105913,
                lng: 113.31866
              }
            },
            { 
              id: 309, 
              name: '珠江夜游', 
              timeStart: '8:00PM', 
              timeEnd: '9:30PM', 
              description: '珠江夜游是广州最受欢迎的夜间活动之一，乘船游览珠江，欣赏两岸灯光璀璨的都市夜景，感受广州"千年商都"的魅力。', 
              address: '广州市天字码头（越秀区沿江路）',
              openingHours: '7:00PM - 10:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/7ceffb9ac93fa0a6512e2c0c4c97aaf5.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/7aa76671fa708df27e7364e2a2c4a3ac.jpeg'
              ],
              location: {
                lat: 23.114707,
                lng: 113.245244
              }
            }
          ]
        },
        {
          day: 3,
          dailyTimeRange: { start: 9, end: 20 },
          color: '#FF5722', // 橙红色路线
          places: [
            { 
              id: 310, 
              name: '永庆坊', 
              timeStart: '9:00AM', 
              timeEnd: '11:00AM', 
              description: '永庆坊是一个融合了历史文化与现代创意的社区，保留了广州老城区的骑楼建筑风格，现已成为文创市集和艺术空间。', 
              address: '广州市荔湾区恩宁路连升街',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/e2c7d61b0b5f1f64a9d2ca0270613e51.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/0e5911dd46f15ac4ec8f6dc3e15b0d13.jpeg'
              ],
              location: {
                lat: 23.123926,
                lng: 113.244837
              }
            },
            { 
              id: 311, 
              name: '陶陶居饼家', 
              timeStart: '11:30AM', 
              timeEnd: '1:00PM', 
              description: '陶陶居是广州著名的老字号餐饮店，尤其以制作广式月饼闻名，同时也提供传统的广东点心和粤菜。', 
              address: '广州市荔湾区上下九路83号',
              openingHours: '7:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/f0fcb92ba4b5ab2776cdd3d1a8d1b7d0.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/f6c6b8eea3e31c0abd5fac03f31f1e1e.jpeg'
              ],
              location: {
                lat: 23.122246,
                lng: 113.24896
              }
            },
            { 
              id: 312, 
              name: '南越王宫博物馆', 
              timeStart: '1:30PM', 
              timeEnd: '3:30PM', 
              description: '南越王宫博物馆是建立在南越国宫殿遗址上的博物馆，展示了公元前二世纪南越国的历史文物和建筑遗迹。', 
              address: '广州市越秀区解放北路867号',
              openingHours: '9:00AM - 5:30PM（周一闭馆）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/ea3a47a1b73bd9bd5c60838e2b5d2bc5.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/5af1dd2aafcacef1aaabb2c3d3ceb6bc.jpeg'
              ],
              location: {
                lat: 23.144064,
                lng: 113.262914
              }
            },
            { 
              id: 313, 
              name: '北京路步行街', 
              timeStart: '4:00PM', 
              timeEnd: '6:30PM', 
              description: '北京路步行街是广州最古老的商业街之一，不仅有现代商场和品牌店，还保存着宋代和明清时期的古城墙遗址，文化底蕴深厚。', 
              address: '广州市越秀区北京路',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/1c00e532a4d7a8392d32956fb1a45a49.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/b89d08dd1e7c5ba9c82c7c6955fb75d3.jpeg'
              ],
              location: {
                lat: 23.125693,
                lng: 113.269841
              }
            },
            { 
              id: 314, 
              name: '小炳胜（体育东路店）', 
              timeStart: '7:00PM', 
              timeEnd: '9:00PM', 
              description: '小炳胜是广州知名的粤菜餐厅，以烧腊和海鲜见长，特别是烧鹅和脆皮烧肉备受推崇，是品尝正宗粤菜的好去处。', 
              address: '广州市天河区体育东路22号',
              openingHours: '11:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/1aa84dcfa7b2f5fd1b2b02e574d4a8ba.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/a8dcda2b5ef8a5f1b2d36a36c5eb00eb.jpeg'
              ],
              location: {
                lat: 23.13661,
                lng: 113.325058
              }
            }
          ]
        }
      ]
    }
  },
  
  // 杭州西湖游详情
  4: {
    // 行程基本信息
    tripInfo: {
      id: 4,
      title: '杭州西湖游',
      destination: '杭州',
      startDate: '2023-08-05',
      endDate: '2023-08-07',
      travelType: 'self',
      notes: '这是一次杭州休闲之旅，主要体验西湖风光和杭州的人文景观。'
    },
    
    // 行程详情
    itinerary: {
      days: [
        {
          day: 1,
          dailyTimeRange: { start: 8, end: 20 },
          color: '#8BC34A', // 淡绿色路线
          places: [
            { 
              id: 401, 
              name: '西湖', 
              timeStart: '8:00AM', 
              timeEnd: '11:30AM', 
              description: '西湖是杭州的标志性景点，以"西湖十景"闻名于世，湖光山色、亭台楼阁相映成趣，被誉为"人间天堂"。', 
              address: '杭州市西湖区龙井路1号',
              openingHours: '全天开放',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/b4bbd555753e2ebf55061deeead5e488.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/aa8c6731bcc99340c9ce2d0e90a438e7.jpeg'
              ],
              location: {
                lat: 30.238158,
                lng: 120.143066
              }
            },
            { 
              id: 402, 
              name: '楼外楼（孤山路店）', 
              timeStart: '12:00PM', 
              timeEnd: '1:30PM', 
              description: '楼外楼是杭州历史悠久的老字号餐厅，创建于1848年，以西湖醋鱼、东坡肉等杭帮菜闻名，位于西湖边，环境优美。', 
              address: '杭州市西湖区孤山路30号',
              openingHours: '11:00AM - 9:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/8deffbec53aa8d7ad11f8c5413294a57.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/caa74d8d9fe9797c44a443ac80aa0fd8.jpeg'
              ],
              location: {
                lat: 30.25683,
                lng: 120.147491
              }
            },
            { 
              id: 403, 
              name: '灵隐寺', 
              timeStart: '2:30PM', 
              timeEnd: '4:30PM', 
              description: '灵隐寺始建于东晋，是杭州最著名的佛教寺院，坐落在飞来峰旁，环境清幽，保存有大量的佛教造像和文物。', 
              address: '杭州市西湖区灵隐路法云弄1号',
              openingHours: '7:00AM - 5:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/b2ccd2b6ff3997c6b33cbd8b60d9f7c4.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/0ef83b74d9f4ae25db5c17dabf9d8bec.jpeg'
              ],
              location: {
                lat: 30.242363,
                lng: 120.122459
              }
            },
            { 
              id: 404, 
              name: '河坊街', 
              timeStart: '5:00PM', 
              timeEnd: '8:00PM', 
              description: '河坊街是杭州历史最为悠久的街区之一，有着各式各样的老字号商铺、杭州特色工艺品店和小吃店，是体验杭州传统文化的好去处。', 
              address: '杭州市上城区中河中路/解放路',
              openingHours: '9:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/0dbb8b57a5c776dbac292c2093cf9f16.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/f5a6481df93b50d29b1b75bbc77e8dd2.jpeg'
              ],
              location: {
                lat: 30.2535,
                lng: 120.16953
              }
            }
          ]
        },
        {
          day: 2,
          dailyTimeRange: { start: 8, end: 19 },
          color: '#009688', // 青色路线
          places: [
            { 
              id: 405, 
              name: '西溪湿地', 
              timeStart: '8:30AM', 
              timeEnd: '11:30AM', 
              description: '西溪湿地是中国首个国家湿地公园，有"杭州之肾"之称，保留了原始自然生态系统，可以乘船游览水道，欣赏湿地风光。', 
              address: '杭州市西湖区天目山路518号',
              openingHours: '8:00AM - 5:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/f9e90090b6a5c7f7d47fa73f0e22fcf9.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/9a94a33d9eb3c3a30f4172ca96e73daf.jpeg'
              ],
              location: {
                lat: 30.272624,
                lng: 120.07048
              }
            },
            { 
              id: 406, 
              name: '知味观（武林店）', 
              timeStart: '12:30PM', 
              timeEnd: '2:00PM', 
              description: '知味观是杭州著名的老字号餐厅，创立于1913年，以杭州传统小吃和杭帮菜见长，尤其以小笼包、葱包桧、西湖莼菜汤等名菜闻名。', 
              address: '杭州市下城区延安路83号',
              openingHours: '10:30AM - 9:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/aaada077bea28f7a1c81aacb1bc88b56.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/a4e43dc2b8c58e26a6150b81e5fc1ef8.jpeg'
              ],
              location: {
                lat: 30.264234,
                lng: 120.170131
              }
            },
            { 
              id: 407, 
              name: '杭州博物馆', 
              timeStart: '2:30PM', 
              timeEnd: '4:30PM', 
              description: '杭州博物馆是一座综合性博物馆，展示了杭州从远古至近代的历史文化，包括良渚文化、吴越文化等，是了解杭州历史的重要场所。', 
              address: '杭州市西湖区平海路18号',
              openingHours: '9:00AM - 5:00PM（周一闭馆）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/851e0403c2c0d0f06c1180c0813deff5.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/bc91921b5950acc8b76ad5cb8cc77eca.jpeg'
              ],
              location: {
                lat: 30.253946,
                lng: 120.155304
              }
            },
            { 
              id: 408, 
              name: '南宋御街', 
              timeStart: '5:00PM', 
              timeEnd: '7:00PM', 
              description: '南宋御街是杭州保存较为完好的一条古街，是南宋时期皇帝巡游的御道，现在是一条集历史探访、文化体验和休闲购物为一体的特色街区。', 
              address: '杭州市上城区鼓楼一带',
              openingHours: '全天开放',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/8c891f8ab44a3ec05dff61403ee9e7b4.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/1acfe983a6d9be5ac3ad24022dff1b5a.jpeg'
              ],
              location: {
                lat: 30.251642,
                lng: 120.169809
              }
            }
          ]
        },
        {
          day: 3,
          dailyTimeRange: { start: 8, end: 18 },
          color: '#3F51B5', // 靛蓝色路线
          places: [
            { 
              id: 409, 
              name: '龙井茶园', 
              timeStart: '8:00AM', 
              timeEnd: '10:30AM', 
              description: '龙井茶园位于杭州西湖龙井村，是西湖龙井茶的原产地，可以参观茶园、品尝新茶、了解制茶工艺，体验杭州茶文化。', 
              address: '杭州市西湖区龙井路278号',
              openingHours: '8:00AM - 5:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/be686faf0c24be672a8d5d05c1af1db2.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/ef0c5fdc1c3f5dfe8522765ac9e25af0.jpeg'
              ],
              location: {
                lat: 30.231122,
                lng: 120.126181
              }
            },
            { 
              id: 410, 
              name: '杭州宋城景区', 
              timeStart: '11:30AM', 
              timeEnd: '3:30PM', 
              description: '杭州宋城是中国最大的宋代文化主题公园，重现了宋代杭州的市井生活和民俗风情，并有著名的大型歌舞表演《宋城千古情》。', 
              address: '杭州市西湖区之江路148号',
              openingHours: '9:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/b32b29f98dabb6d6aee5c31f82123116.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/78d0e17754e66abdf7b0b31c5a8c9b88.jpeg'
              ],
              location: {
                lat: 30.195405,
                lng: 120.11458
              }
            },
            { 
              id: 411, 
              name: '太子湾公园', 
              timeStart: '4:00PM', 
              timeEnd: '6:00PM', 
              description: '太子湾公园位于西湖南岸，以郁金香和樱花闻名，春季是杭州最美的赏花地点之一，公园内还有各种亭台楼榭，景色优美。', 
              address: '杭州市西湖区南山路89号',
              openingHours: '7:30AM - 6:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/0e5fbcabbf0fd78ac1031bc3a3ed9f46.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/cdac4db8b47a2a0c3f94374da34a4a01.jpeg'
              ],
              location: {
                lat: 30.229845,
                lng: 120.135726
              }
            }
          ]
        }
      ]
    }
  },
  
  // 成都休闲游详情
  5: {
    // 行程基本信息
    tripInfo: {
      id: 5,
      title: '成都休闲游',
      destination: '成都',
      startDate: '2023-09-20',
      endDate: '2023-09-25',
      travelType: 'business',
      notes: '这是一次成都商务休闲之旅，在工作之余体验成都的休闲生活和美食文化。'
    },
    
    // 行程详情
    itinerary: {
      days: [
        {
          day: 1,
          dailyTimeRange: { start: 9, end: 21 },
          color: '#673AB7', // 紫色路线
          places: [
            { 
              id: 501, 
              name: '宽窄巷子', 
              timeStart: '9:00AM', 
              timeEnd: '11:30AM', 
              description: '宽窄巷子是成都保存最完好的清朝古街道，由宽巷子、窄巷子和井巷子组成，是体验成都传统生活方式和休闲文化的好去处。', 
              address: '成都市青羊区长顺上街127号',
              openingHours: '全天开放',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/bbad259f2fdd6868feeb73bc8a1b9cce.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/11a5a9a76b68d7273e0fa4e3d4c4f9cb.jpeg'
              ],
              location: {
                lat: 30.669488,
                lng: 104.053225
              }
            },
            { 
              id: 502, 
              name: '马旺子咂tea（宽窄巷子店）', 
              timeStart: '12:00PM', 
              timeEnd: '1:30PM', 
              description: '马旺子咂tea是成都著名的休闲茶馆，提供传统川西茶文化体验，茶点和小吃也很有特色，是感受成都慢生活的好地方。', 
              address: '成都市青羊区窄巷子42号',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/3eb0e49f4d35f4a68e6b69ad0dd8ee2e.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/94e6a2afa7b3fa05f5416a9ddb0e6ba4.jpeg'
              ],
              location: {
                lat: 30.670321,
                lng: 104.052902
              }
            },
            { 
              id: 503, 
              name: '成都博物馆', 
              timeStart: '2:00PM', 
              timeEnd: '4:00PM', 
              description: '成都博物馆是一座现代化的城市博物馆，展示了成都从远古到近代的历史文化，尤其是三星堆文化、金沙文化等巴蜀文明的珍贵文物。', 
              address: '成都市青羊区小南街2号',
              openingHours: '9:00AM - 5:30PM（周一闭馆）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/3d2db3cc909e0cef07d7bcf9b2eca4b2.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/a9ec64c1c8a5ab8aa94b7df3bea4fd15.jpeg'
              ],
              location: {
                lat: 30.6591,
                lng: 104.066277
              }
            },
            { 
              id: 504, 
              name: '锦里古街', 
              timeStart: '5:00PM', 
              timeEnd: '8:00PM', 
              description: '锦里古街是成都著名的商业步行街，以三国文化和成都民俗为主题，汇集了各种四川特色小吃、手工艺品和传统表演。', 
              address: '成都市武侯区武侯祠大街231号',
              openingHours: '10:00AM - 11:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/f24cc69a77ff6f9c2d6fc4a645e46c11.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/2af87f7ead28b86ebecbea82c72db5f2.jpeg'
              ],
              location: {
                lat: 30.642462,
                lng: 104.048464
              }
            }
          ]
        },
        {
          day: 2,
          dailyTimeRange: { start: 8, end: 18 },
          color: '#795548', // 棕色路线
          places: [
            { 
              id: 505, 
              name: '都江堰景区', 
              timeStart: '8:00AM', 
              timeEnd: '12:00PM', 
              description: '都江堰是世界文化遗产，建于公元前256年，至今仍在使用的水利工程，是中国古代科技的杰出代表，风景优美，历史深厚。', 
              address: '成都市都江堰市都江堰景区',
              openingHours: '8:00AM - 5:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/bcd00e60fd7c24bd2d78f8a72e5becc3.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/b0aade0fddfa4cee63c19eb58bdb5d9e.jpeg'
              ],
              location: {
                lat: 30.996033,
                lng: 103.619535
              }
            },
            { 
              id: 506, 
              name: '青城山', 
              timeStart: '1:30PM', 
              timeEnd: '5:30PM', 
              description: '青城山是中国道教发源地之一，以"青城天下幽"著称，山中古木参天，溪流潺潺，有众多的道观和庙宇，环境清幽。', 
              address: '成都市都江堰市青城山镇',
              openingHours: '8:00AM - 5:30PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/cd87697b29dbe6d72e09b7e48d9453bf.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/49cc9c6c5a9c94bd8b7d004a82b52b24.jpeg'
              ],
              location: {
                lat: 30.916473,
                lng: 103.567455
              }
            }
          ]
        },
        {
          day: 3,
          dailyTimeRange: { start: 9, end: 20 },
          color: '#FFC107', // 琥珀色路线
          places: [
            { 
              id: 507, 
              name: '杜甫草堂', 
              timeStart: '9:00AM', 
              timeEnd: '11:00AM', 
              description: '杜甫草堂是唐代诗人杜甫流寓成都时的故居，现为博物馆，展示了杜甫的生平和作品，园林环境优美，古朴典雅。', 
              address: '成都市青羊区青华路37号',
              openingHours: '8:00AM - 6:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/0aea25bc2d21ad6d3f2efbe3d3f35db8.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/0eae0e498de7f45d6b2e0e4be3a17cd2.jpeg'
              ],
              location: {
                lat: 30.667442,
                lng: 104.031345
              }
            },
            { 
              id: 508, 
              name: '陈麻婆豆腐（总店）', 
              timeStart: '11:30AM', 
              timeEnd: '1:00PM', 
              description: '陈麻婆豆腐是成都最著名的川菜餐厅之一，创建于1862年，以正宗麻婆豆腐闻名，是品尝正宗川菜的必去之地。', 
              address: '成都市青羊区西安中路197号',
              openingHours: '11:00AM - 9:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/bd4bb8fad9e3a3a1f48d1b68f67f651a.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/1cea96c159e9e5c2fa110cd8d6fea6cb.jpeg'
              ],
              location: {
                lat: 30.676946,
                lng: 104.059537
              }
            },
            { 
              id: 509, 
              name: '成都大熊猫繁育研究基地', 
              timeStart: '2:00PM', 
              timeEnd: '5:00PM', 
              description: '成都大熊猫繁育研究基地是世界著名的大熊猫保护和研究机构，可以近距离观赏大熊猫的生活，了解大熊猫的保护知识。', 
              address: '成都市成华区外北熊猫大道1375号',
              openingHours: '7:30AM - 6:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/d79ca3513f3ce0095ab332ab136acaef.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/3661c889e4388d6f7e2bf51354964097.jpeg'
              ],
              location: {
                lat: 30.7384,
                lng: 104.14759
              }
            },
            { 
              id: 510, 
              name: '春熙路步行街', 
              timeStart: '6:00PM', 
              timeEnd: '8:00PM', 
              description: '春熙路是成都最繁华的商业中心，汇集了各种国际品牌店和本地特色商铺，是购物、娱乐和感受成都都市生活的理想场所。', 
              address: '成都市锦江区春熙路',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/59693a04ce20f2af996af3c5a3d39605.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/b64bb1b87f47c4e8aada50e21bd4ba4a.jpeg'
              ],
              location: {
                lat: 30.657488,
                lng: 104.085228
              }
            }
          ]
        },
        {
          day: 4,
          dailyTimeRange: { start: 9, end: 20 },
          color: '#FF5252', // 红色路线
          places: [
            { 
              id: 511, 
              name: '四川省博物院', 
              timeStart: '9:00AM', 
              timeEnd: '11:30AM', 
              description: '四川省博物院是中国西部地区最大的综合性博物馆之一，收藏了大量四川地区的历史文物和艺术品，尤其以三星堆文物、巴蜀青铜器闻名。', 
              address: '成都市青羊区浣花南路251号',
              openingHours: '9:00AM - 5:00PM（周一闭馆）',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/28be50a36d77eb7c93a7ceb7c6a2642d.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/c81cd98d69e76e9fa56e5cf7522b47b2.jpeg'
              ],
              location: {
                lat: 30.662881,
                lng: 104.037345
              }
            },
            { 
              id: 512, 
              name: '龙抄手（总店）', 
              timeStart: '12:00PM', 
              timeEnd: '1:30PM', 
              description: '龙抄手是成都著名的小吃店，创立于1958年，以抄手（馄饨）和担担面等传统川式小吃闻名，是品尝成都特色小吃的好去处。', 
              address: '成都市锦江区人民东路61号',
              openingHours: '10:00AM - 9:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/3d7a44cb6be8cb0cd26db7fd15ed6752.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/3c99bfbe8ccb8ed595cac1b5b6c5edb9.jpeg'
              ],
              location: {
                lat: 30.655835,
                lng: 104.078358
              }
            },
            { 
              id: 513, 
              name: '金沙遗址博物馆', 
              timeStart: '2:00PM', 
              timeEnd: '5:00PM', 
              description: '金沙遗址博物馆建在三千年前古蜀国都城遗址上，展示了金沙遗址出土的珍贵文物，包括太阳神鸟金饰等国宝级文物。', 
              address: '成都市青羊区金沙遗址路2号',
              openingHours: '8:00AM - 6:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/cfb27bcf4cf6fa73cdb78c6e72123f9a.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/01e8a49cded2b8d06cfb0de1e3ef30d6.jpeg'
              ],
              location: {
                lat: 30.686528,
                lng: 104.000203
              }
            },
            { 
              id: 514, 
              name: '太古里', 
              timeStart: '6:00PM', 
              timeEnd: '8:00PM', 
              description: '成都远洋太古里是一个开放式街区商业综合体，融合了传统与现代元素，汇集了众多国际品牌和特色餐厅，是成都时尚潮流的中心。', 
              address: '成都市锦江区中纱帽街8号',
              openingHours: '10:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/8ef8cf09b240c085be1ad07209eecac4.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/fa1f53628d9dcdab3f63d11b055bbc88.jpeg'
              ],
              location: {
                lat: 30.654697,
                lng: 104.086382
              }
            }
          ]
        },
        {
          day: 5,
          dailyTimeRange: { start: 8, end: 17 },
          color: '#2196F3', // 蓝色路线
          places: [
            { 
              id: 515, 
              name: '武侯祠', 
              timeStart: '8:30AM', 
              timeEnd: '11:00AM', 
              description: '武侯祠是中国唯一一座君臣合祀的祠庙，祭祀着三国时期蜀汉丞相诸葛亮和蜀汉皇帝刘备，园内古柏参天，环境清幽。', 
              address: '成都市武侯区武侯祠大街231号',
              openingHours: '8:00AM - 6:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/7a40c33ba6f8ee9e8e1f6c9050cda59c.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/49abd65f10edf32a6c14f31e0e0ca0e1.jpeg'
              ],
              location: {
                lat: 30.642688,
                lng: 104.047339
              }
            },
            { 
              id: 516, 
              name: '成都吃客（致民路店）', 
              timeStart: '11:30AM', 
              timeEnd: '1:00PM', 
              description: '成都吃客是一家创新川菜餐厅，将传统川菜与现代烹饪技法相结合，菜品独特创新但保留了川菜的麻辣风味，是尝试新派川菜的好去处。', 
              address: '成都市锦江区致民路48号',
              openingHours: '11:00AM - 10:00PM',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/b77e60ce878033ed6e7a2af83dde2874.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/6ad0c5f90e1a2cc51a94f77b0caa9f05.jpeg'
              ],
              location: {
                lat: 30.656722,
                lng: 104.075857
              }
            },
            { 
              id: 517, 
              name: '浣花溪公园', 
              timeStart: '2:00PM', 
              timeEnd: '4:00PM', 
              description: '浣花溪公园是纪念唐代诗人杜甫的公园，环境优美，溪水清澈，古树参天，是成都市民休闲娱乐的好去处。', 
              address: '成都市青羊区浣花南路',
              openingHours: '全天开放',
              images: [
                'https://pic.rmb.bdstatic.com/bjh/news/59c0f9fbc81ed72e5149d5da0fb9af41.jpeg',
                'https://pic.rmb.bdstatic.com/bjh/news/36a4bf8c5c52f27a4430c84e4abbc70d.jpeg'
              ],
              location: {
                lat: 30.667869,
                lng: 104.034517
              }
            }
          ]
        }
      ]
    }
  }
};

// 获取所有行程(合并预设+用户创建)
export const getAllTrips = () => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 重新加载用户行程以确保数据最新
      userTrips = loadUserTrips();
      resolve([...mockTrips, ...userTrips]);
    }, 500);
  });
};

// 根据ID获取行程(合并预设+用户创建)
export const getTripById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 先在预设行程中查找
      let trip = mockTrips.find(trip => trip.id === id);
      // 如果没找到,在用户行程中查找
      if (!trip) {
        userTrips = loadUserTrips();
        trip = userTrips.find(trip => trip.id === id);
      }
      if (trip) {
        resolve(trip);
      } else {
        reject(new Error('未找到行程'));
      }
    }, 500);
  });
};

// 获取行程详情(合并预设+用户创建)
export const getTripDetailsById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 先在预设详情中查找
      let details = mockTripDetails[id];
      // 如果没找到,在用户详情中查找
      if (!details) {
        userTripDetails = loadUserTripDetails();
        details = userTripDetails[id];
      }
      
      // 确保所有景点图片可访问
      if (details && details.itinerary && details.itinerary.days) {
        details.itinerary.days.forEach(day => {
          if (day.places) {
            day.places.forEach(place => {
              // 替换所有景点图片为本地图片
              if (place.images && place.images.length > 0) {
                // 根据景点名称直接使用对应图片
                if (place.name.includes('故宫')) {
                  place.images = ['/image/attractions/故宫.jpg'];
                } else if (place.name.includes('天安门') || place.name.includes('天坛')) {
                  place.images = ['/image/attractions/beijing.jpg'];
                } else if (place.name.includes('颐和园')) {
                  place.images = ['/image/attractions/颐和园.jpg'];
                } else if (place.name.includes('长城')) {
                  place.images = ['/image/attractions/长城.jpg'];
                } else if (place.name.includes('圆明园')) {
                  place.images = ['/image/attractions/圆明园.jpg'];
                } else if (place.name.includes('四季民福')) {
                  place.images = ['/image/attractions/四季民福.jpg'];
                } else if (place.name.includes('王府井')) {
                  place.images = ['/image/attractions/王府井.jpg'];
                } else if (place.name.includes('北京大学')) {
                  place.images = ['/image/attractions/北京大学.jpg'];
                } else if (place.name.includes('明十三陵')) {
                  place.images = ['/image/attractions/ming.jpg'];
                } else {
                  // 使用目的地默认图片
                  const destination = details.tripInfo.destination.toLowerCase();
                  place.images = [`/image/${destination}.jpg`];
                }
              }
            });
          }
        });
      }
      
      resolve(details);
    }, 800);
  });
};

// 创建新行程(保存到localStorage)
export const createTrip = (tripData) => {
  // 重新加载用户行程以确保ID不冲突
  userTrips = loadUserTrips();
  userTripDetails = loadUserTripDetails();

  // 生成新行程ID: 从1000开始,避免与预设行程冲突
  const existingIds = [...mockTrips.map(t => t.id), ...userTrips.map(t => t.id)];
  const newTripId = Math.max(1000, ...existingIds) + 1;

  // 创建新行程对象
  const newTrip = {
    id: newTripId,
    ...tripData,
    coverImage: `/image/${tripData.destination.toLowerCase()}.jpg`,
    createdAt: new Date().toISOString()
  };

  // 添加到用户行程列表(持久化)
  userTrips.push(newTrip);
  saveUserTrips(userTrips);

  // 为新行程创建详细行程数据
  const startDate = new Date(tripData.startDate);
  const endDate = new Date(tripData.endDate);
  const tripDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  // 根据目的地自动生成行程详情
  const daysArray = [];
  const colors = ['#FF5252', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'];

  for (let i = 0; i < tripDays; i++) {
    daysArray.push({
      day: i + 1,
      dailyTimeRange: { start: 9, end: 19 },
      color: colors[i % colors.length],
      places: generatePlacesForDestination(tripData.destination, i + 1)
    });
  }

  // 创建详细行程(持久化)
  userTripDetails[newTripId] = {
    tripInfo: {
      ...newTrip,
      notes: tripData.notes || `这是一次${tripData.destination}之旅`
    },
    itinerary: {
      days: daysArray
    }
  };
  saveUserTripDetails(userTripDetails);

  console.log('【创建行程】新行程ID:', newTripId, '已保存到localStorage');

  // 直接返回新创建的行程ID，不使用模拟延迟
  return Promise.resolve({ id: newTripId });
};

// 根据目的地生成对应的景点
function generatePlacesForDestination(destination, day) {
  const commonPlaces = [];
  
  // 所有目的地使用本地图片
  const getImage = () => [`/image/${destination.toLowerCase()}.jpg`];
  
  // 第一天生成景点、餐厅
  if (day === 1) {
    commonPlaces.push({
      id: Math.floor(Math.random() * 10000),
      name: `${destination}景点一`,
      timeStart: '9:00AM',
      timeEnd: '11:00AM',
      description: `这是${destination}的著名景点，拥有悠久的历史和美丽的风景。`,
      address: `${destination}市景点路123号`,
      openingHours: '8:00AM - 5:00PM',
      requiresBooking: false,
      ticketPrice: '¥50',
      images: [getImage()],
      type: 'attraction',
      location: { lat: 30 + Math.random(), lng: 110 + Math.random() }
    });
    
    commonPlaces.push({
      id: Math.floor(Math.random() * 10000),
      name: `${destination}餐厅一`,
      timeStart: '12:00PM',
      timeEnd: '1:30PM',
      description: `这是一家提供正宗${destination}美食的餐厅，菜品种类丰富，味道鲜美。`,
      address: `${destination}市美食街456号`,
      openingHours: '10:00AM - 10:00PM',
      requiresBooking: true,
      ticketPrice: '人均¥100',
      images: [getImage()],
      type: 'restaurant',
      location: { lat: 30 + Math.random(), lng: 110 + Math.random() }
    });
  }
  // 第二天生成公园、博物馆
  else if (day === 2) {
    commonPlaces.push({
      id: Math.floor(Math.random() * 10000),
      name: `${destination}公园`,
      timeStart: '9:00AM',
      timeEnd: '11:30AM',
      description: `这是${destination}市内最大的公园，环境优美，是放松身心的好去处。`,
      address: `${destination}市公园路789号`,
      openingHours: '6:00AM - 8:00PM',
      requiresBooking: false,
      ticketPrice: '免费',
      images: [getImage()],
      type: 'park',
      location: { lat: 30 + Math.random(), lng: 110 + Math.random() }
    });
    
    commonPlaces.push({
      id: Math.floor(Math.random() * 10000),
      name: `${destination}博物馆`,
      timeStart: '1:00PM',
      timeEnd: '4:00PM',
      description: `这是展示${destination}历史文化的重要场所，收藏了大量珍贵文物。`,
      address: `${destination}市文化路101号`,
      openingHours: '9:00AM - 5:00PM（周一闭馆）',
      requiresBooking: false,
      ticketPrice: '¥30',
      images: [getImage()],
      type: 'museum',
      location: { lat: 30 + Math.random(), lng: 110 + Math.random() }
    });
  }
  // 第三天生成购物中心、特产店
  else {
    commonPlaces.push({
      id: Math.floor(Math.random() * 10000),
      name: `${destination}购物中心`,
      timeStart: '10:00AM',
      timeEnd: '1:00PM',
      description: `这是${destination}最大的购物中心，汇集了各类国际品牌和本地特色商品。`,
      address: `${destination}市商业大道888号`,
      openingHours: '10:00AM - 10:00PM',
      requiresBooking: false,
      ticketPrice: '免费',
      images: [getImage()],
      type: 'shopping',
      location: { lat: 30 + Math.random(), lng: 110 + Math.random() },
      driving: true
    });
    
    commonPlaces.push({
      id: Math.floor(Math.random() * 10000),
      name: `${destination}特产商店`,
      timeStart: '5:00PM',
      timeEnd: '6:30PM',
      description: `这里汇聚了${destination}的各种特色商品和纪念品，是购物的好去处。`,
      address: `${destination}市商业区`,
      openingHours: '10:00AM - 9:00PM',
      requiresBooking: false,
      ticketPrice: '免费',
      images: [getImage()],
      type: 'shopping',
      location: { lat: 30 + Math.random(), lng: 110 + Math.random() }
    });
  }
  
  return commonPlaces;
}

// 更新行程
export const updateTrip = (tripId, tripData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTrips.findIndex(trip => trip.id === tripId);
      if (index !== -1) {
        // 更新行程基本信息
        mockTrips[index] = {
          ...mockTrips[index],
          ...tripData
        };

        // 更新详细行程信息
        if (mockTripDetails[tripId]) {
          mockTripDetails[tripId].tripInfo = {
            ...mockTripDetails[tripId].tripInfo,
            ...tripData
          };
        }

        resolve({ success: true, trip: mockTrips[index] });
      } else {
        reject(new Error('未找到行程'));
      }
    }, 500);
  });
};

// 删除行程
export const deleteTrip = (tripId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTrips.findIndex(trip => trip.id === tripId);
      if (index !== -1) {
        // 删除行程
        mockTrips.splice(index, 1);

        // 删除详细行程数据
        if (mockTripDetails[tripId]) {
          delete mockTripDetails[tripId];
        }

        resolve({ success: true, message: '行程已删除' });
      } else {
        reject(new Error('未找到行程'));
      }
    }, 500);
  });
};