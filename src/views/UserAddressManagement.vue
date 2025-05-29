<template>
  <div class="address-management">
    <h1 class="page-title">收货地址管理</h1>

    <!-- 添加地址按钮 -->
    <el-button type="primary" @click="showAddAddressForm" class="add-address-button">
      添加新地址
    </el-button>

    <!-- 地址列表 -->
    <div class="address-list">
      <div v-for="address in addresses" :key="address.id" class="address-card">
        <div class="address-header">
          <span class="receiver-name">{{ address.receiverName }}</span>
          <el-tag v-if="address.isDefault" type="success" size="small">默认地址</el-tag>
        </div>
        <div class="address-body">
          <p class="receiver-phone">联系电话：{{ address.receiverPhone }}</p>
          <p class="receiver-region">所在地区：{{ address.receiverRegion }}</p>
          <p class="receiver-address">详细地址：{{ address.receiverAddress }}</p>
        </div>
        <div class="address-actions">
          <el-button type="primary" size="small" @click="editAddress(address)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteAddress(address.id)">删除</el-button>
          <el-button
            v-if="!address.isDefault"
            type="success"
            size="small"
            @click="setDefaultAddress(address.id)"
          >
            设为默认
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑地址弹窗 -->
    <el-dialog
      v-model="addressFormVisible"
      :title="isEditing ? '编辑地址' : '添加新地址'"
      width="500px"
    >
      <el-form :model="addressForm" :rules="addressRules" label-width="100px" ref="addressFormRef">
        <el-form-item label="收货人姓名" prop="receiverName">
          <el-input v-model="addressForm.receiverName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiverPhone">
          <el-input v-model="addressForm.receiverPhone" />
        </el-form-item>
        <el-form-item label="所在地区" prop="receiverRegion">
          <el-input v-model="addressForm.receiverRegion" />
        </el-form-item>
        <el-form-item label="详细地址" prop="receiverAddress">
          <el-input v-model="addressForm.receiverAddress" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddressForm">
          {{ isEditing ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '@/utils/axios'; // 导入封装的 axios 实例
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// 地址列表
const addresses = ref([]);

// 添加/编辑地址表单
const addressForm = ref({
  id: null,
  receiverName: '',
  receiverPhone: '',
  receiverRegion: '',
  receiverAddress: '',
});

// 表单校验规则
const addressRules = ref({
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
  ],
  receiverRegion: [{ required: true, message: '请输入所在地区', trigger: 'blur' }],
  receiverAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
});

// 弹窗显示状态
const addressFormVisible = ref(false);

// 是否为编辑模式
const isEditing = ref(false);

// 表单引用
const addressFormRef = ref(null);

// 加载地址列表
const loadAddresses = async () => {
  try {
    const response = await axios.get('/user/address/list', {
      params: { userId: authStore.getUserId() },
    });
    addresses.value = response;
  } catch (error) {
    ElMessage.error('加载地址列表失败');
  }
};

// 显示添加地址弹窗
const showAddAddressForm = () => {
  addressForm.value = {
    id: null,
    receiverName: '',
    receiverPhone: '',
    receiverRegion: '',
    receiverAddress: '',
  };
  isEditing.value = false;
  addressFormVisible.value = true;
};

// 显示编辑地址弹窗
const editAddress = (address) => {
  addressForm.value = { ...address };
  isEditing.value = true;
  addressFormVisible.value = true;
};

// 提交地址表单
const submitAddressForm = async () => {
  try {
    // 校验表单
    await addressFormRef.value.validate();

    if (isEditing.value) {
      await axios.post('/user/address/update', addressForm.value);
      ElMessage.success('地址更新成功');
    } else {
      await axios.post('/user/address/add', {
        ...addressForm.value,
        userId: authStore.getUserId(),
      });
      ElMessage.success('地址添加成功');
    }
    addressFormVisible.value = false;
    loadAddresses(); // 刷新地址列表
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error('提交地址失败');
    } else {
      // 校验失败，error 是一个对象，包含校验失败的信息
      ElMessage.warning('请填写完整的地址信息');
    }
  }
};

// 删除地址
const deleteAddress = async (id) => {
  try {
    await axios.post(`/user/address/delete?id=${id}`);
    ElMessage.success('地址删除成功');
    loadAddresses(); // 刷新地址列表
  } catch (error) {
    ElMessage.error('删除地址失败');
  }
};

// 设置默认地址
const setDefaultAddress = async (addressId) => {
  try {
    await axios.post('/user/address/setDefault', {
      userId: authStore.getUserId(),
      addressId,
    });
    ElMessage.success('默认地址设置成功');
    loadAddresses(); // 刷新地址列表
  } catch (error) {
    ElMessage.error('设置默认地址失败');
  }
};

// 组件挂载时加载地址列表
onMounted(() => {
  loadAddresses();
});
</script>

<style scoped>
.address-management {
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

.add-address-button {
  margin-bottom: 20px;
  background-color: #409eff;
  border-color: #409eff;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.address-card {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
}

.address-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.receiver-name {
  font-size: 18px;
  font-weight: bold;
}

.address-body {
  margin-bottom: 16px;
}

.receiver-phone,
.receiver-region,
.receiver-address {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.address-actions {
  display: flex;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .address-card {
    padding: 16px;
  }

  .address-actions {
    flex-direction: column;
    gap: 8px;
  }

  .el-button {
    width: 100%;
  }
}
</style>