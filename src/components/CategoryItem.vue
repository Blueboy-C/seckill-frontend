<template>
  <el-sub-menu :index="category.id.toString()" v-if="category.children.length > 0">
    <template #title>
      <span>{{ category.name }}</span>
    </template>
    <category-item
      v-for="child in category.children"
      :key="child.id"
      :category="child"
    />
  </el-sub-menu>
  <el-menu-item :index="category.id.toString()" v-else>
    <span>{{ category.name }}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: 'CategoryItem',
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.el-menu-item,
.el-sub-menu__title {
  padding: 10px 20px;
  font-size: 14px;
  color: #333;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.el-menu-item.is-active,
.el-sub-menu.is-active > .el-sub-menu__title {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
</style>