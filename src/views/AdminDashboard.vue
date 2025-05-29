<template>
  <div class="admin-dashboard">
    
    <!-- 纵向导航栏 -->
    <el-menu
      mode="vertical"
      :default-active="activeMenu"
      background-color="#2c3e50"
      text-color="#bdc3c7"
      active-text-color="#1abc9c"
      router
      class="admin-menu"
      :collapse="isCollapsed"
    >
     <!-- 收起按钮 -->
      <div class="collapse-button" @click="toggleCollapse"  v-if="!isCollapsed">
        <el-icon :size="20">
          <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>


        <!-- 导航项 -->
      <el-menu-item v-if="isCollapsed" @click="toggleCollapse">
          <el-icon :size="20">
           <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </el-menu-item>
   
      <!-- 导航项 -->
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <template #title>在线商城</template>
      </el-menu-item>
      <el-menu-item index="/admin/users">
        <el-icon><User /></el-icon>
        <template #title>用户管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/products">
        <el-icon><Goods /></el-icon>
        <template #title>商品管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/category">
        <el-icon><Menu /></el-icon>
        <template #title>商品类别管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/seckill-activities">
        <el-icon><Clock /></el-icon>
        <template #title>秒杀活动管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/orders">
        <el-icon><Document /></el-icon>
        <template #title>订单管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/seckill-orders">
        <el-icon><List /></el-icon>
        <template #title>秒杀订单管理</template>
      </el-menu-item>
      <el-menu-item index="/admin/stats">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>数据统计</template>
      </el-menu-item>
      <el-menu-item index="/auth">
        <el-icon><SwitchButton /></el-icon>
        <template #title>退出登录</template>
      </el-menu-item>
    </el-menu>

    <!-- 页面内容 -->
    <div class="admin-content" :class="{ 'collapsed': isCollapsed }">
      <!-- 面包屑栏 -->
      <div class="breadcrumb-bar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbList"
            :key="index"
            :to="item.path"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 路由出口 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Fold,
  Expand,
  HomeFilled,
  User,
  Goods,
  Menu,
  Clock,
  Document,
  List,
  DataAnalysis,
  SwitchButton,
} from '@element-plus/icons-vue'; // 引入图标

const router = useRouter();
const route = useRoute();

// 导航栏是否收起
const isCollapsed = ref(false);

// 切换导航栏收起状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 当前激活的菜单项
const activeMenu = computed(() => route.path);

// 面包屑数据
const breadcrumbList = ref([]);

// 生成面包屑
const generateBreadcrumb = () => {
  const matchedRoutes = route.matched.filter((r) => r.meta && r.meta.title);
  breadcrumbList.value = matchedRoutes.map((r) => ({
    path: r.path,
    name: r.meta.title,
  }));
};

// 监听路由变化，更新面包屑
watch(
  () => route.path,
  () => {
    generateBreadcrumb();
  },
  { immediate: true }
);
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height:100%;
  background-color: #f5f7fa; /* 浅色背景 */
}

.admin-menu {
  width: 200px; /* 导航栏宽度 */
  height:100vh;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1); /* 右侧阴影 */
  transition: width 0.3s ease;
  position: relative; /* 相对定位 */
}

.admin-menu:not(.el-menu--collapse) {
  width: 200px; /* 展开时的宽度 */
}

.admin-menu.el-menu--collapse {
  width: 64px; /* 收起时的宽度 */
}

.collapse-button {
  position: absolute;
  top: 16px;
  right: 10px;
  z-index: 1000;
  cursor: pointer;
  color: #bdc3c7;
  transition: color 0.3s ease;
}

.collapse-button:hover {
  color: #1abc9c; /* 悬停时变色 */
}

.admin-content {
  height:100vh;
  flex: 1; /* 内容区域占满剩余空间 */
 
  background-color: #fff; /* 内容区域背景色为白色 */
  border-radius: 8px; /* 圆角效果 */

  margin-left: 20px; /* 初始左边距 */
  transition: margin-left 0.3s ease;
  overflow:scroll;
}

.admin-content.collapsed {
  margin-left: 20px; /* 收起时的左边距 */
}

.breadcrumb-bar {
  background-color: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-menu-item {
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px !important; /* 调整内边距 */
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: #1abc9c !important;
  color: #fff !important;
}

.el-menu-item.is-active {
  background-color: #1abc9c !important;
  color: #fff !important;
}
</style>