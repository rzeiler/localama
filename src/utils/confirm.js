// src/utils/confirm.js
import { createApp, h } from "vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

let instance;

export function confirm(options) {
  if (!instance) {
    const container = document.createElement("div");
    document.body.appendChild(container);

    instance = createApp({
      render() {
        return h(ConfirmModal, { ref: "modal" });
      }
    }).mount(container);
  }

  return instance.$refs.modal.show(options);
}
