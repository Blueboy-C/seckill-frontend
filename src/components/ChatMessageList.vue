<template>
  <div class="message-list">
    <div v-for="msg in messages" :key="msg.id" class="message">
      <span class="sender">{{ msg.sender }}：</span>
      <span class="content">{{ msg.content }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.message-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: #f9f9f9;
}
.message {
  margin-bottom: 8px;
}
.sender {
  font-weight: bold;
  color: #409eff;
}
.content {
  margin-left: 4px;
}
</style>
