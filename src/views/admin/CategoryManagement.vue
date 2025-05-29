<template>
  <div class="category-management">
    <h1 class="page-title">商品类别管理</h1>

    <!-- 新增类别按钮 -->
    <el-button type="primary" @click="addCategory" class="add-category-button">
      新增类别
    </el-button>

    <!-- 类别列表 -->
    <el-card class="category-table-card">
      <el-table
        :data="categories"
        border
        style="width: 100%"
        max-height="500"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="类别名称" />
        <el-table-column prop="parentId" label="父类别ID" width="120" />
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
            <el-button type="primary" size="small" @click="editCategory(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteCategory(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑类别表单 -->
    <el-dialog
      v-model="showForm"
      :title="isEditing ? '编辑类别' : '新增类别'"
      width="500px"
    >
      <el-form
        :model="form"
        label-width="80px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="父类别" prop="parentId">
          <el-select
            v-model="form.parentId"
            placeholder="请选择父类别"
            clearable
          >
            <el-option
              v-for="category in availableParentCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import instance from '@/utils/axios'; // 导入封装的 axios 实例

// 类别列表
const categories = ref([]);

// 表单显示状态
const showForm = ref(false);

// 是否为编辑模式
const isEditing = ref(false);

// 表单数据
const form = ref({
  id: null,
  name: '',
  parentId: null,
});

// 表单引用
const formRef = ref(null);

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入类别名称', trigger: 'blur' },
    { min: 2, max: 100, message: '类别名称长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  parentId: [
    { type: 'number', message: '父类别ID必须为数字', trigger: 'blur' },
  ],
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// 获取类别列表
const fetchCategories = async () => {
  try {
    const response = await instance.get('/categories');
    categories.value = response.data;
  } catch (error) {
    ElMessage.error('获取类别列表失败');
  }
};

// 新增类别
const addCategory = () => {
  showForm.value = true;
  isEditing.value = false;
  resetForm();
};

// 编辑类别
const editCategory = (category) => {
  showForm.value = true;
  isEditing.value = true;
  form.value = { ...category };
};

// 删除类别
const deleteCategory = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该类别吗？', '提示', {
      type: 'warning',
    });
    await instance.delete(`/categories/${id}`);
    ElMessage.success('删除成功');
    fetchCategories(); // 删除后刷新类别列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除类别失败');
    }
  }
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate();
    if (isEditing.value) {
      await instance.put(`/categories/${form.value.id}`, form.value);
      ElMessage.success('更新成功');
    } else {
      await instance.post('/categories', form.value);
      ElMessage.success('新增成功');
    }
    showForm.value = false;
    fetchCategories(); // 提交后刷新类别列表
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
    parentId: null,
  };
};

// 计算属性：获取可用的父类别列表（排除自己）
const availableParentCategories = computed(() => {
  return categories.value.filter(category => category.id !== form.value.id);
});

// 组件挂载时获取类别列表
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.add-category-button {
  margin-bottom: 20px;
}

.category-table-card {
  margin-bottom: 20px;
}
</style>