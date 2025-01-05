<template>
  <div>
    <h1>Reset Password</h1>
    <form @submit.prevent="resetPassword">
      <input v-model="email" placeholder="Email" />
      <input v-model="newPassword" type="password" placeholder="New Password" />
      <button type="submit">Reset Password</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      newPassword: ''
    };
  },
  methods: {
    resetPassword() {
      axios.post('/user/reset-password', null, {
        params: { email: this.email, newPassword: this.newPassword }
      }).then(() => {
        alert('Password reset successfully');
      });
    }
  }
};
</script>