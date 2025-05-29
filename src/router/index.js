import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Shopping from '../views/Shopping.vue';
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
import CategoryrManagement from '../views/admin/CategoryManagement.vue'
const routes = [
  {
    path: '/',
    component: NavigationView,
    meta: { title: '首页' }, // 根路由的 meta 信息
    children: [
      { path: '', component: Home, meta: { title: '首页' } }, // 首页
      { path: 'products', component: Shopping, meta: { title: '商品列表' } }, // 商品列表
      { path: 'product/:id', component: ProductDetail, meta: { title: '商品详情' } }, // 商品详情
      { path: 'seckill-activities', component: SeckillActivityList, meta: { title: '秒杀活动' } }, // 秒杀活动
      { path: 'seckill-activity/:id', component: SeckillActivityDetail, meta: { title: '秒杀活动详情' } }, // 秒杀活动详情
      { path: 'orders', component: OrderList, meta: { requiresAuth: true, title: '我的订单' } }, // 我的订单
      { path: 'cart', component: Cart, meta: { requiresAuth: true, title: '购物车' } }, // 购物车
      { path: 'seckillOrder', component: SeckillOrderList, meta: { requiresAuth: true, title: '秒杀订单' } }, // 秒杀订单
      { path: 'user/address', component: UserAddressManagement, meta: { requiresAuth: true, title: '地址管理' } }, // 地址管理
      { path: 'profile', component: Profile, meta: { requiresAuth: true, title: '个人中心' } }, // 用户信息管理
    ],
  },
  {
    path: '/login',
    name: 'Auth',
    component: Auth,
    meta: { title: '登录/注册' }, // 登录/注册页面
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true, title: '后台管理' }, // 后台管理
    children: [
      { path: '', component: AdminHome, meta: { title: '后台首页' } }, // 后台首页
      { path: 'users', component: UserManagement, meta: { title: '用户管理' } }, // 用户管理
      { path: 'products', component: ProductManagement, meta: { title: '商品管理' } }, // 商品管理
      { path: 'seckill-activities', component: SeckillActivityManagement, meta: { title: '秒杀活动管理' } }, // 秒杀活动管理
      { path: 'orders', component: OrderManagement, meta: { title: '订单管理' } }, // 订单管理
      { path: 'stats', component: StatsAnalysis, meta: { title: '数据统计' } }, // 数据统计
      { path: 'seckill-orders', component: SeckillOrderManagement, meta: { title: '秒杀订单管理' } }, // 秒杀订单管理
      { path: 'category', component: CategoryrManagement, meta: { title: '商品类别管理' } }, // 商品类别管理
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
    next('/login'); // 需要登录但未登录，跳转到登录页
  } else if (to.meta.requiresAdmin && role !== '1') {
    next('/'); // 需要管理员权限但用户不是管理员，跳转到首页
  } else {
    next(); // 正常放行
  }
});

export default router;