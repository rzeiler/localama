<script setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore.js";

const chatStore = useChatStore();
const models = ref([]);
const loading = ref(false);

async function loadModels() {
  loading.value = true;
  const res = await fetch("http://localhost:11434/api/tags");
  const data = await res.json();
  models.value = data.models || [];

  // Initial Model aus Store oder erstes Model
  if (!chatStore.selectedModel && models.value.length) {
    chatStore.selectModel(models.value[0].name);
  }
  loading.value = false;
}

function selectModel(name) {
  chatStore.selectModel(name);
}

onMounted(loadModels);
</script>

<template>
  <div class="p-2 shadow-sm">
    <div class="dropdown">
      <button class="btn btn-light dropdown-toggle " data-bs-toggle="dropdown" :disabled="loading">
        {{ chatStore.selectedModel || "Modell wählen" }}
      </button>

      <ul class="dropdown-menu">
        <li v-for="m in models" :key="m.name">
          <button class="dropdown-item" :class="{ active: m.name === chatStore.selectedModel }" @click="selectModel(m.name)">
            {{ m.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>