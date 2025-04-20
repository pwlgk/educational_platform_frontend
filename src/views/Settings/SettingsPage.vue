// src/views/Settings/SettingsPage.vue
<template>
    <div>
        <h1>Settings</h1>
        <section>
            <h2>Change Password</h2>
            <ChangePasswordForm />
        </section>
        <hr>
        <section>
             <h2>Notification Settings</h2>
             <NotificationSettingsForm /> <!-- Создадим позже, в этапе 2 -->
        </section>
    </div>
</template>

<script setup lang="ts">
import ChangePasswordForm from '@/components/forms/ChangePasswordForm.vue'; // Путь может отличаться
// import NotificationSettingsForm from '@/components/forms/NotificationSettingsForm.vue'; // Создадим позже
</script>

<style scoped>
section {
    margin-bottom: 2rem;
}
 hr { margin: 1.5rem 0; border: 0; border-top: 1px solid #eee; }
</style>