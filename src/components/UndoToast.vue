<script setup>
import { ref, watch, computed, onUnmounted } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { Toast } from "bootstrap";

const chatStore = useChatStore();
const toasts = ref([]);

// Watch auf undoStack
watch(
  () => chatStore.undoStack.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      const lastAction = chatStore.undoStack[chatStore.undoStack.length - 1];
      showToast(lastAction);
    }
  }
);

// Toast erstellen
function showToast(action) {
  const id = Date.now(); // eindeutige ID
  toasts.value.push({ id, action });

  // Auto-hide nach 5 Sekunden
  setTimeout(() => {
    removeToast(id);
  }, 15000);
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) toasts.value.splice(index, 1);
}

function handleUndo(id) {
  chatStore.undoLast();
  removeToast(id);
}
</script>

<template>
  <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast show mb-2 text-white bg-dark border-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="toast-body d-flex justify-content-between align-items-center">
        <span class="user-select" @click="removeToast(t.id)">
          {{ t.action.type === 'session' ? 'Chat gelöscht' : 'Nachricht gelöscht' }}
        </span>
        <button class="btn btn-sm btn-link text-warning" @click="handleUndo(t.id)">
          Rückgängig
        </button>
      </div>
    </div>
  </div>
</template>

