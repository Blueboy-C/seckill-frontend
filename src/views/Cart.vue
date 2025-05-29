<template>
  <div class="cart-container">
    <h1 class="page-title">购物车</h1>
    <el-card class="cart-card">
      <!-- 购物车商品列表 -->
      <div class="cart-list">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <el-checkbox v-model="item.selected" class="item-checkbox" />
          <el-image :src="item.product.image" class="product-image" fit="cover" />
          <div class="product-info">
            <h3 class="product-name">{{ item.product.name }}</h3>
            <p class="product-price">单价：{{ formatPrice(item.product.price) }}</p>
            <el-input-number
              v-model="item.quantity"
              :min="1"
              @change="updateQuantity(item)"
              class="quantity-input"
            />
          </div>
          <div class="product-subtotal">
            <p class="subtotal">小计：{{ formatPrice(item.product.price * item.quantity) }}</p>
            <el-button type="danger" size="small" @click="deleteCartItem(item.id)" class="delete-button">
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 结算栏 -->
      <div class="checkout-bar">
        <div class="select-all">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        </div>
        <div class="total-price">
          已选 {{ selectedCount }} 件商品，总价: {{ formatPrice(totalPrice) }}
        </div>
        <el-button type="primary" @click="handleCheckout" class="checkout-button">去结算</el-button>
      </div>
    </el-card>

    <!-- 下单弹窗 -->
    <el-dialog v-model="orderDialogVisible" title="下单" width="30%">
      <el-form :model="orderForm" label-width="100px">
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

    <!-- 商品推荐 -->
    <div class="recommendations">
      <h3 class="section-title">猜你喜欢</h3>
      <div class="recommendation-list">
        <ProductList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../utils/axios';
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
import { useAuthStore } from '../stores/authStore';
import ProductList from '@/components/ProductList.vue';

const authStore = useAuthStore();
const cartItems = ref([]);
const userAddresses = ref([]); // 用户地址列表
const orderDialogVisible = ref(false); // 下单弹窗是否显示
const addressFormVisible = ref(false); // 填写新地址弹窗是否显示
const newAddress = ref({ // 新地址表单数据
  receiverName: '',
  receiverPhone: '',
  receiverRegion: '',
  receiverAddress: '',
});
const recommendedProducts = ref([]); // 推荐商品列表
const selectAll = ref(false); // 是否全选

const orderForm = ref({
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

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
});

// 计算已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter((item) => item.selected).length;
});

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 加载购物车列表
const loadCart = async () => {
  try {
    const response = await axios.get('/cart/list', {
      params: { userId: authStore.getUserId() },
    });
    cartItems.value = response.map((item) => ({ ...item, selected: false }));
  } catch (error) {
    ElMessage.error('加载购物车失败');
  }
};

// 更新商品数量
const updateQuantity = async (item) => {
  try {
    await axios.post('/cart/update', {
      id: item.id,
      quantity: item.quantity,
    });
    ElMessage.success('更新成功');
  } catch (error) {
    ElMessage.error('更新失败');
  }
};

// 删除购物车项
const deleteCartItem = async (id) => {
  try {
    await axios.post('/cart/delete', null, {
      params: {
        id: id
      }
    });
    ElMessage.success('删除成功');
    loadCart(); // 重新加载购物车
  } catch (error) {
    ElMessage.error('删除失败');
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

// 处理全选
const handleSelectAll = (value) => {
  cartItems.value.forEach((item) => (item.selected = value));
};

// 处理结算
const handleCheckout = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品');
    return;
  }

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

  try {
    // 遍历购物车中的每个商品，为每个商品生成一个订单
    for (const item of cartItems.value.filter((item) => item.selected)) {
      const order = {
        userId: authStore.getUserId(),
        productId: item.product.id,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity, // 单个商品的总价
        addressId: orderForm.value.addressId,
        productName: item.product.name,
        productPrice: item.product.price,
      };

      // 提交订单
      await axios.post('/order/create', order);
    }

    ElMessage.success('下单成功！');

    // 清空购物车
    for (const item of cartItems.value.filter((item) => item.selected)) {
      await axios.post('/cart/delete', null, {
        params: {
          id: item.id
        }
      });
    }

    orderDialogVisible.value = false;
    loadCart(); // 重新加载购物车
  } catch (error) {
    console.log(error);
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

// 加载推荐商品
const loadRecommendations = async () => {
  try {
    const response = await axios.get('/product/recommendations');
    recommendedProducts.value = response;
  } catch (error) {
    ElMessage.error('加载推荐商品失败');
  }
};

// 加入购物车
const addToCart = async (product) => {
  try {
    await axios.post('/cart/add', {
      userId: authStore.getUserId(),
      productId: product.id,
      quantity: 1,
    });
    ElMessage.success('已加入购物车');
    loadCart(); // 重新加载购物车
  } catch (error) {
    ElMessage.error('加入购物车失败');
  }
};

onMounted(() => {
  loadCart();
  // loadRecommendations();
});
</script>

<style scoped>
.cart-container {
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

.cart-card {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  margin-right: 10px;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.product-price {
  font-size: 14px;
  color: #666;
}

.quantity-input {
  width: 120px;
}

.product-subtotal {
  text-align: right;
}

.subtotal {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.delete-button {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

.checkout-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.select-all {
  margin-right: 20px;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
}

.checkout-button {
  background-color: #409eff;
  border-color: #409eff;
  font-size: 16px;
}

.recommendations {
  margin-top: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.recommendation-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
}

.recommendation-item {
  width: 200px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
}

.recommendation-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recommendation-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
}

.recommendation-info {
  text-align: center;
  margin-top: 10px;
}

.recommendation-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.recommendation-price {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-subtotal {
    text-align: left;
    width: 100%;
  }

  .checkout-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .recommendation-list {
    flex-direction: column;
  }

  .recommendation-item {
    width: 100%;
  }
}
</style>