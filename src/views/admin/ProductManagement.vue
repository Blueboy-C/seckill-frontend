<template>
  <div class="product-management">
    <h1 class="page-title">商品管理</h1>

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入商品名称搜索"
        clearable
        @clear="fetchProducts"
        @keyup.enter="searchProducts"
        class="search-input"
      >
        <template #append>
          <el-button :icon="Search" @click="searchProducts" />
        </template>
      </el-input>
    </div>

    <!-- 商品列表 -->
    <el-card class="product-table-card">
      <el-table
        :data="products"
        border
        style="width: 100%"
        max-height="500"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="description" label="商品描述">
          <template #default="{ row }">
            <el-tooltip :content="row.description" placement="top">
              <span class="description-text">
                {{ truncateDescription(row.description) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            {{ row.price.toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
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
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editProduct(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteProduct(row.id)">
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
        @current-change="fetchProducts"
        @size-change="fetchProducts"
        class="pagination"
      />
    </el-card>

    <!-- 新增/编辑商品表单 -->
    <el-dialog
      v-model="showForm"
      :title="isEditing ? '编辑商品' : '新增商品'"
      width="500px"
    >
      <el-form
        :model="form"
        label-width="80px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input
            v-model.number="form.price"
            type="number"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input
            v-model.number="form.stock"
            type="number"
            placeholder="请输入库存"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelForm">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditing ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增商品按钮 -->
    <el-button type="primary" @click="addProduct" class="add-product-button">
      新增商品
    </el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import instance from '@/utils/axios'; // 导入封装的 axios 实例

// 商品列表
const products = ref([]);

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
  description: '',
  price: 0,
  stock: 0,
});

// 表单引用
const formRef = ref(null); // 确保这里正确声明了 formRef

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 5, max: 200, message: '商品描述长度在 10 到 200 个字符', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', message: '价格必须为数字', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', message: '库存必须为数字', trigger: 'blur' },
  ],
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// 截断商品描述
const truncateDescription = (description) => {
  const maxLength = 30; // 最大显示长度
  return description.length > maxLength
    ? description.slice(0, maxLength) + '...'
    : description;
};

// 获取商品列表
const fetchProducts = async () => {
  try {
    const response = await instance.get('/admin/products/page', {
      params: {
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
      },
    });
    products.value = response.data.data; // 商品列表
    pagination.value.total = response.data.total; // 总记录数
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  }
};

// 搜索商品
const searchProducts = async () => {
  try {
    const response = await instance.get('/admin/products/search', {
      params: {
        name: searchQuery.value,
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
      },
    });
    products.value = response.data.data; // 搜索结果
    pagination.value.total = response.data.total; // 更新总记录数
  } catch (error) {
    ElMessage.error('搜索商品失败');
  }
};

// 新增商品
const addProduct = () => {
  showForm.value = true;
  isEditing.value = false;
  resetForm();
};

// 编辑商品
const editProduct = (product) => {
  showForm.value = true;
  isEditing.value = true;
  form.value = { ...product };
};

// 删除商品
const deleteProduct = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning',
    });
    await instance.delete(`/admin/products/${id}`);
    ElMessage.success('删除成功');
    fetchProducts(); // 删除后刷新商品列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除商品失败');
    }
  }
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate(); // 确保这里使用的是 formRef.value
    if (isEditing.value) {
      await instance.put(`/admin/products/${form.value.id}`, form.value);
      ElMessage.success('更新成功');
    } else {
      await instance.post('/admin/products', form.value);
      ElMessage.success('新增成功');
    }
    showForm.value = false;
    fetchProducts(); // 提交后刷新商品列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交表单失败');
    }
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
    description: '',
    price: 0,
    stock: 0,
  };
};

// 组件挂载时获取商品列表
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.product-management {
  padding: 20px;
  max-width: 1400px; /* 增加最大宽度 */
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

.product-table-card {
  margin-bottom: 20px;
}

.description-text {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.add-product-button {
  margin-top: 20px;
}
</style>