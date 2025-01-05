<template>
  <div class="stats-management">
    <h1 class="page-title">秒杀活动统计</h1>

    <!-- 导出按钮 -->
    <el-button type="primary" @click="exportStats" class="export-button">
      <el-icon><Download /></el-icon> 导出统计数据
    </el-button>

    <!-- 统计图表 -->
    <div class="charts-container">
      <!-- 柱状图：参与人数 -->
      <el-card class="chart-card">
        <div ref="participantChart" class="chart"></div>
      </el-card>

      <!-- 柱状图：订单数 -->
      <el-card class="chart-card">
        <div ref="orderChart" class="chart"></div>
      </el-card>

      <!-- 饼图：总销售额分布 -->
      <el-card class="chart-card">
        <div ref="salesChart" class="chart"></div>
      </el-card>
    </div>

    <!-- 统计表格 -->
    <el-card class="table-card">
      <el-table :data="stats" border style="width: 100%" max-height="500" stripe>
        <el-table-column prop="seckillActivityId" label="秒杀活动ID" width="120" align="center" />
        <el-table-column prop="seckillActivityName" label="秒杀活动名称" />
        <el-table-column prop="participantCount" label="参与人数" width="120" align="center" />
        <el-table-column prop="orderCount" label="订单数" width="120" align="center" />
        <el-table-column prop="totalSales" label="总销售额" width="120" align="center">
          <template #default="{ row }">
            {{ row.totalSales.toFixed(2) }} 元
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import instance from '@/utils/axios'; // 导入封装的 axios 实例

// 统计数据
const stats = ref([]);

// 图表容器
const participantChart = ref(null);
const orderChart = ref(null);
const salesChart = ref(null);

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await instance.get('/stats/seckill');
    stats.value = response.data;

    // 渲染图表
    renderCharts();
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败，请稍后重试');
  }
};

// 导出统计数据
const exportStats = async () => {
  try {
    const response = await instance.get('/stats/seckill/export', {
      responseType: 'blob', // 确保返回的是文件流
    });

    // 检查文件内容是否为空
    if (response.size === 0) {
      throw new Error('导出的文件内容为空');
    }

    // 将文件流转换为 Blob
    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'seckill_stats.xlsx'); // 确保文件名包含扩展名
    document.body.appendChild(link);
    link.click();

    // 清理 DOM
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功，文件已下载');
  } catch (error) {
    console.error('导出统计数据失败:', error);
    ElMessage.error(error.message || '导出统计数据失败，请稍后重试');
  }
};

// 渲染图表
const renderCharts = () => {
  // 参与人数柱状图
  const participantChartInstance = echarts.init(participantChart.value);
  participantChartInstance.setOption({
    title: {
      text: '参与人数',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: stats.value.map(item => item.seckillActivityName),
      axisLabel: {
        rotate: 45, // 防止文字重叠
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: stats.value.map(item => item.participantCount),
        type: 'bar',
        itemStyle: {
          color: '#409EFF', // 设置柱状图颜色
        },
      },
    ],
  });

  // 订单数柱状图
  const orderChartInstance = echarts.init(orderChart.value);
  orderChartInstance.setOption({
    title: {
      text: '订单数',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: stats.value.map(item => item.seckillActivityName),
      axisLabel: {
        rotate: 45, // 防止文字重叠
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: stats.value.map(item => item.orderCount),
        type: 'bar',
        itemStyle: {
          color: '#67C23A', // 设置柱状图颜色
        },
      },
    ],
  });

  // 总销售额饼图
  const salesChartInstance = echarts.init(salesChart.value);
  salesChartInstance.setOption({
    title: {
      text: '总销售额分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)', // 显示具体数值和百分比
    },
    series: [
      {
        type: 'pie',
        data: stats.value.map(item => ({
          name: item.seckillActivityName,
          value: item.totalSales,
        })),
        radius: '50%', // 饼图大小
        itemStyle: {
          borderRadius: 5, // 圆角
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  });
};

// 组件挂载时获取统计数据
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.stats-management {
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

.export-button {
  margin-bottom: 20px;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  flex: 1 1 calc(33.333% - 20px);
  min-width: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart {
  width: 100%;
  height: 400px;
}

.table-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    flex-direction: column;
  }

  .chart-card {
    flex: 1 1 100%;
  }
}
</style>