<template>
  <div class="chat-window">
    <chat-message-list :messages="messages" />
    <chat-input @send="handleSend" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChatMessageList from './ChatMessageList.vue';
import ChatInput from './ChatInput.vue';

const messages = ref([
  { id: 1, sender: '系统', content: '欢迎进入聊天室！' }
]);

const handleSend = (msg) => {
  messages.value.push({
    id: Date.now(),
    sender: '我',
    content: msg
  });
};
</script>

<style scoped>
.chat-window {
  width: 100%;
  max-width: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
}
</style>
