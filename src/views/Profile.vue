<template>
  <div class="profile">
    <h1 class="page-title">个人信息管理</h1>
    <el-card class="profile-card">
      <!-- 用户信息 -->
      <div class="user-info">
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
        <div class="info-section">
          <el-form :model="userForm" label-width="100px">
            <el-form-item label="昵称">
              <el-input v-model="userForm.nickname" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" />
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="updateUserInfo" class="save-button">
            保存信息
          </el-button>
        </div>
      </div>

      <!-- 修改密码 -->
      <el-divider />
      <div class="password-section">
        <h3 class="section-title">修改密码</h3>
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
          <el-button type="primary" @click="updatePassword" class="save-button">
            修改密码
          </el-button>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/axios'; // 导入封装的 axios 实例
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

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
  oldPassword: '', // 旧密码
  newPassword: '', // 新密码
  confirmPassword: '', // 确认密码
});

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await axios.get(`/user/${authStore.getUserId()}`);
    userForm.value = response;
  } catch (error) {
    ElMessage.error('加载用户信息失败');
  }
};

// 更新用户信息
const updateUserInfo = async () => {
  try {
    await axios.put('/user/update', userForm.value);
    ElMessage.success('用户信息更新成功');
  } catch (error) {
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
    // 清空表单
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.confirmPassword = '';
  } catch (error) {
    ElMessage.error('修改密码失败：' + error.response?.data?.message || '未知错误');
  }
};

// 头像上传成功回调
const handleAvatarSuccess = (response) => {
  userForm.value.avatar = response.url; // 假设后端返回头像 URL
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

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.profile {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  background-color: #fff;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 8px;
}

.avatar-section {
  text-align: center;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  margin-top: 10px;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.info-section {
  flex: 1;
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

.password-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 8px;
}

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
}

.el-divider {
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    align-items: center;
  }

  .avatar-section {
    margin-bottom: 20px;
  }

  .info-section {
    width: 100%;
  }
}
</style>