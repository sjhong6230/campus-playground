export function initSiteNotice() {
  const dialog = document.getElementById("site-notice");
  document.querySelectorAll("[data-open-notice]").forEach((button) => {
    button.addEventListener("click", () => dialog.showModal());
  });
  dialog
    .querySelector(".notice-close")
    .addEventListener("click", () => dialog.close());
}
