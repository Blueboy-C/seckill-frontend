<template>
  <div class="navigation-view">
    <!-- 导航栏 -->
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
    

    <el-menu-item v-if="isAdmin" index="/admin">后台系统</el-menu-item>
      <!-- 首页 -->
      <el-menu-item index="/">首页</el-menu-item>

      <!-- 商品列表 -->
      <el-menu-item index="/products">在线商城</el-menu-item>

      <!-- 秒杀活动 -->
      <el-menu-item index="/seckill-activities">秒杀活动</el-menu-item>

      <!-- 秒杀活动 -->
      <el-menu-item v-if="isLoggedIn" index="/profile">个人中心</el-menu-item>

      <!-- 需要登录的导航项 -->
      <el-menu-item v-if="isLoggedIn" index="/orders">我的订单</el-menu-item>
      <el-menu-item v-if="isLoggedIn" index="/cart">购物车</el-menu-item>
      <el-menu-item v-if="isLoggedIn" index="/seckillOder">秒杀订单</el-menu-item>
        <el-menu-item v-if="isLoggedIn" index="/user/address">地址管理</el-menu-item>

      <!-- 登录/注册 -->
      <el-menu-item v-if="!isLoggedIn" index="/auth">登录/注册</el-menu-item>

      <!-- 用户信息 -->
      <el-submenu v-if="isLoggedIn" index="user" class="user-menu">
        <template #title>
          <el-avatar :size="30" :src="userAvatar"></el-avatar>
          <span style="margin-left: 10px">{{ username }}</span>
        </template>
        <el-menu-item @click="handleLogout">注销账号</el-menu-item>
      </el-submenu>
    </el-menu>

    <!-- 页面内容 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const router = useRouter();

// 获取用户登录状态
const isLoggedIn = computed(() => !!localStorage.getItem('token'));

const isAdmin = computed(() => localStorage.getItem('role')==1);
// 获取用户名和头像
const username = computed(() => localStorage.getItem('username') || '用户');
const userAvatar = computed(() => localStorage.getItem('avatar') || 'https://via.placeholder.com/30');

// 当前激活的菜单项
const activeMenu = computed(() => router.currentRoute.value.path);

// 退出登录
const handleLogout = () => {
  authStore.clearAuth()
  ElMessage.success('注销成功');
  router.push('/auth');
};
</script>

<style scoped>
.navigation-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.el-menu {
  border-bottom: none;
}

.user-menu {
  margin-left: auto;
}

.el-menu-item {
  font-size: 16px;
}

.el-submenu__title {
  font-size: 16px;
}

.el-avatar {
  background-color: #409eff;
}
</style>