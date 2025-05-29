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
        <!-- 图片区域（左） -->
        <div class="activity-image">
          <el-carousel v-if="activity.product && activity.product.imageList.length > 0" :interval="3000" arrow="always">
            <el-carousel-item v-for="(image, index) in activity.product.imageList" :key="index">
              <img :src="image.imageUrl" alt="商品图片" class="product-image" />
            </el-carousel-item>
          </el-carousel>
          <div v-else class="image-placeholder">暂无图片</div>
        </div>

        <!-- 活动信息区域（中） -->
        <div class="activity-info">
          <h2 class="activity-name">{{ activity.name }}</h2>
          <p class="activity-description">{{ activity.description || '暂无描述' }}</p>
          <div class="activity-meta">
            <p class="time">开始时间: {{ formatTime(activity.startTime) }}</p>
            <p class="time">结束时间: {{ formatTime(activity.endTime) }}</p>
            <p class="stock">库存: {{ activity.stock }}</p>
            <p class="status" :class="getStatusClass(getActivityStatus(activity))">
              状态: {{ getActivityStatus(activity) }}
            </p>
            <!-- 倒计时 -->
            <p v-if="getActivityStatus(activity) === '进行中'" class="countdown">
              结束倒计时: <span class="countdown-time">{{ countdown }}</span>
            </p>
            <p v-else-if="getActivityStatus(activity) === '未开始'" class="countdown">
              距离开始: <span class="countdown-time">{{ countdown }}</span>
            </p>
          </div>
        </div>

        <!-- 价格和抢购按钮区域（右） -->
        <div class="price-action-section">
          <!-- 价格 -->
          <div class="price-section">
            <!-- <p class="price-label">秒杀价</p> -->
            <p class="price-value">{{ formatPrice(activity.product?.price) }}</p>
          </div>
          <!-- 抢购按钮 -->
          <div class="action-section">
            <el-button
              type="danger"
              :disabled="getActivityStatus(activity) !== '进行中' || activity.stock <= 0 || !selectedAddress"
              @click="participateSeckill"
              class="seckill-button"
            >
              立即抢购
            </el-button>
            <!-- 收货地址选择 -->
            <el-button type="text" @click="openAddressDialog">
              {{ selectedAddress ? `收货地址: ${selectedAddress.receiverAddress}` : '选择收货地址' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 商品详情部分 -->
    <el-card class="product-card" v-if="activity.product">
      <h3 class="product-title">商品信息</h3>
      <div class="product-detail">
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

    <!-- 收货地址选择弹窗 -->
    <el-dialog v-model="addressDialogVisible" title="选择收货地址" width="50%">
      <el-table :data="addressList" @row-click="selectAddress">
        <el-table-column prop="receiverName" label="收货人" width="120" />
        <el-table-column prop="receiverPhone" label="联系电话" width="150" />
        <el-table-column prop="receiverAddress" label="收货地址" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="text" @click="setDefaultAddress(row.id)">设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
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
const countdown = ref(''); // 倒计时
const route = useRoute();
const router = useRouter();
let timer = null; // 定时器

const addressDialogVisible = ref(false); // 地址选择弹窗
const addressList = ref([]); // 收货地址列表
const selectedAddress = ref(null); // 选中的收货地址

// 加载活动详情
const loadActivity = async () => {
  try {
    const response = await axios.get(`/seckill-activities/${route.params.id}`);
    activity.value = response.data;
    startCountdown(); // 启动倒计时
  } catch (error) {
    ElMessage.error('加载活动详情失败');
  }
};

// 加载收货地址列表
const loadAddressList = async () => {
  try {
    const response = await axios.get('/user/address/list', {
      params: { userId: authStore.getUserId() },
    });
    addressList.value = response;
    // 设置默认地址
    const defaultAddress = addressList.value.find((addr) => addr.isDefault);
    if (defaultAddress) {
      selectedAddress.value = defaultAddress;
    }
  } catch (error) {
    ElMessage.error('加载收货地址失败');
  }
};

// 打开地址选择弹窗
const openAddressDialog = () => {
  addressDialogVisible.value = true;
};

// 选择地址
const selectAddress = (address) => {
  selectedAddress.value = address;
  addressDialogVisible.value = false;
};

// 设置默认地址
const setDefaultAddress = async (addressId) => {
  try {
    await axios.post('/user/address/setDefault', {
      userId: authStore.getUserId(),
      addressId,
    });
    ElMessage.success('设置默认地址成功');
    loadAddressList(); // 重新加载地址列表
  } catch (error) {
    ElMessage.error('设置默认地址失败');
  }
};

// 抢购功能
const participateSeckill = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请先选择收货地址');
    return;
  }

  try {
    const userId = authStore.getUserId();
    const seckillActivityId = activity.value.id;
    const totalPrice = activity.value.product.price; // 使用商品价格作为总价
    const productName = activity.value.product.name; // 商品名称
    const productPrice = activity.value.product.price; // 商品价格
    const addressId = selectedAddress.value.id; // 选中的地址ID
    const activityName = activity.value.name;

    const seckillOrder = {
      userId,
      seckillActivityId,
      totalPrice,
      productName,
      productPrice,
      addressId,
      activityName,
    };

    const response = await axios.post('/seckill/participate', seckillOrder);
    if (response.data === '秒杀成功') {
      ElMessage.success('抢购成功！');
      activity.value.stock -= 1; // 更新库存
      router.push('/seckillOrder'); // 跳转到订单页面
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
    if (price === undefined || price === null) {
    return '¥0.00'; // 如果价格不存在，返回默认值
  }
  return `¥${price.toFixed(2)}`; // 正常格式化价格
  return `¥${price.toFixed(2)}`;
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

// 计算倒计时
const startCountdown = () => {
  const now = new Date().getTime();
  const startTime = new Date(activity.value.startTime).getTime();
  const endTime = new Date(activity.value.endTime).getTime();

  timer = setInterval(() => {
    const currentTime = new Date().getTime();
    let distance;

    if (currentTime < startTime) {
      distance = startTime - currentTime; // 距离开始时间
    } else if (currentTime >= startTime && currentTime <= endTime) {
      distance = endTime - currentTime; // 距离结束时间
    } else {
      clearInterval(timer);
      countdown.value = '活动已结束';
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdown.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
};

// 初始化加载
onMounted(() => {
  loadActivity();
  loadAddressList();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
:root {
  --primary-color: red; /* 主色调：红色 */
  --secondary-color: #ff7a45; /* 辅色调：橙色 */
  --background-color: #f8f8f8; /* 背景色 */
  --text-color: #333; /* 文字颜色 */
  --text-secondary-color: #666; /* 次要文字颜色 */
  --border-color: #e8e8e8; /* 边框颜色 */
  --shadow-color: rgba(0, 0, 0, 0.1); /* 阴影颜色 */
}

.seckill-activity-detail {
  padding: 24px;
  background-color: var(--background-color);
}

.page-title {
  text-align: center;
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 24px;
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
  color: red;
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

.activity-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  background: linear-gradient(135deg, #fff, var(--background-color));

}

.activity-detail {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.activity-image {
  flex: 1;
  max-width: 500px; /* 固定图片区域宽度 */
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: #f8f8f8;
  border: 1px dashed var(--border-color);
  color: var(--text-secondary-color);
}

.activity-info {
  flex: 2;
  max-width: 400px; /* 固定活动信息区域宽度 */
}

.activity-name {
  font-size: 24px;
  color: var(--text-color);
  margin-bottom: 12px;
}

.activity-description {
  font-size: 14px;
  color: var(--text-secondary-color);
  margin-bottom: 20px;
}

.activity-meta {
  margin-bottom: 20px;
}

.time,
.stock,
.status {
  font-size: 14px;
  color: var(--text-secondary-color);
  margin-bottom: 10px;
}

.countdown {
  font-size: 22px;
  color: red; /* 倒计时文字颜色改为红色 */
  font-weight: bold;
  margin-bottom: 20px;
}

.countdown-time {
  font-size: 25px;
  font-weight: bold;
  color: var(--primary-color); /* 倒计时文字颜色改为红色 */
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.price-action-section {

  max-width: 200px; /* 减少右侧区域宽度，使其更靠近中间 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px; /* 减少内部间距 */

}

.price-section {
  text-align: center;
  padding:20px;
  border-radius: 8px;
  border: 1px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.1);
  width: 100%;
}

.price-label {
  font-size: 20px;
  color: var(--text-secondary-color);
  margin-bottom: 8px;
}

.price-value {
  font-size: 60px;
  font-weight: bold;
  color: red;
  animation: pulse 1s infinite;
}

.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.seckill-button {
  width: 100%;
  font-weight: bold;
  color: black; /* 按钮文字颜色为黑色 */
  transition: all 0.3s ease;
  animation: shake 1s infinite;
}

.seckill-button:hover {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}

.product-card {
  margin-bottom: 20px;
}

.product-title {
  font-size: 20px;
  color: var(--text-color);
  margin-bottom: 20px;
}

.product-detail {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.product-info {
  flex: 2;
}

.el-descriptions {
  width: 100%;
}

.el-descriptions-item {
  padding: 10px 0;
}

.el-descriptions-item__label {
  font-weight: bold;
  color: var(--text-color);
}

.el-descriptions-item__content {
  color: var(--text-secondary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-detail {
    flex-direction: column;
  }

  .activity-image {
    max-width: 100%;
  }

  .page-title {
    font-size: 28px;
  }

  .title-flash {
    font-size: 18px;
  }
}
</style>