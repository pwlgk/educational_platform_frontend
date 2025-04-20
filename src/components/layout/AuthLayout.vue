// src/components/layout/AuthLayout.vue
<template>
  <div class="auth-layout">
    <main>
      <router-view /> <!-- Сюда будут рендериться Login/Register -->
    </main>
  </div>
</template>

<script setup lang="ts">
// Логика для лэйаута аутентификации (если нужна)
</script>

<style scoped>
/* Стили для этого лэйаута */
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e8f0fe; /* Пример фона */
}
main {
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>