<template>
  <div>
    <h1>Seckill Activity Statistics</h1>
    <table>
      <thead>
        <tr>
          <th>Activity ID</th>
          <th>Activity Name</th>
          <th>Participants</th>
          <th>Orders</th>
          <th>Total Sales</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stat in stats" :key="stat.seckillActivityId">
          <td>{{ stat.seckillActivityId }}</td>
          <td>{{ stat.seckillActivityName }}</td>
          <td>{{ stat.participantCount }}</td>
          <td>{{ stat.orderCount }}</td>
          <td>{{ stat.totalSales }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      stats: []
    };
  },
  created() {
    this.fetchSeckillStats();
  },
  methods: {
    fetchSeckillStats() {
      axios.get('/stats/seckill').then(response => {
        this.stats = response.data;
      });
    }
  }
};
</script>