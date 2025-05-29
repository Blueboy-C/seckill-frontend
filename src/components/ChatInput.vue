<template>
  <div class="chat-input">
    <input
      v-model="input"
      @keyup.enter="send"
      placeholder="输入消息..."
      class="input-box"
    />
    <button @click="send" class="send-btn">发送</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const input = ref('');
const emit = defineEmits(['send']);

const send = () => {
  if (input.value.trim()) {
    emit('send', input.value);
    input.value = '';
  }
};
</script>

<style scoped>
.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  background: #fafbfc;
}
.input-box {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}
.send-btn {
  margin-left: 8px;
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.send-btn:hover {
  background: #66b1ff;
}
</style>
