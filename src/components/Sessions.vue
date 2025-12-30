<script setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore.js";
import { closeTooltip } from "@/utils/tooltip.js";
import { confirm } from "@/utils/confirm";

const chatStore = useChatStore();
const editSessionId = ref(null);
const ollamaVersion = ref(null);
const versionError = ref(false);

// Timer für Single vs Double Click
let clickTimeout = null;

function handleClick(s) {
  // Wenn Doppelklick schon registriert, ignoriere Single Click
  if (clickTimeout) return;

  clickTimeout = setTimeout(() => {
    chatStore.selectSession(s.id);
    clickTimeout = null;
  }, 250); // 250ms warten auf Doppelclick
}

function handleDblClick(s) {
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }
  editSessionId.value = s.id;
}

function finishEdit(id, newTitle) {
  chatStore.updateTitle(id, newTitle || "Neuer Chat");
  editSessionId.value = null;
}

function handleKeyDown(event, id, title) {
  if (event.key === "Enter") {
    finishEdit(id, title);
  }
}

function handleRename(id, event) {
  closeTooltip(event);

  editSessionId.value = id;
}

async function confirmDelete(id, event) {

  closeTooltip(event); // Tooltip sofort schließen

  const session = chatStore.sessions.find(s => s.id === id);
  if (!session) return;

  const ok = await confirm({
    title: "Chat löschen",
    message: `Willst du den Chat "${session.title}" wirklich löschen?`,
    confirmText: "Löschen",
    variant: "danger"
  });

  if (ok) {
    chatStore.deleteSession(id);
  }
}

async function loadOllamaVersion() {
  try {
    const res = await fetch("http://localhost:11434/api/version");
    const data = await res.json();
    ollamaVersion.value = data.version;
  } catch (err) {
    versionError.value = true;
  }
}

onMounted(loadOllamaVersion);

</script>

<template>
  <div class="p-1 flex-fill ">
    <transition-group name="fade" tag="div">
      <div v-for="s in chatStore.sessions" :key="s.id"
        class="d-flex align-items-center justify-content-between btn btn-light"
        :class="{ aactive: s.id === chatStore.activeSessionId, 'form-control p-0 mb-1 mt-1': s.id === editSessionId }"
        @click="handleClick(s)" @dblclick.prevent="handleDblClick(s)">
        <template v-if="editSessionId === s.id">
          <input type="text" v-model="s.title" @blur="finishEdit(s.id, s.title)"
            @keydown.enter="finishEdit(s.id, s.title)" @keydown.esc.prevent="editSessionId = null" @click.stop
            class="form-control" autofocus />
        </template>
        <template v-else>
          <span>{{ s.title }}</span>

          <!-- Context Menu -->
          <div class="dropdown ms-2" @click.stop>
            <button class="btn btn-sm btn-light" data-bs-toggle="dropdown" data-bs-placement="right"
              aria-expanded="false" title="Optionen">
              <i class="bi bi-three-dots-vertical"></i>
            </button>

            <ul class="dropdown-menu dropdown-menu-end">
              <li data-bs-toggle="tooltip" data-bs-placement="right" data-bs-trigger="hover" title="Umbenennen">
                <button class="dropdown-item" @click="handleRename(s.id, $event)">
                  <i class="bi bi-pencil me-2"></i>
                  Umbenennen
                </button>
              </li>

              <li data-bs-toggle="tooltip" data-bs-placement="right" data-bs-trigger="hover" title="Löschen">
                <button class="dropdown-item text-danger" @click="confirmDelete(s.id, $event)">
                  <i class="bi bi-eraser me-2"></i>
                  Löschen
                </button>
              </li>
            </ul>
          </div>

        </template>
      </div>
    </transition-group>
    <button class="list-group-item list-group-item-action text-primary" @click="chatStore.newSession('llama3')">
      + Neuer Chat
    </button>
  </div>
  <div class="text-muted small">
    <template v-if="ollamaVersion">
      Ollama v{{ ollamaVersion }}
    </template>
    <template v-else-if="versionError">
      Ollama nicht erreichbar
    </template>
    <template v-else>
      Lade Ollama-Version…
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>