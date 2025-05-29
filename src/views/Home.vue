<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <div class="carousel-section">
      <el-carousel :interval="5000" arrow="always" height="400px" class="carousel">
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <el-image :src="item.image" fit="cover" class="carousel-image" />
          <div class="carousel-caption">
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 广告位 -->
    <div class="advertisement-section">
      <el-image :src="adImage" fit="cover" class="ad-image" />
    </div>

    <!-- 热门商品 -->
    <div class="hot-products-section">
      <h2 class="section-title">🔥 热门商品</h2>
      <el-row :gutter="20" class="product-row">
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

    <!-- 推荐分类 -->
    <div class="categories-section">
      <h2 class="section-title">🎯 推荐分类</h2>
      <el-row :gutter="20">
        <el-col
          v-for="category in categories"
          :key="category.id"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="4"
        >
          <div class="category-card">
            <el-image :src="category.image" fit="cover" class="category-image" />
            <p class="category-name">{{ category.name }}</p>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <!-- <div class="product-list-section">
      <h2 class="section-title">🛒 商品列表</h2>
      <div class="product-list-container">
        <ProductList />
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProductList from '@/components/ProductList.vue';

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

// 推荐分类
const categories = ref([
  {
    id: 1,
    name: '电子产品',
    image: 'https://ts1.cn.mm.bing.net/th/id/R-C.f933ecdc1a942a9613fa87a9f6383864?rik=WH3LHVqSz7W2uw&riu=http%3a%2f%2fwww.hnhuitian.com%2fstatics%2fattachment%2fgoods%2f2020%2f8%2f12%2f11%2f26544211_big.png&ehk=Hs6sKQsfoFLE0pxTAKqrhnfplzQsP%2fMfrjkwoapSt8E%3d&risl=&pid=ImgRaw&r=0',
  },
  {
    id: 2,
    name: '家居生活',
    image: 'https://ts1.cn.mm.bing.net/th/id/R-C.3069c627280a1e890fe1a49e1431de56?rik=5Rnk4R%2fM2m6%2b4A&riu=http%3a%2f%2ftgi13.jia.com%2f114%2f833%2f14833257.jpg&ehk=qguUr8aFPfqWrX%2ffA0p1XkErNkGIBuy0R6orJHMKXf0%3d&risl=1&pid=ImgRaw&r=0',
  },
  {
    id: 3,
    name: '服饰鞋包',
    image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.TdkvC0aDXKhy5Y5iK5iCNwHaHM?rs=1&pid=ImgDetMain',
  },
  {
    id: 4,
    name: '美妆护肤',
    image: 'https://img95.699pic.com/photo/50060/1676.jpg_wh860.jpg',
  },
]);
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 95%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  overflow-x: hidden;
  box-sizing: border-box;
}

.carousel-section {
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f8ff, #e0f7fa);
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
  padding: 15px 25px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
}

.carousel-caption h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.carousel-caption p {
  margin: 5px 0 0;
  font-size: 16px;
}

.advertisement-section {
  margin: 40px 0;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
}

.ad-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.ad-image:hover {
  transform: scale(1.02);
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
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
}

.product-card {
  width: 100%;
  max-width: 100%;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
}

.product-info {
  padding: 15px;
  text-align: center;
}

.product-name {
  font-size: 18px;
  color: #333;
  margin: 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  margin-top: 10px;
}

.categories-section {
  margin: 40px 0;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  padding: 20px;
  border-radius: 12px;
}

.category-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.category-image {
  width: 100%;
  height: 150px;
  border-radius: 12px 12px 0 0;
}

.category-name {
  font-size: 16px;
  color: #333;
  text-align: center;
  padding: 10px;
  margin: 0;
}

.product-list-section {
  margin-bottom: 40px;
  background: linear-gradient(135deg, #f0fff0, #e0f7fa);
  padding: 20px;
  border-radius: 12px;
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