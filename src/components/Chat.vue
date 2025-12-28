<script setup>
import { useChatStore } from "@/stores/chatStore.js";
import { ref, nextTick, computed, onMounted, watch } from "vue";
import VueMarkdown from "vue3-markdown-it";
import { closeTooltip } from "@/utils/tooltip.js";
import { confirm } from "@/utils/confirm";

// 1️⃣ Store zuerst initialisieren
const chatStore = useChatStore();
const userInput = ref("");
const textareaRef = ref(null);
const loading = ref(false);
const messagesContainer = ref(null);
const showNewMessageIndicator = ref(false);
const messages = computed(() =>
  chatStore.activeSession?.messages || []
);

onMounted(() => {
  if (!chatStore.activeSession && chatStore.sessions.length === 0) {
    chatStore.newSession(props.model);
  }
});

watch(messages, () => {
  scrollToBottom(true);
}, { deep: true });

// Scroll-Funktion
function scrollToBottom(force = false) {
  nextTick(() => {
    const el = messagesContainer.value;
    if (!el) return;

    const tolerance = 50; // 50px Toleranzbereich
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= tolerance;

    if (force || atBottom) {
      el.scrollTop = el.scrollHeight;
      showNewMessageIndicator.value = false;
    } else {
      showNewMessageIndicator.value = true;
    }
  });
}

function autoResize() {
  nextTick(() => {
    const el = textareaRef.value;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  });
}

function resetTextarea() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  });
}

async function confirmDeleteMessage(index, event) {
  closeTooltip(event); // Tooltip sofort schließen

  if (!chatStore.activeSession) return;

  const ok = await confirm({
    title: "Nachricht löschen",
    message: `Willst du diese Nachricht wirklich löschen?`,
    confirmText: "Löschen",
    variant: "danger"
  });


  // const confirmed = confirm("Möchtest du diese Nachricht wirklich löschen?");
  if (ok) {
    chatStore.deleteMessage(chatStore.activeSession.id, index);
  }
}

async function sendMessage() {

  if (!userInput.value.trim() || loading.value || !chatStore.activeSession) return;

  resetTextarea();

  chatStore.addMessage({ role: "user", content: userInput.value });

  const payload = [...chatStore.activeSession.messages]; // ✅ direkt aus Store, nicht Computed

  userInput.value = "";
  loading.value = true;

  const body = {
    model: chatStore.selectedModel,
    messages: payload,
    stream: false
  };

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    chatStore.addMessage({
      role: "assistant",
      content: data.message.content,
      meta: {
        model: data.model,
        duration: (data.total_duration / 1e9).toFixed(2),
        tokens: data.prompt_eval_count + data.eval_count
      }
    });

    loading.value = false;

  } catch (err) {
    console.log(err);

    chatStore.addMessage({
      role: "assistant",
      content: "Error connecting to Ollama."
    });

  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <div class="flex-fill d-flex flex-column  overflow-hidden">
    <div class="flex-fill overflow-auto " ref="messagesContainer">
      <div class="container ">
        <div class="d-flex flex-column" v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div class="d-flex   " :class="[
            msg.role === 'user' ? 'justify-content-end' : 'flex-column'
          ]">

            <span :class="[
              msg.role === 'user' ? 'bg-body-secondary mw-70' : ''
            ]" class="p-2 rounded d-block  ">
              <VueMarkdown :source="msg.content" />

              <button class="btn btn-light" data-bs-toggle="tooltip" data-bs-placement="right" title="Nachricht löschen"
                @click.stop="confirmDeleteMessage(index, $event)">
                <i class="bi bi-eraser"></i>
              </button>


            </span>

            <div v-if="msg.meta" class="fw-lighter">
              {{ msg.meta.duration }}s |
              {{ msg.meta.tokens }} tokens |
              {{ msg.meta.model }} model
            </div>
          </div>
        </div>
        <div class="text-center">
          <div v-if="loading" class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

    </div>
    <!-- „Neue Nachricht“ Button -->
    <button v-if="showNewMessageIndicator" @click="scrollToBottom(true)" class="position-absolute btn btn-dark"
      style="bottom: 10px; left: 50%; transform: translateX(-50%); z-index: 10;">
      Neue Nachricht
    </button>
    <div class="shadow">
      <div class="container p-3">
        <form @submit.prevent="sendMessage" class="input-group shadow">
          <textarea ref="textareaRef" class="form-control" v-model="userInput" placeholder="Type a message..." rows="1"
            autocomplete="off" @input="autoResize" @keydown.enter.prevent="sendMessage" />
          <button :disabled="loading" class="input-group-text">
            {{ loading ? "..." : "Send" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.mw-70 {
  max-width: 70%;
}
</style>