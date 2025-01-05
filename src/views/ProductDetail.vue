<template>
  <div class="product-detail">
    <h1 class="page-title">商品详情</h1>
    <el-card class="product-card">
      <!-- 图片轮播 -->
      <div class="product-image-container">
        <el-carousel v-if="product.images && product.images.length > 0" class="product-carousel">
          <el-carousel-item v-for="(image, index) in product.images" :key="index">
            <el-image :src="image" fit="cover" class="product-image" />
          </el-carousel-item>
        </el-carousel>

        <!-- 如果没有图片，显示默认占位图 -->
          <el-image
            :src="product.image || imageList[Math.floor(Math.random() * imageList.length)]"
            fit="cover"
            class="product-image"
          />
      </div>

      <!-- 商品基本信息 -->
      <div class="product-basic-info">
        <h2 class="product-name">{{ product.name }}</h2>
        <p class="product-price">价格: ￥{{ formattedPrice }}</p>
        <p class="product-stock">库存: {{ product.stock }}</p>
        <div class="action-buttons">
          <el-button type="success" @click="handleCreateOrder" class="order-button">
            立即下单
          </el-button>
          <el-button type="primary" @click="addToCart" class="cart-button">
            加入购物车
          </el-button>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="product-description-container">
        <h3>商品描述</h3>
        <p class="product-description">{{ product.description }}</p>
      </div>
    </el-card>

    <!-- 下单弹窗 -->
    <el-dialog v-model="orderDialogVisible" title="下单" width="30%">
      <el-form :model="orderForm" label-width="100px">
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
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">确认下单</el-button>
      </template>
    </el-dialog>

    <!-- 填写新地址弹窗 -->
    <el-dialog v-model="addressFormVisible" title="填写新地址" width="30%">
      <el-form :model="newAddress" :rules="addressRules" label-width="100px">
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
        <el-form-item>
          <el-button type="primary" @click="saveAddress">保存地址</el-button>
          <el-button @click="addressFormVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
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

const product = ref({});
const userAddresses = ref([]); // 用户地址列表
const orderDialogVisible = ref(false); // 下单弹窗是否显示
const addressFormVisible = ref(false); // 填写新地址弹窗是否显示
const newAddress = ref({ // 新地址表单数据
  receiverName: '',
  receiverPhone: '',
  receiverRegion: '',
  receiverAddress: '',
});

const orderForm = ref({
  quantity: 1, // 默认数量为1
  addressId: null, // 选择的地址ID
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

// 加载商品详情
const loadProduct = async () => {
  try {
    const response = await axios.get(`/product/${route.params.id}`);
    product.value = {
      ...response,
      price: response.price || 0, // 确保 price 有默认值
      images: response.images || [], // 确保 images 是一个数组
    };
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
  await loadUserAddresses();
  if (userAddresses.value.length > 0) {
    orderForm.value.addressId = userAddresses.value[0].id; // 默认选中第一个地址
  }
  orderDialogVisible.value = true; // 显示下单弹窗
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
      addressId: orderForm.value.addressId, // 使用选择的地址ID
    };

    await axios.post('/order/create', order);
    ElMessage.success('下单成功！');
    orderDialogVisible.value = false;
    // router.push('/orders'); // 跳转到订单列表页
  } catch (error) {
    ElMessage.error(`下单失败: ${error.response?.data?.message || '未知错误'}`);
  }
};

// 显示填写新地址弹窗
const showAddressForm = () => {
  orderDialogVisible.value = false;
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
    await loadUserAddresses(); // 重新加载地址列表
    orderDialogVisible.value = true; // 返回下单弹窗
  } catch (error) {
    ElMessage.error('保存地址失败');
  }
};

// 加入购物车
const addToCart = async () => {
  try {
    const quantity = 1; // 假设购买数量为1
    if (product.value.stock < quantity) {
      ElMessage.warning('库存不足，无法加入购物车');
      return;
    }

    const cartItem = {
      userId: authStore.getUserId(),
      productId: product.value.id,
      quantity: quantity,
    };

    await axios.post('/cart/add', cartItem);
    ElMessage.success('已加入购物车');
  } catch (error) {
    ElMessage.error(`加入购物车失败: ${error.response?.data?.message || '未知错误'}`);
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
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.product-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.product-image-container {
  text-align: center;
  margin-bottom: 20px;
}

.product-carousel {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.product-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.product-basic-info {
  text-align: center;
  margin-bottom: 20px;
}

.product-name {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.product-price {
  font-size: 18px;
  color: #e4393c;
  margin-bottom: 10px;
}

.product-stock {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.order-button,
.cart-button {
  width: 120px;
}

.product-description-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .product-carousel {
    width: 100%;
    max-width: 300px;
  }

  .product-basic-info {
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .order-button,
  .cart-button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>