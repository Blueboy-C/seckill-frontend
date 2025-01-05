<template>
  <div class="order-management">
    <h1 class="page-title">订单管理</h1>

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入订单号、用户ID或商品ID搜索"
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

    <!-- 订单列表 -->
    <el-card class="order-table-card">
      <el-table
        :data="orders"
        border
        style="width: 100%"
        max-height="500"
        stripe
        highlight-current-row
      >
        <el-table-column prop="id" label="订单号" width="120" align="center" />
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="productId" label="商品ID" width="100" align="center" />
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
            <el-button type="primary" size="small" @click="updateOrderStatus(row)">
              更新状态
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

    <!-- 更新订单状态弹窗 -->
    <el-dialog v-model="showStatusDialog" title="更新订单状态" width="400px">
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="statusForm.status">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取消" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="submitStatusUpdate">确认</el-button>
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

// 搜索查询
const searchQuery = ref('');

// 分页信息
const pagination = ref({
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页大小
  total: 0, // 总记录数
});

// 更新订单状态弹窗显示状态
const showStatusDialog = ref(false);

// 更新订单状态表单
const statusForm = ref({
  id: null,
  status: 0,
});

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 0:
      return 'info'; // 待支付
    case 1:
      return 'success'; // 已支付
    case 2:
      return 'danger'; // 已取消
    default:
      return '';
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

// 打开更新订单状态弹窗
const updateOrderStatus = (order) => {
  statusForm.value.id = order.id;
  statusForm.value.status = order.status;
  showStatusDialog.value = true;
};

// 提交订单状态更新
const submitStatusUpdate = async () => {
  try {
    await instance.put(`/order/update-status/${statusForm.value.id}?status=${statusForm.value.status}`);
    showStatusDialog.value = false;
    fetchOrders(); // 更新后刷新订单列表
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
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