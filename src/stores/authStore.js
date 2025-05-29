import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    role: localStorage.getItem('role') || '',
    userId: localStorage.getItem('userId') || '',
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setRole(role) {
      this.role = role;
      localStorage.setItem('role', role);
    },

    setUserId(userId) {
      this.userId = userId
      localStorage.setItem('userId',userId);
    },



    getUserId(){
      return this.userId;
    },
    
    getToken(){
      return this.token;
    },

    clearAuth() {
      this.token = '';
      this.role = '';
      this.userId = '';
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId')
    },
  },
});