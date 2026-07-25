// js/modal.js
// Generyczny modal komunikatów, identyczny z oryginalną implementacją.

let modalCallback = null;

export function showModal(title, bodyText, callback = null) {
  document.getElementById("modal-title").innerText = title;
  document.getElementById("modal-body").innerText = bodyText;
  modalCallback = callback;
  document.getElementById("custom-modal").classList.remove("hidden");
}

export function closeModal() {
  document.getElementById("custom-modal").classList.add("hidden");
  if (modalCallback) {
    const cb = modalCallback;
    modalCallback = null;
    cb();
  }
}
