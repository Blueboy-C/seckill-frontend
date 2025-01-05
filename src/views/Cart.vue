<template>
  <div class="cart-container">
    <h1 class="page-title">购物车</h1>
    <el-table :data="cartItems" class="cart-table" stripe>
      <el-table-column prop="product.name" label="商品名称" width="300" />
      <el-table-column prop="product.price" label="单价" width="150">
        <template #default="{ row }">
          {{ formatPrice(row.product.price) }}
        </template>
      </el-table-column>
      <el-table-column label="数量" width="150">
        <template #default="{ row }">
          <el-input-number
            v-model="row.quantity"
            :min="1"
            @change="updateQuantity(row)"
            class="quantity-input"
          />
        </template>
      </el-table-column>
      <el-table-column label="小计" width="150">
        <template #default="{ row }">
          {{ formatPrice(row.product.price * row.quantity) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="deleteCartItem(row.id)" class="delete-button">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 结算栏 -->
    <div class="checkout-bar">
      <div class="total-price">
        总价: {{ formatPrice(totalPrice) }}
      </div>
      <el-button type="primary" @click="checkout" class="checkout-button">去结算</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../utils/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const cartItems = ref([]);

// 加载购物车列表
const loadCart = async () => {
  try {
    const response = await axios.get('/cart/list', {
      params: { userId: authStore.getUserId() },
    });
    cartItems.value = response;
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

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 去结算
const checkout = () => {
  // 跳转到结算页面
};

onMounted(() => {
  loadCart();
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
}

.cart-table {
  width: 100%;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quantity-input {
  width: 100px;
}

.delete-button {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

.checkout-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
}

.checkout-button {
  background-color: #409eff;
  border-color: #409eff;
  font-size: 16px;
}
</style>