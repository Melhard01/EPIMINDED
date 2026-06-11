export function scrollToApply() {
  const el = document.getElementById("apply");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    return true;
  }
  return false;
}
