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
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>
        <el-button type="primary" @click="loadOrders" class="search-button">查询</el-button>
      </div>

      <!-- 订单列表 -->
      <el-table :data="filteredOrders" class="order-table" stripe border>
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column prop="product.name" label="商品名称" width="200" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="totalPrice" label="总价" width="120">
          <template #default="{ row }">
            {{ formatPrice(row.totalPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" class="status-tag">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-dropdown trigger="click" placement="bottom-end">
              <el-button type="primary" size="small" class="action-button">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="viewOrderDetails(row)">查看详情</el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 0"
                    @click="payOrder(row.id)"
                  >
                    支付
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 0"
                    @click="cancelOrder(row.id)"
                  >
                    取消订单
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 订单详情对话框 -->
      <el-dialog v-model="dialogVisible" title="订单详情" width="50%" class="order-dialog">
        <div v-if="selectedOrder" class="order-details">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="订单ID">{{ selectedOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ selectedOrder.product.name }}</el-descriptions-item>
            <el-descriptions-item label="商品描述">{{ selectedOrder.product.description }}</el-descriptions-item>
            <el-descriptions-item label="数量">{{ selectedOrder.quantity }}</el-descriptions-item>
            <el-descriptions-item label="单价">{{ formatPrice(selectedOrder.product.price) }}</el-descriptions-item>
            <el-descriptions-item label="总价">{{ formatPrice(selectedOrder.totalPrice) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(selectedOrder.status)">
                {{ getStatusText(selectedOrder.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(selectedOrder.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(selectedOrder.updateTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../utils/axios';
import { useAuthStore } from '../stores/authStore';
import { ElMessage, ElMessageBox } from 'element-plus';

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
      ? order.product.name.includes(searchQuery.value.productName)
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
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning',
    });
    await axios.put(`/order/update-status/${orderId}?status=2`, { status: 2 }); // 2 表示已取消
    ElMessage.success('订单已取消');
    loadOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败');
    }
  }
};

// 支付订单
const payOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要支付该订单吗？', '提示', {
      type: 'warning',
    });
    await axios.put(`/order/update-status/${orderId}?status=1`, { status: 1 }); // 1 表示已支付
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
    case 0:
      return 'warning'; // 待支付
    case 1:
      return 'success'; // 已支付
    case 2:
      return 'danger'; // 已取消
    default:
      return 'info';
  }
};

// 获取状态文本
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

.action-button {
  width: 80px;
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
</style>