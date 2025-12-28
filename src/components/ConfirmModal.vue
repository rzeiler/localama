<!-- src/components/ConfirmModal.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";

const modalRef = ref(null);
let modalInstance = null;
let resolver = null;

const options = ref({
  title: "Bestätigen",
  message: "",
  confirmText: "OK",
  cancelText: "Abbrechen",
  variant: "primary"
});

function show(opts) {
  options.value = { ...options.value, ...opts };
  modalInstance.show();

  return new Promise(resolve => {
    resolver = resolve;
  });
}

function confirm() {
  modalInstance.hide();
  resolver?.(true);
}

function cancel() {
  modalInstance.hide();
  resolver?.(false);
}

onMounted(() => {
  modalInstance = new Modal(modalRef.value, {
    backdrop: "static",
    keyboard: true
  });

  modalRef.value.addEventListener("hidden.bs.modal", () => {
    resolver?.(false);
    resolver = null;
  });
});

onUnmounted(() => {
  modalInstance?.dispose();
});

defineExpose({ show });
</script>

<template>
  <div class="modal fade" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">

        <div class="modal-header border-bottom-0">
          <h5 class="modal-title">{{ options.title }}</h5>
          <button type="button" class="btn-close" @click="cancel"></button>
        </div>

        <div class="modal-body">
          <p>{{ options.message }}</p>
        </div>

        <div class="modal-footer border-top-0">
          <button class="btn btn-light" @click="cancel">
            {{ options.cancelText }}
          </button>
          <button
            class="btn"
            :class="'btn-' + options.variant"
            @click="confirm"
            autofocus
          >
            {{ options.confirmText }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
