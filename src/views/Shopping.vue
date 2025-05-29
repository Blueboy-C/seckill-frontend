<template>
  <div class="product-container">
    <!-- 侧边导航栏 -->
    <div class="sidebar">
      <div class="sidebar-content">
        <el-menu
          :default-active="selectedCategory"
          class="category-menu"
          @select="handleCategoryChange"
        >
          <!-- 递归渲染多级分类 -->
          <category-item
            v-for="category in categoryTree"
            :key="category.id"
            :category="category"
          />
        </el-menu>
      </div>
    </div>

    <!-- 商品列表区域 -->
    <div class="main-content">
      <!-- 搜索栏 -->
      <div class="sticky-search-container">
        <el-input
          v-model="searchQuery"
          placeholder="请输入商品名称"
          class="search-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 商品列表 -->
      <div class="product-list">
        <el-row :gutter="20" class="product-row">
          <el-col
            v-for="product in products"
            :key="product.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <ProductCard :product="product" />
          </el-col>
        </el-row>

        <!-- 加载提示 -->
        <div v-if="loading" class="loading-text">
          <el-icon class="loading-icon"><Loading /></el-icon>
          加载中...
        </div>
        <div v-if="noMore" class="loading-text">没有更多商品了</div>

        <!-- 用于触发无限滚动的观察元素 -->
        <div ref="loadMoreTrigger" style="height: 0;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMenu, ElInput } from 'element-plus';
import { Loading, Search } from '@element-plus/icons-vue';
import axios from '@/utils/axios';
import ProductCard from '@/components/ProductCard.vue';
import CategoryItem from '@/components/CategoryItem.vue'; // 引入递归组件

// 定义 props
const props = defineProps({
  selectedSort: String,
});

// 商品列表
const products = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const loading = ref(false);
const noMore = ref(false);

// 搜索相关
const searchQuery = ref('');

// 类别相关
const categories = ref([]); // 原始类别列表
const categoryTree = ref([]); // 树形结构的类别列表
const selectedCategory = ref(''); // 当前选中的类别

// 用于触发无限滚动的观察元素
const loadMoreTrigger = ref(null);

// 加载商品列表
const loadProducts = async (isLoadMore = false) => {
  if (loading.value || noMore.value) return;

  try {
    loading.value = true;

    if (!isLoadMore) {
      currentPage.value = 1;
      products.value = [];
      noMore.value = false;
    }

    const response = await axios.get('/products/search', {
      params: {
        pageNum: currentPage.value,
        pageSize,
        name: searchQuery.value,
        categoryId: selectedCategory.value,
        sort: props.selectedSort,
      },
    });

    if (isLoadMore) {
      products.value = [...products.value, ...response.data.data];
    } else {
      products.value = response.data.data;
    }

    total.value = response.data.total;
    noMore.value = products.value.length >= total.value;

    if (!noMore.value) {
      currentPage.value += 1;
    }

    if (isLoadMore && loadMoreTrigger.value) {
      loadMoreTrigger.value.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 平滑滚动
    }
  } catch (error) {
    ElMessage.error('加载商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载所有类别
const loadCategories = async () => {
  try {
    const response = await axios.get('/categories');
    categories.value = response.data;

    // 将扁平化数据转换为树形结构
    categoryTree.value = buildCategoryTree(response.data);
  } catch (error) {
    ElMessage.error('加载类别失败');
  }
};

// 构建树形结构
const buildCategoryTree = (categories) => {
  const map = {};
  const roots = [];

  // 创建映射表
  categories.forEach((category) => {
    map[category.id] = { ...category, children: [] };
  });

  // 构建树形结构
  categories.forEach((category) => {
    if (category.parentId === null) {
      roots.push(map[category.id]);
    } else {
      map[category.parentId].children.push(map[category.id]);
    }
  });

  return roots;
};

// 处理类别变化
const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId;

  // 重置分页状态
  currentPage.value = 1;
  products.value = [];
  noMore.value = false;

  // 重新加载商品
  loadProducts();

  window.scrollTo({
    top: 0,
    behavior: 'smooth', // 平滑滚动
  });
};

// 处理搜索输入
const handleSearch = () => {
  // 重置分页状态
  currentPage.value = 1;
  products.value = [];
  noMore.value = false;

  // 重新加载商品
  loadProducts();
};

// 监听过滤条件变化
watch(
  () => [props.selectedSort],
  () => {
    console.log('过滤条件变化，重新加载数据');
    noMore.value = false;
    loadProducts();
  },
  { immediate: true, deep: true }
);

// 初始化 IntersectionObserver
let observer = null;
onMounted(() => {
  // 加载类别
  loadCategories();

  // 初始化无限滚动
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && !noMore.value) {
        loadProducts(true);
      }
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }
  );

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});

// 组件卸载时停止观察
onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
  }
});
</script>

<style scoped>
.product-container {
  display: flex;
  width: 100%;
  max-width: 100%;
  height: 100%; /* 使容器占满整个视口高度 */
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden; /* 隐藏外部容器的滚动条 */
}

.sidebar {
  width: 250px;
  margin-right: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* 允许侧边栏内部滚动 */
  height: 100%; /* 使侧边栏占满父容器高度 */
}

.sidebar-content {
  padding: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许主内容区域内部滚动 */
  height: 100%; /* 使主内容区域占满父容器高度 */
}

.sticky-search-container {
  position: sticky; /* 使搜索框固定在顶部 */
  top: 0; /* 固定在顶部 */
  z-index: 100; /* 确保搜索框在最上层 */
  margin:0px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background-color: #fff;
}

.product-list {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input {
  width: 100%;
}

.product-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px !important;
}

.el-col {
  padding: 0 10px;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 20px;
}

.loading-text {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-right: 8px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
    height: auto; /* 在小屏幕上取消固定高度 */
  }

  .main-content {
    height: auto; /* 在小屏幕上取消固定高度 */
  }

  .el-col {
    width: 100%;
  }
}
</style>