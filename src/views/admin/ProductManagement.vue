<template>
  <el-container class="product-management">
    <!-- Header -->
    <el-header class="header">
      <h1>商品管理</h1>
    </el-header>

    <!-- Main Content -->
    <el-main>
      <!-- 搜索栏 -->
      <el-row class="search-bar" :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchParams.name"
            placeholder="商品名称"
            clearable
            prefix-icon="el-icon-search"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="searchParams.categoryId"
            placeholder="选择类别"
            clearable
            class="category-select"
            @change="handleSearch"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6" class="action-buttons">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleAdd">
            添加商品
          </el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <div class="table-container">
        <el-table :data="products" style="width: 100%" border stripe>
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="description" label="描述" width="200">
            <template #default="scope">
              <el-tooltip :content="scope.row.description" placement="top">
                <div class="description-cell">
                  {{ scope.row.description }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" align="center" />
          <el-table-column prop="stock" label="库存" align="center" />
          <el-table-column prop="category.name" label="类别" />
          <el-table-column label="图片" width="150" align="center">
            <template #default="scope">
              <el-image
                v-for="(image, index) in scope.row.imageList"
                :key="index"
                :src="image.imageUrl"
                :preview-src-list="scope.row.imageList.map(img => img.imageUrl)"
                class="product-image"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleCreateSeckillActivity(scope.row)"
              >
                创建秒杀活动
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="prev, pager, next, sizes, total"
        class="pagination"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />

      <!-- 添加/编辑商品对话框 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
        <el-form
          :model="formProduct"
          label-width="100px"
          :rules="rules"
          ref="productForm"
        >
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="formProduct.name" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="formProduct.description" type="textarea" />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input v-model.number="formProduct.price" type="number" />
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input v-model.number="formProduct.stock" type="number" />
          </el-form-item>
          <el-form-item label="类别" prop="category.id">
            <el-select v-model="formProduct.category.id" placeholder="选择类别">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品图片">
            <el-upload
              action="#"
              :limit="5"
              :file-list="newImageList"
              list-type="picture-card"
              :on-change="handleImageChange"
              :on-remove="handleImageRemove"
              :auto-upload="false"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div v-for="(image, index) in existingImageList" :key="index" class="image-item">
              <el-image :src="image.imageUrl" style="width: 50px; height: 50px" />
              <el-button
                type="danger"
                size="small"
                @click="handleRemoveExistingImage(index)"
              >
                删除
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
      </el-dialog>

      <!-- 创建秒杀活动对话框 -->
      <el-dialog v-model="seckillDialogVisible" title="创建秒杀活动" width="50%">
        <el-form :model="formSeckill" label-width="100px">
          <el-form-item label="活动名称" required>
            <el-input v-model="formSeckill.name" />
          </el-form-item>
          <el-form-item label="开始时间" required>
            <el-date-picker
              v-model="formSeckill.startTime"
              type="datetime"
              placeholder="选择开始时间"
            />
          </el-form-item>
          <el-form-item label="结束时间" required>
            <el-date-picker
              v-model="formSeckill.endTime"
              type="datetime"
              placeholder="选择结束时间"
            />
          </el-form-item>
          <el-form-item label="库存" required>
            <el-input v-model.number="formSeckill.stock" type="number" />
          </el-form-item>
          <el-form-item label="状态" required>
            <el-select v-model="formSeckill.status">
              <el-option label="未开始" :value="0" />
              <el-option label="进行中" :value="1" />
              <el-option label="已结束" :value="2" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="seckillDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSeckillForm">保存</el-button>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/utils/axios';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/authStore';
import { getFullImageUrl } from '@/utils/imageUtils';

const authStore = useAuthStore();
const productForm = ref(null);

// 商品列表数据
const products = ref([]);
const categories = ref([]);

// 搜索参数
const searchParams = ref({
  name: '',
  categoryId: null,
});

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('添加商品');
const formProduct = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: {
    id: null,
  },
  imageList: [],
});

// 原有图片列表
const existingImageList = ref([]);

// 新上传图片列表
const newImageList = ref([]);

// 秒杀活动对话框相关
const seckillDialogVisible = ref(false);
const formSeckill = ref({
  name: '',
  productId: null,
  startTime: null,
  endTime: null,
  stock: 0,
  status: 0, // 0:未开始, 1:进行中, 2:已结束
});

