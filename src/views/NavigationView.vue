<template>
  <div class="navigation-view">
    <!-- 顶部导航栏 -->
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      background-color="transparent"
      text-color="#333"
      active-text-color="#ff6f61"
      router
      class="custom-menu"
    >
      <el-menu-item v-if="isAdmin" index="/admin">后台系统</el-menu-item>
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/products">在线商城</el-menu-item>
      <el-menu-item index="/seckill-activities">秒杀活动</el-menu-item>
      <el-menu-item v-if="!isLoggedIn" index="/login">登录/注册</el-menu-item>

      <!-- 注销按钮 -->
      <el-menu-item v-if="isLoggedIn" class="logout-item" @click="handleLogout">
        <el-icon color="#333"><i-ep-switch-button /></el-icon>
      </el-menu-item>
    </el-menu>

    <!-- 右侧悬浮侧边栏 -->
    <div v-if="isLoggedIn" class="floating-sidebar">
      <el-menu
        mode="vertical"
        :default-active="activeMenu"
        background-color="transparent"
        text-color="#333"
        active-text-color="#ff6f61"
        router
        class="sidebar-menu"
      >
        <el-tooltip content="个人中心" placement="left">
          <el-menu-item index="/profile" class="sidebar-item">
            <el-icon color="#333"><i-ep-user /></el-icon>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="我的订单" placement="left">
          <el-menu-item index="/orders" class="sidebar-item">
            <el-icon color="#333"><i-ep-tickets /></el-icon>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="购物车" placement="left">
          <el-menu-item index="/cart" class="sidebar-item">
            <el-icon color="#333"><i-ep-shopping-cart /></el-icon>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="秒杀订单" placement="left">
          <el-menu-item index="/seckillOrder" class="sidebar-item">
            <el-icon color="#333"><i-ep-alarm-clock /></el-icon>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="地址管理" placement="left">
          <el-menu-item index="/user/address" class="sidebar-item">
            <el-icon color="#333"><i-ep-location /></el-icon>
          </el-menu-item>
        </el-tooltip>
      </el-menu>
    </div>

    <div class="main-content">
        <!-- 页面内容 -->
       <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';
import {
  User as iEpUser,
  Tickets as iEpTickets,
  ShoppingCart as iEpShoppingCart,
  AlarmClock as iEpAlarmClock,
  Location as iEpLocation,
  SwitchButton as iEpSwitchButton,
} from '@element-plus/icons-vue';

const authStore = useAuthStore();
const router = useRouter();

const isLoggedIn = computed(() => !!localStorage.getItem('token'));
const isAdmin = computed(() => localStorage.getItem('role') == 1);
const activeMenu = computed(() => router.currentRoute.value.path);

const handleLogout = () => {
  authStore.clearAuth();
  ElMessage.success('注销成功');
  router.push('/auth');
};
</script>

<style scoped>
.navigation-view {
  display: flex;
  width:100%;
  flex-direction: column;
  height: 100vh;
  overflow:hidden;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.custom-menu {
  flex:0.5;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin: 10px;
  padding: 0 20px;
  width:100%;
  z-index:100;
}

.main-content{
  flex:9;
  overflow-y: auto; /* 纵向滚动 */
 
}

.el-menu-item {
  font-size: 16px;
  font-weight: 500;
  margin: 0 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: #ff6f61;
  color: #fff !important;
}

.logout-item {
  margin-left: auto;
}

.floating-sidebar {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 2px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.sidebar-menu {
  border: none;
  background: transparent;
  z-index: 1000;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.sidebar-item:hover {
  background-color: #ff6f61;
}

.sidebar-item:hover .el-icon {
  color: #fff !important;
}

.el-menu--horizontal {
  border-bottom: none;
}

.el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: 2px solid #ff6f61;
}

.el-menu--horizontal > .el-menu-item:not(.is-active) {
  border-bottom: 2px solid transparent;
}

.el-menu--horizontal > .el-menu-item:not(.is-active):hover {
  border-bottom: 2px solid #ff6f61;
}
</style>