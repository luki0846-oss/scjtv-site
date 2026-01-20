(() => {
  const btn = document.querySelector(".menu-btn");
  const menu = document.getElementById("mobileMenu");
  if (!btn || !menu) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    if (open) menu.removeAttribute("hidden");
    else menu.setAttribute("hidden", "");
  };

  let isOpen = false;

  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    setOpen(isOpen);
  });

  // 바깥 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (!isOpen) return;
    if (btn.contains(e.target) || menu.contains(e.target)) return;
    isOpen = false;
    setOpen(false);
  });

  // 리사이즈 시 데스크톱으로 가면 닫기
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && isOpen) {
      isOpen = false;
      setOpen(false);
    }
  });
})();