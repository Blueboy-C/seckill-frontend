<template>
  <div class="seckill-management">
    <h1 class="page-title">秒杀活动管理</h1>

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入活动名称搜索"
        clearable
        @clear="fetchSeckillActivities"
        @keyup.enter="searchSeckillActivities"
        class="search-input"
      >
        <template #append>
          <el-button :icon="Search" @click="searchSeckillActivities" />
        </template>
      </el-input>
    </div>

    <!-- 秒杀活动列表 -->
    <el-card class="seckill-table-card">
      <el-table
        :data="seckillActivities"
        border
        style="width: 100%"
        max-height="500"
        stripe
        highlight-current-row
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="product.name" label="商品名称" />
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="dark">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editSeckillActivity(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteSeckillActivity(row.id)">
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
        @current-change="fetchSeckillActivities"
        @size-change="handlePageSizeChange"
        class="pagination"
      />
    </el-card>

    <!-- 新增/编辑秒杀活动表单 -->
    <el-dialog
      v-model="showForm"
      :title="isEditing ? '编辑秒杀活动' : '新增秒杀活动'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="商品" required>
          <el-select
            v-model="form.productId"
            placeholder="请选择商品"
            filterable
            remote
            :remote-method="searchProducts"
            :loading="isLoadingProducts"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
          />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
          />
        </el-form-item>
        <el-form-item label="库存" required>
          <el-input v-model.number="form.stock" type="number" />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="form.status">
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelForm">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditing ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增秒杀活动按钮 -->
    <el-button type="primary" @click="addSeckillActivity" class="add-seckill-button">
      新增秒杀活动
    </el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import axios from '@/utils/axios';

// 秒杀活动列表
const seckillActivities = ref([]);

// 搜索查询
const searchQuery = ref('');

// 分页信息
const pagination = ref({
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页大小
  total: 0, // 总记录数
});

// 表单显示状态
const showForm = ref(false);

// 是否为编辑模式
const isEditing = ref(false);

// 表单数据
const form = ref({
  id: null,
  name: '',
  productId: null,
  startTime: null,
  endTime: null,
  stock: 0,
  status: 0, // 0:未开始, 1:进行中, 2:已结束
});

// 商品列表
const products = ref([]);

// 是否正在加载商品
const isLoadingProducts = ref(false);

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 0:
      return 'info'; // 未开始
    case 1:
      return 'success'; // 进行中
    case 2:
      return 'danger'; // 已结束
    default:
      return '';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0:
      return '未开始';
    case 1:
      return '进行中';
    case 2:
      return '已结束';
    default:
      return '';
  }
};

// 获取秒杀活动列表
const fetchSeckillActivities = async () => {
  try {
    const response = await axios.get('/seckill-activities/page', {
      params: {
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
      },
    });
    seckillActivities.value = response.data.data; // 秒杀活动列表
    pagination.value.total = response.data.total; // 总记录数
  } catch (error) {
    console.error('获取秒杀活动列表失败:', error);
  }
};

// 搜索秒杀活动
const searchSeckillActivities = async () => {
  try {
    const response = await axios.get('/seckill-activities/search', {
      params: {
        name: searchQuery.value,
      },
    });
    seckillActivities.value = response.data; // 搜索结果
    pagination.value.total = response.data.length; // 更新总记录数
  } catch (error) {
    console.error('搜索秒杀活动失败:', error);
  }
};

// 新增秒杀活动
const addSeckillActivity = async () => {
  showForm.value = true;
  isEditing.value = false;
  resetForm();

  // 加载商品数据
  try {
    const response = await axios.get('/products/search', {
      params: {
        pageNum: 1,
        pageSize: 10,
      },
    });
    products.value = response.data.data; // 假设接口返回的数据结构为 { data: [...] }
  } catch (error) {
    console.error('加载商品数据失败:', error);
  }
};

// 编辑秒杀活动
const editSeckillActivity = (activity) => {
  showForm.value = true;
  isEditing.value = true;
  form.value = { ...activity };
};

// 删除秒杀活动
const deleteSeckillActivity = async (id) => {
  try {
    await axios.delete(`/seckill-activities/${id}`);
    fetchSeckillActivities(); // 删除后刷新列表
  } catch (error) {
    console.error('删除秒杀活动失败:', error);
  }
};

// 提交表单
const submitForm = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`/seckill-activities/${form.value.id}`, form.value);
    } else {
      await axios.post('/seckill-activities', form.value);
    }
    showForm.value = false;
    fetchSeckillActivities(); // 提交后刷新列表
  } catch (error) {
    console.error('提交表单失败:', error);
  }
};

// 取消表单
const cancelForm = () => {
  showForm.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  form.value = {
    id: null,
    name: '',
    productId: null,
    startTime: null,
    endTime: null,
    stock: 0,
    status: 0,
  };
};

// 分页大小变化
const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize;
  fetchSeckillActivities();
};

// 组件挂载时获取秒杀活动列表
onMounted(() => {
  fetchSeckillActivities();
});
</script>

<style scoped>
.seckill-management {
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
  width: 300px;
}

.seckill-table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.add-seckill-button {
  margin-top: 20px;
  width: 100%;
  max-width: 200px;
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