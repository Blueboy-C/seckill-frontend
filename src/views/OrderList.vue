<template>
  <div class="order-list-container">
    <h1 class="page-title">我的订单</h1>
    <el-card class="order-card">
      <!-- 查询功能 -->
      <div class="filter-container">
        <el-input
          v-model="searchQuery.id"
          placeholder="订单ID"
          class="search-input"
          clearable
        />
        <el-input
          v-model="searchQuery.productName"
          placeholder="商品名称"
          class="search-input"
          clearable
        />
        <el-select
          v-model="searchQuery.status"
          placeholder="订单状态"
          clearable
          class="status-select"
        >
          <el-option label="待支付" value="PENDING" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
        <el-button type="primary" @click="loadOrders" class="search-button">查询</el-button>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-item">
          <div class="order-header">
            <span class="order-id">订单号：{{ order.id }}</span>
            <span class="order-status">
              <el-tag :type="getStatusTagType(order.status)" class="status-tag">
                {{ getStatusText(order.status) }}
              </el-tag>
            </span>
          </div>
          <div class="order-body">
            <div class="product-info">
              <el-image :src="order.productImage" class="product-image" fit="cover" />
              <div class="product-details">
                <h3 class="product-name">{{ order.productName }}</h3>
                <p class="product-quantity">数量：{{ order.quantity }}</p>
                <p class="product-price">总价：{{ formatPrice(order.totalPrice) }}</p>
              </div>
            </div>
            <div class="order-actions">
              <el-button type="primary" size="small" @click="viewOrderDetails(order)">查看详情</el-button>
              <el-button
                v-if="order.status === 'PENDING'"
                type="success"
                size="small"
                @click="payOrder(order.id)"
              >
                支付
              </el-button>
              <el-button
                v-if="order.status === 'PENDING'"
                type="danger"
                size="small"
                @click="cancelOrder(order.id)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.status !== 'PENDING'"
                type="danger"
                size="small"
                @click="deleteOrder(order.id)"
              >
                删除订单
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单详情对话框 -->
      <el-dialog v-model="dialogVisible" title="订单详情" width="50%" class="order-dialog">
        <div v-if="selectedOrder" class="order-details">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="订单ID">{{ selectedOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ selectedOrder.productName }}</el-descriptions-item>
            <el-descriptions-item label="数量">{{ selectedOrder.quantity }}</el-descriptions-item>
            <el-descriptions-item label="单价">{{ formatPrice(selectedOrder.productPrice) }}</el-descriptions-item>
            <el-descriptions-item label="总价">{{ formatPrice(selectedOrder.totalPrice) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(selectedOrder.status)">
                {{ getStatusText(selectedOrder.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(selectedOrder.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(selectedOrder.updateTime) }}</el-descriptions-item>
            <el-descriptions-item label="收货地址">
              {{ selectedOrder.address.receiverRegion }} {{ selectedOrder.address.receiverAddress }}
            </el-descriptions-item>
            <el-descriptions-item label="收货人">
              {{ selectedOrder.address.receiverName }} ({{ selectedOrder.address.receiverPhone }})
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../utils/axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const orders = ref([]);
const dialogVisible = ref(false);
const selectedOrder = ref(null);
const searchQuery = ref({
  id: '',
  productName: '',
  status: null,
});

// 获取订单列表
const loadOrders = async () => {
  try {
    const response = await axios.get(`/order/user/${authStore.getUserId()}`);
    orders.value = response.data;
  } catch (error) {
    ElMessage.error('获取订单列表失败');
  }
};

// 过滤订单列表
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesId = searchQuery.value.id ? order.id.toString().includes(searchQuery.value.id) : true;
    const matchesProductName = searchQuery.value.productName
      ? order.productName.includes(searchQuery.value.productName)
      : true;
    const matchesStatus = searchQuery.value.status !== null
      ? order.status === searchQuery.value.status
      : true;
    return matchesId && matchesProductName && matchesStatus;
  });
});

// 查看订单详情
const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  dialogVisible.value = true;
};

// 取消订单
const cancelOrder = async (orderId) => {
  try {
    await axios.put(`/order/cancel/${orderId}`);
    loadOrders();
  } catch (error) {
    console.error('取消订单失败:', error);
  }
};

// 删除订单
const deleteOrder = async (orderId) => {
  try {
    await axios.delete(`/order/${orderId}`);
    loadOrders();
  } catch (error) {
    console.error('删除订单失败:', error);
  }
};

// 支付订单
const payOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要支付该订单吗？', '提示', {
      type: 'warning',
    });
    await axios.put(`/order/update-status/${orderId}?status=PAID`);
    ElMessage.success('订单支付成功');
    loadOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('支付订单失败');
    }
  }
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case "PENDING":
      return 'warning'; // 待支付
    case "PAID":
      return 'success'; // 已支付
    case "CANCELLED":
      return 'danger'; // 已取消
    default:
      return 'info';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return '待支付';
    case "PAID":
      return '已支付';
    case "CANCELLED":
      return '已取消';
    default:
      return '未知状态';
  }
};

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString();
};

// 初始化加载
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-list-container {
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

.order-status .status-tag {
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
  width: 80px;
  height: 80px;
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

.product-quantity,
.product-price {
  font-size: 14px;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.order-dialog {
  border-radius: 8px;
}

.order-details {
  padding: 20px;
}

.order-details p {
  margin: 10px 0;
  font-size: 16px;
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
    justify-content: flex-end;
  }
}
</style>