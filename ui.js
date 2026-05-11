/**
 * Skapar och visar en temporär avisering (toast) på skärmen.
 * * @param {string} message  Meddelandet som ska visas i aviseringen.
 * @param {('success'|'danger'|'warning'|'info')} [type="success"]  Typen av avisering som bestämmer färgtema och ikon.
 * @returns {void}
 */
export function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const id = "toast-" + Date.now();

  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-trash-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };

  const toastEl = document.createElement("div");
  toastEl.id = id;
  toastEl.className = `toast toast-herman toast-${type} align-items-center border-0 show`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");

  const wrapper = document.createElement("div");
  wrapper.className = "d-flex align-items-center gap-2 p-3";

  const icon = document.createElement("i");
  icon.className = `bi ${icons[type] || icons.info} toast-icon`;

  const body = document.createElement("div");
  body.className = "toast-body p-0 flex-grow-1";
  body.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn-close btn-close-white ms-2";
  closeBtn.setAttribute("aria-label", "Stäng");

  closeBtn.addEventListener("click", () => toastEl.remove());

  wrapper.append(icon, body, closeBtn);
  toastEl.appendChild(wrapper);
  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.classList.add("toast-fade-out");
    setTimeout(() => toastEl.remove(), 400);
  }, 3500);
}