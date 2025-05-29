<template>
  <div class="seckill-order-list">
    <h1 class="page-title">我的秒杀订单</h1>
    <el-card class="order-card">
      <!-- 搜索和过滤 -->
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索订单ID"
          class="search-input"
          clearable
          @keyup.enter="loadOrders"
        />
        <el-select
          v-model="statusFilter"
          placeholder="选择订单状态"
          clearable
          @change="loadOrders"
          class="status-select"
        >
          <el-option label="待支付" value="PENDING" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
        <el-button type="primary" @click="loadOrders" class="search-button">搜索</el-button>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <span class="order-id">订单号：{{ order.id }}</span>
            <el-tag :type="getStatusTagType(order.status)" class="status-tag">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
          <div class="order-body">
            <div class="product-info">
              <el-image :src="order.productImage" class="product-image" fit="cover" />
              <div class="product-details">
                <h3 class="product-name">{{ order.productName }}</h3>
                <p class="activity-name">活动名称：{{ order.activityNameName }}</p>
                <p class="total-price">总价：{{ formatPrice(order.totalPrice) }}</p>
              </div>
            </div>
            <div class="order-actions">
              <div v-if="order.status === 'PENDING'" class="countdown">
                剩余支付时间：{{ calculateCountdown(order.payExpireTime) }}
              </div>
              <div class="buttons">
                <el-button
                  v-if="order.status === 'PENDING'"
                  type="success"
                  size="small"
                  @click="payOrder(order.id)"
                  class="action-button"
                >
                  支付
                </el-button>
                <el-button
                  v-if="order.status === 'PENDING'"
                  type="danger"
                  size="small"
                  @click="cancelOrder(order.id)"
                  class="action-button"
                >
                  取消
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="showOrderDetail(order)"
                  class="action-button"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next"
        :total="totalOrders"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="活动名称">{{ currentOrder.activityNameName }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.productName }}</el-descriptions-item>
        <el-descriptions-item label="总价格">{{ formatPrice(currentOrder.totalPrice) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(currentOrder.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="支付截止时间">{{ formatTime(currentOrder.payExpireTime) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ currentOrder.address.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.address.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentOrder.address.receiverRegion }} {{ currentOrder.address.receiverAddress }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const orders = ref([]); // 订单列表
const searchQuery = ref(''); // 搜索关键字
const statusFilter = ref(null); // 状态过滤
const totalOrders = ref(0); // 总订单数
const pageSize = ref(10); // 每页显示数量
const currentPage = ref(1); // 当前页码
const detailVisible = ref(false); // 详情弹窗是否可见
const currentOrder = ref({}); // 当前查看的订单
let countdownInterval = null; // 倒计时定时器

// 加载订单
const loadOrders = async () => {
  try {
    const userId = authStore.getUserId(); // 获取当前用户ID
    const response = await axios.get(`/seckill/orders/user/${userId}`, {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    });
    orders.value = response.data; // 当前页的数据
    totalOrders.value = response.data.total; // 总记录数
    startCountdown(); // 启动倒计时
  } catch (error) {
    ElMessage.error('加载订单失败');
  }
};

// 支付订单
const payOrder = async (orderId) => {
  try {
    await axios.put(`/seckill/orders/${orderId}/pay`);
    ElMessage.success('支付成功');
    loadOrders(); // 刷新订单列表
  } catch (error) {
    ElMessage.error('支付失败');
  }
};

// 取消订单
const cancelOrder = async (orderId) => {
  try {
    await axios.put(`/seckill/orders/${orderId}/cancel`);
    ElMessage.success('取消成功');
    loadOrders(); // 刷新订单列表
  } catch (error) {
    ElMessage.error('取消失败');
  }
};

// 显示订单详情
const showOrderDetail = (order) => {
  currentOrder.value = order;
  detailVisible.value = true;
};

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString();
};

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 获取订单状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'PENDING':
      return '待支付';
    case 'PAID':
      return '已支付';
    case 'CANCELLED':
      return '已取消';
    default:
      return '未知状态';
  }
};

// 获取订单状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'PAID':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'info';
  }
};

// 计算倒计时
const calculateCountdown = (payExpireTime) => {
  const now = new Date().getTime();
  const end = new Date(payExpireTime).getTime();
  const distance = end - now;

  if (distance <= 0) {
    return '已结束';
  }

  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 启动倒计时
const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval); // 清除旧的定时器
  countdownInterval = setInterval(() => {
    orders.value = orders.value.map((order) => {
      if (order.status === 'PENDING') {
        return { ...order }; // 触发响应式更新
      }
      return order;
    });
  }, 1000); // 每秒更新一次
};

// 分页改变事件
const handlePageChange = (page) => {
  currentPage.value = page;
  loadOrders();
};

// 初始化加载
onMounted(() => {
  loadOrders();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.seckill-order-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f8f8;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.order-card {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filter-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 200px;
}

.status-select {
  width: 150px;
}

.search-button {
  background-color: #409eff;
  border-color: #409eff;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
}

.order-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-id {
  font-size: 16px;
  font-weight: bold;
}

.status-tag {
  font-size: 14px;
}

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.activity-name {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 16px;
  font-weight: bold;
}

.order-actions {
  text-align: right;
}

.countdown {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
  margin-bottom: 8px;
}

.buttons {
  display: flex;
  gap: 10px;
}

.action-button {
  width: 80px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
  }

  .search-input,
  .status-select {
    width: 100%;
  }

  .order-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .order-actions {
    width: 100%;
    text-align: left;
  }

  .buttons {
    justify-content: flex-start;
  }
}
</style>