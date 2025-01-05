<template>
  <div class="seckill-order-management">
    <h1 class="page-title">秒杀订单管理</h1>
    <el-card class="order-card">
      <!-- 搜索和过滤 -->
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索订单ID"
          class="search-input"
          @keyup.enter="loadOrders"
        />
        <el-select
          v-model="statusFilter"
          placeholder="选择订单状态"
          clearable
          class="status-select"
          @change="loadOrders"
        >
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>
        <el-button type="primary" @click="loadOrders" class="search-button">
          搜索
        </el-button>
      </div>

      <!-- 订单列表 -->
      <el-table
        :data="orders"
        style="width: 100%"
        border
        stripe
        highlight-current-row
        class="order-table"
      >
        <el-table-column prop="id" label="订单ID" width="100" align="center" />
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="seckillActivityId" label="活动ID" width="100" align="center" />
        <el-table-column prop="totalPrice" label="总价格" width="120" align="center">
          <template #default="{ row }">
            {{ formatPrice(row.totalPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="dark">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
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
import { ref, onMounted } from 'vue';
import axios from '../../utils/axios';
import { ElMessage } from 'element-plus';

const orders = ref([]); // 订单列表
const searchQuery = ref(''); // 搜索关键字
const statusFilter = ref(null); // 状态过滤
const totalOrders = ref(0); // 总订单数
const pageSize = ref(10); // 每页显示数量
const currentPage = ref(1); // 当前页码

// 加载订单
const loadOrders = async () => {
  try {
    const response = await axios.get('/seckill/orders/admin', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    });
    orders.value = response.data;
    totalOrders.value = response.data.length; // 假设返回的是所有订单
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

// 分页改变事件
const handlePageChange = (page) => {
  currentPage.value = page;
  loadOrders();
};

// 初始化加载
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.seckill-order-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.order-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 200px;
  margin-right: 10px;
}

.status-select {
  width: 150px;
  margin-right: 10px;
}

.search-button {
  margin-left: 10px;
}

.order-table {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.action-button {
  margin: 0 5px;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

.el-tag {
  font-size: 12px;
  padding: 0 8px;
}
</style>