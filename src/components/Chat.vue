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

  const parent = messagesContainer.value.parentElement;
  parent.addEventListener("scroll", handleScroll, { passive: true });

  if (!chatStore.activeSession && chatStore.sessions.length === 0) {
    chatStore.newSession(props.model);
  }

  handleScroll();
});

watch(messages, () => {
  handleScroll();
}, { deep: true });


function handleScroll() {
  nextTick(() => {
    const el = messagesContainer.value.parentElement;


    const tolerance = 2;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight >= tolerance;

    console.log(el.scrollHeight - el.scrollTop - el.clientHeight);

    showNewMessageIndicator.value = atBottom;
  });
}


// Scroll-Funktion
function scrollToBottom(f) {
  nextTick(() => {
    const el = messagesContainer.value.parentElement;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth"
    });
    showNewMessageIndicator.value = false;
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

  <div ref="messagesContainer" class="flex-fill">
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
  <div class="shadow sticky-bottom ">
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
  <div v-if="showNewMessageIndicator" @click="scrollToBottom()" class=" sticky-bottom d-flex justify-content-center "
    style="bottom: 60px;">
    <button class="btn btn-dark"> Neue Nachricht
    </button>
  </div>
</template>

<style>
.mw-70 {
  max-width: 70%;
}
</style>