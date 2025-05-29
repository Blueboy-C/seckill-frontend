<template>
  <el-card class="product-card" shadow="hover" @click="viewProduct(product.id)">
    <div class="image-container">
      <el-image
        :src="product.image || imageList[Math.floor(Math.random() * imageList.length)]"
        fit="cover"
        class="product-image"
        lazy
      />
      <div class="image-overlay">
        <span class="overlay-text">点击查看详情</span>
      </div>
      <div class="product-tags">
        <el-tag  type="danger" class="tag">🔥 热销</el-tag>
        <el-tag  type="success" class="tag">🆕 新品</el-tag>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <!-- 使用 el-tag 展示类别 -->
      <div class="category-tags">
        <el-tag
          class="category-tag"
        >
          {{ product.category.name }}
        </el-tag>
      </div>
      <div class="price-section">
        <span class="product-price">￥{{ product.price }}</span>
        <span class="product-sales">销量: {{ product.sales || 0 }}</span>
      </div>
      <div class="rating-section">
        <el-rate
          v-model="product.rating"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value} 分"
        />
      </div>
      <el-button type="primary" class="view-button" @click.stop="viewProduct(product.id)">
        查看详情
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
// import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 图片列表
const imageList = [
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
];

// 定义 props
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// 查看商品详情
const viewProduct = (id) => {
  router.push(`/product/${id}`);
};

// 根据类别名称返回对应的标签类型
const getCategoryTagType = (categoryName) => {
  const categoryColors = {
    '电子产品': 'primary',
    '家居生活': 'success',
    '服饰鞋包': 'warning',
    '美妆护肤': 'danger',
  };
  return categoryColors[categoryName] || 'info';
};
</script>

<style scoped>
.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  width: 100%; /* 确保卡片宽度不超过父容器 */
  max-width: 100%; /* 防止内容溢出 */
  box-sizing: border-box; /* 确保内边距和边框不影响宽度 */
  border: 1px solid #ebeef5; /* 增加边框 */
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  box-sizing: border-box; /* 确保图片宽度不超过父容器 */
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6)); /* 渐变遮罩 */
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
}

.image-overlay .overlay-text {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-tags {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px; /* 圆角标签 */
}

.product-info {
  padding: 15px;
  text-align: center;
  box-sizing: border-box; /* 确保内边距不影响宽度 */
}

.product-name {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.category-tags {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 10px 0;
}

.category-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px; /* 圆角标签 */
  transition: transform 0.2s ease;
}

.category-tag:hover {
  transform: translateY(-2px); /* 悬停效果 */
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.product-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.product-sales {
  color: #666;
  font-size: 14px;
}

.rating-section {
  margin: 10px 0;
}

.view-button {
  width: 100%;
  margin-top: 10px;
  background-color: #409eff; /* 按钮背景颜色 */
  color: #fff; /* 按钮文字颜色 */
  border: none;
  transition: background-color 0.3s ease;
  border-radius: 8px; /* 圆角按钮 */
}

.view-button:hover {
  background-color: #66b1ff; /* 按钮悬停效果 */
}
</style>