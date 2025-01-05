<template>
  <div class="auth-container">
    <!-- 背景图片预留 -->
    <div class="auth-background"></div>

    <!-- 登录注册卡片 -->
    <el-card class="auth-card">
      <!-- 使用动画切换登录和注册 -->
      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'login'" key="login">
          <h2 class="auth-title">欢迎登录</h2>
          <el-form :model="loginForm" label-width="80px" class="auth-form">
            <el-form-item label="用户名">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="el-icon-user"
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogin" class="auth-button">
                登录
              </el-button>
            </el-form-item>
          </el-form>
          <div class="auth-switch">
            没有账号？
            <el-link type="primary" @click="activeTab = 'register'">立即注册</el-link>
             <el-link type="primary" @click="showForgotPasswordDialog = true" style="margin-left: 10px;">
              忘记密码？
            </el-link>
          </div>
        </div>

        <div v-else key="register">
          <h2 class="auth-title">欢迎注册</h2>
          <el-form
            :model="registerForm"
            label-width="80px"
            class="auth-form"
            :rules="registerRules"
            ref="registerFormRef"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                prefix-icon="el-icon-user"
              />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                prefix-icon="el-icon-message"
              />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <div class="code-input-container">
                <el-input
                  v-model="registerForm.code"
                  placeholder="请输入验证码"
                  prefix-icon="el-icon-key"
                />
                <el-button
                  type="primary"
                  class="send-code-button"
                  :disabled="isCodeSending"
                  @click="sendVerificationCode"
                >
                  {{ isCodeSending ? `${countdown}秒后重试` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleRegister" class="auth-button">
                注册
              </el-button>
            </el-form-item>
          </el-form>
          <div class="auth-switch">
            已有账号？
            <el-link type="primary" @click="activeTab = 'login'">立即登录</el-link>
          </div>
        </div>
      </transition>
    </el-card>

     <!-- 忘记密码弹窗 -->
    <el-dialog
      v-model="showForgotPasswordDialog"
      title="忘记密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="forgotPasswordForm" label-width="80px" ref="forgotPasswordFormRef">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input-container">
            <el-input
              v-model="forgotPasswordForm.code"
              placeholder="请输入验证码"
              prefix-icon="el-icon-key"
            />
            <el-button
              type="primary"
              class="send-code-button"
              :disabled="isCodeSending"
              @click="sendForgotPasswordCode"
            >
              {{ isCodeSending ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="forgotPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            prefix-icon="el-icon-lock"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForgotPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';
import axios from '@/utils/axios';

const authStore = useAuthStore();
const router = useRouter();

const activeTab = ref('login');
const registerFormRef = ref(null); // 注册表单的引用
const isCodeSending = ref(false); // 是否正在发送验证码
const countdown = ref(60); // 验证码倒计时

const forgotPasswordFormRef = ref(null); // 忘记密码表单的引用
const showForgotPasswordDialog = ref(false); // 是否显示忘记密码弹窗

const loginForm = ref({
  username: '',
  password: '',
});

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: '', // 验证码
});

const forgotPasswordForm = ref({
  email: '',
  code: '',
  newPassword: '',
});


// 忘记密码表单校验规则
const forgotPasswordRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为 6 位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' },
  ],
};

// 注册表单校验规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['blur', 'change'],
    },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为 6 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};



// 发送验证码（忘记密码）
const sendForgotPasswordCode = async () => {
  if (!forgotPasswordForm.value.email) {
    ElMessage.warning('请输入邮箱');
    return;
  }

  try {
    isCodeSending.value = true;
    await axios.post('/user/send-verification-code', {
      email: forgotPasswordForm.value.email,
    });
    ElMessage.success('验证码已发送');

    // 开始倒计时
    let timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
        isCodeSending.value = false;
        countdown.value = 60;
      }
    }, 1000);
  } catch (error) {
    ElMessage.error('验证码发送失败');
    isCodeSending.value = false;
  }
};


// 处理重置密码
const handleResetPassword = async () => {
  try {
    await forgotPasswordFormRef.value.validate();
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确');
    return;
  }

  try {
    await axios.post('/user/reset-password-with-code',{
      email: forgotPasswordForm.value.email,
      code: forgotPasswordForm.value.code,
      newPassword: forgotPasswordForm.value.newPassword,
    });
    ElMessage.success('密码重置成功');
    showForgotPasswordDialog.value = false; // 关闭弹窗
  } catch (error) {
    ElMessage.error('密码重置失败');
  }
};


// 发送验证码
const sendVerificationCode = async () => {
  if (!registerForm.value.email) {
    ElMessage.warning('请输入邮箱');
    return;
  }

  try {
    isCodeSending.value = true;
    await axios.post('/user/send-verification-code', {
      email: registerForm.value.email,
    });
    ElMessage.success('验证码已发送');

    // 开始倒计时
    let timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
        isCodeSending.value = false;
        countdown.value = 60;
      }
    }, 1000);
  } catch (error) {
    ElMessage.error('验证码发送失败');
    isCodeSending.value = false;
  }
};

// 处理注册
const handleRegister = async () => {
  // 校验表单
  try {
    await registerFormRef.value.validate();
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确');
    return;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }

  try {
    const response = await axios.post('/user/register', registerForm.value,{
       params: {
        code: registerForm.value.code,
      },
    });
    ElMessage.success('注册成功,请登录');
    activeTab.value = 'login'; // 注册成功后切换到登录页
  } catch (error) {
    ElMessage.error('注册失败');
  }
};

// 处理登录
const handleLogin = async () => {
  try {
    const response = await axios.post('/user/login', loginForm.value);
    authStore.setToken(response.token);
    authStore.setRole(response.role);
    authStore.setUserId(response.userId);
    if (response.role == 1) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (error) {
    ElMessage.error('登录失败');
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f8f8;
  position: relative;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://bpic.588ku.com/back_pic/05/95/54/765d662a701b1a2.jpg!/fw/822.76311278711/quality/90/unsharp/true/compress/true'); /* 预留背景图片 */
  background-size: cover;
  background-position: center;
  opacity: 0.8; /* 背景图片透明度 */
  z-index: 1;
}

.auth-card {
  width: 400px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.9); /* 卡片背景透明度 */
  z-index: 2;
}

.auth-title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.auth-form {
  padding: 20px;
}

.auth-form .el-form-item {
  margin-bottom: 20px;
}

.auth-form .el-input {
  width: 100%;
}

.code-input-container {
  display: flex;
  align-items: center;
}

.send-code-button {
  margin-left: 10px;
  width: 120px;
}

.auth-button {
  width: 100%;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  font-size: 16px;
}

.auth-button:hover {
  background-color: #ff7875;
  border-color: #ff7875;
}

.auth-switch {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.auth-switch .el-link {
  margin-left: 5px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}



/* 忘记密码弹窗样式 */
.code-input-container {
  display: flex;
  align-items: center;
}

.send-code-button {
  margin-left: 10px;
  width: 120px;
}
</style>