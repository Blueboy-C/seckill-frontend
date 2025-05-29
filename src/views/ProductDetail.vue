<template>
  <div class="product-detail">
    <h1 class="page-title">商品详情</h1>
    <el-card class="product-card">
      <div class="product-content">
        <!-- 图片区域 -->
        <div class="product-image-container">
          <el-carousel v-if="product.imageList && product.imageList.length > 0" class="product-carousel" indicator-position="outside">
            <el-carousel-item v-for="(image, index) in product.imageList" :key="index">
              <el-image :src="image.imageUrl" fit="cover" class="product-image" />
            </el-carousel-item>
          </el-carousel>

          <!-- 如果没有图片，显示默认占位图 -->
          <el-image
            v-else
            :src="imageList[Math.floor(Math.random() * imageList.length)]"
            fit="cover"
            class="product-image"
          />
        </div>

        <!-- 商品信息区域 -->
        <div class="product-info">
          <h2 class="product-name">{{ product.name }}</h2>
          <div class="product-meta">
            <p class="product-price">价格: <span class="price-highlight">￥{{ formattedPrice }}</span></p>
            <p class="product-stock" :class="{ 'stock-out': product.stock === 0 }">
              库存: {{ product.stock === 0 ? '已售罄' : product.stock }}
            </p>
            <p class="product-category">分类: {{ product.category?.name || '无分类' }}</p>
            <p class="product-time">上架时间: {{ formatDate(product.createTime) }}</p>
          </div>
          <div class="action-buttons">
            <el-button type="success" @click="handleCreateOrder" class="order-button" :disabled="product.stock === 0">
              立即下单
            </el-button>
            <el-button type="primary" @click="handleAddToCart" class="cart-button" :disabled="product.stock === 0">
              加入购物车
            </el-button>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="product-description-container">
        <h3>商品描述</h3>
        <p class="product-description">{{ product.description || '暂无描述' }}</p>
      </div>
    </el-card>

    <!-- 下单弹窗 -->
    <el-dialog v-model="orderDialogVisible" title="下单" width="500px" class="form-dialog">
      <el-form :model="orderForm" :rules="orderRules" label-width="100px" ref="orderFormRef">
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="orderForm.quantity"
            :min="1"
            :max="product.stock"
            label="数量"
          />
        </el-form-item>
        <el-form-item label="收货地址" prop="addressId">
          <el-select v-model="orderForm.addressId" placeholder="请选择收货地址">
            <el-option
              v-for="address in userAddresses"
              :key="address.id"
              :label="`${address.receiverName} - ${address.receiverPhone} - ${address.receiverAddress}`"
              :value="address.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="showAddressForm">填写新地址</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <!-- <el-button @click="orderDialogVisible = false">取消</el-button> -->
        <el-button type="primary" @click="submitOrder">确认下单</el-button>
      </template>
    </el-dialog>

    <!-- 加入购物车弹窗 -->
    <el-dialog v-model="cartDialogVisible" title="加入购物车" width="500px" class="form-dialog">
      <el-form :model="cartForm" :rules="cartRules" label-width="100px" ref="cartFormRef">
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="cartForm.quantity"
            :min="1"
            :max="product.stock"
            label="数量"
          />
        </el-form-item>
        <!-- <el-form-item label="收货地址" prop="addressId">
          <el-select v-model="cartForm.addressId" placeholder="请选择收货地址">
            <el-option
              v-for="address in userAddresses"
              :key="address.id"
              :label="`${address.receiverName} - ${address.receiverPhone} - ${address.receiverAddress}`"
              :value="address.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="showAddressForm">填写新地址</el-button>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <!-- <el-button @click="cartDialogVisible = false">取消</el-button> -->
        <el-button type="primary" @click="addToCart">确认加入</el-button>
      </template>
    </el-dialog>

    <!-- 填写新地址弹窗 -->
    <el-dialog v-model="addressFormVisible" title="填写新地址" width="500px" class="form-dialog">
      <el-form :model="newAddress" :rules="addressRules" label-width="100px" ref="addressFormRef">
        <el-form-item label="收货人姓名" prop="receiverName">
          <el-input v-model="newAddress.receiverName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiverPhone">
          <el-input v-model="newAddress.receiverPhone" />
        </el-form-item>
        <el-form-item label="所在地区" prop="receiverRegion">
          <el-input v-model="newAddress.receiverRegion" />
        </el-form-item>
        <el-form-item label="详细地址" prop="receiverAddress">
          <el-input v-model="newAddress.receiverAddress" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存地址</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../utils/axios';
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect, ElOption, ElCarousel, ElCarouselItem } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
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

const product = ref({
  imageList: []
});
const userAddresses = ref([]);
const orderDialogVisible = ref(false);
const cartDialogVisible = ref(false);
const addressFormVisible = ref(false);
const newAddress = ref({
  receiverName: '',
  receiverPhone: '',
  receiverRegion: '',
  receiverAddress: '',
});

const orderForm = ref({
  quantity: 1,
  addressId: null,
});

const cartForm = ref({
  quantity: 1,
  addressId: null,
});

const orderRules = ref({
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  addressId: [{ required: true, message: '请选择收货地址', trigger: 'blur' }],
});

