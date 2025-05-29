<template>
  <div class="profile">
    <!-- 顶部用户信息展示 -->
    <div class="user-header">
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          action="/api/upload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <el-image
            v-if="userForm.avatar"
            :src="userForm.avatar"
            fit="cover"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <p class="username">{{ userForm.username }}</p>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">12</span>
          <span class="stat-label">我的订单</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">3</span>
          <span class="stat-label">购物车</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">1</span>
          <span class="stat-label">秒杀订单</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">2</span>
          <span class="stat-label">地址管理</span>
        </div>
      </div>
    </div>

    <!-- 导航卡片 -->
    <div class="navigation-cards">
      <el-card class="nav-card" @click="navigateTo('/orders')">
        <el-icon><i-ep-tickets /></el-icon>
        <span>我的订单</span>
      </el-card>
      <el-card class="nav-card" @click="navigateTo('/cart')">
        <el-icon><i-ep-shopping-cart /></el-icon>
        <span>购物车</span>
      </el-card>
      <el-card class="nav-card" @click="navigateTo('/seckillOrder')">
        <el-icon><i-ep-alarm-clock /></el-icon>
        <span>秒杀订单</span>
      </el-card>
      <el-card class="nav-card" @click="navigateTo('/user/address')">
        <el-icon><i-ep-location /></el-icon>
        <span>地址管理</span>
      </el-card>
    </div>

    <!-- 用户信息展示 -->
    <el-card class="profile-card">
      <h3 class="card-title">个人信息</h3>
      <div class="info-display">
        <div class="info-item">
          <span class="info-label">昵称：</span>
          <span class="info-value">{{ userForm.nickname }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱：</span>
          <span class="info-value">{{ userForm.email }}</span>
        </div>
      </div>
      <el-button type="primary" @click="showEditModal = true">编辑信息</el-button>
    </el-card>

    <!-- 修改密码按钮 -->
    <el-card class="profile-card">
      <h3 class="card-title">账户安全</h3>
      <el-button type="primary" @click="showPasswordModal = true">修改密码</el-button>
    </el-card>

    <!-- 编辑用户信息的模态框 -->
    <el-dialog v-model="showEditModal" title="编辑个人信息" width="500px">
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="updateUserInfo">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码的模态框 -->
    <el-dialog v-model="showPasswordModal" title="修改密码" width="500px">
      <el-form :model="passwordForm" label-width="100px" ref="passwordFormRef">
        <el-form-item label="旧密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordModal = false">取消</el-button>
        <el-button type="primary" @click="updatePassword">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/axios';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// 用户信息表单
const userForm = ref({
  id: null,
  username: '',
  nickname: '',
  email: '',
  avatar: '',
});

// 修改密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 控制模态框显示
const showEditModal = ref(false);
const showPasswordModal = ref(false);

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await axios.get(`/user/${authStore.getUserId()}`);
    userForm.value = response;
  } catch (error) {
    console.log(error);
    ElMessage.error('加载用户信息失败');
  }
};

// 更新用户信息
const updateUserInfo = async () => {
  try {
    await axios.put('/user/update', userForm.value);
    ElMessage.success('用户信息更新成功');
    showEditModal.value = false;
  } catch (error) {
    console.log(error);
    ElMessage.error('更新用户信息失败');
  }
};

// 修改密码
const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致');
    return;
  }

  try {
    await axios.put(`/user/update-password/${authStore.getUserId()}`, null, {
      params: {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword,
      },
    });
    ElMessage.success('密码修改成功');
    showPasswordModal.value = false;
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.confirmPassword = '';
  } catch (error) {
    ElMessage.error('修改密码失败：' + error.response?.data?.message || '未知错误');
  }
};

// 头像上传成功回调
const handleAvatarSuccess = (response) => {
  userForm.value.avatar = response.url;
  ElMessage.success('头像上传成功');
};

// 头像上传前的校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB');
  }

  return isImage && isLt2M;
};

// 导航跳转
const navigateTo = (path) => {
  router.push(path);
};

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  padding: 20px;
  border-radius: 12px;
  color: #fff;
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px dashed #fff;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 24px;
  color: #fff;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-size: 24px;
  font-weight: bold;
}

.user-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #f0f0f0;
}

.navigation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-card .el-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.nav-card span {
  font-size: 16px;
  font-weight: 500;
}

.profile-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.info-display {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 10px;
}

.info-label {
  font-weight: bold;
  color: #666;
}

.info-value {
  color: #333;
}

.save-button {
  width: 100%;
  margin-top: 20px;
  background-color: #409eff;
  border-color: #409eff;
  font-size: 16px;
}

.save-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .user-stats {
    margin-top: 20px;
  }

  .navigation-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>