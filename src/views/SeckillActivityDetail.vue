<template>
  <div class="seckill-activity-detail">
    <!-- 页面标题 -->
    <h1 class="page-title">
      <span class="title-text">秒杀活动详情</span>
      <span class="title-flash">限时抢购！</span>
    </h1>

    <!-- 活动详情卡片 -->
    <el-card class="activity-card">
      <div class="activity-detail">
        <!-- 活动图片占位符 -->
        <div class="activity-image-placeholder">
          <img
            v-if="true"
            :src="imageList[Math.floor(Math.random() * imageList.length)]"
            alt="商品图片"
            class="product-image"
          />
          <div v-else class="image-placeholder">暂无图片</div>
        </div>

        <!-- 活动信息 -->
        <div class="activity-info">
          <h2 class="activity-name">{{ activity.name }}</h2>
          <p class="activity-description">{{ activity.description || '暂无描述' }}</p>
          <div class="activity-meta">
            <p class="time">开始时间: {{ formatTime(activity.startTime) }}</p>
            <p class="time">结束时间: {{ formatTime(activity.endTime) }}</p>
            <p class="stock">库存: {{ activity.stock }}</p>
            <p class="status" :class="getStatusClass(activity.status)">
              状态: {{ getStatusText(activity.status) }}
            </p>
            <p v-if="countdown" class="countdown">结束倒计时: <span class="countdown-time">{{ countdown }}</span></p>
          </div>

          <!-- 抢购按钮 -->
          <el-button
            type="danger"
            :disabled="activity.status !== 1 || activity.stock <= 0"
            @click="participateSeckill"
            class="seckill-button"
          >
            立即抢购
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 商品详情部分 -->
    <el-card class="product-card" v-if="activity.product">
      <h3 class="product-title">商品信息</h3>
      <div class="product-detail">
        <!-- 商品图片占位符 -->
        <div class="product-image-placeholder">
          <img
            v-if="true"
            :src="imageList[Math.floor(Math.random() * imageList.length)]"
            alt="商品图片"
            class="product-image"
          />
          <div v-else class="image-placeholder">暂无图片</div>
        </div>

        <!-- 商品信息 -->
        <div class="product-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="商品名称">{{ activity.product.name }}</el-descriptions-item>
            <el-descriptions-item label="商品描述">{{ activity.product.description }}</el-descriptions-item>
            <el-descriptions-item label="商品价格">
              {{ formatPrice(activity.product.price) }}
            </el-descriptions-item>
            <el-descriptions-item label="商品库存">{{ activity.product.stock }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatTime(activity.product.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatTime(activity.product.updateTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const activity = ref({}); // 活动详情
const countdown = ref(''); // 结束倒计时
const route = useRoute();
const router = useRouter();
let timer = null; // 定时器

const imageList =[
  "https://img.zcool.cn/community/01d5615abc9301a8012062e38ca89c.JPG?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100/quality,q_100",
  "https://img.zcool.cn/community/01d5615abc9301a8012062e38ca89c.JPG?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100/quality,q_100",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.i3aj4AAmlwyUCeNpZjnvOAHaE8?rs=1&pid=ImgDetMain",
  "https://img95.699pic.com/photo/50018/0189.jpg_wh860.jpg",
  "https://img95.699pic.com/photo/60015/8957.jpg_wh860.jpg",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.3hBgFtrc4-d0daxwmH7cnwHaE8?rs=1&pid=ImgDetMain",
  "https://ts1.cn.mm.bing.net/th/id/R-C.30e8a422ed0531c065614f57b3ec00c7?rik=prPBQ%2bH8HHA6tg&riu=http%3a%2f%2fseopic.699pic.com%2fphoto%2f50105%2f8519.jpg_wh1200.jpg&ehk=nZWSnJtQiDQlJ7orUunPGwc7rc89n7L03b6YDYCpiFI%3d&risl=&pid=ImgRaw&r=0",
  "https://img.zcool.cn/community/0103d65afaf2d2a80121604517b881.jpg?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100",
  "https://ts1.cn.mm.bing.net/th/id/R-C.ea214c6bd697f499d917f86c9de53c56?rik=o33lqLaAKmrxMg&riu=http%3a%2f%2fp7.zbjimg.com%2fservice%2f2015-11%2f30%2fservice%2f565c164e15dd2.jpg&ehk=mVqsmAQPLS2fy1gbdfiML24rLDEbVL7KSW53DDhI%2bVI%3d&risl=&pid=ImgRaw&r=0",
  "https://pic.nximg.cn/file/20220608/27797488_120921621109_2.jpg",
  "https://tse3-mm.cn.bing.net/th/id/OIP-C.T8szPQWoyzuppclnXhVfcAHaE7?rs=1&pid=ImgDetMain"
]

// 加载活动详情
const loadActivity = async () => {
  try {
    const response = await axios.get(`/admin/seckill-activities/${route.params.id}`);
    activity.value = response.data;
    startCountdown(); // 启动倒计时
  } catch (error) {
    ElMessage.error('加载活动详情失败');
  }
};

// 抢购功能
const participateSeckill = async () => {
  try {
    const userId = authStore.getUserId();
    const seckillActivityId = activity.value.id;
    const totalPrice = 1;
    const response = await axios.post('/seckill/participate', null, {
      params: {
        userId,
        seckillActivityId,
        totalPrice,
      },
    });
    if (response === '秒杀成功') {
      ElMessage.success('抢购成功！');
      activity.value.stock -= 1; // 更新库存
      router.push('/seckillOder'); // 跳转到订单页面
    } else {
      ElMessage.error('你已经抢购过了');
    }
  } catch (error) {
    console.log(error);
    ElMessage.error('抢购失败');
  }
};

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString();
};

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 获取活动状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0:
      return '未开始';
    case 1:
      return '进行中';
    case 2:
      return '已结束';
    default:
      return '未知状态';
  }
};

