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

  let lockedLink = null;
  let lockTimer = 0;

  const updateFromScroll = () => {
    if (lockedLink) {
      setActive(lockedLink);
      return;
    }

    const y = window.scrollY + headerOffset();
    let current = sections[0];

    for (const item of sections) {
      if (item.el.offsetTop <= y + 2) current = item;
      else break;
    }

    setActive(current.link);
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      lockedLink = link;
      setActive(link);
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(() => {
        lockedLink = null;
        updateFromScroll();
      }, 600);
    });
  });

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
