// utils/tooltip.js oder direkt im Script deiner Komponente
import { Tooltip } from "bootstrap";

export function closeTooltip(event) {
  const el = event.currentTarget;
  const instance = Tooltip.getInstance(el);
  if (instance) instance.hide();
  el.blur();
}

 export function initGlobalTooltipAutoHide() {
  const hideAllTooltips = () => {
    document
      .querySelectorAll('[data-bs-toggle="tooltip"]')
      .forEach(el => {
        const instance = Tooltip.getInstance(el);
        if (instance) instance.hide();
      });
  };

  document.addEventListener("click", hideAllTooltips);
  document.addEventListener("focusin", hideAllTooltips);
}