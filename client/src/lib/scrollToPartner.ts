export function scrollToPartner() {
  const el = document.getElementById("partner");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    return true;
  }
  return false;
}
