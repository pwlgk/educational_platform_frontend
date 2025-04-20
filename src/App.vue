// src/App.vue
<template>
  <!-- Просто точка монтирования для Vue Router -->
  <router-view />
</template>

<script setup lang="ts">
// Никакой логики выбора лэйаута здесь не нужно.
// Скрипт может быть пустым или содержать глобальную логику приложения,
// не связанную с лэйаутами роутера.
</script>

<style>
/* Глобальные стили */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

a {
  font-weight: bold;
  color: #2c3e50;
}

a.router-link-exact-active {
  color: #42b983;
}

/* Добавьте или импортируйте другие глобальные стили */
/* @import '@/assets/main.css'; */
</style>