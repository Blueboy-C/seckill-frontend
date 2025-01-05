<template>
  <div class="address-management">
    <h1 class="page-title">收货地址管理</h1>

    <!-- 添加地址按钮 -->
    <el-button type="primary" @click="showAddAddressForm" class="add-address-button">
      添加新地址
    </el-button>

    <!-- 地址列表 -->
    <el-table :data="addresses" border style="width: 100%" class="address-table">
      <el-table-column prop="receiverName" label="收货人" width="120" align="center" />
      <el-table-column prop="receiverPhone" label="联系电话" width="150" align="center" />
      <el-table-column prop="receiverRegion" label="所在地区" width="150" align="center" />
      <el-table-column prop="receiverAddress" label="详细地址" min-width="200" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="editAddress(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteAddress(row.id)">删除</el-button>
            <el-button
              v-if="!row.isDefault"
              type="success"
              size="small"
              @click="setDefaultAddress(row.id)"
            >
              设为默认
            </el-button>
            <el-tag v-else type="success" size="small">默认地址</el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>

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
    ElMessage.error('提交地址失败');
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
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.add-address-button {
  margin-bottom: 20px;
}

.address-table {
  margin-top: 20px;
  width: 100%;
}

.address-table .el-table__body-wrapper {
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.el-tag {
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }

  .el-button {
    width: 100%;
  }
}
</style>