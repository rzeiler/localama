<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useChatStore } from "@/stores/chatStore.js";

const chatStore = useChatStore();
const models = ref([]);
const loading = ref(false);
const atTop = ref(false);
const nav = ref(null);

function handleScroll() {
  const parent = nav.value.parentElement;
  atTop.value = parent.scrollTop === 0;
}

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

onMounted(() => {
  const parent = nav.value.parentElement;
  handleScroll(); // Initial
  parent.addEventListener("scroll", handleScroll, { passive: true });
  loadModels();
});

onUnmounted(() => {
  const parent = nav.value.parentElement;
  parent.removeEventListener("scroll", handleScroll);
});

</script>

<template>
  <nav class="p-2 sticky-top backdrop-blur" ref="nav" :class="{ 'shadow-sm': !atTop }">
    <div class="dropdown">
      <button class="btn btn-light dropdown-toggle " data-bs-toggle="dropdown" :disabled="loading">
        {{ chatStore.selectedModel || "Modell wählen" }}
      </button>

      <ul class="dropdown-menu">
        <li v-for="m in models" :key="m.name">
          <button class="dropdown-item" :class="{ active: m.name === chatStore.selectedModel }"
            @click="selectModel(m.name)">
            {{ m.name }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
