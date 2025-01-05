import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ProductList from '../views/ProductList.vue';
import ProductDetail from '../views/ProductDetail.vue';
import SeckillActivityList from '../views/SeckillActivityList.vue';
import SeckillActivityDetail from '../views/SeckillActivityDetail.vue';
import OrderList from '../views/OrderList.vue';
import Cart from '../views/Cart.vue'; // 新增购物车页面
import AdminDashboard from '../views/AdminDashboard.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import ProductManagement from '../views/admin/ProductManagement.vue';
import OrderManagement from '../views/admin/OrderManagement.vue';
import SeckillActivityManagement from '../views/admin/SeckillActivityManagement.vue';
import StatsAnalysis from '../views/admin/StatsAnalysis.vue';
import SeckillOrderManagement from '../views/admin/SeckillOrderManagement.vue'
import SeckillOrderList from '../views/SeckillOrderList.vue';
import Auth from '../views/Auth.vue';
import NavigationView from   '../views/NavigationView.vue'
import UserAddressManagement from '@/views/UserAddressManagement.vue'; // 新增地址管理页面
import Profile from '@/views/Profile.vue'; // 新增用户信息管理页面
import AdminHome from '../views/admin/AdminHome.vue';
const routes = [
  {
    path: '/',
    component: NavigationView,
    children: [
      { path: '', component: Home }, // 首页
      { path: 'products', component: ProductList }, // 商品列表
      { path: 'product/:id', component: ProductDetail }, // 商品详情
      { path: 'seckill-activities', component: SeckillActivityList }, // 秒杀活动
      { path: 'seckill-activity/:id', component: SeckillActivityDetail }, // 秒杀活动详情
      { path: 'orders', component: OrderList, meta: { requiresAuth: true } }, // 我的订单
      { path: 'cart', component: Cart, meta: { requiresAuth: true } }, // 购物车
      { path: 'seckillOder', component: SeckillOrderList, meta: { requiresAuth: true } }, // 秒杀订单
      { path: 'user/address', component: UserAddressManagement, meta: { requiresAuth: true } }, // 新增地址管理
      { path: 'profile', component: Profile, meta: { requiresAuth: true } }, // 用户信息管理
    ],
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', component:  AdminHome}, // 首页
      { path: 'users', component: UserManagement },
      { path: 'products', component: ProductManagement },
      { path: 'seckill-activities', component: SeckillActivityManagement },
      { path: 'orders', component: OrderManagement },
      { path: 'stats', component: StatsAnalysis },
      { path: 'seckill-orders', component: SeckillOrderManagement },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (to.meta.requiresAuth && !token) {
    next('/auth'); // 需要登录但未登录，跳转到登录页
  } else if (to.meta.requiresAdmin && role !== '1') {
    next('/'); // 需要管理员权限但用户不是管理员，跳转到首页
  } else {
    next(); // 正常放行
  }
});

export default router;