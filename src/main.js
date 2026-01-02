// Import our custom CSS
import "./scss/styles.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./css/default.css";
import "./css/github.css";

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// ✅ Tooltip Auto-Hide global aktivieren
import { initGlobalTooltipAutoHide } from "@/utils/tooltip";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);


// Import all of Bootstrap’s JS
import * as bootstrap from "bootstrap";
import { Tooltip, Toast, Popover } from "bootstrap";

createApp(App).use(pinia).mount("#app");

// 🚀 nach App-Mount initialisieren
initGlobalTooltipAutoHide();

// 🔥 Globale Tooltip-Initialisierung
const initTooltips = () => {
  document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach(el => {
      if (!Tooltip.getInstance(el)) {
        new Tooltip(el);
      }
    });
};
 
// Initial
initTooltips();

// Bei DOM-Änderungen erneut initialisieren
const observer = new MutationObserver(initTooltips);
observer.observe(document.body, {
  childList: true,
  subtree: true
});