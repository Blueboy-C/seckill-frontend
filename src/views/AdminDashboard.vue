<template>
  <div class="admin-dashboard">
    <!-- 管理员导航栏 -->
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
    
      <el-menu-item index="/">在线商城</el-menu-item>
      <el-menu-item index="/admin/users">用户管理</el-menu-item>
      <el-menu-item index="/admin/products">商品管理</el-menu-item>
      <el-menu-item index="/admin/seckill-activities">秒杀活动管理</el-menu-item>
      <el-menu-item index="/admin/orders">订单管理</el-menu-item>
      <el-menu-item index="/admin/seckill-orders">秒杀订单管理</el-menu-item>
      <el-menu-item index="/admin/stats">数据统计</el-menu-item>
      <el-menu-item index="/auth">退出登录</el-menu-item>
    </el-menu>

    <!-- 页面内容 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed,onMounted } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();

// 当前激活的菜单项
const activeMenu = computed(() => router.currentRoute.value.path);


</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.el-menu {
  border-bottom: none;
}
</style>
