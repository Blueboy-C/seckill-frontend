<template>
  <div class="home">
    <!-- 轮播图 -->
    <el-carousel :interval="5000" arrow="always" height="400px" class="carousel">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <el-image :src="item.image" fit="cover" class="carousel-image" />
        <div class="carousel-caption">
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 广告位 -->
    <div class="advertisement">
      <el-image :src="adImage" fit="cover" class="ad-image" />
    </div>

    <!-- 热门商品 -->
    <div class="hot-products">
      <h2 class="section-title">热门商品</h2>
      <el-row :gutter="20">
        <el-col
          v-for="product in hotProducts"
          :key="product.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card class="product-card" shadow="hover">
            <el-image
            :src="product.image || imageList[Math.floor(Math.random() * imageList.length)]"
            fit="cover"
            class="product-image"
          />
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="price">￥{{ product.price.toFixed(2) }}</p>
              <p class="stock">库存: {{ product.stock }}</p>
              <el-button type="primary" @click="viewProduct(product.id)" class="view-button">
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <div class="product-list">
      <h2 class="section-title">商品列表</h2>
      <el-row :gutter="20">
        <el-col
          v-for="product in products"
          :key="product.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card class="product-card" shadow="hover">
             <el-image
            :src="product.image || imageList[Math.floor(Math.random() * imageList.length)]"
            fit="cover"
            class="product-image"
          />
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="price">￥{{ product.price.toFixed(2) }}</p>
              <p class="stock">库存: {{ product.stock }}</p>
              <el-button type="primary" @click="viewProduct(product.id)" class="view-button">
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 加载提示 -->
      <div v-if="loading" class="loading-text">加载中...</div>
      <div v-if="noMore" class="loading-text">没有更多商品了</div>

      <!-- 观察目标 -->
      <div ref="observerTarget" v-if="!noMore"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

// 轮播图数据
const carouselItems = ref([
  {
    image: 'https://img.51miz.com/Element/00/87/11/32/c5a6e0e7_E871132_2034f142.png',
    title: '促销活动1',
    description: '限时折扣，快来抢购！',
  },
  {
    image: 'https://img.shetu66.com/2023/05/31/1685513038751808.jpg',
    title: '促销活动2',
    description: '新品上市，抢先体验！',
  },
]);

// 广告图
const adImage = ref('https://pic.nximg.cn/file/20190609/28512159_231133966000_2.jpg');

// 热门商品
const hotProducts = ref([
  {
    id: 1,
    name: '热门商品1',
    price: 99.99,
    stock: 100,
    image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.uoocMZ-qeLS0PPrASWy0_wHaKa?rs=1&pid=ImgDetMain',
  },
  {
    id: 2,
    name: '热门商品2',
    price: 199.99,
    stock: 50,
    image: 'https://img.shetu66.com/2023/08/03/1691055924076514.png',
  },
  {
    id: 3,
    name: '热门商品3',
    price: 299.99,
    stock: 30,
    image: 'https://img.zcool.cn/community/677340d6c991a7emay17bo9237.jpg?imageMogr2/auto-orient/thumbnail/1280x>/sharpen/0.5/quality/100',
  },
]);


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

// 商品列表
const products = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const loading = ref(false);
const noMore = ref(false);

// 加载商品列表
const loadProducts = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/admin/products/page', {
      params: {
        pageNum: currentPage.value,
        pageSize,
        name: searchQuery.value,
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

// 初始化 IntersectionObserver
const observerTarget = ref(null);
let observer = null;

const initObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && !noMore.value) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (observerTarget.value) {
    observer.observe(observerTarget.value);
  }
};

// 销毁 IntersectionObserver
const destroyObserver = () => {
  if (observer) {
    observer.disconnect();
  }
};

onMounted(() => {
  loadProducts();
  initObserver();
});

onUnmounted(() => {
  destroyObserver();
});
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.carousel {
  margin-bottom: 20px;
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.carousel-caption {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 5px;
}

.carousel-caption h2 {
  margin: 0;
  font-size: 24px;
}

.carousel-caption p {
  margin: 5px 0 0;
  font-size: 16px;
}

.advertisement {
  margin: 20px 0;
}

.ad-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
}

.product-info {
  padding: 15px;
  text-align: center;
}

.product-name {
  font-size: 18px;
  color: #333;
  margin: 10px 0;
}

.price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
  margin: 10px 0;
}

.stock {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.view-button {
  width: 100%;
}

.loading-text {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-caption h2 {
    font-size: 20px;
  }

  .carousel-caption p {
    font-size: 14px;
  }

  .section-title {
    font-size: 20px;
  }

  .product-name {
    font-size: 16px;
  }

  .price {
    font-size: 18px;
  }

  .stock {
    font-size: 12px;
  }
}
</style>