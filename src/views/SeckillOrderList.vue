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
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>
        <el-button type="primary" @click="loadOrders" class="search-button">搜索</el-button>
      </div>

      <!-- 订单列表 -->
      <el-table :data="orders" class="order-table" stripe border>
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column prop="seckillActivity.name" label="活动名称" width="150" />
        <el-table-column prop="seckillActivity.product.name" label="商品名称" width="150" />
        <el-table-column prop="totalPrice" label="总价格" width="120">
          <template #default="{ row }">
            {{ formatPrice(row.totalPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" class="status-tag">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="剩余支付时间" width="180">
          <template #default="{ row }">
            <div v-if="row.status === 0" class="countdown">
              {{ calculateCountdown(row.endTime || getDefaultEndTime(row.createTime)) }}
            </div>
            <div v-else>—</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              size="small"
              @click="payOrder(row.id)"
              class="action-button"
            >
              支付
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              size="small"
              @click="cancelOrder(row.id)"
              class="action-button"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
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
let countdownInterval = null; // 倒计时定时器

// 默认倒计时时间（30 分钟）
const DEFAULT_COUNTDOWN_MINUTES = 30;

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
    case 0:
      return '待支付';
    case 1:
      return '已支付';
    case 2:
      return '已取消';
    default:
      return '未知状态';
  }
};

// 获取订单状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 0:
      return 'warning';
    case 1:
      return 'success';
    case 2:
      return 'danger';
    default:
      return 'info';
  }
};

// 获取默认的结束时间（创建时间 + 30 分钟）
const getDefaultEndTime = (createTime) => {
  const createDate = new Date(createTime);
  return new Date(createDate.getTime() + DEFAULT_COUNTDOWN_MINUTES * 60 * 1000).toISOString();
};

// 计算倒计时
const calculateCountdown = (endTime) => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
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
      if (order.status === 0) {
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

.order-table {
  width: 100%;
  margin-bottom: 20px;
}

.status-tag {
  font-size: 14px;
}

.countdown {
  color: #ff4d4f;
  font-weight: bold;
}

.action-button {
  margin-right: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>