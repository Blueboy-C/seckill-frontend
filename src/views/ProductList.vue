<template>
  <div class="product-list">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索商品..."
        clearable
        @clear="loadProducts"
        @keyup.enter="loadProducts"
      />
      <el-button type="primary" @click="loadProducts">搜索</el-button>
    </div>

    <!-- 商品分类和排序 -->
    <div class="filter-bar">
      <el-select v-model="selectedCategory" placeholder="选择分类" @change="loadProducts">
        <el-option label="全部" value=""></el-option>
        <el-option label="电子产品" value="electronics"></el-option>
        <el-option label="服装" value="clothing"></el-option>
        <el-option label="家居" value="home"></el-option>
      </el-select>
      <el-select v-model="selectedSort" placeholder="排序方式" @change="loadProducts">
        <el-option label="默认" value="default"></el-option>
        <el-option label="价格从低到高" value="price_asc"></el-option>
        <el-option label="价格从高到低" value="price_desc"></el-option>
        <el-option label="销量从高到低" value="sales_desc"></el-option>
      </el-select>
    </div>

    <!-- 商品网格布局 -->
    <el-row :gutter="20" v-infinite-scroll="loadMore" :infinite-scroll-disabled="loading">
      <el-col
        v-for="product in products"
        :key="product.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
      >
        <el-card class="product-card" shadow="hover" @click="viewProduct(product.id)">
        <el-image
            :src="product.image || imageList[Math.floor(Math.random() * imageList.length)]"
            fit="cover"
            class="product-image"
          />
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">￥{{ product.price }}</p>
            <p class="product-stock">库存: {{ product.stock }}</p>
            <el-button type="primary" class="view-detail-btn" @click.stop="viewProduct(product.id)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 加载提示 -->
    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-if="noMore" class="loading-text">没有更多商品了</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

// 商品列表
const products = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedSort = ref('default');
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const loading = ref(false);
const noMore = ref(false);

const imageList =[
  "https://img.zcool.cn/community/01d5615abc9301a8012062e38ca89c.JPG?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100/quality,q_100",
  "https://img.zcool.cn/community/01d5615abc9301a8012062e38ca89c.JPG?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100/quality,q_100",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.i3aj4AAmlwyUCeNpZjnvOAHaE8?rs=1&pid=ImgDetMain",
  "https://img95.699pic.com/photo/50018/0189.jpg_wh860.jpg",
  "https://img95.699pic.com/photo/60015/8957.jpg_wh860.jpg",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.3hBgFtrc4-d0daxwmH7cnwHaE8?rs=1&pid=ImgDetMain",
  "https://ts1.cn.mm.bing.net/th/id/R-C.30e8a422ed0531c065614f57b3ec00c7?rik=prPBQ%2bH8HHA6tg&riu=http%3a%2f%2fseopic.699pic.com%2fphoto%2f50105%2f8519.jpg_wh1200.jpg&ehk=nZWSnJtQiDQlJ7orUunPGwc7rc89n7L03b6YDYCpiFI%3d&risl=&pid=ImgRaw&r=0",
  "https://img.zcool.cn/community/0103d65afaf2d2a80121604517b881.jpg?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100",
  "https://ts1.cn.mm.bing.net/th/id/R-C.ea214c6bd697f499d917f86c9de53c56?rik=o33lqLaAKmrxMg&riu=http%3a%2f%2fp7.zbjimg.com%2fservice%2f2015-11%2f30%2fservice%2f565c164e15dd2.jpg&ehk=mVqsmAQPLS2fy1gbdfiML24rLDEbVL7KSW53DDhI%2bVI%3d&risl=&pid=ImgRaw&r=0",
  "https://pic.nximg.cn/file/20220608/27797488_120921621109_2.jpg",
  "https://tse3-mm.cn.bing.net/th/id/OIP-C.T8szPQWoyzuppclnXhVfcAHaE7?rs=1&pid=ImgDetMain"
]

// 加载商品列表
const loadProducts = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/admin/products/page', {
      params: {
        pageNum: currentPage.value,
        pageSize,
        name: searchQuery.value,
        category: selectedCategory.value,
        sort: selectedSort.value,
      },
    });
    if (currentPage.value === 1) {
      products.value = response.data.data;
    } else {
      products.value = [...products.value, ...response.data.data];
    }
    total.value = response.data.total;
    noMore.value = products.value.length >= total.value;
  } catch (error) {
    ElMessage.error('加载商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 滚动加载更多
const loadMore = () => {
  if (!loading.value && !noMore.value) {
    currentPage.value += 1;
    loadProducts();
  }
};

// 查看商品详情
const viewProduct = (id) => {
  router.push(`/product/${id}`);
};

// 初始化加载
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.product-list {
  padding: 20px;
  background-color: #f8f8f8;
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-bar .el-input {
  width: 400px;
  margin-right: 10px;
}

.filter-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
}

.product-info {
  padding: 15px;
  text-align: center;
}

.product-name {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}

.product-stock {
  color: #666;
  margin: 10px 0;
}

.view-detail-btn {
  width: 100%;
  margin-top: 10px;
}

.loading-text {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>