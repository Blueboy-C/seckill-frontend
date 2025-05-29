<template>
  <div class="seckill-activity-list">
    <h1 class="page-title">
      <span class="title-text">秒杀活动列表</span>
      <span class="title-flash">🔥</span>
    </h1>
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索活动..."
        clearable
        @clear="loadActivities"
        @keyup.enter="loadActivities"
        class="search-input"
      />
      <el-button type="danger" @click="loadActivities" class="search-button">搜索</el-button>
    </div>

    <!-- 活动网格布局 -->
    <el-row :gutter="20" v-infinite-scroll="loadMore" :infinite-scroll-disabled="loading">
      <el-col
        v-for="activity in activities"
        :key="activity.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
      >
        <el-card class="activity-card" shadow="hover" @click="viewActivity(activity.id)">
          <div class="activity-info">
            <img 
              :src="imageList[Math.floor(Math.random() * imageList.length)]"
              alt="活动图片" 
              class="activity-image" 
            />
            <h3 class="activity-name">{{ activity.name }}</h3>
            <div class="time-info">
              <p class="time">开始时间: {{ formatTime(activity.startTime) }}</p>
              <p class="time">结束时间: {{ formatTime(activity.endTime) }}</p>
            </div>
            <!-- 倒计时 -->
            <div class="countdown" v-if="getActivityStatus(activity) === '进行中'">
              <span class="countdown-text">剩余时间:</span>
              <span class="countdown-time">{{ calculateCountdown(activity.endTime) }}</span>
            </div>
            <div class="countdown" v-else-if="getActivityStatus(activity) === '未开始'">
              <span class="countdown-text">距离开始:</span>
              <span class="countdown-time">{{ calculateCountdown(activity.startTime) }}</span>
            </div>
            <p class="stock">库存: {{ activity.stock }}</p>
            <!-- 状态 -->
            <p class="status" :class="getStatusClass(getActivityStatus(activity))">
              {{ getActivityStatus(activity) }}
            </p>
            <el-button type="danger" class="view-detail-button">立即抢购</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 加载提示 -->
    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-if="noMore" class="loading-text">没有更多活动了</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';

const activities = ref([]); // 活动列表
const searchQuery = ref(''); // 搜索关键词
const currentPage = ref(1); // 当前页码
const pageSize = 10; // 每页大小
const total = ref(0); // 总活动数
const loading = ref(false); // 是否正在加载
const noMore = ref(false); // 是否没有更多活动
const router = useRouter();
let countdownInterval = null; // 全局定时器

const imageList = [
  "https://img.zcool.cn/community/01d5615abc9301a8012062e38ca89c.JPG?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100/quality,q_100",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.i3aj4AAmlwyUCeNpZjnvOAHaE8?rs=1&pid=ImgDetMain",
  "https://img95.699pic.com/photo/50018/0189.jpg_wh860.jpg",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.3hBgFtrc4-d0daxwmH7cnwHaE8?rs=1&pid=ImgDetMain",
  "https://ts1.cn.mm.bing.net/th/id/R-C.30e8a422ed0531c065614f57b3ec00c7?rik=prPBQ%2bH8HHA6tg&riu=http%3a%2f%2fseopic.699pic.com%2fphoto%2f50105%2f8519.jpg_wh1200.jpg&ehk=nZWSnJtQiDQlJ7orUunPGwc7rc89n7L03b6YDYCpiFI%3d&risl=&pid=ImgRaw&r=0",
  "https://img.zcool.cn/community/0103d65afaf2d2a80121604517b881.jpg?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100",
  "https://ts1.cn.mm.bing.net/th/id/R-C.ea214c6bd697f499d917f86c9de53c56?rik=o33lqLaAKmrxMg&riu=http%3a%2f%2fp7.zbjimg.com%2fservice%2f2015-11%2f30%2fservice%2f565c164e15dd2.jpg&ehk=mVqsmAQPLS2fy1gbdfiML24rLDEbVL7KSW53DDhI%2bVI%3d&risl=&pid=ImgRaw&r=0",
  "https://pic.nximg.cn/file/20220608/27797488_120921621109_2.jpg",
  "https://tse3-mm.cn.bing.net/th/id/OIP-C.T8szPQWoyzuppclnXhVfcAHaE7?rs=1&pid=ImgDetMain"
];

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/seckill-activities/page', {
      params: {
        pageNum: currentPage.value,
        pageSize,
        name: searchQuery.value,
        endTime: new Date()
      },
    });
    if (currentPage.value === 1) {
      activities.value = response.data.data; // 第一页直接覆盖
    } else {
      activities.value = [...activities.value, ...response.data.data]; // 追加新数据
    }
    total.value = response.data.total;
    noMore.value = activities.value.length >= total.value; // 判断是否没有更多活动
  } catch (error) {
    ElMessage.error('加载活动列表失败');
  } finally {
    loading.value = false;
  }
};

