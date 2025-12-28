<script setup>
import { ref } from "vue";
import Chat from './components/Chat.vue'
import ChatSessions from './components/ChatSessions.vue'
import Models from './components/Models.vue'
import UndoToast from "@/components/UndoToast.vue";

</script>

<template>
  <div class="vh-100 d-flex">
    <div class="p-2 border-end shadow bg-body-tertiary w-300">
      <header class="d-flex flex-column  align-items-center">
      <img src="/pwa-192x192.png" alt="Logo" width="50" height="50" class="me-2">
      <h1 class="display-6 mb-2">Localama</h1>
      </header>
      <ChatSessions />
    </div>
    <div class="vh-100 p-0 m-0 flex-fill d-flex flex-column">
      <Models />
      <Chat />
    </div>
  </div>
   <UndoToast />
</template>

<style>
  .w-300{
    min-width: 300px;
  }
</style>