// 表单校验规则
const rules = ref({
  name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '商品描述不能为空', trigger: 'blur' }],
  price: [
    { required: true, message: '价格不能为空', trigger: 'blur' },
    { type: 'number', message: '价格必须为数字', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '库存不能为空', trigger: 'blur' },
    { type: 'number', message: '库存必须为数字', trigger: 'blur' },
  ],
  'category.id': [{ required: true, message: '商品类别不能为空', trigger: 'change' }],
});

// 获取商品列表
const fetchProducts = async () => {
  try {
    const response = await axios.get('/products/search', {
      params: {
        ...searchParams.value,
        ...pagination.value,
      },
    });
    products.value = response.data.data;
    pagination.value.total = response.data.total;
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  }
};

// 获取类别列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories');
    categories.value = response.data;
  } catch (error) {
    ElMessage.error('获取类别列表失败');
  }
};

// 搜索商品
const handleSearch = () => {
  pagination.value.pageNum = 1;
  fetchProducts();
};

// 分页变化
const handlePageChange = (pageNum) => {
  pagination.value.pageNum = pageNum;
  fetchProducts();
};

// 分页大小变化
const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize;
  fetchProducts();
};

// 打开添加商品对话框
const handleAdd = () => {
  dialogTitle.value = '添加商品';
  formProduct.value = {
    id: null,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: {
      id: null,
    },
    imageList: [],
  };
  existingImageList.value = [];
  newImageList.value = [];
  dialogVisible.value = true;
};

// 打开编辑商品对话框
const handleEdit = (product) => {
  dialogTitle.value = '编辑商品';
  formProduct.value = JSON.parse(JSON.stringify(product));
  existingImageList.value = product.imageList.map((img) => ({
    ...img,
    imageUrl: getFullImageUrl(img.imageUrl),
  }));
  newImageList.value = [];
  dialogVisible.value = true;
};

// 图片选择变化
const handleImageChange = (file) => {
  newImageList.value.push(file);
};

// 删除新上传图片
const handleImageRemove = (file) => {
  newImageList.value = newImageList.value.filter((item) => item.uid !== file.uid);
};

// 删除原有图片
const handleRemoveExistingImage = (index) => {
  existingImageList.value.splice(index, 1);
};

// 保存商品
const handleSave = async () => {
  try {
    // 表单校验
    await productForm.value.validate();

    // 上传新图片
    const uploadedImages = [];
    for (const file of newImageList.value) {
      if (file.raw) {
        const formData = new FormData();
        formData.append('file', file.raw);
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authStore.getToken()}`,
          },
        });
        uploadedImages.push({ imageUrl: getFullImageUrl(response.data) });
      }
    }

    // 合并原有图片和新上传的图片
    formProduct.value.imageList = [...existingImageList.value, ...uploadedImages];

    // 更新商品信息
    if (formProduct.value.id) {
      await axios.put(`/products/${formProduct.value.id}`, formProduct.value);
      ElMessage.success('商品更新成功');
    } else {
      await axios.post('/products', formProduct.value);
      ElMessage.success('商品添加成功');
    }

    dialogVisible.value = false;
    fetchProducts();
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

// 删除商品
const handleDelete = async (id) => {
  try {
    await axios.delete(`/products/${id}`);
    ElMessage.success('商品删除成功');
    fetchProducts();
  } catch (error) {
    ElMessage.error('删除商品失败');
  }
};

// 创建秒杀活动
const handleCreateSeckillActivity = (product) => {
  seckillDialogVisible.value = true;
  formSeckill.value = {
    name: `${product.name}秒杀活动`,
    productId: product.id,
    startTime: null,
    endTime: null,
    stock: product.stock,
    status: 0,
  };
};

// 提交秒杀活动表单
const submitSeckillForm = async () => {
  try {
    await axios.post('/seckill-activities', formSeckill.value);
    ElMessage.success('秒杀活动创建成功');
    seckillDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('创建秒杀活动失败');
  }
};

// 初始化数据
onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<style scoped>
.product-management {
  padding: 20px;
}

.header {
  background-color: #f5f7fa;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #e4e7ed;
}

.search-bar {
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 100;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-container {
  min-height: 650px;
  max-height: 650px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.product-image {
  width: 50px;
  height: 50px;
  margin-right: 5px;
  border-radius: 4px;
  object-fit: cover;
}

.pagination {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 100;
  padding: 10px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.image-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.image-item .el-button {
  margin-left: 10px;
}

.description-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>