// 滚动加载更多
const loadMore = () => {
  if (!loading.value && !noMore.value) {
    currentPage.value += 1;
    loadActivities();
  }
};

// 查看活动详情
const viewActivity = (id) => {
  router.push(`/seckill-activity/${id}`);
};

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString();
};

// 计算倒计时
const calculateCountdown = (targetTime) => {
  const now = new Date().getTime();
  const target = new Date(targetTime).getTime();
  const diff = target - now;
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 获取活动状态
const getActivityStatus = (activity) => {
  const now = new Date().getTime();
  const startTime = new Date(activity.startTime).getTime();
  const endTime = new Date(activity.endTime).getTime();

  if (now < startTime) {
    return '未开始';
  } else if (now >= startTime && now <= endTime) {
    return '进行中';
  } else {
    return '已结束';
  }
};

// 获取活动状态类名
const getStatusClass = (status) => {
  switch (status) {
    case '未开始':
      return 'status-not-started';
    case '进行中':
      return 'status-in-progress';
    case '已结束':
      return 'status-ended';
    default:
      return '';
  }
};

// 启动全局定时器
const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval); // 清除旧的定时器
  countdownInterval = setInterval(() => {
    activities.value = activities.value.map((activity) => {
      return { ...activity }; // 触发响应式更新
    });
  }, 1000);
};

// 初始化加载
onMounted(() => {
  loadActivities();
  startCountdown(); // 启动全局定时器
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.seckill-activity-list {
  padding: 20px;
  background-color: #f8f8f8;
  min-height:100vh;
}

.page-title {
  text-align: center;
  font-size: 36px;
  color: #ff4d4f;
  margin-bottom: 20px;
  position: relative;
}

.title-text {
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(255, 77, 79, 0.3);
}

.title-flash {
  display: inline-block;
  margin-left: 10px;
  font-size: 24px;
  color: #ff4d4f;
  animation: flash 1s infinite alternate;
}

@keyframes flash {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.5;
  }
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-input {
  width: 400px;
  margin-right: 10px;
}

.search-button {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  font-weight: bold;
}

.activity-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: linear-gradient(135deg, #fff, #f8f8f8);
  border-radius: 8px;
  overflow: hidden;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(255, 77, 79, 0.2);
}

.activity-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.activity-info {
  padding: 15px;
}

.activity-name {
  font-size: 18px;
  color: #333;
  margin: 10px 0;
  font-weight: bold;
}

.time-info {
  color: #666;
  margin: 10px 0;
}

.countdown {
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.countdown-text {
  margin-right: 5px;
}

.countdown-time {
  font-size: 18px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.stock {
  color: #f56c6c;
  margin: 10px 0;
}

.status {
  font-size: 14px;
  margin: 10px 0;
}

.status-not-started {
  color: #999;
}

.status-in-progress {
  color: #52c41a;
}

.status-ended {
  color: #f5222d;
}

.view-detail-button {
  width: 100%;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.view-detail-button:hover {
  background-color: #ff7875;
  border-color: #ff7875;
}

.loading-text {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>