(() => {
  "use strict";

  const nav = document.querySelector(".rules-rail__nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll("a[href^='#']"));
  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (activeLink) => {
    links.forEach((link) => {
      const on = link === activeLink;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const headerOffset = () => {
    const header = document.querySelector(".site-header");
    return (header?.offsetHeight || 72) + 24;
  };

  const updateFromScroll = () => {
    const y = window.scrollY + headerOffset();
    let current = sections[0];

    for (const item of sections) {
      if (item.el.offsetTop <= y) current = item;
      else break;
    }

    // Near bottom: keep last section active
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 8;
    if (atBottom) current = sections[sections.length - 1];

    setActive(current.link);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateFromScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateFromScroll, { passive: true });
  updateFromScroll();
})();
