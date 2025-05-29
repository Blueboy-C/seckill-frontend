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
          <el-option label="待支付" value="PENDING" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已取消" value="CANCELLED" />
          <el-option label="已发货" value="SHIPPED" />
          <el-option label="已完成" value="COMPLETED" />
        </el-select>
        <el-button
          type="primary"
          @click="loadOrders"
          class="search-button"
          :loading="loading"
        >
          搜索
        </el-button>
        <el-button type="success" @click="exportOrders" class="export-button">
          导出订单
        </el-button>
      </div>

      <!-- 批量操作 -->
      <div class="batch-action-container" v-if="selectedOrders.length > 0">
        <el-button type="success" @click="batchPayOrders" class="batch-action-button">
          批量支付
        </el-button>
        <el-button type="danger" @click="batchCancelOrders" class="batch-action-button">
          批量取消
        </el-button>
        <span class="batch-action-text">已选择 {{ selectedOrders.length }} 条订单</span>
      </div>

      <!-- 订单列表 -->
      <el-table
        :data="orders"
        style="width: 100%"
        border
        stripe
        highlight-current-row
        class="order-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
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
              type="primary"
              size="small"
              @click="showOrderDetail(row)"
              class="action-button"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="success"
              size="small"
              @click="payOrder(row.id)"
              class="action-button"
            >
              支付
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
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

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
        <el-descriptions-item label="活动ID">{{ currentOrder.seckillActivityId }}</el-descriptions-item>
        <el-descriptions-item label="活动名称">{{ currentOrder.activityNameName }}</el-descriptions-item>
        <el-descriptions-item label="总价格">{{ formatPrice(currentOrder.totalPrice) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(currentOrder.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ currentOrder.address?.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.address?.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentOrder.address?.receiverRegion }} {{ currentOrder.address?.receiverAddress }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../../utils/axios';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';

const orders = ref([]); // 订单列表
const selectedOrders = ref([]); // 选中的订单
const searchQuery = ref(''); // 搜索关键字
const statusFilter = ref(null); // 状态过滤
const totalOrders = ref(0); // 总订单数
const pageSize = ref(10); // 每页显示数量
const currentPage = ref(1); // 当前页码
const detailVisible = ref(false); // 详情弹窗是否可见
const currentOrder = ref({}); // 当前查看的订单
const loading = ref(false); // 加载状态

// 加载订单
const loadOrders = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/seckill/orders/admin', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    });
    orders.value = response.data; // 当前页的数据
    totalOrders.value = response.total; // 总记录数
  } catch (error) {
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
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

// 批量支付订单
const batchPayOrders = async () => {
  try {
    const orderIds = selectedOrders.value.map((order) => order.id);
    const response = await axios.put('/seckill/orders/batch-pay', orderIds );
    ElMessage.success('批量支付成功');
    loadOrders(); // 刷新订单列表
  } catch (error) {
    ElMessage.error('批量支付失败');
  }
};

// 批量取消订单
const batchCancelOrders = async () => {
  try {
    const orderIds = selectedOrders.value.map((order) => order.id);
    const response = await axios.put('/seckill/orders/batch-cancel', orderIds );
    ElMessage.success('批量取消成功');
    loadOrders(); // 刷新订单列表
  } catch (error) {
    ElMessage.error('批量取消失败');
  }
};

// 导出订单
const exportOrders = () => {
  const worksheet = XLSX.utils.json_to_sheet(orders.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据');
  XLSX.writeFile(workbook, '订单数据.xlsx');
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
      return 'warning'; // 待支付，使用黄色
    case 'PAID':
      return 'success'; // 已支付，使用绿色
    case 'CANCELLED':
      return 'danger'; // 已取消，使用红色
    default:
      return 'info'; // 未知状态，使用蓝色
  }
};

// 分页改变事件
const handlePageChange = (page) => {
  currentPage.value = page;
  loadOrders();
};

// 处理选中订单
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection;
};

// 初始化加载
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
/* 样式保持不变 */
</style>

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

.export-button {
  margin-left: 10px;
}

.batch-action-container {
  margin-bottom: 20px;
}

.batch-action-button {
  margin-right: 10px;
}

.batch-action-text {
  font-size: 14px;
  color: #666;
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