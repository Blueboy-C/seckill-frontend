<template>
  <div class="product-list">
    <!-- 类别选择器 -->
    <!-- <div class="category-selector">
      <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button
          v-for="category in categories"
          :key="category.id"
          :label="category.id"
        >
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </div> -->

    <!-- 商品网格布局 -->
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElRadioGroup, ElRadioButton } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import axios from '@/utils/axios';
import ProductCard from '@/components/ProductCard.vue';

// 定义 props
const props = defineProps({
  searchQuery: String,
  selectedSort: String,
});

// 商品列表
const products = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const loading = ref(false);
const noMore = ref(false);

// 类别相关
const categories = ref([]); // 所有类别
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
        name: props.searchQuery,
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
  } catch (error) {
    ElMessage.error('加载类别失败');
  }
};

// 处理类别变化
const handleCategoryChange = () => {
  // 重置分页状态
  currentPage.value = 1;
  products.value = [];
  noMore.value = false;

  // 重新加载商品
  loadProducts();
};

// 监听过滤条件变化
watch(
  () => [props.searchQuery, props.selectedSort],
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
.product-list {
  width: 100%;
  margin: 0 auto; /* 居中 */
  padding: 20px;
  background-color: #f8f8f8;
  box-sizing: border-box; /* 确保内边距不影响宽度 */
}

.category-selector {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px !important; /* 抵消 el-col 的 gutter */
}

.el-col {
  padding: 0 10px; /* 设置 el-col 的内边距 */
  box-sizing: border-box; /* 确保内边距不影响宽度 */
  width: 100%; /* 确保 el-col 的宽度不超过父容器 */
  margin-bottom: 20px; /* 增加商品卡片间距 */
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

/* 商品卡片美化 */
.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 18px;
  margin: 0 0 10px;
  color: #333;
}

.product-price {
  font-size: 16px;
  color: #e4393c;
  margin: 0 0 10px;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-col {
    width: 100%; /* 在小屏幕上让每列占满宽度 */
  }

  .category-selector {
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>