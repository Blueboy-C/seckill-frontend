<template>
  <div class="user-management">
    <h1 class="page-title">用户管理</h1>

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="请输入用户名或 ID 搜索"
        clearable
        @clear="fetchUsers"
        @keyup.enter="searchUsers"
        class="search-input"
      >
        <template #append>
          <el-button :icon="Search" @click="searchUsers" />
        </template>
      </el-input>
    </div>

    <!-- 用户列表 -->
    <el-card class="user-table-card">
      <el-table
        :data="users"
        border
        style="width: 100%"
        max-height="500"
        stripe
        :row-key="(row) => row.id"
      >
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <p><strong>用户ID:</strong> {{ row.id }}</p>
              <p><strong>用户名:</strong> {{ row.username }}</p>
              <p><strong>邮箱:</strong> {{ row.email }}</p>
              <p><strong>昵称:</strong> {{ row.nickname }}</p>
              <p><strong>角色:</strong> {{ row.role === 1 ? '管理员' : '普通用户' }}</p>
              <p><strong>创建时间:</strong> {{ formatTime(row.createTime) }}</p>
              <p><strong>更新时间:</strong> {{ formatTime(row.updateTime) }}</p>
            </div>
          </template>
        </el-table-column>

        <!-- 用户ID -->
        <el-table-column prop="id" label="ID" width="80" />

        <!-- 用户名 -->
        <el-table-column prop="username" label="用户名" />

        <!-- 邮箱 -->
        <el-table-column prop="email" label="邮箱" />

        <!-- 昵称 -->
        <el-table-column prop="nickname" label="昵称" />

        <!-- 头像 -->
        <el-table-column prop="avatar" label="头像">
          <template #default="{ row }">
            <el-image
              v-if="row.avatar"
              :src="row.avatar"
              style="width: 50px; height: 50px; border-radius: 50%"
              fit="cover"
            />
            <span v-else>无头像</span>
          </template>
        </el-table-column>

        <!-- 角色 -->
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 1 ? 'success' : 'info'">
              {{ row.role === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>


        <!-- 操作 -->
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editUser(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="resetPassword(row.id)">
              重置密码
            </el-button>
            <el-button type="danger" size="small" @click="deleteUser(row.id)">
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
        @current-change="fetchUsers"
        @size-change="fetchUsers"
        class="pagination"
      />
    </el-card>

    <!-- 新增/编辑用户表单 -->
    <el-dialog
      v-model="showForm"
      :title="isEditing ? '编辑用户' : '新增用户'"
      width="500px"
    >
      <el-form
        :model="form"
        label-width="80px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditing">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="form.avatar" placeholder="请输入头像 URL" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="普通用户" :value="0" />
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="活跃" :value="1" />
            <el-option label="禁用" :value="0" />
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

    <!-- 新增用户按钮 -->
    <el-button type="primary" @click="addUser" class="add-user-button">
      新增用户
    </el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import instance from '@/utils/axios'; // 导入封装的 axios 实例

// 用户列表
const users = ref([]);

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
  username: '',
  password: '',
  email: '',
  nickname: '',
  avatar: '',
  role: 0,
  status: 1, // 默认状态为活跃
});

// 表单引用
const formRef = ref(null); // 确保 formRef 被正确定义
// 表单校验规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await instance.get('/admin/users/page', {
      params: {
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
      },
    });
    users.value = response.data; // 用户列表
    pagination.value.total = response.total; // 总记录数
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  }
};

// 搜索用户
const searchUsers = async () => {
  try {
    const response = await instance.get('/admin/users/search', {
      params: {
        query: searchQuery.value,
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
      },
    });
    users.value = response.data; // 搜索结果
    pagination.value.total = response.total; // 更新总记录数
  } catch (error) {
    ElMessage.error('搜索用户失败');
  }
};

// 新增用户
const addUser = () => {
  showForm.value = true;
  isEditing.value = false;
  resetForm();
};

// 编辑用户
const editUser = (user) => {
  showForm.value = true;
  isEditing.value = true;
  form.value = { ...user };
};

// 重置密码
const resetPassword = async (id) => {
  try {
    await ElMessageBox.confirm('确定要重置该用户的密码吗？', '提示', {
      type: 'warning',
    });
    await axios.put(`/user/update-password/${authStore.getUserId()}`, null, {
      params: { newPassword: passwordForm.value.newPassword },
    });
    ElMessage.success('密码重置成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败');
    }
  }
};

// 删除用户
const deleteUser = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning',
    });
    await instance.delete(`/admin/users/${id}`);
    ElMessage.success('删除成功');
    fetchUsers(); // 删除后刷新用户列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败');
    }
  }
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate();
    if (isEditing.value) {
      await instance.put(`/admin/users/${form.value.id}`, form.value);
      ElMessage.success('更新成功');
    } else {
      await instance.post('/admin/users/add', form.value);
      ElMessage.success('新增成功');
    }
    showForm.value = false;
    fetchUsers(); // 提交后刷新用户列表
  } catch (error) {
    console.log(error);
    if (error !== 'cancel') {
      // ElMessage.error('提交表单失败');
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
    username: '',
    password: '',
    email: '',
    nickname: '',
    avatar: '',
    role: 0,
    status: 1,
  };
};

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString();
};

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-management {
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

.user-table-card {
  margin-bottom: 20px;
}

.expand-content {
  padding: 10px;
}

.expand-content p {
  margin: 5px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.add-user-button {
  margin-top: 20px;
}
</style>