const cartRules = ref({
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  addressId: [{ required: true, message: '请选择收货地址', trigger: 'blur' }],
});

const addressRules = ref({
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
  ],
  receiverRegion: [{ required: true, message: '请输入所在地区', trigger: 'blur' }],
  receiverAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
});

// 格式化价格
const formattedPrice = computed(() => {
  return (product.value.price || 0).toFixed(2);
});

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// 加载商品详情
const loadProduct = async () => {
  try {
    const response = await axios.get(`/products/${route.params.id}`);
    product.value = response.data;
  } catch (error) {
    ElMessage.error('加载商品详情失败');
  }
};

// 加载用户地址列表
const loadUserAddresses = async () => {
  try {
    const response = await axios.get('/user/address/list', {
      params: { userId: authStore.getUserId() },
    });
    userAddresses.value = response;
  } catch (error) {
    ElMessage.error('加载地址列表失败');
  }
};

// 处理下单
const handleCreateOrder = async () => {
  if (product.value.stock === 0) {
    ElMessage.warning('库存不足，无法下单');
    return;
  }
  await loadUserAddresses();
  if (userAddresses.value.length > 0) {
    orderForm.value.addressId = userAddresses.value[0].id;
  }
  orderDialogVisible.value = true;
};

// 提交订单
const submitOrder = async () => {
  if (!orderForm.value.addressId) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  if (orderForm.value.quantity > product.value.stock) {
    ElMessage.warning('库存不足，无法下单');
    return;
  }

  try {
    const totalPrice = product.value.price * orderForm.value.quantity;

    const order = {
      userId: authStore.getUserId(),
      productId: product.value.id,
      quantity: orderForm.value.quantity,
      totalPrice: totalPrice,
      addressId: orderForm.value.addressId,
      productName: product.value.name,
      productPrice: product.value.price
    };

    await axios.post('/order/create', order);
    ElMessage.success('下单成功！');
    orderDialogVisible.value = false;
    loadProduct();
  } catch (error) {
    ElMessage.error(`下单失败: ${error.response?.data?.message || '未知错误'}`);
  }
};

// 处理加入购物车
const handleAddToCart = async () => {
  if (product.value.stock === 0) {
    ElMessage.warning('库存不足，无法加入购物车');
    return;
  }
  await loadUserAddresses();
  if (userAddresses.value.length > 0) {
    cartForm.value.addressId = userAddresses.value[0].id;
  }
  cartDialogVisible.value = true;
};

// 加入购物车
const addToCart = async () => {
  // if (!cartForm.value.addressId) {
  //   ElMessage.warning('请选择收货地址');
  //   return;
  // }

  if (cartForm.value.quantity > product.value.stock) {
    ElMessage.warning('库存不足，无法加入购物车');
    return;
  }

  try {
    const cartItem = {
      userId: authStore.getUserId(),
      productId: product.value.id,
      quantity: cartForm.value.quantity,
      addressId: cartForm.value.addressId,
    };

    await axios.post('/cart/add', cartItem);
    ElMessage.success('已加入购物车');
    cartDialogVisible.value = false;
  } catch (error) {
    ElMessage.error(`加入购物车失败: ${error.response?.data?.message || '未知错误'}`);
  }
};

// 显示填写新地址弹窗
const showAddressForm = () => {
  if (orderDialogVisible.value) orderDialogVisible.value = false;
  if (cartDialogVisible.value) cartDialogVisible.value = false;
  addressFormVisible.value = true;
};

// 保存新地址
const saveAddress = async () => {
  try {
    const response = await axios.post('/user/address/add', {
      ...newAddress.value,
      userId: authStore.getUserId(),
    });
    ElMessage.success('地址保存成功');
    addressFormVisible.value = false;
    await loadUserAddresses();
    if (orderDialogVisible.value) orderDialogVisible.value = true;
    if (cartDialogVisible.value) cartDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('保存地址失败');
  }
};

onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f8f8;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.product-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  background: linear-gradient(135deg, #f9f9f9, #ffffff);
}

.product-content {
  display: flex;
  gap: 20px;
  width: 100%;
}

.product-image-container {
  flex: 1;
  max-width: 500px;
  min-width: 300px;
}

.product-carousel {
  border-radius: 12px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
  padding: 0 20px;
}

.product-name {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

.product-meta {
  margin-bottom: 20px;
}

.product-price {
  font-size: 20px;
  color: #e4393c;
  margin-bottom: 10px;
}

.price-highlight {
  font-weight: bold;
  color: #ff5722;
}

.product-stock {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.stock-out {
  color: #f56c6c;
}

.product-category,
.product-time {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.order-button,
.cart-button {
  width: 150px;
  font-size: 16px;
  border-radius: 8px;
}

.product-description-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.product-description-container h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.product-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.form-dialog {
  border-radius: 12px;
}

.form-dialog .el-form-item {
  margin-bottom: 20px;
}

.form-dialog .el-input,
.form-dialog .el-select {
  width: 100%;
}

.form-dialog .el-button {
  width: 100%;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-content {
    flex-direction: column;
  }

  .product-image-container {
    max-width: 100%;
  }

  .product-info {
    padding: 0;
  }

  .action-buttons {
    flex-direction: column;
  }

  .order-button,
  .cart-button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>