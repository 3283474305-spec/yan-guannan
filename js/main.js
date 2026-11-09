/* Yan Guannan — shared page behaviour */
(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  /* ---------- menu ---------- */
  const nav = $("#nav");
  const menuBtn = $("#menuBtn");
  if (nav && menuBtn) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", nav).forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(event.target) || menuBtn.contains(event.target)) return;
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- top bar ---------- */
  const topbar = $("#topbar");
  const onScroll = () => {
    topbar?.classList.toggle("scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal ---------- */
  const revealItems = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  /* ---------- active nav ---------- */
  const sections = ["home", "about", "work", "atlas", "tools", "play", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const links = $$(".nav a");

  function setActiveNav(id) {
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  let navLockUntil = 0;

  function updateActiveNav(force = false) {
    if (!sections.length) return;
    if (!force && performance.now() < navLockUntil) return;

    let current = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 106) current = section.id;
    }

    // Contact is the last section and may never reach the top of the viewport.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12;
    if (atBottom) current = sections[sections.length - 1].id;

    setActiveNav(current);
  }

  let navTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (navTicking) return;
      navTicking = true;
      requestAnimationFrame(() => {
        updateActiveNav();
        navTicking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateActiveNav);

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").slice(1);
      if (!id) return;
      setActiveNav(id);
      navLockUntil = performance.now() + 1200;
      setTimeout(() => updateActiveNav(true), 1250);
    });
  });

  updateActiveNav(true);

  /* ---------- ID card tilt ---------- */
  const card = $("#idCard");
  if (card) {
    const inner = $(".id-card-inner", card);
    const reset = () => {
      inner.style.setProperty("--rx", "0deg");
      inner.style.setProperty("--ry", "0deg");
      inner.style.setProperty("--mx", "50%");
      inner.style.setProperty("--my", "40%");
    };

    if (!reduce && window.matchMedia("(hover: hover)").matches) {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        inner.style.setProperty("--rx", `${((0.5 - y) * 11).toFixed(2)}deg`);
        inner.style.setProperty("--ry", `${((x - 0.5) * 13).toFixed(2)}deg`);
        inner.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        inner.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      });
      card.addEventListener("pointerleave", reset);
    }
  }

  /* ---------- copy email ---------- */
  const copy = $("#copyEmail");
  if (copy) {
    const fallbackCopy = (text) => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
      return ok;
    };

    copy.addEventListener("click", async () => {
      const email = copy.dataset.email || "";
      let ok = false;
      try {
        await navigator.clipboard.writeText(email);
        ok = true;
      } catch {
        ok = fallbackCopy(email);
      }
      copy.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(() => {
        copy.textContent = "Copy email";
      }, 1600);
    });
  }

  /* ---------- year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