// 获取活动状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 0:
      return 'status-not-started';
    case 1:
      return 'status-in-progress';
    case 2:
      return 'status-ended';
    default:
      return '';
  }
};

// 计算倒计时
const startCountdown = () => {
  const endTime = new Date(activity.value.endTime).getTime();
  timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance <= 0) {
      clearInterval(timer);
      countdown.value = '活动已结束';
      activity.value.status = 2; // 更新活动状态为已结束
    } else {
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      countdown.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }, 1000);
};

// 初始化加载
onMounted(() => {
  loadActivity();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.seckill-activity-detail {
  padding: 40px;
  background-color: #f4f4f4;
}

.page-title {
  text-align: center;
  font-size: 36px;
  color: #ff4d4f;
  margin-bottom: 30px;
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

.activity-card,
.product-card {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover,
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(255, 77, 79, 0.2);
}

.activity-detail {
  display: flex;
  gap: 30px;
  padding: 30px;
}

.activity-image-placeholder,
.product-image-placeholder {
  width: 350px;
  height: 230px;
  background-color: #e9e9e9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-info {
  flex: 1;
}

.activity-name {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: bold;
}

.activity-description {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.activity-meta p {
  margin: 12px 0;
  font-size: 18px;
}

.time {
  color: #666;
}

.stock {
  color: #f56c6c;
  font-weight: bold;
}

.status {
  font-weight: bold;
}

.status-not-started {
  color: #999;
}

.status-in-progress {
  color: #409eff;
}

.status-ended {
  color: #f5222d;
}

.countdown {
  color: #ff4d4f;
  font-size: 20px;
  font-weight: bold;
  margin-top: 15px;
}

.countdown-time {
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

.seckill-button {
  width: 100%;
  margin-top: 25px;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  font-size: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.seckill-button:hover {
  background-color: #f5222d;
}

.product-card {
  padding: 30px;
}

.product-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 25px;
  font-weight: bold;
}

.product-detail {
  display: flex;
  gap: 30px;
}

.product-info {
  flex: 1;
}

.el-descriptions {
  border: 1px solid #dcdfe6;
}

.el-descriptions-item {
  font-size: 16px;
  line-height: 1.8;
}

.el-descriptions-item__label {
  font-weight: bold;
  color: #606266;
}

.el-descriptions-item__content {
  color: #909399;
}
</style> 