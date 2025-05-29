<template>
  <div class="order-management">
    <h1 class="page-title">订单管理</h1>

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入订单号、用户ID、商品ID或商品名称搜索"
        clearable
        @clear="fetchOrders"
        @keyup.enter="searchOrders"
        class="search-input"
      >
        <template #append>
          <el-button :icon="Search" @click="searchOrders" />
        </template>
      </el-input>
    </div>

    <!-- 批量操作按钮 -->
    <div class="batch-actions">
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedOrders.length === 0">
        批量删除
      </el-button>
      <el-button type="warning" @click="handleBatchCancel" :disabled="selectedOrders.length === 0">
        批量取消
      </el-button>
    </div>

    <!-- 订单列表 -->
    <el-card class="order-table-card">
      <el-table
        :data="orders"
        border
        style="width: 100%"
        max-height="500"
        stripe
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="订单号" width="120" align="center" />
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="productId" label="商品ID" width="100" align="center" />
        <el-table-column prop="productName" label="商品名称" width="150" align="center" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="totalPrice" label="总价" width="120" align="center">
          <template #default="{ row }">
            {{ row.totalPrice.toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="dark">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showOrderDetail(row)">
              查看详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="cancelOrder(row.id)"
              :disabled="row.status === 'CANCELLED'"
            >
              取消订单
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteOrder(row.id)"
              :disabled="row.status !== 'PAID'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchOrders"
        @size-change="fetchOrders"
        class="pagination"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="订单详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
        <el-descriptions-item label="商品ID">{{ currentOrder.productId }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.productName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ currentOrder.quantity }}</el-descriptions-item>
        <el-descriptions-item label="总价">{{ currentOrder.totalPrice.toFixed(2) }} 元</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentOrder.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ currentOrder.address?.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.address?.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentOrder.address?.receiverRegion }} {{ currentOrder.address?.receiverAddress }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import instance from '@/utils/axios'; // 导入封装的 axios 实例

// 订单列表
const orders = ref([]);

// 当前查看的订单
const currentOrder = ref({});

// 搜索查询
const searchQuery = ref('');

// 分页信息
const pagination = ref({
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页大小
  total: 0, // 总记录数
});

// 订单详情弹窗显示状态
const showDetailDialog = ref(false);

// 选中的订单
const selectedOrders = ref([]);

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning'; // 待支付
    case 'PAID':
      return 'success'; // 已支付
    case 'CANCELLED':
      return 'danger'; // 已取消
    default:
      return '';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'PENDING':
      return '待支付';
    case 'PAID':
      return '已支付';
    case 'CANCELLED':
      return '已取消';
    default:
      return '';
  }
};

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await instance.get('/order/page', {
      params: {
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
      },
    });
    orders.value = response.data.data; // 订单列表
    pagination.value.total = response.data.total; // 总记录数
  } catch (error) {
    console.error('获取订单列表失败:', error);
  }
};

// 搜索订单
const searchOrders = async () => {
  try {
    const response = await instance.get('/order/search', {
      params: {
        keyword: searchQuery.value,
      },
    });
    orders.value = response.data; // 搜索结果
    pagination.value.total = response.data.length; // 更新总记录数
  } catch (error) {
    console.error('搜索订单失败:', error);
  }
};

// 查看订单详情
const showOrderDetail = (order) => {
  currentOrder.value = order;
  showDetailDialog.value = true;
};

// 取消订单
const cancelOrder = async (orderId) => {
  try {
    await instance.put(`/order/cancel/${orderId}`);
    fetchOrders(); // 取消后刷新订单列表
  } catch (error) {
    console.error('取消订单失败:', error);
  }
};

// 删除订单
const deleteOrder = async (orderId) => {
  try {
    await instance.delete(`/order/${orderId}`);
    fetchOrders(); // 删除后刷新订单列表
  } catch (error) {
    console.error('删除订单失败:', error);
  }
};

// 批量删除订单
const handleBatchDelete = async () => {
  try {
    const orderIds = selectedOrders.value.map((order) => order.id);
    await instance.post('/order/batch-delete', orderIds);
    fetchOrders(); // 删除后刷新订单列表
  } catch (error) {
    console.error('批量删除订单失败:', error);
  }
};

// 批量取消订单
const handleBatchCancel = async () => {
  try {
    const orderIds = selectedOrders.value.map((order) => order.id);
    await instance.post('/order/batch-cancel', { ids: orderIds });
    fetchOrders(); // 取消后刷新订单列表
  } catch (error) {
    console.error('批量取消订单失败:', error);
  }
};

// 处理表格多选
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection;
};

// 组件挂载时获取订单列表
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.order-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 400px;
}

.batch-actions {
  margin-bottom: 20px;
}

.order-table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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